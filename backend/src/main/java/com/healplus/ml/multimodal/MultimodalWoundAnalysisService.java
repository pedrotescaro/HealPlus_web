package com.healplus.ml.multimodal;

import com.healplus.ml.TissueType;
import com.healplus.ml.WoundAnalysisResult;
import com.healplus.ml.WoundType;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.*;

/**
 * Serviço de Análise Multimodal para Classificação de Feridas
 * Combina dados visuais (imagem) com metadados clínicos do paciente
 */
@Service
public class MultimodalWoundAnalysisService {
    
    private static final Logger logger = LoggerFactory.getLogger(MultimodalWoundAnalysisService.class);
    
    /**
     * Realiza análise multimodal combinando visão computacional com dados clínicos
     */
    public MultimodalAnalysisResult analyzeWithClinicalContext(
            WoundAnalysisResult imageAnalysis,
            PatientClinicalData clinicalData) {
        
        logger.info("Iniciando análise multimodal para paciente: idade {}, comorbidades: {}", 
            clinicalData.getAge(), clinicalData.getComorbidities());
        
        MultimodalAnalysisResult result = new MultimodalAnalysisResult();
        result.setImageAnalysis(imageAnalysis);
        result.setClinicalData(clinicalData);
        
        // 1. Refinar classificação do tipo de ferida com dados clínicos
        WoundTypeRefinement refinement = refineWoundTypeClassification(imageAnalysis, clinicalData);
        result.setRefinedWoundType(refinement);
        
        // 2. Ajustar avaliação de risco baseado em comorbidades
        RiskAdjustment riskAdjustment = adjustRiskForComorbidities(imageAnalysis, clinicalData);
        result.setRiskAdjustment(riskAdjustment);
        
        // 3. Gerar recomendações personalizadas
        List<PersonalizedRecommendation> recommendations = 
            generatePersonalizedRecommendations(imageAnalysis, clinicalData, refinement);
        result.setPersonalizedRecommendations(recommendations);
        
        // 4. Prever prognóstico considerando fatores clínicos
        PrognosisAssessment prognosis = assessPrognosis(imageAnalysis, clinicalData);
        result.setPrognosis(prognosis);
        
        // 5. Alertas específicos para o paciente
        List<ClinicalAlert> alerts = generateClinicalAlerts(imageAnalysis, clinicalData);
        result.setAlerts(alerts);
        
        // 6. Calcular confiança geral
        result.setOverallConfidence(calculateOverallConfidence(imageAnalysis, clinicalData, refinement));
        
        logger.info("Análise multimodal concluída - Tipo refinado: {}, Confiança: {}%",
            refinement.getRefinedType().getDisplayName(),
            String.format("%.1f", result.getOverallConfidence() * 100));
        
        return result;
    }
    
