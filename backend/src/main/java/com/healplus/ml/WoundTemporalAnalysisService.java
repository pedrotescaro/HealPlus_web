package com.healplus.ml;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Serviço de Análise Temporal de Feridas
 * Realiza comparação de imagens ao longo do tempo para detectar evolução
 */
@Service
public class WoundTemporalAnalysisService {
    
    private static final Logger logger = LoggerFactory.getLogger(WoundTemporalAnalysisService.class);
    
    /**
     * Analisa a evolução temporal de uma ferida baseado em múltiplas avaliações
     */
    public TemporalEvolutionResult analyzeTemporalEvolution(List<WoundAnalysisResult> historicalAnalyses) {
        if (historicalAnalyses == null || historicalAnalyses.size() < 2) {
            return createInsufficientDataResult();
        }
        
        // Ordenar por data de análise
        List<WoundAnalysisResult> sortedAnalyses = historicalAnalyses.stream()
            .sorted(Comparator.comparing(WoundAnalysisResult::getAnalyzedAt))
            .collect(Collectors.toList());
        
        TemporalEvolutionResult result = new TemporalEvolutionResult();
        result.setAnalysisCount(sortedAnalyses.size());
        result.setFirstAnalysisDate(sortedAnalyses.get(0).getAnalyzedAt());
        result.setLastAnalysisDate(sortedAnalyses.get(sortedAnalyses.size() - 1).getAnalyzedAt());
        
        // Calcular métricas de evolução
        result.setAreaEvolution(calculateAreaEvolution(sortedAnalyses));
        result.setTissueEvolution(calculateTissueEvolution(sortedAnalyses));
        result.setHealingRateMetrics(calculateHealingRate(sortedAnalyses));
        result.setTrendAnalysis(analyzeTrends(sortedAnalyses));
        result.setOverallProgression(determineOverallProgression(result));
        result.setConfidenceScore(calculateConfidenceScore(sortedAnalyses));
        result.setClinicalInsights(generateClinicalInsights(result, sortedAnalyses));
        result.setRecommendations(generateTemporalRecommendations(result));
        result.setAlerts(generateAlerts(result, sortedAnalyses));
        
        logger.info("Análise temporal concluída: {} avaliações, progressão: {}", 
            sortedAnalyses.size(), result.getOverallProgression());
        
        return result;
    }
    
    private AreaEvolution calculateAreaEvolution(List<WoundAnalysisResult> analyses) {
        AreaEvolution evolution = new AreaEvolution();
        
        WoundAnalysisResult first = analyses.get(0);
        WoundAnalysisResult last = analyses.get(analyses.size() - 1);
        
        double initialArea = first.getEstimatedArea();
        double currentArea = last.getEstimatedArea();
        double areaChange = currentArea - initialArea;
        double percentChange = initialArea > 0 ? (areaChange / initialArea) * 100 : 0;
        
        evolution.setInitialArea(initialArea);
        evolution.setCurrentArea(currentArea);
        evolution.setAbsoluteChange(areaChange);
        evolution.setPercentChange(percentChange);
        
        // Calcular velocidade de mudança
        Duration totalDuration = Duration.between(first.getAnalyzedAt(), last.getAnalyzedAt());
        long days = Math.max(totalDuration.toDays(), 1);
        evolution.setDailyChangeRate(areaChange / days);
        evolution.setWeeklyChangeRate((areaChange / days) * 7);
        
        // Determinar direção da evolução
        if (percentChange < -10) {
            evolution.setDirection(EvolutionDirection.IMPROVING);
        } else if (percentChange > 10) {
            evolution.setDirection(EvolutionDirection.WORSENING);
        } else {
            evolution.setDirection(EvolutionDirection.STABLE);
        }
        
        // Histórico de áreas
        List<Double> areaHistory = analyses.stream()
            .map(WoundAnalysisResult::getEstimatedArea)
            .collect(Collectors.toList());
        evolution.setAreaHistory(areaHistory);
        
        return evolution;
    }
    
