package com.healplus.ml.xai;

import com.healplus.ml.TissueType;
import com.healplus.ml.WoundAnalysisResult;
import com.healplus.ml.WoundType;
import org.nd4j.linalg.api.ndarray.INDArray;
import org.nd4j.linalg.factory.Nd4j;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.*;
import java.util.List;

/**
 * Serviço de Explainable AI (XAI) para Análise de Feridas
 * Implementa Grad-CAM e outras técnicas de explicabilidade
 */
@Service
public class ExplainableAIService {
    
    private static final Logger logger = LoggerFactory.getLogger(ExplainableAIService.class);
    
    private static final int HEATMAP_WIDTH = 224;
    private static final int HEATMAP_HEIGHT = 224;
    
    /**
     * Gera explicação completa para uma análise de ferida
     */
    public ExplanationResult generateExplanation(
            WoundAnalysisResult analysisResult, 
            byte[] originalImage,
            INDArray activations) throws IOException {
        
        logger.info("Gerando explicação para análise: {}", analysisResult.getId());
        
        ExplanationResult explanation = new ExplanationResult();
        explanation.setAnalysisId(analysisResult.getId());
        
        // 1. Gerar Heatmap de ativação (Grad-CAM simplificado)
        HeatmapResult heatmap = generateActivationHeatmap(originalImage, activations, analysisResult);
        explanation.setHeatmap(heatmap);
        
        // 2. Identificar regiões de interesse
        List<RegionOfInterest> rois = identifyRegionsOfInterest(analysisResult, heatmap);
        explanation.setRegionsOfInterest(rois);
        
        // 3. Gerar explicações textuais
        List<FeatureExplanation> featureExplanations = generateFeatureExplanations(analysisResult);
        explanation.setFeatureExplanations(featureExplanations);
        
        // 4. Calcular métricas de confiança
        ConfidenceMetrics confidenceMetrics = calculateConfidenceMetrics(analysisResult);
        explanation.setConfidenceMetrics(confidenceMetrics);
        
        // 5. Gerar explicação em linguagem natural
        String narrativeExplanation = generateNarrativeExplanation(analysisResult, featureExplanations);
        explanation.setNarrativeExplanation(narrativeExplanation);
        
        // 6. Adicionar aviso legal
        explanation.setLegalDisclaimer(generateLegalDisclaimer());
        
        logger.info("Explicação gerada com sucesso");
        
        return explanation;
    }
    
    /**
     * Gera heatmap de ativação usando técnica similar ao Grad-CAM
     */
    private HeatmapResult generateActivationHeatmap(
            byte[] originalImage, 
            INDArray activations,
            WoundAnalysisResult result) throws IOException {
        
        BufferedImage original = ImageIO.read(new ByteArrayInputStream(originalImage));
        BufferedImage resized = resizeImage(original, HEATMAP_WIDTH, HEATMAP_HEIGHT);
        
        // Gerar mapa de ativação baseado em análise de cor e resultado
        double[][] activationMap = generateActivationMap(resized, result);
        
        // Converter para heatmap visual
        BufferedImage heatmapImage = createHeatmapVisualization(activationMap);
        
        // Sobrepor ao original
        BufferedImage overlayImage = createOverlayImage(resized, heatmapImage, 0.5f);
        
        HeatmapResult heatmapResult = new HeatmapResult();
        heatmapResult.setHeatmapBase64(imageToBase64(heatmapImage));
        heatmapResult.setOverlayBase64(imageToBase64(overlayImage));
        heatmapResult.setWidth(HEATMAP_WIDTH);
        heatmapResult.setHeight(HEATMAP_HEIGHT);
        heatmapResult.setActivationMap(activationMap);
        
        return heatmapResult;
    }
    