    /**
     * Refina a classificação do tipo de ferida usando dados clínicos
     */
    private WoundTypeRefinement refineWoundTypeClassification(
            WoundAnalysisResult imageAnalysis,
            PatientClinicalData clinicalData) {
        
        WoundTypeRefinement refinement = new WoundTypeRefinement();
        refinement.setOriginalType(imageAnalysis.getWoundType());
        refinement.setOriginalConfidence(imageAnalysis.getWoundTypeConfidence());
        
        Map<WoundType, Double> adjustedProbabilities = new EnumMap<>(WoundType.class);
        
        // Inicializar com probabilidades baseadas na imagem
        for (WoundType type : WoundType.values()) {
            adjustedProbabilities.put(type, 
                type == imageAnalysis.getWoundType() ? imageAnalysis.getWoundTypeConfidence() : 0.1);
        }
        
        // Ajustar baseado em comorbidades
        List<String> comorbidities = clinicalData.getComorbidities();
        
        // Diabetes aumenta probabilidade de pé diabético
        if (containsAny(comorbidities, "diabetes", "dm", "diabetes mellitus")) {
            adjustedProbabilities.merge(WoundType.DIABETIC_FOOT, 0.25, Double::sum);
            refinement.addAdjustmentReason("Diabetes aumenta probabilidade de pé diabético");
        }
        
        // Insuficiência venosa
        if (containsAny(comorbidities, "insuficiência venosa", "varizes", "trombose", "tvp")) {
            adjustedProbabilities.merge(WoundType.VENOUS_ULCER, 0.25, Double::sum);
            refinement.addAdjustmentReason("Histórico venoso aumenta probabilidade de úlcera venosa");
        }
        
        // Doença arterial
        if (containsAny(comorbidities, "doença arterial", "aterosclerose", "dap", "claudicação")) {
            adjustedProbabilities.merge(WoundType.ARTERIAL_ULCER, 0.25, Double::sum);
            refinement.addAdjustmentReason("Doença arterial aumenta probabilidade de úlcera arterial");
        }
        
        // Imobilidade aumenta probabilidade de LPP
        if (containsAny(comorbidities, "acamado", "imobilidade", "cadeirante", "paraplégico", "tetraplégico")) {
            adjustedProbabilities.merge(WoundType.PRESSURE_ULCER, 0.3, Double::sum);
            refinement.addAdjustmentReason("Imobilidade aumenta probabilidade de lesão por pressão");
        }
        
        // Ajustar baseado na localização anatômica
        String location = clinicalData.getWoundLocation() != null ? 
            clinicalData.getWoundLocation().toLowerCase() : "";
        
        if (location.contains("sacral") || location.contains("trocanter") || 
            location.contains("calcâneo") || location.contains("isquio")) {
            adjustedProbabilities.merge(WoundType.PRESSURE_ULCER, 0.2, Double::sum);
            refinement.addAdjustmentReason("Localização típica de lesão por pressão");
        }
        
        if (location.contains("pé") || location.contains("plantar") || location.contains("digital")) {
            if (containsAny(comorbidities, "diabetes")) {
                adjustedProbabilities.merge(WoundType.DIABETIC_FOOT, 0.2, Double::sum);
            }
        }
        
        if (location.contains("maléolo") || location.contains("terço inferior") || location.contains("perna")) {
            adjustedProbabilities.merge(WoundType.VENOUS_ULCER, 0.15, Double::sum);
        }
        
        // Ajustar baseado na idade
        if (clinicalData.getAge() > 65) {
            // Idosos têm maior risco de LPP e cicatrização lenta
            adjustedProbabilities.merge(WoundType.PRESSURE_ULCER, 0.1, Double::sum);
            refinement.addAdjustmentReason("Idade avançada considerada na análise");
        }
        
        // Normalizar probabilidades
        double total = adjustedProbabilities.values().stream().mapToDouble(Double::doubleValue).sum();
        for (Map.Entry<WoundType, Double> entry : adjustedProbabilities.entrySet()) {
            adjustedProbabilities.put(entry.getKey(), entry.getValue() / total);
        }
        
        // Determinar tipo refinado
        WoundType refinedType = adjustedProbabilities.entrySet().stream()
            .max(Map.Entry.comparingByValue())
            .map(Map.Entry::getKey)
            .orElse(imageAnalysis.getWoundType());
        
        refinement.setRefinedType(refinedType);
        refinement.setRefinedConfidence(adjustedProbabilities.get(refinedType));
        refinement.setAdjustedProbabilities(adjustedProbabilities);
        
        // Se o tipo mudou, registrar
        if (refinedType != imageAnalysis.getWoundType()) {
            refinement.setTypeChanged(true);
            refinement.addAdjustmentReason(String.format(
                "Classificação alterada de %s para %s baseado em dados clínicos",
                imageAnalysis.getWoundType().getDisplayName(),
                refinedType.getDisplayName()
            ));
        }
        
        return refinement;
    }
    
