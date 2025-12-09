package com.healplus.ml;

import java.time.Instant;
import java.util.List;
import java.util.Map;

public class WoundAnalysisResult {
    private String id;
    private Instant analyzedAt;
    private WoundType woundType;
    private double woundTypeConfidence;
    private HealingPhase healingPhase;
    private double healingPhaseConfidence;
    private Map<TissueType, Double> tissuePercentages;
    private double estimatedArea;
    private double estimatedDepth;
    private List<String> clinicalObservations;
    private List<String> recommendations;
    private RiskAssessment riskAssessment;
    private EvolutionPrediction evolutionPrediction;

    public WoundAnalysisResult() {
        this.analyzedAt = Instant.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public Instant getAnalyzedAt() { return analyzedAt; }
    public void setAnalyzedAt(Instant analyzedAt) { this.analyzedAt = analyzedAt; }

    public WoundType getWoundType() { return woundType; }
    public void setWoundType(WoundType woundType) { this.woundType = woundType; }

    public double getWoundTypeConfidence() { return woundTypeConfidence; }
    public void setWoundTypeConfidence(double woundTypeConfidence) { this.woundTypeConfidence = woundTypeConfidence; }

    public HealingPhase getHealingPhase() { return healingPhase; }
    public void setHealingPhase(HealingPhase healingPhase) { this.healingPhase = healingPhase; }

    public double getHealingPhaseConfidence() { return healingPhaseConfidence; }
    public void setHealingPhaseConfidence(double healingPhaseConfidence) { this.healingPhaseConfidence = healingPhaseConfidence; }

    public Map<TissueType, Double> getTissuePercentages() { return tissuePercentages; }
    public void setTissuePercentages(Map<TissueType, Double> tissuePercentages) { this.tissuePercentages = tissuePercentages; }

    public double getEstimatedArea() { return estimatedArea; }
    public void setEstimatedArea(double estimatedArea) { this.estimatedArea = estimatedArea; }

    public double getEstimatedDepth() { return estimatedDepth; }
    public void setEstimatedDepth(double estimatedDepth) { this.estimatedDepth = estimatedDepth; }

    public List<String> getClinicalObservations() { return clinicalObservations; }
    public void setClinicalObservations(List<String> clinicalObservations) { this.clinicalObservations = clinicalObservations; }

    public List<String> getRecommendations() { return recommendations; }
    public void setRecommendations(List<String> recommendations) { this.recommendations = recommendations; }

    public RiskAssessment getRiskAssessment() { return riskAssessment; }
    public void setRiskAssessment(RiskAssessment riskAssessment) { this.riskAssessment = riskAssessment; }

    public EvolutionPrediction getEvolutionPrediction() { return evolutionPrediction; }
    public void setEvolutionPrediction(EvolutionPrediction evolutionPrediction) { this.evolutionPrediction = evolutionPrediction; }

    public static class RiskAssessment {
        private String level;
        private double infectionRisk;
        private double chronicityRisk;
        private double complicationRisk;
        private List<String> riskFactors;

        public String getLevel() { return level; }
        public void setLevel(String level) { this.level = level; }

        public double getInfectionRisk() { return infectionRisk; }
        public void setInfectionRisk(double infectionRisk) { this.infectionRisk = infectionRisk; }

        public double getChronicityRisk() { return chronicityRisk; }
        public void setChronicityRisk(double chronicityRisk) { this.chronicityRisk = chronicityRisk; }

        public double getComplicationRisk() { return complicationRisk; }
        public void setComplicationRisk(double complicationRisk) { this.complicationRisk = complicationRisk; }

        public List<String> getRiskFactors() { return riskFactors; }
        public void setRiskFactors(List<String> riskFactors) { this.riskFactors = riskFactors; }
    }

    public static class EvolutionPrediction {
        private int estimatedHealingDays;
        private double healingProbability;
        private String expectedNextPhase;
        private List<String> evolutionIndicators;

        public int getEstimatedHealingDays() { return estimatedHealingDays; }
        public void setEstimatedHealingDays(int estimatedHealingDays) { this.estimatedHealingDays = estimatedHealingDays; }

        public double getHealingProbability() { return healingProbability; }
        public void setHealingProbability(double healingProbability) { this.healingProbability = healingProbability; }

        public String getExpectedNextPhase() { return expectedNextPhase; }
        public void setExpectedNextPhase(String expectedNextPhase) { this.expectedNextPhase = expectedNextPhase; }

        public List<String> getEvolutionIndicators() { return evolutionIndicators; }
        public void setEvolutionIndicators(List<String> evolutionIndicators) { this.evolutionIndicators = evolutionIndicators; }
    }
}