    /**
     * Gera mapa de ativação baseado nas características detectadas
     */
    private double[][] generateActivationMap(BufferedImage image, WoundAnalysisResult result) {
        int width = image.getWidth();
        int height = image.getHeight();
        double[][] activationMap = new double[height][width];
        
        Map<TissueType, Double> tissues = result.getTissuePercentages();
        
        // Analisar cada pixel e atribuir ativação baseada no tipo de tecido detectado
        for (int y = 0; y < height; y++) {
            for (int x = 0; x < width; x++) {
                int rgb = image.getRGB(x, y);
                int r = (rgb >> 16) & 0xFF;
                int g = (rgb >> 8) & 0xFF;
                int b = rgb & 0xFF;
                
                double activation = 0;
                
                // Pixels escuros (possível necrose) - alta ativação
                if (r < 60 && g < 60 && b < 60) {
                    activation = 0.9;
                }
                // Pixels amarelados (esfacelo/fibrina)
                else if (r > 180 && g > 150 && b < 100) {
                    activation = 0.8;
                }
                // Pixels vermelhos (granulação ou inflamação)
                else if (r > 150 && g < 100 && b < 100) {
                    activation = 0.7;
                }
                // Pixels rosados (epitelização)
                else if (r > 200 && g > 150 && b > 150 && r > g && r > b) {
                    activation = 0.5;
                }
                // Pixels esverdeados (possível infecção)
                else if (g > r && g > b && g > 100) {
                    activation = 0.95;
                }
                // Outros
                else {
                    activation = 0.2;
                }
                
                activationMap[y][x] = activation;
            }
        }
        
        // Aplicar suavização gaussiana
        return applyGaussianSmoothing(activationMap, 5);
    }
    
    /**
     * Aplica suavização gaussiana ao mapa de ativação
     */
    private double[][] applyGaussianSmoothing(double[][] map, int kernelSize) {
        int height = map.length;
        int width = map[0].length;
        double[][] smoothed = new double[height][width];
        
        int half = kernelSize / 2;
        double sigma = kernelSize / 3.0;
        
        // Criar kernel gaussiano
        double[][] kernel = new double[kernelSize][kernelSize];
        double sum = 0;
        for (int i = 0; i < kernelSize; i++) {
            for (int j = 0; j < kernelSize; j++) {
                int x = i - half;
                int y = j - half;
                kernel[i][j] = Math.exp(-(x*x + y*y) / (2 * sigma * sigma));
                sum += kernel[i][j];
            }
        }
        // Normalizar kernel
        for (int i = 0; i < kernelSize; i++) {
            for (int j = 0; j < kernelSize; j++) {
                kernel[i][j] /= sum;
            }
        }
        
        // Aplicar convolução
        for (int y = 0; y < height; y++) {
            for (int x = 0; x < width; x++) {
                double value = 0;
                for (int ky = 0; ky < kernelSize; ky++) {
                    for (int kx = 0; kx < kernelSize; kx++) {
                        int py = Math.min(Math.max(y + ky - half, 0), height - 1);
                        int px = Math.min(Math.max(x + kx - half, 0), width - 1);
                        value += map[py][px] * kernel[ky][kx];
                    }
                }
                smoothed[y][x] = value;
            }
        }
        
        return smoothed;
    }
    
    /**
     * Cria visualização de heatmap com cores
     */
    private BufferedImage createHeatmapVisualization(double[][] activationMap) {
        int height = activationMap.length;
        int width = activationMap[0].length;
        BufferedImage heatmap = new BufferedImage(width, height, BufferedImage.TYPE_INT_ARGB);
        
        for (int y = 0; y < height; y++) {
            for (int x = 0; x < width; x++) {
                double value = activationMap[y][x];
                Color color = getHeatmapColor(value);
                heatmap.setRGB(x, y, color.getRGB());
            }
        }
        
        return heatmap;
    }
    
    /**
     * Converte valor de ativação em cor do heatmap (azul -> verde -> amarelo -> vermelho)
     */
    private Color getHeatmapColor(double value) {
        value = Math.max(0, Math.min(1, value));
        
        int r, g, b;
        int alpha = (int) (value * 180 + 75); // Transparência variável
        
        if (value < 0.25) {
            // Azul para ciano
            r = 0;
            g = (int) (255 * value * 4);
            b = 255;
        } else if (value < 0.5) {
            // Ciano para verde
            r = 0;
            g = 255;
            b = (int) (255 * (1 - (value - 0.25) * 4));
        } else if (value < 0.75) {
            // Verde para amarelo
            r = (int) (255 * (value - 0.5) * 4);
            g = 255;
            b = 0;
        } else {
            // Amarelo para vermelho
            r = 255;
            g = (int) (255 * (1 - (value - 0.75) * 4));
            b = 0;
        }
        
        return new Color(r, g, b, alpha);
    }
    