    private TissueEvolution calculateTissueEvolution(List<WoundAnalysisResult> analyses) {
        TissueEvolution evolution = new TissueEvolution();
        
        WoundAnalysisResult first = analyses.get(0);
        WoundAnalysisResult last = analyses.get(analyses.size() - 1);
        
        Map<TissueType, Double> initialTissues = first.getTissuePercentages();
        Map<TissueType, Double> currentTissues = last.getTissuePercentages();
        
        // Calcular mudanças em cada tipo de tecido
        Map<TissueType, Double> tissueChanges = new EnumMap<>(TissueType.class);
        for (TissueType type : TissueType.values()) {
            double initial = initialTissues.getOrDefault(type, 0.0);
            double current = currentTissues.getOrDefault(type, 0.0);
            tissueChanges.put(type, current - initial);
        }
        evolution.setTissueChanges(tissueChanges);
        
        // Métricas específicas importantes
        double granulationChange = tissueChanges.getOrDefault(TissueType.GRANULATION, 0.0);
        double necroticChange = tissueChanges.getOrDefault(TissueType.NECROTIC, 0.0);
        double epithelialChange = tissueChanges.getOrDefault(TissueType.EPITHELIAL, 0.0);
        double sloughChange = tissueChanges.getOrDefault(TissueType.SLOUGH, 0.0);
        
        evolution.setGranulationTrend(granulationChange > 5 ? "Aumentando" : 
                                      granulationChange < -5 ? "Diminuindo" : "Estável");
        evolution.setNecroticTrend(necroticChange > 5 ? "Aumentando (⚠️)" : 
                                   necroticChange < -5 ? "Diminuindo (✓)" : "Estável");
        evolution.setEpithelializationTrend(epithelialChange > 5 ? "Aumentando (✓)" : 
                                            epithelialChange < -5 ? "Diminuindo" : "Estável");
        
        // Score de qualidade da cicatrização
        double healingScore = 50;
        healingScore += granulationChange * 2;
        healingScore += epithelialChange * 3;
        healingScore -= necroticChange * 4;
        healingScore -= sloughChange * 2;
        evolution.setHealingQualityScore(Math.max(0, Math.min(100, healingScore)));
        
        return evolution;
    }
    
    private HealingRateMetrics calculateHealingRate(List<WoundAnalysisResult> analyses) {
        HealingRateMetrics metrics = new HealingRateMetrics();
        
        if (analyses.size() < 2) {
            metrics.setHealingVelocity(0);
            metrics.setEstimatedDaysToHeal(-1);
            return metrics;
        }
        
        WoundAnalysisResult first = analyses.get(0);
        WoundAnalysisResult last = analyses.get(analyses.size() - 1);
        
        Duration duration = Duration.between(first.getAnalyzedAt(), last.getAnalyzedAt());
        long days = Math.max(duration.toDays(), 1);
        
        double areaReduction = first.getEstimatedArea() - last.getEstimatedArea();
        double dailyReduction = areaReduction / days;
        
        metrics.setHealingVelocity(dailyReduction);
        metrics.setWeeklyHealingRate(dailyReduction * 7);
        
        // Calcular % de redução por semana (PUSH score usa isso)
        double weeklyPercentReduction = first.getEstimatedArea() > 0 ? 
            (dailyReduction * 7 / first.getEstimatedArea()) * 100 : 0;
        metrics.setWeeklyPercentReduction(weeklyPercentReduction);
        
        // Estimar tempo para cicatrização
        if (dailyReduction > 0 && last.getEstimatedArea() > 0) {
            int daysToHeal = (int) Math.ceil(last.getEstimatedArea() / dailyReduction);
            metrics.setEstimatedDaysToHeal(Math.min(daysToHeal, 365));
        } else if (dailyReduction <= 0) {
            metrics.setEstimatedDaysToHeal(-1); // Não está cicatrizando
        }
        
        // Classificar velocidade de cicatrização
        if (weeklyPercentReduction >= 40) {
            metrics.setHealingSpeed(HealingSpeed.EXCELLENT);
        } else if (weeklyPercentReduction >= 20) {
            metrics.setHealingSpeed(HealingSpeed.GOOD);
        } else if (weeklyPercentReduction >= 10) {
            metrics.setHealingSpeed(HealingSpeed.MODERATE);
        } else if (weeklyPercentReduction > 0) {
            metrics.setHealingSpeed(HealingSpeed.SLOW);
        } else {
            metrics.setHealingSpeed(HealingSpeed.STAGNANT);
        }
        
        return metrics;
    }
    