    /**
     * Ajusta avaliação de risco baseado em comorbidades
     */
    private RiskAdjustment adjustRiskForComorbidities(
            WoundAnalysisResult imageAnalysis,
            PatientClinicalData clinicalData) {
        
        RiskAdjustment adjustment = new RiskAdjustment();
        
        double baseInfectionRisk = imageAnalysis.getRiskAssessment() != null ? 
            imageAnalysis.getRiskAssessment().getInfectionRisk() : 0.3;
        double baseChronicityRisk = imageAnalysis.getRiskAssessment() != null ?
            imageAnalysis.getRiskAssessment().getChronicityRisk() : 0.3;
        
        double infectionMultiplier = 1.0;
        double healingDelayMultiplier = 1.0;
        double complicationMultiplier = 1.0;
        
        List<String> comorbidities = clinicalData.getComorbidities();
        List<String> riskFactors = new ArrayList<>();
        
        // Diabetes
        if (containsAny(comorbidities, "diabetes", "dm")) {
            infectionMultiplier *= 1.5;
            healingDelayMultiplier *= 1.8;
            complicationMultiplier *= 1.6;
            riskFactors.add("Diabetes mellitus - alto risco de infecção e retardo na cicatrização");
            
            // Verificar controle glicêmico se disponível
            if (clinicalData.getHba1c() != null && clinicalData.getHba1c() > 8.0) {
                healingDelayMultiplier *= 1.3;
                riskFactors.add("HbA1c elevada (>8%) - controle glicêmico inadequado");
            }
        }
        
        // Imunossupressão
        if (containsAny(comorbidities, "imunossupressão", "hiv", "aids", "transplante", 
                       "quimioterapia", "corticoide crônico")) {
            infectionMultiplier *= 2.0;
            healingDelayMultiplier *= 1.5;
            riskFactors.add("Imunossupressão - risco significativo de infecção");
        }
        
        // Desnutrição
        if (containsAny(comorbidities, "desnutrição", "caquexia", "albumina baixa")) {
            healingDelayMultiplier *= 1.8;
            complicationMultiplier *= 1.4;
            riskFactors.add("Desnutrição - comprometimento da cicatrização");
        }
        
        // Doença vascular periférica
        if (containsAny(comorbidities, "dap", "doença arterial periférica", "claudicação", "isquemia")) {
            healingDelayMultiplier *= 2.0;
            infectionMultiplier *= 1.3;
            riskFactors.add("Doença arterial periférica - perfusão comprometida");
        }
        
        // Tabagismo
        if (containsAny(comorbidities, "tabagismo", "tabagista", "fumante")) {
            healingDelayMultiplier *= 1.4;
            riskFactors.add("Tabagismo - compromete oxigenação tissular");
        }
        
        // Obesidade
        if (containsAny(comorbidities, "obesidade", "obeso", "imc > 30")) {
            infectionMultiplier *= 1.3;
            healingDelayMultiplier *= 1.2;
            riskFactors.add("Obesidade - maior risco de complicações");
        }
        
        // Idade avançada
        if (clinicalData.getAge() > 75) {
            healingDelayMultiplier *= 1.3;
            riskFactors.add("Idade > 75 anos - cicatrização mais lenta");
        }
        
        // Medicações que afetam cicatrização
        List<String> medications = clinicalData.getMedications();
        if (containsAny(medications, "corticoide", "prednisona", "dexametasona")) {
            healingDelayMultiplier *= 1.4;
            infectionMultiplier *= 1.3;
            riskFactors.add("Uso de corticoides - impacto na cicatrização e imunidade");
        }
        
        if (containsAny(medications, "anticoagulante", "warfarina", "rivaroxabana", "apixabana")) {
            complicationMultiplier *= 1.2;
            riskFactors.add("Uso de anticoagulantes - risco de sangramento");
        }
        
        // Calcular riscos ajustados
        adjustment.setAdjustedInfectionRisk(Math.min(baseInfectionRisk * infectionMultiplier, 0.95));
        adjustment.setAdjustedHealingDelayRisk(Math.min(baseChronicityRisk * healingDelayMultiplier, 0.95));
        adjustment.setAdjustedComplicationRisk(Math.min(0.3 * complicationMultiplier, 0.95));
        adjustment.setRiskFactors(riskFactors);
        
        // Classificar nível de risco geral
        double avgRisk = (adjustment.getAdjustedInfectionRisk() + 
                         adjustment.getAdjustedHealingDelayRisk() + 
                         adjustment.getAdjustedComplicationRisk()) / 3;
        
        if (avgRisk > 0.7) {
            adjustment.setOverallRiskLevel("CRÍTICO");
        } else if (avgRisk > 0.5) {
            adjustment.setOverallRiskLevel("ALTO");
        } else if (avgRisk > 0.3) {
            adjustment.setOverallRiskLevel("MODERADO");
        } else {
            adjustment.setOverallRiskLevel("BAIXO");
        }
        
        return adjustment;
    }
    