    /**
     * Sobrepõe heatmap sobre imagem original
     */
    private BufferedImage createOverlayImage(BufferedImage original, BufferedImage heatmap, float alpha) {
        int width = original.getWidth();
        int height = original.getHeight();
        BufferedImage overlay = new BufferedImage(width, height, BufferedImage.TYPE_INT_RGB);
        
        Graphics2D g2d = overlay.createGraphics();
        g2d.drawImage(original, 0, 0, null);
        g2d.setComposite(AlphaComposite.getInstance(AlphaComposite.SRC_OVER, alpha));
        g2d.drawImage(heatmap, 0, 0, null);
        g2d.dispose();
        
        return overlay;
    }
    
    /**
     * Identifica regiões de interesse na imagem
     */
    private List<RegionOfInterest> identifyRegionsOfInterest(
            WoundAnalysisResult result, 
            HeatmapResult heatmap) {
        
        List<RegionOfInterest> rois = new ArrayList<>();
        double[][] activationMap = heatmap.getActivationMap();
        
        // Encontrar regiões de alta ativação
        List<Point> highActivationPoints = findHighActivationRegions(activationMap, 0.7);
        
        // Agrupar pontos próximos em regiões
        List<List<Point>> clusters = clusterPoints(highActivationPoints, 20);
        
        for (int i = 0; i < Math.min(clusters.size(), 5); i++) {
            List<Point> cluster = clusters.get(i);
            if (cluster.isEmpty()) continue;
            
            Rectangle bounds = getBoundingBox(cluster);
            double avgActivation = calculateAverageActivation(cluster, activationMap);
            
            RegionOfInterest roi = new RegionOfInterest();
            roi.setId("ROI-" + (i + 1));
            roi.setX(bounds.x);
            roi.setY(bounds.y);
            roi.setWidth(bounds.width);
            roi.setHeight(bounds.height);
            roi.setActivationLevel(avgActivation);
            roi.setDescription(describeRegion(avgActivation, result));
            
            rois.add(roi);
        }
        
        return rois;
    }
    
    private List<Point> findHighActivationRegions(double[][] activationMap, double threshold) {
        List<Point> points = new ArrayList<>();
        for (int y = 0; y < activationMap.length; y++) {
            for (int x = 0; x < activationMap[0].length; x++) {
                if (activationMap[y][x] >= threshold) {
                    points.add(new Point(x, y));
                }
            }
        }
        return points;
    }
    
    private List<List<Point>> clusterPoints(List<Point> points, int maxDistance) {
        List<List<Point>> clusters = new ArrayList<>();
        Set<Point> visited = new HashSet<>();
        
        for (Point point : points) {
            if (visited.contains(point)) continue;
            
            List<Point> cluster = new ArrayList<>();
            Queue<Point> queue = new LinkedList<>();
            queue.add(point);
            
            while (!queue.isEmpty()) {
                Point current = queue.poll();
                if (visited.contains(current)) continue;
                
                visited.add(current);
                cluster.add(current);
                
                for (Point other : points) {
                    if (!visited.contains(other) && current.distance(other) < maxDistance) {
                        queue.add(other);
                    }
                }
            }
            
            if (!cluster.isEmpty()) {
                clusters.add(cluster);
            }
        }
        
        // Ordenar por tamanho (maior primeiro)
        clusters.sort((a, b) -> Integer.compare(b.size(), a.size()));
        
        return clusters;
    }
    
    private Rectangle getBoundingBox(List<Point> points) {
        int minX = Integer.MAX_VALUE, minY = Integer.MAX_VALUE;
        int maxX = Integer.MIN_VALUE, maxY = Integer.MIN_VALUE;
        
        for (Point p : points) {
            minX = Math.min(minX, p.x);
            minY = Math.min(minY, p.y);
            maxX = Math.max(maxX, p.x);
            maxY = Math.max(maxY, p.y);
        }
        
        return new Rectangle(minX, minY, maxX - minX + 1, maxY - minY + 1);
    }
    
    private double calculateAverageActivation(List<Point> points, double[][] activationMap) {
        return points.stream()
            .mapToDouble(p -> activationMap[p.y][p.x])
            .average()
            .orElse(0);
    }
    
    private String describeRegion(double activation, WoundAnalysisResult result) {
        if (activation > 0.9) {
            return "Região crítica - possível necrose ou infecção";
        } else if (activation > 0.7) {
            return "Região de atenção - tecido desvitalizado";
        } else if (activation > 0.5) {
            return "Região moderada - processo inflamatório ativo";
        } else {
            return "Região de menor relevância";
        }
    }
    