    private TrendAnalysis analyzeTrends(List<WoundAnalysisResult> analyses) {
        TrendAnalysis trends = new TrendAnalysis();
        
        // Analisar últimas 3 medições para tendência recente
        int recentCount = Math.min(3, analyses.size());
        List<WoundAnalysisResult> recent = analyses.subList(analyses.size() - recentCount, analyses.size());
        
        // Tendência de área
        if (recent.size() >= 2) {
            boolean areaDecreasing = true;
            for (int i = 1; i < recent.size(); i++) {
                if (recent.get(i).getEstimatedArea() >= recent.get(i-1).getEstimatedArea()) {
                    areaDecreasing = false;
                    break;
                }
            }
            trends.setAreaTrend(areaDecreasing ? TrendDirection.DECREASING : TrendDirection.INCREASING);
        }
        
        // Tendência de fase de cicatrização
        HealingPhase lastPhase = analyses.get(analyses.size() - 1).getHealingPhase();
        HealingPhase firstPhase = analyses.get(0).getHealingPhase();
        
        boolean positivePhaseProgression = isPositivePhaseProgression(firstPhase, lastPhase);
        trends.setPhaseProgression(positivePhaseProgression ? "Progressão positiva" : "Regressão ou estagnação");
        
        // Detectar padrões
        trends.setPatterns(detectPatterns(analyses));
        
        return trends;
    }
    
    private boolean isPositivePhaseProgression(HealingPhase from, HealingPhase to) {
        Map<HealingPhase, Integer> phaseOrder = Map.of(
            HealingPhase.CHRONIC, 0,
            HealingPhase.INFECTED, 1,
            HealingPhase.INFLAMMATORY, 2,
            HealingPhase.PROLIFERATIVE, 3,
            HealingPhase.REMODELING, 4
        );
        
        return phaseOrder.getOrDefault(to, 0) > phaseOrder.getOrDefault(from, 0);
    }
    
    private List<String> detectPatterns(List<WoundAnalysisResult> analyses) {
        List<String> patterns = new ArrayList<>();
        
        // Detectar estagnação
        if (analyses.size() >= 4) {
            List<WoundAnalysisResult> lastFour = analyses.subList(analyses.size() - 4, analyses.size());
            double variance = calculateAreaVariance(lastFour);
            if (variance < 1.0) {
                patterns.add("ESTAGNAÇÃO: Área da ferida estável por múltiplas avaliações");
            }
        }
        
        // Detectar melhora consistente
        boolean consistentImprovement = true;
        for (int i = 1; i < analyses.size(); i++) {
            if (analyses.get(i).getEstimatedArea() >= analyses.get(i-1).getEstimatedArea()) {
                consistentImprovement = false;
                break;
            }
        }
        if (consistentImprovement && analyses.size() >= 3) {
            patterns.add("MELHORA CONSISTENTE: Redução contínua da área");
        }
        
        // Detectar piora recente
        if (analyses.size() >= 3) {
            WoundAnalysisResult previous = analyses.get(analyses.size() - 2);
            WoundAnalysisResult current = analyses.get(analyses.size() - 1);
            if (current.getEstimatedArea() > previous.getEstimatedArea() * 1.2) {
                patterns.add("⚠️ ALERTA: Aumento significativo da área na última avaliação");
            }
        }
        
        return patterns;
    }
    
    private double calculateAreaVariance(List<WoundAnalysisResult> analyses) {
        double mean = analyses.stream()
            .mapToDouble(WoundAnalysisResult::getEstimatedArea)
            .average()
            .orElse(0);
        
        return analyses.stream()
            .mapToDouble(a -> Math.pow(a.getEstimatedArea() - mean, 2))
            .average()
            .orElse(0);
    }
    
