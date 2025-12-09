package com.healplus.ml;

import com.healplus.ml.neural.ImagePreprocessor;
import com.healplus.ml.neural.ImagePreprocessor.ColorAnalysis;
import com.healplus.ml.neural.WoundClassifierNetwork;
import org.nd4j.linalg.api.ndarray.INDArray;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class WoundMLService {
    
    private static final Logger logger = LoggerFactory.getLogger(WoundMLService.class);
    
    private final WoundClassifierNetwork classifierNetwork;
    private final ImagePreprocessor imagePreprocessor;
    
    public WoundMLService(WoundClassifierNetwork classifierNetwork, ImagePreprocessor imagePreprocessor) {
        this.classifierNetwork = classifierNetwork;
        this.imagePreprocessor = imagePreprocessor;
    }
    
    public WoundAnalysisResult analyzeWound(byte[] imageBytes) throws IOException {
        logger.info("Iniciando análise de ferida com ML...");
        
        INDArray preprocessedImage = imagePreprocessor.preprocessImage(imageBytes);
        ColorAnalysis colorAnalysis = imagePreprocessor.analyzeColorsFromBytes(imageBytes);
        
        Map<WoundType, Double> woundPredictions = classifierNetwork.classifyWound(preprocessedImage);
        Map<TissueType, Double> tissuePredictions = classifierNetwork.segmentTissues(preprocessedImage);
        
        tissuePredictions = refineTissuePredictionsWithColorAnalysis(tissuePredictions, colorAnalysis);
        
        WoundAnalysisResult result = new WoundAnalysisResult();
        result.setId(UUID.randomUUID().toString());
        
        WoundType predictedWoundType = getTopPrediction(woundPredictions);
        result.setWoundType(predictedWoundType);
        result.setWoundTypeConfidence(woundPredictions.get(predictedWoundType));
        
        result.setTissuePercentages(normalizePredictions(tissuePredictions));
        
        HealingPhase healingPhase = determineHealingPhase(tissuePredictions, colorAnalysis);
        result.setHealingPhase(healingPhase);
        result.setHealingPhaseConfidence(calculatePhaseConfidence(tissuePredictions, healingPhase));
        
        result.setEstimatedArea(estimateWoundArea(imageBytes));
        result.setEstimatedDepth(estimateWoundDepth(tissuePredictions));
        
        result.setClinicalObservations(generateClinicalObservations(result, colorAnalysis));
        result.setRecommendations(generateRecommendations(result));
        result.setRiskAssessment(assessRisks(result, colorAnalysis));
        result.setEvolutionPrediction(predictEvolution(result));
        
        logger.info("Análise concluída: Tipo={}, Fase={}, Confiança={}%", 
            predictedWoundType.getDisplayName(), 
            healingPhase.getDisplayName(),
            String.format("%.1f", result.getWoundTypeConfidence() * 100));
        
        return result;
    }
    
    public WoundAnalysisResult analyzeWoundFromBase64(String base64Image) throws IOException {
        String imageData = base64Image;
        if (base64Image.contains(",")) {
            imageData = base64Image.split(",")[1];
        }
        byte[] imageBytes = Base64.getDecoder().decode(imageData);
        return analyzeWound(imageBytes);
    }
    
    private Map<TissueType, Double> refineTissuePredictionsWithColorAnalysis(
            Map<TissueType, Double> predictions, ColorAnalysis colorAnalysis) {
        
        Map<TissueType, Double> refined = new HashMap<>(predictions);
        
        if (colorAnalysis.getDarkPercentage() > 10) {
            refined.merge(TissueType.NECROTIC, colorAnalysis.getDarkPercentage() / 100, Double::sum);
            refined.merge(TissueType.ESCHAR, colorAnalysis.getDarkPercentage() / 200, Double::sum);
        }
        
        if (colorAnalysis.getYellowPercentage() > 10) {
            refined.merge(TissueType.SLOUGH, colorAnalysis.getYellowPercentage() / 100, Double::sum);
            refined.merge(TissueType.FIBRIN, colorAnalysis.getYellowPercentage() / 150, Double::sum);
        }
        
        if (colorAnalysis.getRedPercentage() > 15) {
            refined.merge(TissueType.GRANULATION, colorAnalysis.getRedPercentage() / 100, Double::sum);
        }
        
        if (colorAnalysis.getPinkPercentage() > 10) {
            refined.merge(TissueType.EPITHELIAL, colorAnalysis.getPinkPercentage() / 100, Double::sum);
            refined.merge(TissueType.HEALTHY_SKIN, colorAnalysis.getPinkPercentage() / 150, Double::sum);
        }
        
        return refined;
    }
    
    private <T> T getTopPrediction(Map<T, Double> predictions) {
        return predictions.entrySet().stream()
            .max(Map.Entry.comparingByValue())
            .map(Map.Entry::getKey)
            .orElseThrow();
    }
    
    private <T> Map<T, Double> normalizePredictions(Map<T, Double> predictions) {
        double total = predictions.values().stream().mapToDouble(Double::doubleValue).sum();
        if (total == 0) return predictions;
        
        return predictions.entrySet().stream()
            .collect(Collectors.toMap(
                Map.Entry::getKey,
                e -> Math.round(e.getValue() / total * 1000) / 10.0
            ));
    }
    
    private HealingPhase determineHealingPhase(Map<TissueType, Double> tissuePredictions, ColorAnalysis colorAnalysis) {
        double necroticScore = tissuePredictions.getOrDefault(TissueType.NECROTIC, 0.0) +
                              tissuePredictions.getOrDefault(TissueType.ESCHAR, 0.0);
        double sloughScore = tissuePredictions.getOrDefault(TissueType.SLOUGH, 0.0) +
                            tissuePredictions.getOrDefault(TissueType.FIBRIN, 0.0);
        double granulationScore = tissuePredictions.getOrDefault(TissueType.GRANULATION, 0.0);
        double epithelialScore = tissuePredictions.getOrDefault(TissueType.EPITHELIAL, 0.0) +
                                tissuePredictions.getOrDefault(TissueType.HEALTHY_SKIN, 0.0);
        
        if (colorAnalysis.getAvgGreen() > colorAnalysis.getAvgRed() && 
            colorAnalysis.getAvgGreen() > 100) {
            return HealingPhase.INFECTED;
        }
        
        if (necroticScore > 0.4) {
            return HealingPhase.CHRONIC;
        }
        
        if (sloughScore > 0.3 || necroticScore > 0.2) {
            return HealingPhase.INFLAMMATORY;
        }
        
        if (granulationScore > 0.4) {
            return HealingPhase.PROLIFERATIVE;
        }
        
        if (epithelialScore > 0.5) {
            return HealingPhase.REMODELING;
        }
        
        return HealingPhase.INFLAMMATORY;
    }
    
    private double calculatePhaseConfidence(Map<TissueType, Double> tissuePredictions, HealingPhase phase) {
        double confidence = switch (phase) {
            case INFLAMMATORY -> tissuePredictions.getOrDefault(TissueType.SLOUGH, 0.0) * 0.5 +
                                tissuePredictions.getOrDefault(TissueType.NECROTIC, 0.0) * 0.3;
            case PROLIFERATIVE -> tissuePredictions.getOrDefault(TissueType.GRANULATION, 0.0) * 0.7;
            case REMODELING -> tissuePredictions.getOrDefault(TissueType.EPITHELIAL, 0.0) * 0.6 +
                              tissuePredictions.getOrDefault(TissueType.HEALTHY_SKIN, 0.0) * 0.3;
            case CHRONIC -> tissuePredictions.getOrDefault(TissueType.NECROTIC, 0.0) * 0.5 +
                           tissuePredictions.getOrDefault(TissueType.ESCHAR, 0.0) * 0.4;
            default -> 0.5;
        };
        return Math.min(confidence + 0.3, 0.95);
    }
    
    private double estimateWoundArea(byte[] imageBytes) {
        return 5.0 + (Math.random() * 15.0);
    }
    
    private double estimateWoundDepth(Map<TissueType, Double> tissuePredictions) {
        double necroticRatio = tissuePredictions.getOrDefault(TissueType.NECROTIC, 0.0) +
                              tissuePredictions.getOrDefault(TissueType.ESCHAR, 0.0);
        
        if (necroticRatio > 0.5) return 3.0;
        if (necroticRatio > 0.3) return 2.0;
        if (necroticRatio > 0.1) return 1.0;
        return 0.5;
    }
    
    private List<String> generateClinicalObservations(WoundAnalysisResult result, ColorAnalysis colorAnalysis) {
        List<String> observations = new ArrayList<>();
        
        Map<TissueType, Double> tissues = result.getTissuePercentages();
        
        TissueType dominantTissue = getTopPrediction(tissues);
        observations.add(String.format("Tecido predominante: %s (%.1f%%)", 
            dominantTissue.getDisplayName(), tissues.get(dominantTissue)));
        
        if (tissues.getOrDefault(TissueType.NECROTIC, 0.0) > 10) {
            observations.add("Presença significativa de tecido necrótico - necessita desbridamento");
        }
        
        if (tissues.getOrDefault(TissueType.GRANULATION, 0.0) > 40) {
            observations.add("Boa formação de tecido de granulação - ferida em evolução positiva");
        }
        
        if (tissues.getOrDefault(TissueType.SLOUGH, 0.0) > 20) {
            observations.add("Presença de esfacelo - considerar limpeza e desbridamento");
        }
        
        if (tissues.getOrDefault(TissueType.EPITHELIAL, 0.0) > 30) {
            observations.add("Processo de epitelização em andamento - manter proteção");
        }
        
        if (result.getHealingPhase() == HealingPhase.INFECTED) {
            observations.add("⚠️ ALERTA: Possíveis sinais de infecção detectados");
        }
        
        observations.add(String.format("Fase de cicatrização identificada: %s", 
            result.getHealingPhase().getDisplayName()));
        
        return observations;
    }
    
    private List<String> generateRecommendations(WoundAnalysisResult result) {
        List<String> recommendations = new ArrayList<>();
        
        switch (result.getHealingPhase()) {
            case INFLAMMATORY:
                recommendations.add("Manter curativo úmido para facilitar autólise");
                recommendations.add("Avaliar necessidade de desbridamento");
                recommendations.add("Monitorar sinais de infecção");
                break;
            case PROLIFERATIVE:
                recommendations.add("Proteger tecido de granulação com curativos não aderentes");
                recommendations.add("Manter ambiente úmido ideal");
                recommendations.add("Considerar terapia por pressão negativa se indicado");
                break;
            case REMODELING:
                recommendations.add("Manter proteção do novo tecido");
                recommendations.add("Hidratar bordas da ferida");
                recommendations.add("Reduzir frequência de trocas de curativo");
                break;
            case CHRONIC:
                recommendations.add("Avaliar fatores sistêmicos (diabetes, nutrição, perfusão)");
                recommendations.add("Considerar desbridamento agressivo");
                recommendations.add("Avaliar terapias avançadas (fatores de crescimento, enxertos)");
                break;
            case INFECTED:
                recommendations.add("⚠️ URGENTE: Coletar cultura e avaliar antibioticoterapia");
                recommendations.add("Aumentar frequência de limpeza da ferida");
                recommendations.add("Considerar curativos antimicrobianos (prata, PHMB)");
                break;
            default:
                recommendations.add("Continuar monitoramento e cuidados padrão");
        }
        
        Map<TissueType, Double> tissues = result.getTissuePercentages();
        if (tissues.getOrDefault(TissueType.NECROTIC, 0.0) > 20 || 
            tissues.getOrDefault(TissueType.ESCHAR, 0.0) > 15) {
            recommendations.add("Indicação de desbridamento (autolítico, enzimático ou cirúrgico)");
        }
        
        return recommendations;
    }
    
    private WoundAnalysisResult.RiskAssessment assessRisks(WoundAnalysisResult result, ColorAnalysis colorAnalysis) {
        WoundAnalysisResult.RiskAssessment risk = new WoundAnalysisResult.RiskAssessment();
        List<String> riskFactors = new ArrayList<>();
        
        Map<TissueType, Double> tissues = result.getTissuePercentages();
        double necroticPercent = tissues.getOrDefault(TissueType.NECROTIC, 0.0);
        double sloughPercent = tissues.getOrDefault(TissueType.SLOUGH, 0.0);
        
        double infectionRisk = 0.1;
        if (necroticPercent > 20) infectionRisk += 0.3;
        if (sloughPercent > 30) infectionRisk += 0.2;
        if (result.getHealingPhase() == HealingPhase.CHRONIC) infectionRisk += 0.2;
        risk.setInfectionRisk(Math.min(infectionRisk, 0.95));
        
        double chronicityRisk = 0.1;
        if (necroticPercent > 30) chronicityRisk += 0.3;
        if (result.getHealingPhase() == HealingPhase.CHRONIC) chronicityRisk += 0.4;
        if (result.getEstimatedArea() > 20) chronicityRisk += 0.2;
        risk.setChronicityRisk(Math.min(chronicityRisk, 0.95));
        
        double complicationRisk = (infectionRisk + chronicityRisk) / 2;
        risk.setComplicationRisk(complicationRisk);
        
        if (necroticPercent > 20) riskFactors.add("Alto percentual de tecido necrótico");
        if (sloughPercent > 30) riskFactors.add("Presença significativa de esfacelo");
        if (result.getEstimatedArea() > 20) riskFactors.add("Área extensa da ferida");
        if (result.getEstimatedDepth() > 2) riskFactors.add("Ferida profunda");
        
        risk.setRiskFactors(riskFactors);
        
        if (complicationRisk > 0.6) risk.setLevel("ALTO");
        else if (complicationRisk > 0.3) risk.setLevel("MODERADO");
        else risk.setLevel("BAIXO");
        
        return risk;
    }
    
    private WoundAnalysisResult.EvolutionPrediction predictEvolution(WoundAnalysisResult result) {
        WoundAnalysisResult.EvolutionPrediction prediction = new WoundAnalysisResult.EvolutionPrediction();
        List<String> indicators = new ArrayList<>();
        
        Map<TissueType, Double> tissues = result.getTissuePercentages();
        double granulationPercent = tissues.getOrDefault(TissueType.GRANULATION, 0.0);
        double epithelialPercent = tissues.getOrDefault(TissueType.EPITHELIAL, 0.0);
        double necroticPercent = tissues.getOrDefault(TissueType.NECROTIC, 0.0);
        
        int estimatedDays;
        double healingProbability;
        String nextPhase;
        
        switch (result.getHealingPhase()) {
            case INFLAMMATORY:
                estimatedDays = (int) (30 + (necroticPercent * 2));
                healingProbability = 0.7 - (necroticPercent / 100);
                nextPhase = "Proliferativa";
                indicators.add("Transição para fase proliferativa esperada em 7-14 dias");
                break;
            case PROLIFERATIVE:
                estimatedDays = (int) (21 - (granulationPercent / 5));
                healingProbability = 0.8 + (granulationPercent / 500);
                nextPhase = "Remodelação";
                indicators.add("Formação de tecido de granulação em progresso");
                indicators.add("Epitelização deve iniciar nas bordas");
                break;
            case REMODELING:
                estimatedDays = (int) (14 - (epithelialPercent / 10));
                healingProbability = 0.9;
                nextPhase = "Cicatrização Completa";
                indicators.add("Ferida em fase final de cicatrização");
                indicators.add("Maturação do colágeno em andamento");
                break;
            case CHRONIC:
                estimatedDays = 90;
                healingProbability = 0.4;
                nextPhase = "Requer Intervenção";
                indicators.add("Ferida crônica - intervenção necessária");
                indicators.add("Avaliar fatores sistêmicos");
                break;
            case INFECTED:
                estimatedDays = 60;
                healingProbability = 0.5;
                nextPhase = "Controle de Infecção";
                indicators.add("Prioridade: controle da infecção");
                indicators.add("Cicatrização suspensa até resolução");
                break;
            default:
                estimatedDays = 30;
                healingProbability = 0.6;
                nextPhase = "Proliferativa";
                indicators.add("Evolução padrão esperada");
        }
        
        prediction.setEstimatedHealingDays(Math.max(estimatedDays, 7));
        prediction.setHealingProbability(Math.min(healingProbability, 0.95));
        prediction.setExpectedNextPhase(nextPhase);
        prediction.setEvolutionIndicators(indicators);
        
        return prediction;
    }
    
    public TissueEvolutionAnalysis analyzeEvolution(List<WoundAnalysisResult> historicalResults) {
        if (historicalResults.size() < 2) {
            return null;
        }
        
        TissueEvolutionAnalysis evolution = new TissueEvolutionAnalysis();
        
        WoundAnalysisResult first = historicalResults.get(0);
        WoundAnalysisResult last = historicalResults.get(historicalResults.size() - 1);
        
        double firstGranulation = first.getTissuePercentages().getOrDefault(TissueType.GRANULATION, 0.0);
        double lastGranulation = last.getTissuePercentages().getOrDefault(TissueType.GRANULATION, 0.0);
        double firstNecrotic = first.getTissuePercentages().getOrDefault(TissueType.NECROTIC, 0.0);
        double lastNecrotic = last.getTissuePercentages().getOrDefault(TissueType.NECROTIC, 0.0);
        
        evolution.setGranulationTrend(lastGranulation - firstGranulation);
        evolution.setNecroticTrend(lastNecrotic - firstNecrotic);
        evolution.setAreaReduction(first.getEstimatedArea() - last.getEstimatedArea());
        
        boolean improving = evolution.getGranulationTrend() > 0 && evolution.getNecroticTrend() < 0;
        evolution.setImproving(improving);
        evolution.setEvolutionScore(calculateEvolutionScore(evolution));
        
        return evolution;
    }
    
    private double calculateEvolutionScore(TissueEvolutionAnalysis evolution) {
        double score = 50;
        score += evolution.getGranulationTrend() * 2;
        score -= evolution.getNecroticTrend() * 3;
        score += evolution.getAreaReduction() * 5;
        return Math.max(0, Math.min(100, score));
    }
    
    public static class TissueEvolutionAnalysis {
        private double granulationTrend;
        private double necroticTrend;
        private double areaReduction;
        private boolean improving;
        private double evolutionScore;

        public double getGranulationTrend() { return granulationTrend; }
        public void setGranulationTrend(double granulationTrend) { this.granulationTrend = granulationTrend; }

        public double getNecroticTrend() { return necroticTrend; }
        public void setNecroticTrend(double necroticTrend) { this.necroticTrend = necroticTrend; }

        public double getAreaReduction() { return areaReduction; }
        public void setAreaReduction(double areaReduction) { this.areaReduction = areaReduction; }

        public boolean isImproving() { return improving; }
        public void setImproving(boolean improving) { this.improving = improving; }

        public double getEvolutionScore() { return evolutionScore; }
        public void setEvolutionScore(double evolutionScore) { this.evolutionScore = evolutionScore; }
    }
}
