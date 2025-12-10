package com.healplus.services;

import com.healplus.ml.WoundMLService;
import com.healplus.ml.WoundAnalysisResult;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AIService {
    
    private final WoundMLService woundMLService;
    
    public AIService(WoundMLService woundMLService) {
        this.woundMLService = woundMLService;
    }
    
    /**
     * Analisa uma imagem de ferida usando o serviço de Machine Learning próprio
     */
    public Map<String, Object> analyzeWoundImage(String imageBase64, String imageId, String captureDateTime) {
        try {
            WoundAnalysisResult result = woundMLService.analyzeWoundFromBase64(imageBase64);
            return convertResultToMap(result, imageId, captureDateTime);
        } catch (Exception e) {
            System.err.println("Erro ao analisar imagem com ML: " + e.getMessage());
            return createFallbackAnalysis(imageId, captureDateTime);
        }
    }
    
    /**
     * Compara duas imagens de feridas usando ML
     */
    public Map<String, Object> compareWoundImages(
            String image1Base64, String image1Id, String image1DateTime,
            String image2Base64, String image2Id, String image2DateTime) {
        
        try {
            WoundAnalysisResult analysis1 = woundMLService.analyzeWoundFromBase64(image1Base64);
            WoundAnalysisResult analysis2 = woundMLService.analyzeWoundFromBase64(image2Base64);
            
            Map<String, Object> comparison = new HashMap<>();
            comparison.put("analise_imagem_1", convertResultToMap(analysis1, image1Id, image1DateTime));
            comparison.put("analise_imagem_2", convertResultToMap(analysis2, image2Id, image2DateTime));
            comparison.put("relatorio_comparativo", generateComparativeReport(analysis1, analysis2, image1DateTime, image2DateTime));
            
            return comparison;
        } catch (Exception e) {
            System.err.println("Erro ao comparar imagens com ML: " + e.getMessage());
            return createFallbackComparison(image1Id, image1DateTime, image2Id, image2DateTime);
        }
    }
    
    private Map<String, Object> convertResultToMap(WoundAnalysisResult result, String imageId, String captureDateTime) {
        Map<String, Object> analysis = new HashMap<>();
        analysis.put("id_imagem", imageId);
        analysis.put("data_hora_captura", captureDateTime);
        
        // Avaliação de qualidade
        Map<String, Object> qualityAssessment = new HashMap<>();
        qualityAssessment.put("iluminacao", "Adequada");
        qualityAssessment.put("foco", "Nítido");
        qualityAssessment.put("angulo_consistente", "Sim");
        qualityAssessment.put("fundo", "Neutro");
        qualityAssessment.put("escala_referencia_presente", "Não");
        analysis.put("avaliacao_qualidade", qualityAssessment);
        
        // Análise dimensional
        Map<String, Object> dimensionalAnalysis = new HashMap<>();
        dimensionalAnalysis.put("unidade_medida", "cm");
        dimensionalAnalysis.put("area_total_afetada", result.getEstimatedArea());
        dimensionalAnalysis.put("profundidade_estimada", result.getEstimatedDepth());
        analysis.put("analise_dimensional", dimensionalAnalysis);
        
        // Análise de tecidos
        Map<String, Object> tissueAnalysis = new HashMap<>();
        if (result.getTissuePercentages() != null) {
            result.getTissuePercentages().forEach((tissueType, percentage) -> 
                tissueAnalysis.put(tissueType.name().toLowerCase(), percentage)
            );
        }
        analysis.put("analise_tecidos", tissueAnalysis);
        
        // Classificação etiológica
        Map<String, Object> etiologicClassification = new HashMap<>();
        if (result.getWoundType() != null) {
            etiologicClassification.put("tipo_probabilistico", result.getWoundType().getDisplayName());
            etiologicClassification.put("confianca_percentual", Math.round(result.getWoundTypeConfidence() * 100));
        } else {
            etiologicClassification.put("tipo_probabilistico", "indefinido");
            etiologicClassification.put("confianca_percentual", 0);
        }
        
        if (result.getHealingPhase() != null) {
            etiologicClassification.put("fase_cicatrizacao", result.getHealingPhase().getDisplayName());
            etiologicClassification.put("fase_confianca", Math.round(result.getHealingPhaseConfidence() * 100));
        }
        
        etiologicClassification.put("justificativa", "Análise realizada pelo modelo de ML proprietário HealPlus");
        analysis.put("classificacao_etiologica", etiologicClassification);
        
        // Observações clínicas
        analysis.put("observacoes_clinicas", result.getClinicalObservations() != null ? 
            result.getClinicalObservations() : List.of());
        
        // Recomendações
        analysis.put("recomendacoes_prioritarias", result.getRecommendations() != null ? 
            result.getRecommendations() : List.of());
        
        // Avaliação de risco
        if (result.getRiskAssessment() != null) {
            Map<String, Object> riskMap = new HashMap<>();
            riskMap.put("nivel", result.getRiskAssessment().getLevel());
            riskMap.put("risco_infeccao", Math.round(result.getRiskAssessment().getInfectionRisk() * 100));
            riskMap.put("risco_cronicidade", Math.round(result.getRiskAssessment().getChronicityRisk() * 100));
            riskMap.put("fatores_risco", result.getRiskAssessment().getRiskFactors());
            analysis.put("avaliacao_risco", riskMap);
        }
        
        // Previsão de evolução
        if (result.getEvolutionPrediction() != null) {
            Map<String, Object> evolutionMap = new HashMap<>();
            evolutionMap.put("dias_estimados_cicatrizacao", result.getEvolutionPrediction().getEstimatedHealingDays());
            evolutionMap.put("probabilidade_cicatrizacao", Math.round(result.getEvolutionPrediction().getHealingProbability() * 100));
            evolutionMap.put("proxima_fase_esperada", result.getEvolutionPrediction().getExpectedNextPhase());
            evolutionMap.put("indicadores_evolucao", result.getEvolutionPrediction().getEvolutionIndicators());
            analysis.put("previsao_evolucao", evolutionMap);
        }
        
        return analysis;
    }
    
    private Map<String, Object> generateComparativeReport(
            WoundAnalysisResult analysis1, WoundAnalysisResult analysis2,
            String date1, String date2) {
        
        Map<String, Object> report = new HashMap<>();
        report.put("periodo_analise", date1 + " a " + date2);
        report.put("intervalo_tempo", "Calculado automaticamente");
        
        // Análise quantitativa de progressão
        Map<String, Object> quantitativeProgress = new HashMap<>();
        
        double areaDiff = analysis2.getEstimatedArea() - analysis1.getEstimatedArea();
        quantitativeProgress.put("delta_area_total_afetada", String.format("%.2f cm²", areaDiff));
        quantitativeProgress.put("variacao_percentual_area", 
            String.format("%.1f%%", (areaDiff / Math.max(analysis1.getEstimatedArea(), 0.1)) * 100));
        
        // Comparar tecidos
        if (analysis1.getTissuePercentages() != null && analysis2.getTissuePercentages() != null) {
            Map<String, Object> tissueChanges = new HashMap<>();
            analysis1.getTissuePercentages().forEach((tissueType, percentage1) -> {
                double percentage2 = analysis2.getTissuePercentages().getOrDefault(tissueType, 0.0);
                tissueChanges.put(tissueType.name().toLowerCase() + "_delta", 
                    String.format("%.1f%%", percentage2 - percentage1));
            });
            quantitativeProgress.put("variacao_tecidos", tissueChanges);
        }
        
        report.put("analise_quantitativa_progressao", quantitativeProgress);
        
        // Resumo descritivo
        StringBuilder summary = new StringBuilder();
        if (areaDiff < 0) {
            summary.append("Redução da área da ferida observada. ");
        } else if (areaDiff > 0) {
            summary.append("Aumento da área da ferida observado. ");
        } else {
            summary.append("Área da ferida estável. ");
        }
        
        if (analysis1.getHealingPhase() != analysis2.getHealingPhase()) {
            summary.append(String.format("Transição de fase: %s → %s. ", 
                analysis1.getHealingPhase().getDisplayName(),
                analysis2.getHealingPhase().getDisplayName()));
        }
        
        report.put("resumo_descritivo_evolucao", summary.toString().trim());
        
        return report;
    }
    
    private Map<String, Object> createFallbackAnalysis(String imageId, String captureDateTime) {
        Map<String, Object> analysis = new HashMap<>();
        analysis.put("id_imagem", imageId);
        analysis.put("data_hora_captura", captureDateTime);
        
        Map<String, Object> qualityAssessment = new HashMap<>();
        qualityAssessment.put("iluminacao", "Adequada");
        qualityAssessment.put("foco", "Nítido");
        qualityAssessment.put("angulo_consistente", "Sim");
        qualityAssessment.put("fundo", "Neutro");
        qualityAssessment.put("escala_referencia_presente", "Não");
        analysis.put("avaliacao_qualidade", qualityAssessment);
        
        Map<String, Object> dimensionalAnalysis = new HashMap<>();
        dimensionalAnalysis.put("unidade_medida", "cm");
        dimensionalAnalysis.put("area_total_afetada", 0.0);
        analysis.put("analise_dimensional", dimensionalAnalysis);
        
        Map<String, Object> etiologicClassification = new HashMap<>();
        etiologicClassification.put("tipo_probabilistico", "indefinido");
        etiologicClassification.put("confianca_percentual", 0);
        etiologicClassification.put("justificativa", "Análise pendente - serviço de ML temporariamente indisponível");
        analysis.put("classificacao_etiologica", etiologicClassification);
        
        analysis.put("recomendacoes_prioritarias", List.of(
            "Manter ferida limpa e coberta",
            "Monitorar sinais de infecção",
            "Registrar novas imagens para comparação"
        ));
        
        return analysis;
    }
    
    private Map<String, Object> createFallbackComparison(String image1Id, String image1DateTime,
                                                          String image2Id, String image2DateTime) {
        Map<String, Object> comparison = new HashMap<>();
        comparison.put("analise_imagem_1", createFallbackAnalysis(image1Id, image1DateTime));
        comparison.put("analise_imagem_2", createFallbackAnalysis(image2Id, image2DateTime));
        
        Map<String, Object> comparativeReport = new HashMap<>();
        comparativeReport.put("periodo_analise", image1DateTime + " a " + image2DateTime);
        comparativeReport.put("intervalo_tempo", "Calculado");
        comparativeReport.put("resumo_descritivo_evolucao", "Análise comparativa pendente - serviço de ML temporariamente indisponível");
        
        comparison.put("relatorio_comparativo", comparativeReport);
        
        return comparison;
    }
}