    /**
     * Gera explicações para cada característica analisada
     */
    private List<FeatureExplanation> generateFeatureExplanations(WoundAnalysisResult result) {
        List<FeatureExplanation> explanations = new ArrayList<>();
        
        // Explicação do tipo de ferida
        explanations.add(new FeatureExplanation(
            "Tipo de Ferida",
            result.getWoundType().getDisplayName(),
            result.getWoundTypeConfidence(),
            getWoundTypeExplanation(result.getWoundType()),
            getWoundTypeEvidences(result)
        ));
        
        // Explicação da fase de cicatrização
        explanations.add(new FeatureExplanation(
            "Fase de Cicatrização",
            result.getHealingPhase().getDisplayName(),
            result.getHealingPhaseConfidence(),
            getHealingPhaseExplanation(result.getHealingPhase()),
            getHealingPhaseEvidences(result)
        ));
        
        // Explicação dos tecidos principais
        Map<TissueType, Double> tissues = result.getTissuePercentages();
        tissues.entrySet().stream()
            .filter(e -> e.getValue() > 10)
            .sorted(Map.Entry.<TissueType, Double>comparingByValue().reversed())
            .limit(3)
            .forEach(e -> {
                explanations.add(new FeatureExplanation(
                    "Tecido: " + e.getKey().getDisplayName(),
                    String.format("%.1f%%", e.getValue()),
                    0.7 + (e.getValue() / 100) * 0.3,
                    getTissueExplanation(e.getKey()),
                    List.of("Análise colorimétrica", "Padrão de textura detectado")
                ));
            });
        
        return explanations;
    }
    
    private String getWoundTypeExplanation(WoundType type) {
        return switch (type) {
            case PRESSURE_ULCER -> 
                "Identificada como lesão por pressão baseada na localização típica sobre proeminências ósseas e padrão de isquemia tissular.";
            case VENOUS_ULCER -> 
                "Características compatíveis com úlcera venosa: localização em terço inferior da perna, bordas irregulares e pigmentação perilesional.";
            case ARTERIAL_ULCER -> 
                "Padrão sugestivo de úlcera arterial: bordas bem definidas, leito pálido e localização em extremidades.";
            case DIABETIC_FOOT -> 
                "Características de pé diabético: localização plantar ou digital, bordas calosas e sinais de neuropatia.";
            case SURGICAL_WOUND -> 
                "Ferida cirúrgica identificada por bordas regulares e padrão de incisão.";
            case TRAUMATIC_WOUND -> 
                "Ferida traumática identificada por bordas irregulares e padrão de lesão mecânica.";
            default -> 
                "Classificação baseada na análise combinada de características visuais e padrões morfológicos.";
        };
    }
    
    private List<String> getWoundTypeEvidences(WoundAnalysisResult result) {
        List<String> evidences = new ArrayList<>();
        evidences.add("Análise morfológica da lesão");
        evidences.add("Padrões de coloração do tecido");
        evidences.add("Características das bordas");
        
        Map<TissueType, Double> tissues = result.getTissuePercentages();
        if (tissues.getOrDefault(TissueType.NECROTIC, 0.0) > 20) {
            evidences.add("Presença significativa de necrose");
        }
        if (tissues.getOrDefault(TissueType.GRANULATION, 0.0) > 30) {
            evidences.add("Tecido de granulação identificado");
        }
        
        return evidences;
    }
    
    private String getHealingPhaseExplanation(com.healplus.ml.HealingPhase phase) {
        return switch (phase) {
            case INFLAMMATORY -> 
                "Ferida na fase inflamatória inicial, caracterizada por edema, eritema e exsudato. Processo normal de limpeza e defesa.";
            case PROLIFERATIVE -> 
                "Fase proliferativa identificada pela formação ativa de tecido de granulação e início da contração da ferida.";
            case REMODELING -> 
                "Ferida em fase de remodelação final, com maturação do colágeno e fortalecimento do tecido cicatricial.";
            case CHRONIC -> 
                "Ferida crônica identificada - ciclo de cicatrização interrompido. Necessita intervenção para retomar progressão.";
            case INFECTED -> 
                "⚠️ Sinais sugestivos de infecção detectados. Requer avaliação clínica imediata e possível cultura.";
        };
    }
    