    /**
     * Gera recomendações personalizadas baseadas no contexto clínico completo
     */
    private List<PersonalizedRecommendation> generatePersonalizedRecommendations(
            WoundAnalysisResult imageAnalysis,
            PatientClinicalData clinicalData,
            WoundTypeRefinement refinement) {
        
        List<PersonalizedRecommendation> recommendations = new ArrayList<>();
        List<String> comorbidities = clinicalData.getComorbidities();
        WoundType woundType = refinement.getRefinedType();
        
        // Recomendações baseadas no tipo de ferida
        switch (woundType) {
            case PRESSURE_ULCER -> {
                recommendations.add(new PersonalizedRecommendation(
                    "Alívio de Pressão",
                    "Implementar mudança de decúbito a cada 2 horas e uso de superfície de suporte adequada",
                    Priority.HIGH,
                    "Essencial para tratamento de lesão por pressão"
                ));
                recommendations.add(new PersonalizedRecommendation(
                    "Avaliação Nutricional",
                    "Solicitar avaliação nutricional - considerar suplementação proteica",
                    Priority.HIGH,
                    "Nutrição adequada é fundamental para cicatrização"
                ));
            }
            case VENOUS_ULCER -> {
                recommendations.add(new PersonalizedRecommendation(
                    "Terapia Compressiva",
                    "Iniciar terapia compressiva multicamadas após descartar comprometimento arterial (ITB > 0.8)",
                    Priority.HIGH,
                    "Padrão ouro para tratamento de úlcera venosa"
                ));
                recommendations.add(new PersonalizedRecommendation(
                    "Elevação de Membros",
                    "Orientar elevação de membros inferiores acima do nível do coração por 30min, 3-4x/dia",
                    Priority.MEDIUM,
                    "Auxilia no retorno venoso"
                ));
            }
            case ARTERIAL_ULCER -> {
                recommendations.add(new PersonalizedRecommendation(
                    "Avaliação Vascular Urgente",
                    "Encaminhar para avaliação vascular - ITB e possível angiografia",
                    Priority.CRITICAL,
                    "Revascularização pode ser necessária"
                ));
                recommendations.add(new PersonalizedRecommendation(
                    "Evitar Compressão",
                    "NÃO utilizar terapia compressiva até avaliação vascular completa",
                    Priority.HIGH,
                    "Compressão pode agravar isquemia"
                ));
            }
            case DIABETIC_FOOT -> {
                recommendations.add(new PersonalizedRecommendation(
                    "Controle Glicêmico",
                    "Intensificar controle glicêmico - meta HbA1c < 7% durante tratamento",
                    Priority.HIGH,
                    "Hiperglicemia prejudica cicatrização"
                ));
                recommendations.add(new PersonalizedRecommendation(
                    "Descarga de Pressão",
                    "Implementar descarga de pressão (gesso de contato total ou bota removível)",
                    Priority.HIGH,
                    "Fundamental para cicatrização de úlcera plantar"
                ));
                recommendations.add(new PersonalizedRecommendation(
                    "Rastreio de Infecção",
                    "Avaliar profundidade da ferida - se atingir osso, considerar osteomielite",
                    Priority.HIGH,
                    "Infecção óssea comum em pé diabético"
                ));
            }
            default -> {
                recommendations.add(new PersonalizedRecommendation(
                    "Tratamento Padrão",
                    "Manter curativo adequado ao nível de exsudato e fase de cicatrização",
                    Priority.MEDIUM,
                    "Abordagem baseada em evidências"
                ));
            }
        }
        
        // Recomendações baseadas em comorbidades
        if (containsAny(comorbidities, "diabetes")) {
            recommendations.add(new PersonalizedRecommendation(
                "Monitoramento Glicêmico",
                "Monitorar glicemia capilar diariamente durante tratamento da ferida",
                Priority.MEDIUM,
                "Paciente diabético requer atenção especial ao controle metabólico"
            ));
        }
        
        if (containsAny(comorbidities, "desnutrição", "caquexia", "albumina baixa")) {
            recommendations.add(new PersonalizedRecommendation(
                "Suporte Nutricional",
                "Suplementação com proteínas (1.25-1.5g/kg/dia), zinco, vitamina C e arginina",
                Priority.HIGH,
                "Nutrição otimizada acelera cicatrização"
            ));
        }
        
        // Recomendações baseadas nos tecidos identificados
        Map<TissueType, Double> tissues = imageAnalysis.getTissuePercentages();
        
        if (tissues.getOrDefault(TissueType.NECROTIC, 0.0) > 20 ||
            tissues.getOrDefault(TissueType.ESCHAR, 0.0) > 15) {
            recommendations.add(new PersonalizedRecommendation(
                "Desbridamento",
                "Considerar desbridamento (autolítico, enzimático, mecânico ou cirúrgico conforme avaliação)",
                Priority.HIGH,
                "Tecido necrótico impede cicatrização"
            ));
        }
        
        if (tissues.getOrDefault(TissueType.SLOUGH, 0.0) > 25) {
            recommendations.add(new PersonalizedRecommendation(
                "Limpeza de Esfacelo",
                "Intensificar limpeza da ferida e considerar hidrogel ou curativo autolítico",
                Priority.MEDIUM,
                "Remoção de esfacelo favorece granulação"
            ));
        }
        
        // Ordenar por prioridade
        recommendations.sort(Comparator.comparing(PersonalizedRecommendation::getPriority));
        
        return recommendations;
    }
    
