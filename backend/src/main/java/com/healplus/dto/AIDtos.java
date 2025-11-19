package com.healplus.dto;

import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
public class AIDtos {
    
    @Data
    public static class ImageAnalysisResponse {
        private String idImagem;
        private String dataHoraCaptura;
        private QualityAssessment avaliacaoQualidade;
        private DimensionalAnalysis analiseDimensional;
        private ColorAnalysis analiseColorimetrica;
        private HistogramAnalysis analiseHistograma;
        private TextureAnalysis analiseTexturaECaracteristicas;
    }
    
    @Data
    public static class QualityAssessment {
        private String iluminacao; // "Adequada", "Superexposta", "Subexposta", "Sombras Presentes"
        private String foco; // "Nítido", "Levemente Desfocado", "Desfocado"
        private String anguloConsistente; // "Sim", "Não", "Não Aplicável"
        private String fundo; // "Neutro", "Distrativo"
        private String escalaReferenciaPresente; // "Sim", "Não"
    }
    
    @Data
    public static class DimensionalAnalysis {
        private String unidadeMedida; // "mm", "cm", "pixels", "%"
        private Double areaTotalAfetada;
        private WoundDimensions dimensoesLesaoPrincipal;
    }
    
    @Data
    public static class WoundDimensions {
        private Double largura;
        private Double comprimento;
    }
    
    @Data
    public static class ColorAnalysis {
        private List<DominantColor> coresDominantes;
    }
    
    @Data
    public static class DominantColor {
        private String cor;
        private String hexAproximado;
        private Double areaPercentual;
    }
    
    @Data
    public static class HistogramAnalysis {
        private List<ColorRange> distribuicaoCores;
    }
    
    @Data
    public static class ColorRange {
        private String faixaCor;
        private Double contagemPixelsPercentual;
    }
    
    @Data
    public static class TextureAnalysis {
        private String edema; // "Ausente", "Leve", "Moderado", "Grave"
        private String descamacao; // "Ausente", "Presente"
        private String brilhoSuperficial; // "Fosco", "Acetinado", "Brilhante"
        private String presencaSolucaoContinuidade; // "Sim", "Não"
        private String bordasLesao; // "Definidas", "Indefinidas", "Irregulares", "Não Aplicável"
    }
    
    @Data
    public static class CompareImagesRequest {
        private String image1Base64;
        private String image1Id;
        private String image1DateTime;
        private String image2Base64;
        private String image2Id;
        private String image2DateTime;
    }
    
    @Data
    public static class CompareImagesResponse {
        private ImageAnalysisResponse analiseImagem1;
        private ImageAnalysisResponse analiseImagem2;
        private ComparativeReport relatorioComparativo;
    }
    
    @Data
    public static class ComparativeReport {
        private String periodoAnalise;
        private String intervaloTempo;
        private DataConsistency consistenciaDados;
        private QuantitativeProgress analiseQuantitativaProgressao;
        private String resumoDescritivoEvolucao;
    }
    
    @Data
    public static class DataConsistency {
        private String alertaQualidade;
    }
    
    @Data
    public static class QuantitativeProgress {
        private String deltaAreaTotalAfetada;
        private ColorationChange deltaColoracao;
        private String deltaEdema;
        private String deltaTextura;
    }
    
    @Data
    public static class ColorationChange {
        private String mudancaAreaHiperpigmentacao;
        private String mudancaAreaEritemaRubor;
        private String surgimentoNovasColoracoes;
    }
    
    @Data
    public static class CompareReportsRequest {
        private String report1Content;
        private String report2Content;
        private String image1Base64;
        private String image2Base64;
        private String report1Date;
        private String report2Date;
    }
}