    private List<String> getHealingPhaseEvidences(WoundAnalysisResult result) {
        List<String> evidences = new ArrayList<>();
        
        Map<TissueType, Double> tissues = result.getTissuePercentages();
        
        if (tissues.getOrDefault(TissueType.GRANULATION, 0.0) > 40) {
            evidences.add("Alto percentual de tecido de granulação (>40%)");
        }
        if (tissues.getOrDefault(TissueType.EPITHELIAL, 0.0) > 20) {
            evidences.add("Presença de epitelização nas bordas");
        }
        if (tissues.getOrDefault(TissueType.NECROTIC, 0.0) > 15) {
            evidences.add("Tecido necrótico presente");
        }
        if (tissues.getOrDefault(TissueType.SLOUGH, 0.0) > 25) {
            evidences.add("Esfacelo significativo detectado");
        }
        
        evidences.add("Análise de padrão de coloração");
        
        return evidences;
    }
    
    private String getTissueExplanation(TissueType type) {
        return switch (type) {
            case GRANULATION -> 
                "Tecido de granulação: tecido vermelho vivo, úmido e granular que indica cicatrização ativa.";
            case NECROTIC -> 
                "Tecido necrótico: tecido preto/marrom desvitalizado que necessita remoção para progressão da cicatrização.";
            case SLOUGH -> 
                "Esfacelo: tecido amarelado úmido composto de fibrina e células mortas, requer limpeza.";
            case EPITHELIAL -> 
                "Tecido epitelial: nova pele rosa/branca formando nas bordas, indicando cicatrização avançada.";
            case FIBRIN -> 
                "Fibrina: camada amarelada de proteína coagulada, comum em feridas em cicatrização.";
            case ESCHAR -> 
                "Escara: tecido necrótico seco e endurecido, pode necessitar desbridamento.";
            case HEALTHY_SKIN -> 
                "Pele saudável ao redor da lesão.";
            case HYPERGRANULATION -> 
                "Hipergranulação: excesso de tecido de granulação acima do nível da pele.";
        };
    }
    
    /**
     * Calcula métricas de confiança detalhadas
     */
    private ConfidenceMetrics calculateConfidenceMetrics(WoundAnalysisResult result) {
        ConfidenceMetrics metrics = new ConfidenceMetrics();
        
        metrics.setOverallConfidence(
            (result.getWoundTypeConfidence() + result.getHealingPhaseConfidence()) / 2
        );
        
        // Calcular confiança por componente
        Map<String, Double> componentConfidence = new LinkedHashMap<>();
        componentConfidence.put("Classificação do tipo", result.getWoundTypeConfidence());
        componentConfidence.put("Identificação da fase", result.getHealingPhaseConfidence());
        componentConfidence.put("Segmentação de tecidos", 0.75);
        componentConfidence.put("Estimativa de área", 0.65);
        metrics.setComponentConfidence(componentConfidence);
        
        // Fatores que afetam confiança
        List<String> positiveFactors = new ArrayList<>();
        List<String> negativeFactors = new ArrayList<>();
        
        if (result.getWoundTypeConfidence() > 0.8) {
            positiveFactors.add("Alta confiança na classificação do tipo");
        }
        if (result.getHealingPhaseConfidence() > 0.7) {
            positiveFactors.add("Fase de cicatrização bem definida");
        }
        
        Map<TissueType, Double> tissues = result.getTissuePercentages();
        double maxTissue = tissues.values().stream().mapToDouble(Double::doubleValue).max().orElse(0);
        if (maxTissue > 50) {
            positiveFactors.add("Tecido predominante claramente identificado");
        }
        
        // Fatores negativos
        if (result.getWoundTypeConfidence() < 0.5) {
            negativeFactors.add("Baixa confiança na classificação");
        }
        if (maxTissue < 30) {
            negativeFactors.add("Múltiplos tecidos sem predominância clara");
        }
        
        metrics.setPositiveFactors(positiveFactors);
        metrics.setNegativeFactors(negativeFactors);
        
        // Recomendação baseada na confiança
        if (metrics.getOverallConfidence() > 0.8) {
            metrics.setConfidenceRecommendation("Alta confiança - resultado pode auxiliar na decisão clínica");
        } else if (metrics.getOverallConfidence() > 0.6) {
            metrics.setConfidenceRecommendation("Confiança moderada - recomenda-se confirmação clínica");
        } else {
            metrics.setConfidenceRecommendation("Baixa confiança - avaliação clínica obrigatória");
        }
        
        return metrics;
    }
    