    /**
     * Avalia prognóstico considerando fatores clínicos
     */
    private PrognosisAssessment assessPrognosis(
            WoundAnalysisResult imageAnalysis,
            PatientClinicalData clinicalData) {
        
        PrognosisAssessment prognosis = new PrognosisAssessment();
        
        // Fatores favoráveis e desfavoráveis
        List<String> favorableFactors = new ArrayList<>();
        List<String> unfavorableFactors = new ArrayList<>();
        
        double healingModifier = 1.0;
        
        // Analisar tecidos
        Map<TissueType, Double> tissues = imageAnalysis.getTissuePercentages();
        double granulation = tissues.getOrDefault(TissueType.GRANULATION, 0.0);
        double epithelial = tissues.getOrDefault(TissueType.EPITHELIAL, 0.0);
        double necrotic = tissues.getOrDefault(TissueType.NECROTIC, 0.0);
        
        if (granulation > 50) {
            favorableFactors.add("Alto percentual de tecido de granulação");
            healingModifier *= 0.8;
        }
        if (epithelial > 20) {
            favorableFactors.add("Epitelização em progresso");
            healingModifier *= 0.7;
        }
        if (necrotic > 20) {
            unfavorableFactors.add("Presença significativa de necrose");
            healingModifier *= 1.5;
        }
        
        // Analisar comorbidades
        List<String> comorbidities = clinicalData.getComorbidities();
        
        if (containsAny(comorbidities, "diabetes")) {
            unfavorableFactors.add("Diabetes mellitus");
            healingModifier *= 1.4;
        }
        if (containsAny(comorbidities, "dap", "doença arterial")) {
            unfavorableFactors.add("Doença arterial periférica");
            healingModifier *= 1.6;
        }
        if (containsAny(comorbidities, "desnutrição")) {
            unfavorableFactors.add("Desnutrição");
            healingModifier *= 1.5;
        }
        if (containsAny(comorbidities, "tabagismo")) {
            unfavorableFactors.add("Tabagismo");
            healingModifier *= 1.3;
        }
        
        // Idade
        if (clinicalData.getAge() < 50) {
            favorableFactors.add("Idade favorável para cicatrização");
            healingModifier *= 0.9;
        } else if (clinicalData.getAge() > 70) {
            unfavorableFactors.add("Idade avançada");
            healingModifier *= 1.2;
        }
        
        // Área da ferida
        if (imageAnalysis.getEstimatedArea() < 5) {
            favorableFactors.add("Ferida de pequeno tamanho");
        } else if (imageAnalysis.getEstimatedArea() > 20) {
            unfavorableFactors.add("Ferida extensa");
            healingModifier *= 1.3;
        }
        
        prognosis.setFavorableFactors(favorableFactors);
        prognosis.setUnfavorableFactors(unfavorableFactors);
        
        // Calcular tempo estimado
        int baseHealingDays = imageAnalysis.getEvolutionPrediction() != null ?
            imageAnalysis.getEvolutionPrediction().getEstimatedHealingDays() : 30;
        
        int adjustedDays = (int) Math.round(baseHealingDays * healingModifier);
        prognosis.setEstimatedHealingTimeDays(Math.min(adjustedDays, 180));
        
        // Calcular probabilidade de cicatrização
        double baseProbability = imageAnalysis.getEvolutionPrediction() != null ?
            imageAnalysis.getEvolutionPrediction().getHealingProbability() : 0.7;
        
        // Ajustar por fatores
        double adjustedProbability = baseProbability;
        adjustedProbability += favorableFactors.size() * 0.05;
        adjustedProbability -= unfavorableFactors.size() * 0.08;
        
        prognosis.setHealingProbability(Math.max(0.1, Math.min(0.95, adjustedProbability)));
        
        // Classificar prognóstico
        if (prognosis.getHealingProbability() > 0.75) {
            prognosis.setPrognosisLevel("BOM");
            prognosis.setPrognosisDescription("Alta probabilidade de cicatrização com tratamento adequado");
        } else if (prognosis.getHealingProbability() > 0.5) {
            prognosis.setPrognosisLevel("MODERADO");
            prognosis.setPrognosisDescription("Cicatrização possível, mas requer atenção aos fatores de risco");
        } else if (prognosis.getHealingProbability() > 0.3) {
            prognosis.setPrognosisLevel("RESERVADO");
            prognosis.setPrognosisDescription("Múltiplos fatores desfavoráveis - considerar terapias avançadas");
        } else {
            prognosis.setPrognosisLevel("RUIM");
            prognosis.setPrognosisDescription("Alto risco de ferida crônica - intervenção intensiva necessária");
        }
        
        return prognosis;
    }
    