    private OverallProgression determineOverallProgression(TemporalEvolutionResult result) {
        double score = 0;
        
        // Peso da evolução de área (40%)
        EvolutionDirection areaDirection = result.getAreaEvolution().getDirection();
        if (areaDirection == EvolutionDirection.IMPROVING) score += 40;
        else if (areaDirection == EvolutionDirection.STABLE) score += 20;
        
        // Peso da qualidade de cicatrização (30%)
        double healingQuality = result.getTissueEvolution().getHealingQualityScore();
        score += (healingQuality / 100) * 30;
        
        // Peso da velocidade de cicatrização (30%)
        HealingSpeed speed = result.getHealingRateMetrics().getHealingSpeed();
        switch (speed) {
            case EXCELLENT -> score += 30;
            case GOOD -> score += 22;
            case MODERATE -> score += 15;
            case SLOW -> score += 8;
            case STAGNANT -> score += 0;
        }
        
        if (score >= 80) return OverallProgression.EXCELLENT;
        if (score >= 60) return OverallProgression.GOOD;
        if (score >= 40) return OverallProgression.MODERATE;
        if (score >= 20) return OverallProgression.POOR;
        return OverallProgression.CRITICAL;
    }
    
    private double calculateConfidenceScore(List<WoundAnalysisResult> analyses) {
        double confidence = 0.5;
        
        // Mais avaliações = mais confiança
        confidence += Math.min(analyses.size() * 0.05, 0.25);
        
        // Consistência nos dados aumenta confiança
        double avgConfidence = analyses.stream()
            .mapToDouble(WoundAnalysisResult::getWoundTypeConfidence)
            .average()
            .orElse(0.5);
        confidence += avgConfidence * 0.25;
        
        return Math.min(confidence, 0.95);
    }
    
    private List<String> generateClinicalInsights(TemporalEvolutionResult result, 
                                                   List<WoundAnalysisResult> analyses) {
        List<String> insights = new ArrayList<>();
        
        // Insight sobre área
        AreaEvolution area = result.getAreaEvolution();
        if (area.getDirection() == EvolutionDirection.IMPROVING) {
            insights.add(String.format("✓ Área reduzida em %.1f%% desde a primeira avaliação", 
                Math.abs(area.getPercentChange())));
        } else if (area.getDirection() == EvolutionDirection.WORSENING) {
            insights.add(String.format("⚠️ Área aumentou %.1f%% - investigar causas", 
                area.getPercentChange()));
        }
        
        // Insight sobre velocidade
        HealingRateMetrics metrics = result.getHealingRateMetrics();
        if (metrics.getEstimatedDaysToHeal() > 0) {
            insights.add(String.format("Tempo estimado para cicatrização: %d dias", 
                metrics.getEstimatedDaysToHeal()));
        } else if (metrics.getHealingSpeed() == HealingSpeed.STAGNANT) {
            insights.add("⚠️ Ferida sem progresso de cicatrização - reavaliar tratamento");
        }
        
        // Insight sobre tecidos
        TissueEvolution tissue = result.getTissueEvolution();
        if (tissue.getHealingQualityScore() >= 70) {
            insights.add("✓ Qualidade da cicatrização acima do esperado");
        } else if (tissue.getHealingQualityScore() < 40) {
            insights.add("⚠️ Qualidade da cicatrização abaixo do ideal");
        }
        
        // Comparar com última avaliação
        if (analyses.size() >= 2) {
            WoundAnalysisResult last = analyses.get(analyses.size() - 1);
            WoundAnalysisResult previous = analyses.get(analyses.size() - 2);
            
            Duration between = Duration.between(previous.getAnalyzedAt(), last.getAnalyzedAt());
            insights.add(String.format("Última avaliação há %d dias", between.toDays()));
        }
        
        return insights;
    }
    