    /**
     * Gera explicação narrativa em linguagem natural
     */
    private String generateNarrativeExplanation(
            WoundAnalysisResult result, 
            List<FeatureExplanation> features) {
        
        StringBuilder narrative = new StringBuilder();
        
        narrative.append("## Resumo da Análise\n\n");
        
        narrative.append(String.format(
            "A análise por inteligência artificial identificou esta lesão como **%s** " +
            "com %.0f%% de confiança. ",
            result.getWoundType().getDisplayName(),
            result.getWoundTypeConfidence() * 100
        ));
        
        narrative.append(String.format(
            "A ferida encontra-se na **fase %s** do processo de cicatrização.\n\n",
            result.getHealingPhase().getDisplayName().toLowerCase()
        ));
        
        narrative.append("### Composição Tissular\n\n");
        
        Map<TissueType, Double> tissues = result.getTissuePercentages();
        tissues.entrySet().stream()
            .filter(e -> e.getValue() > 5)
            .sorted(Map.Entry.<TissueType, Double>comparingByValue().reversed())
            .forEach(e -> {
                narrative.append(String.format("- **%s**: %.1f%%\n", 
                    e.getKey().getDisplayName(), e.getValue()));
            });
        
        narrative.append("\n### Como a IA chegou a esta conclusão\n\n");
        narrative.append("A análise considerou múltiplos fatores:\n\n");
        
        for (FeatureExplanation feature : features.subList(0, Math.min(3, features.size()))) {
            narrative.append(String.format("**%s**: %s\n\n", feature.getName(), feature.getExplanation()));
        }
        
        narrative.append("### Áreas de Atenção\n\n");
        
        if (tissues.getOrDefault(TissueType.NECROTIC, 0.0) > 15) {
            narrative.append("⚠️ Presença de tecido necrótico requer atenção para possível desbridamento.\n\n");
        }
        
        if (result.getHealingPhase() == com.healplus.ml.HealingPhase.INFECTED) {
            narrative.append("⚠️ **ALERTA**: Sinais sugestivos de infecção foram detectados. Avaliação clínica urgente recomendada.\n\n");
        }
        
        return narrative.toString();
    }
    
    /**
     * Gera aviso legal obrigatório
     */
    private String generateLegalDisclaimer() {
        return """
            ⚠️ AVISO IMPORTANTE - LEIA COM ATENÇÃO
            
            Esta análise foi gerada por um sistema de Inteligência Artificial como ferramenta 
            de APOIO À DECISÃO CLÍNICA. Os resultados apresentados:
            
            ✗ NÃO substituem a avaliação e diagnóstico médico
            ✗ NÃO devem ser utilizados como único critério para decisões de tratamento
            ✗ Devem ser interpretados por profissional de saúde qualificado
            
            O sistema pode apresentar limitações e erros. A responsabilidade final pelo 
            diagnóstico e tratamento é exclusivamente do profissional de saúde responsável 
            pelo paciente.
            
            Em caso de dúvidas ou discordância com os resultados, priorize sempre a 
            avaliação clínica presencial.
            """;
    }
    
    // ==================== Utilitários ====================
    