    /**
     * Gera alertas clínicos específicos para o paciente
     */
    private List<ClinicalAlert> generateClinicalAlerts(
            WoundAnalysisResult imageAnalysis,
            PatientClinicalData clinicalData) {
        
        List<ClinicalAlert> alerts = new ArrayList<>();
        List<String> comorbidities = clinicalData.getComorbidities();
        
        // Alerta de infecção
        if (imageAnalysis.getHealingPhase() == com.healplus.ml.HealingPhase.INFECTED) {
            alerts.add(new ClinicalAlert(
                AlertLevel.CRITICAL,
                "Sinais de Infecção",
                "Sinais sugestivos de infecção detectados. Avaliar necessidade de cultura e antibioticoterapia.",
                List.of("Coletar swab/cultura", "Avaliar antibiótico", "Aumentar frequência de curativos")
            ));
        }
        
        // Alerta para diabéticos
        if (containsAny(comorbidities, "diabetes") && 
            imageAnalysis.getWoundType() == WoundType.DIABETIC_FOOT) {
            alerts.add(new ClinicalAlert(
                AlertLevel.HIGH,
                "Pé Diabético de Alto Risco",
                "Paciente diabético com lesão em pé. Risco aumentado de complicações graves.",
                List.of("Verificar sensibilidade protetora", "Avaliar pulsos periféricos", 
                       "Considerar avaliação multidisciplinar")
            ));
        }
        
        // Alerta para necrose extensa
        Map<TissueType, Double> tissues = imageAnalysis.getTissuePercentages();
        if (tissues.getOrDefault(TissueType.NECROTIC, 0.0) > 40) {
            alerts.add(new ClinicalAlert(
                AlertLevel.HIGH,
                "Necrose Extensa",
                "Mais de 40% de tecido necrótico identificado. Desbridamento urgente indicado.",
                List.of("Avaliar viabilidade de desbridamento cirúrgico", 
                       "Considerar cirurgia plástica se necessário")
            ));
        }
        
        // Alerta de ferida crônica
        if (clinicalData.getWoundDurationDays() != null && clinicalData.getWoundDurationDays() > 30) {
            alerts.add(new ClinicalAlert(
                AlertLevel.MEDIUM,
                "Ferida Crônica",
                String.format("Ferida há %d dias sem cicatrização. Reavaliar protocolo de tratamento.",
                    clinicalData.getWoundDurationDays()),
                List.of("Revisar fatores sistêmicos", "Considerar terapias avançadas", 
                       "Avaliar adesão ao tratamento")
            ));
        }
        
        // Alerta de medicação
        List<String> medications = clinicalData.getMedications();
        if (containsAny(medications, "anticoagulante", "warfarina") && 
            tissues.getOrDefault(TissueType.NECROTIC, 0.0) > 20) {
            alerts.add(new ClinicalAlert(
                AlertLevel.MEDIUM,
                "Atenção: Uso de Anticoagulante",
                "Paciente em uso de anticoagulante com indicação de desbridamento. Avaliar INR antes do procedimento.",
                List.of("Verificar INR recente", "Considerar suspensão temporária se necessário")
            ));
        }
        
        // Ordenar por nível de alerta
        alerts.sort(Comparator.comparing(ClinicalAlert::getLevel));
        
        return alerts;
    }
    
    private double calculateOverallConfidence(
            WoundAnalysisResult imageAnalysis,
            PatientClinicalData clinicalData,
            WoundTypeRefinement refinement) {
        
        double imageConfidence = imageAnalysis.getWoundTypeConfidence();
        double refinedConfidence = refinement.getRefinedConfidence();
        
        // Mais dados clínicos aumentam a confiança
        double clinicalBonus = 0;
        if (clinicalData.getComorbidities() != null && !clinicalData.getComorbidities().isEmpty()) {
            clinicalBonus += 0.05;
        }
        if (clinicalData.getWoundLocation() != null && !clinicalData.getWoundLocation().isEmpty()) {
            clinicalBonus += 0.03;
        }
        if (clinicalData.getMedications() != null && !clinicalData.getMedications().isEmpty()) {
            clinicalBonus += 0.02;
        }
        
        double combined = (imageConfidence * 0.4 + refinedConfidence * 0.6) + clinicalBonus;
        return Math.min(combined, 0.95);
    }
    
    private boolean containsAny(List<String> list, String... terms) {
        if (list == null) return false;
        for (String item : list) {
            String lower = item.toLowerCase();
            for (String term : terms) {
                if (lower.contains(term.toLowerCase())) {
                    return true;
                }
            }
        }
        return false;
    }
    
    // ==================== DTOs ====================
    
    public static class PatientClinicalData {
        private int age;
        private String gender;
        private List<String> comorbidities;
        private List<String> medications;
        private String woundLocation;
        private Integer woundDurationDays;
        private Double hba1c;
        private String albumin;
        private Boolean isMobile;
        private String nursingDiagnosis;
        