    private List<String> generateTemporalRecommendations(TemporalEvolutionResult result) {
        List<String> recommendations = new ArrayList<>();
        
        switch (result.getOverallProgression()) {
            case EXCELLENT, GOOD -> {
                recommendations.add("Manter protocolo atual de tratamento");
                recommendations.add("Continuar monitoramento periódico");
            }
            case MODERATE -> {
                recommendations.add("Avaliar otimização do protocolo de tratamento");
                recommendations.add("Considerar aumento da frequência de avaliações");
                recommendations.add("Revisar fatores que podem estar limitando a cicatrização");
            }
            case POOR -> {
                recommendations.add("⚠️ Reavaliar completamente o plano de tratamento");
                recommendations.add("Investigar fatores sistêmicos (nutrição, diabetes, perfusão)");
                recommendations.add("Considerar terapias avançadas");
            }
            case CRITICAL -> {
                recommendations.add("⚠️ URGENTE: Intervenção necessária");
                recommendations.add("Encaminhar para avaliação especializada");
                recommendations.add("Considerar desbridamento cirúrgico");
                recommendations.add("Avaliar necessidade de cultura e antibioticoterapia");
            }
        }
        
        // Recomendações baseadas na velocidade
        if (result.getHealingRateMetrics().getHealingSpeed() == HealingSpeed.STAGNANT) {
            recommendations.add("Considerar terapia por pressão negativa (VAC)");
            recommendations.add("Avaliar uso de fatores de crescimento");
        }
        
        return recommendations;
    }
    
    private List<TemporalAlert> generateAlerts(TemporalEvolutionResult result, 
                                               List<WoundAnalysisResult> analyses) {
        List<TemporalAlert> alerts = new ArrayList<>();
        
        // Alerta de piora
        if (result.getAreaEvolution().getDirection() == EvolutionDirection.WORSENING) {
            alerts.add(new TemporalAlert(
                AlertSeverity.HIGH,
                "PIORA DETECTADA",
                "A área da ferida aumentou desde a última avaliação"
            ));
        }
        
        // Alerta de estagnação
        if (result.getHealingRateMetrics().getHealingSpeed() == HealingSpeed.STAGNANT) {
            alerts.add(new TemporalAlert(
                AlertSeverity.MEDIUM,
                "ESTAGNAÇÃO",
                "Ferida sem progresso significativo de cicatrização"
            ));
        }
        
        // Alerta de infecção
        WoundAnalysisResult latest = analyses.get(analyses.size() - 1);
        if (latest.getHealingPhase() == HealingPhase.INFECTED) {
            alerts.add(new TemporalAlert(
                AlertSeverity.CRITICAL,
                "POSSÍVEL INFECÇÃO",
                "Sinais de infecção detectados na última avaliação"
            ));
        }
        
        // Alerta de tempo prolongado
        Duration totalDuration = Duration.between(
            result.getFirstAnalysisDate(), 
            result.getLastAnalysisDate()
        );
        if (totalDuration.toDays() > 30 && 
            result.getOverallProgression().ordinal() >= OverallProgression.MODERATE.ordinal()) {
            alerts.add(new TemporalAlert(
                AlertSeverity.MEDIUM,
                "FERIDA CRÔNICA",
                "Ferida em tratamento há mais de 30 dias sem resolução"
            ));
        }
        
        return alerts;
    }
    
    private TemporalEvolutionResult createInsufficientDataResult() {
        TemporalEvolutionResult result = new TemporalEvolutionResult();
        result.setAnalysisCount(0);
        result.setConfidenceScore(0);
        result.setClinicalInsights(List.of("Dados insuficientes para análise temporal"));
        result.setRecommendations(List.of("Realize mais avaliações para análise de evolução"));
        return result;
    }
    
    // ==================== DTOs ====================
    
    public static class TemporalEvolutionResult {
        private int analysisCount;
        private Instant firstAnalysisDate;
        private Instant lastAnalysisDate;
        private AreaEvolution areaEvolution;
        private TissueEvolution tissueEvolution;
        private HealingRateMetrics healingRateMetrics;
        private TrendAnalysis trendAnalysis;
        private OverallProgression overallProgression;
        private double confidenceScore;
        private List<String> clinicalInsights;
        private List<String> recommendations;
        private List<TemporalAlert> alerts;
        