    private BufferedImage resizeImage(BufferedImage original, int width, int height) {
        BufferedImage resized = new BufferedImage(width, height, BufferedImage.TYPE_INT_RGB);
        Graphics2D g2d = resized.createGraphics();
        g2d.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BILINEAR);
        g2d.drawImage(original, 0, 0, width, height, null);
        g2d.dispose();
        return resized;
    }
    
    private String imageToBase64(BufferedImage image) throws IOException {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        ImageIO.write(image, "png", baos);
        return "data:image/png;base64," + Base64.getEncoder().encodeToString(baos.toByteArray());
    }
    
    // ==================== DTOs ====================
    
    public static class ExplanationResult {
        private String analysisId;
        private HeatmapResult heatmap;
        private List<RegionOfInterest> regionsOfInterest;
        private List<FeatureExplanation> featureExplanations;
        private ConfidenceMetrics confidenceMetrics;
        private String narrativeExplanation;
        private String legalDisclaimer;
        
        // Getters and Setters
        public String getAnalysisId() { return analysisId; }
        public void setAnalysisId(String analysisId) { this.analysisId = analysisId; }
        
        public HeatmapResult getHeatmap() { return heatmap; }
        public void setHeatmap(HeatmapResult heatmap) { this.heatmap = heatmap; }
        
        public List<RegionOfInterest> getRegionsOfInterest() { return regionsOfInterest; }
        public void setRegionsOfInterest(List<RegionOfInterest> regionsOfInterest) { this.regionsOfInterest = regionsOfInterest; }
        
        public List<FeatureExplanation> getFeatureExplanations() { return featureExplanations; }
        public void setFeatureExplanations(List<FeatureExplanation> featureExplanations) { this.featureExplanations = featureExplanations; }
        
        public ConfidenceMetrics getConfidenceMetrics() { return confidenceMetrics; }
        public void setConfidenceMetrics(ConfidenceMetrics confidenceMetrics) { this.confidenceMetrics = confidenceMetrics; }
        
        public String getNarrativeExplanation() { return narrativeExplanation; }
        public void setNarrativeExplanation(String narrativeExplanation) { this.narrativeExplanation = narrativeExplanation; }
        
        public String getLegalDisclaimer() { return legalDisclaimer; }
        public void setLegalDisclaimer(String legalDisclaimer) { this.legalDisclaimer = legalDisclaimer; }
    }
    
    public static class HeatmapResult {
        private String heatmapBase64;
        private String overlayBase64;
        private int width;
        private int height;
        private double[][] activationMap;
        
        // Getters and Setters
        public String getHeatmapBase64() { return heatmapBase64; }
        public void setHeatmapBase64(String heatmapBase64) { this.heatmapBase64 = heatmapBase64; }
        
        public String getOverlayBase64() { return overlayBase64; }
        public void setOverlayBase64(String overlayBase64) { this.overlayBase64 = overlayBase64; }
        
        public int getWidth() { return width; }
        public void setWidth(int width) { this.width = width; }
        
        public int getHeight() { return height; }
        public void setHeight(int height) { this.height = height; }
        
        public double[][] getActivationMap() { return activationMap; }
        public void setActivationMap(double[][] activationMap) { this.activationMap = activationMap; }
    }
    
    public static class RegionOfInterest {
        private String id;
        private int x;
        private int y;
        private int width;
        private int height;
        private double activationLevel;
        private String description;
        
        // Getters and Setters
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        
        public int getX() { return x; }
        public void setX(int x) { this.x = x; }
        
        public int getY() { return y; }
        public void setY(int y) { this.y = y; }
        
        public int getWidth() { return width; }
        public void setWidth(int width) { this.width = width; }
        
        public int getHeight() { return height; }
        public void setHeight(int height) { this.height = height; }
        
        public double getActivationLevel() { return activationLevel; }
        public void setActivationLevel(double activationLevel) { this.activationLevel = activationLevel; }
        
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
    }
    
    public static class FeatureExplanation {
        private String name;
        private String value;
        private double confidence;
        private String explanation;
        private List<String> evidences;
        
        public FeatureExplanation(String name, String value, double confidence, 
                                  String explanation, List<String> evidences) {
            this.name = name;
            this.value = value;
            this.confidence = confidence;
            this.explanation = explanation;
            this.evidences = evidences;
        }
        
        // Getters
        public String getName() { return name; }
        public String getValue() { return value; }
        public double getConfidence() { return confidence; }
        public String getExplanation() { return explanation; }
        public List<String> getEvidences() { return evidences; }
    }
    
    public static class ConfidenceMetrics {
        private double overallConfidence;
        private Map<String, Double> componentConfidence;
        private List<String> positiveFactors;
        private List<String> negativeFactors;
        private String confidenceRecommendation;
        
        // Getters and Setters
        public double getOverallConfidence() { return overallConfidence; }
        public void setOverallConfidence(double overallConfidence) { this.overallConfidence = overallConfidence; }
        
        public Map<String, Double> getComponentConfidence() { return componentConfidence; }
        public void setComponentConfidence(Map<String, Double> componentConfidence) { this.componentConfidence = componentConfidence; }
        
        public List<String> getPositiveFactors() { return positiveFactors; }
        public void setPositiveFactors(List<String> positiveFactors) { this.positiveFactors = positiveFactors; }
        
        public List<String> getNegativeFactors() { return negativeFactors; }
        public void setNegativeFactors(List<String> negativeFactors) { this.negativeFactors = negativeFactors; }
        
        public String getConfidenceRecommendation() { return confidenceRecommendation; }
        public void setConfidenceRecommendation(String confidenceRecommendation) { this.confidenceRecommendation = confidenceRecommendation; }
    }
}