        // Getters and Setters
        public int getAge() { return age; }
        public void setAge(int age) { this.age = age; }
        
        public String getGender() { return gender; }
        public void setGender(String gender) { this.gender = gender; }
        
        public List<String> getComorbidities() { return comorbidities != null ? comorbidities : new ArrayList<>(); }
        public void setComorbidities(List<String> comorbidities) { this.comorbidities = comorbidities; }
        
        public List<String> getMedications() { return medications != null ? medications : new ArrayList<>(); }
        public void setMedications(List<String> medications) { this.medications = medications; }
        
        public String getWoundLocation() { return woundLocation; }
        public void setWoundLocation(String woundLocation) { this.woundLocation = woundLocation; }
        
        public Integer getWoundDurationDays() { return woundDurationDays; }
        public void setWoundDurationDays(Integer woundDurationDays) { this.woundDurationDays = woundDurationDays; }
        
        public Double getHba1c() { return hba1c; }
        public void setHba1c(Double hba1c) { this.hba1c = hba1c; }
        
        public String getAlbumin() { return albumin; }
        public void setAlbumin(String albumin) { this.albumin = albumin; }
        
        public Boolean getIsMobile() { return isMobile; }
        public void setIsMobile(Boolean isMobile) { this.isMobile = isMobile; }
        
        public String getNursingDiagnosis() { return nursingDiagnosis; }
        public void setNursingDiagnosis(String nursingDiagnosis) { this.nursingDiagnosis = nursingDiagnosis; }
    }
    
    public static class MultimodalAnalysisResult {
        private WoundAnalysisResult imageAnalysis;
        private PatientClinicalData clinicalData;
        private WoundTypeRefinement refinedWoundType;
        private RiskAdjustment riskAdjustment;
        private List<PersonalizedRecommendation> personalizedRecommendations;
        private PrognosisAssessment prognosis;
        private List<ClinicalAlert> alerts;
        private double overallConfidence;
        
        // Getters and Setters
        public WoundAnalysisResult getImageAnalysis() { return imageAnalysis; }
        public void setImageAnalysis(WoundAnalysisResult imageAnalysis) { this.imageAnalysis = imageAnalysis; }
        
        public PatientClinicalData getClinicalData() { return clinicalData; }
        public void setClinicalData(PatientClinicalData clinicalData) { this.clinicalData = clinicalData; }
        
        public WoundTypeRefinement getRefinedWoundType() { return refinedWoundType; }
        public void setRefinedWoundType(WoundTypeRefinement refinedWoundType) { this.refinedWoundType = refinedWoundType; }
        
        public RiskAdjustment getRiskAdjustment() { return riskAdjustment; }
        public void setRiskAdjustment(RiskAdjustment riskAdjustment) { this.riskAdjustment = riskAdjustment; }
        
        public List<PersonalizedRecommendation> getPersonalizedRecommendations() { return personalizedRecommendations; }
        public void setPersonalizedRecommendations(List<PersonalizedRecommendation> personalizedRecommendations) { this.personalizedRecommendations = personalizedRecommendations; }
        
        public PrognosisAssessment getPrognosis() { return prognosis; }
        public void setPrognosis(PrognosisAssessment prognosis) { this.prognosis = prognosis; }
        
        public List<ClinicalAlert> getAlerts() { return alerts; }
        public void setAlerts(List<ClinicalAlert> alerts) { this.alerts = alerts; }
        
        public double getOverallConfidence() { return overallConfidence; }
        public void setOverallConfidence(double overallConfidence) { this.overallConfidence = overallConfidence; }
    }
    
    public static class WoundTypeRefinement {
        private WoundType originalType;
        private double originalConfidence;
        private WoundType refinedType;
        private double refinedConfidence;
        private Map<WoundType, Double> adjustedProbabilities;
        private List<String> adjustmentReasons = new ArrayList<>();
        private boolean typeChanged;
        
        public void addAdjustmentReason(String reason) {
            this.adjustmentReasons.add(reason);
        }
        
        // Getters and Setters
        public WoundType getOriginalType() { return originalType; }
        public void setOriginalType(WoundType originalType) { this.originalType = originalType; }
        
        public double getOriginalConfidence() { return originalConfidence; }
        public void setOriginalConfidence(double originalConfidence) { this.originalConfidence = originalConfidence; }
        
        public WoundType getRefinedType() { return refinedType; }
        public void setRefinedType(WoundType refinedType) { this.refinedType = refinedType; }
        
        public double getRefinedConfidence() { return refinedConfidence; }
        public void setRefinedConfidence(double refinedConfidence) { this.refinedConfidence = refinedConfidence; }
        