        // Getters and Setters
        public int getAnalysisCount() { return analysisCount; }
        public void setAnalysisCount(int analysisCount) { this.analysisCount = analysisCount; }
        
        public Instant getFirstAnalysisDate() { return firstAnalysisDate; }
        public void setFirstAnalysisDate(Instant firstAnalysisDate) { this.firstAnalysisDate = firstAnalysisDate; }
        
        public Instant getLastAnalysisDate() { return lastAnalysisDate; }
        public void setLastAnalysisDate(Instant lastAnalysisDate) { this.lastAnalysisDate = lastAnalysisDate; }
        
        public AreaEvolution getAreaEvolution() { return areaEvolution; }
        public void setAreaEvolution(AreaEvolution areaEvolution) { this.areaEvolution = areaEvolution; }
        
        public TissueEvolution getTissueEvolution() { return tissueEvolution; }
        public void setTissueEvolution(TissueEvolution tissueEvolution) { this.tissueEvolution = tissueEvolution; }
        
        public HealingRateMetrics getHealingRateMetrics() { return healingRateMetrics; }
        public void setHealingRateMetrics(HealingRateMetrics healingRateMetrics) { this.healingRateMetrics = healingRateMetrics; }
        
        public TrendAnalysis getTrendAnalysis() { return trendAnalysis; }
        public void setTrendAnalysis(TrendAnalysis trendAnalysis) { this.trendAnalysis = trendAnalysis; }
        
        public OverallProgression getOverallProgression() { return overallProgression; }
        public void setOverallProgression(OverallProgression overallProgression) { this.overallProgression = overallProgression; }
        
        public double getConfidenceScore() { return confidenceScore; }
        public void setConfidenceScore(double confidenceScore) { this.confidenceScore = confidenceScore; }
        
        public List<String> getClinicalInsights() { return clinicalInsights; }
        public void setClinicalInsights(List<String> clinicalInsights) { this.clinicalInsights = clinicalInsights; }
        
        public List<String> getRecommendations() { return recommendations; }
        public void setRecommendations(List<String> recommendations) { this.recommendations = recommendations; }
        
        public List<TemporalAlert> getAlerts() { return alerts; }
        public void setAlerts(List<TemporalAlert> alerts) { this.alerts = alerts; }
    }
    
    public static class AreaEvolution {
        private double initialArea;
        private double currentArea;
        private double absoluteChange;
        private double percentChange;
        private double dailyChangeRate;
        private double weeklyChangeRate;
        private EvolutionDirection direction;
        private List<Double> areaHistory;
        
        // Getters and Setters
        public double getInitialArea() { return initialArea; }
        public void setInitialArea(double initialArea) { this.initialArea = initialArea; }
        
        public double getCurrentArea() { return currentArea; }
        public void setCurrentArea(double currentArea) { this.currentArea = currentArea; }
        
        public double getAbsoluteChange() { return absoluteChange; }
        public void setAbsoluteChange(double absoluteChange) { this.absoluteChange = absoluteChange; }
        
        public double getPercentChange() { return percentChange; }
        public void setPercentChange(double percentChange) { this.percentChange = percentChange; }
        
        public double getDailyChangeRate() { return dailyChangeRate; }
        public void setDailyChangeRate(double dailyChangeRate) { this.dailyChangeRate = dailyChangeRate; }
        
        public double getWeeklyChangeRate() { return weeklyChangeRate; }
        public void setWeeklyChangeRate(double weeklyChangeRate) { this.weeklyChangeRate = weeklyChangeRate; }
        
        public EvolutionDirection getDirection() { return direction; }
        public void setDirection(EvolutionDirection direction) { this.direction = direction; }
        
        public List<Double> getAreaHistory() { return areaHistory; }
        public void setAreaHistory(List<Double> areaHistory) { this.areaHistory = areaHistory; }
    }
    
    public static class TissueEvolution {
        private Map<TissueType, Double> tissueChanges;
        private String granulationTrend;
        private String necroticTrend;
        private String epithelializationTrend;
        private double healingQualityScore;
        
        // Getters and Setters
        public Map<TissueType, Double> getTissueChanges() { return tissueChanges; }
        public void setTissueChanges(Map<TissueType, Double> tissueChanges) { this.tissueChanges = tissueChanges; }
        
        public String getGranulationTrend() { return granulationTrend; }
        public void setGranulationTrend(String granulationTrend) { this.granulationTrend = granulationTrend; }
        
        public String getNecroticTrend() { return necroticTrend; }
        public void setNecroticTrend(String necroticTrend) { this.necroticTrend = necroticTrend; }
        
        public String getEpithelializationTrend() { return epithelializationTrend; }
        public void setEpithelializationTrend(String epithelializationTrend) { this.epithelializationTrend = epithelializationTrend; }
        
        public double getHealingQualityScore() { return healingQualityScore; }
        public void setHealingQualityScore(double healingQualityScore) { this.healingQualityScore = healingQualityScore; }
    }
    
    public static class HealingRateMetrics {
        private double healingVelocity;
        private double weeklyHealingRate;
        private double weeklyPercentReduction;
        private int estimatedDaysToHeal;
        private HealingSpeed healingSpeed;
        
        // Getters and Setters
        public double getHealingVelocity() { return healingVelocity; }
        public void setHealingVelocity(double healingVelocity) { this.healingVelocity = healingVelocity; }
        
        public double getWeeklyHealingRate() { return weeklyHealingRate; }
        public void setWeeklyHealingRate(double weeklyHealingRate) { this.weeklyHealingRate = weeklyHealingRate; }
        
        public double getWeeklyPercentReduction() { return weeklyPercentReduction; }
        public void setWeeklyPercentReduction(double weeklyPercentReduction) { this.weeklyPercentReduction = weeklyPercentReduction; }
        
        public int getEstimatedDaysToHeal() { return estimatedDaysToHeal; }
        public void setEstimatedDaysToHeal(int estimatedDaysToHeal) { this.estimatedDaysToHeal = estimatedDaysToHeal; }
        
        public HealingSpeed getHealingSpeed() { return healingSpeed; }
        public void setHealingSpeed(HealingSpeed healingSpeed) { this.healingSpeed = healingSpeed; }
    }
    
    public static class TrendAnalysis {
        private TrendDirection areaTrend;
        private String phaseProgression;
        private List<String> patterns;
        
        // Getters and Setters
        public TrendDirection getAreaTrend() { return areaTrend; }
        public void setAreaTrend(TrendDirection areaTrend) { this.areaTrend = areaTrend; }
        
        public String getPhaseProgression() { return phaseProgression; }
        public void setPhaseProgression(String phaseProgression) { this.phaseProgression = phaseProgression; }
        
        public List<String> getPatterns() { return patterns; }
        public void setPatterns(List<String> patterns) { this.patterns = patterns; }
    }
    
    public static class TemporalAlert {
        private AlertSeverity severity;
        private String title;
        private String description;
        
        public TemporalAlert(AlertSeverity severity, String title, String description) {
            this.severity = severity;
            this.title = title;
            this.description = description;
        }
        
        // Getters
        public AlertSeverity getSeverity() { return severity; }
        public String getTitle() { return title; }
        public String getDescription() { return description; }
    }
    
    // ==================== Enums ====================
    
    public enum EvolutionDirection {
        IMPROVING, STABLE, WORSENING
    }
    
    public enum HealingSpeed {
        EXCELLENT, GOOD, MODERATE, SLOW, STAGNANT
    }
    
    public enum OverallProgression {
        EXCELLENT, GOOD, MODERATE, POOR, CRITICAL
    }
    
    public enum TrendDirection {
        INCREASING, STABLE, DECREASING
    }
    
    public enum AlertSeverity {
        LOW, MEDIUM, HIGH, CRITICAL
    }
}