        public Map<WoundType, Double> getAdjustedProbabilities() { return adjustedProbabilities; }
        public void setAdjustedProbabilities(Map<WoundType, Double> adjustedProbabilities) { this.adjustedProbabilities = adjustedProbabilities; }
        
        public List<String> getAdjustmentReasons() { return adjustmentReasons; }
        public void setAdjustmentReasons(List<String> adjustmentReasons) { this.adjustmentReasons = adjustmentReasons; }
        
        public boolean isTypeChanged() { return typeChanged; }
        public void setTypeChanged(boolean typeChanged) { this.typeChanged = typeChanged; }
    }
    
    public static class RiskAdjustment {
        private double adjustedInfectionRisk;
        private double adjustedHealingDelayRisk;
        private double adjustedComplicationRisk;
        private String overallRiskLevel;
        private List<String> riskFactors;
        
        // Getters and Setters
        public double getAdjustedInfectionRisk() { return adjustedInfectionRisk; }
        public void setAdjustedInfectionRisk(double adjustedInfectionRisk) { this.adjustedInfectionRisk = adjustedInfectionRisk; }
        
        public double getAdjustedHealingDelayRisk() { return adjustedHealingDelayRisk; }
        public void setAdjustedHealingDelayRisk(double adjustedHealingDelayRisk) { this.adjustedHealingDelayRisk = adjustedHealingDelayRisk; }
        
        public double getAdjustedComplicationRisk() { return adjustedComplicationRisk; }
        public void setAdjustedComplicationRisk(double adjustedComplicationRisk) { this.adjustedComplicationRisk = adjustedComplicationRisk; }
        
        public String getOverallRiskLevel() { return overallRiskLevel; }
        public void setOverallRiskLevel(String overallRiskLevel) { this.overallRiskLevel = overallRiskLevel; }
        
        public List<String> getRiskFactors() { return riskFactors; }
        public void setRiskFactors(List<String> riskFactors) { this.riskFactors = riskFactors; }
    }
    
    public static class PersonalizedRecommendation {
        private String title;
        private String description;
        private Priority priority;
        private String rationale;
        
        public PersonalizedRecommendation(String title, String description, Priority priority, String rationale) {
            this.title = title;
            this.description = description;
            this.priority = priority;
            this.rationale = rationale;
        }
        
        // Getters
        public String getTitle() { return title; }
        public String getDescription() { return description; }
        public Priority getPriority() { return priority; }
        public String getRationale() { return rationale; }
    }
    
    public static class PrognosisAssessment {
        private String prognosisLevel;
        private String prognosisDescription;
        private double healingProbability;
        private int estimatedHealingTimeDays;
        private List<String> favorableFactors;
        private List<String> unfavorableFactors;
        
        // Getters and Setters
        public String getPrognosisLevel() { return prognosisLevel; }
        public void setPrognosisLevel(String prognosisLevel) { this.prognosisLevel = prognosisLevel; }
        
        public String getPrognosisDescription() { return prognosisDescription; }
        public void setPrognosisDescription(String prognosisDescription) { this.prognosisDescription = prognosisDescription; }
        
        public double getHealingProbability() { return healingProbability; }
        public void setHealingProbability(double healingProbability) { this.healingProbability = healingProbability; }
        
        public int getEstimatedHealingTimeDays() { return estimatedHealingTimeDays; }
        public void setEstimatedHealingTimeDays(int estimatedHealingTimeDays) { this.estimatedHealingTimeDays = estimatedHealingTimeDays; }
        
        public List<String> getFavorableFactors() { return favorableFactors; }
        public void setFavorableFactors(List<String> favorableFactors) { this.favorableFactors = favorableFactors; }
        
        public List<String> getUnfavorableFactors() { return unfavorableFactors; }
        public void setUnfavorableFactors(List<String> unfavorableFactors) { this.unfavorableFactors = unfavorableFactors; }
    }
    
    public static class ClinicalAlert {
        private AlertLevel level;
        private String title;
        private String description;
        private List<String> suggestedActions;
        
        public ClinicalAlert(AlertLevel level, String title, String description, List<String> suggestedActions) {
            this.level = level;
            this.title = title;
            this.description = description;
            this.suggestedActions = suggestedActions;
        }
        
        // Getters
        public AlertLevel getLevel() { return level; }
        public String getTitle() { return title; }
        public String getDescription() { return description; }
        public List<String> getSuggestedActions() { return suggestedActions; }
    }
    
    public enum Priority {
        CRITICAL, HIGH, MEDIUM, LOW
    }
    
    public enum AlertLevel {
        CRITICAL, HIGH, MEDIUM, LOW
    }
}
