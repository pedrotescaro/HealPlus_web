package com.healplus.dto;

import lombok.Data;
import java.util.List;

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
        public void setIdImagem(String idImagem) { this.idImagem = idImagem; }
        public void setDataHoraCaptura(String dataHoraCaptura) { this.dataHoraCaptura = dataHoraCaptura; }
        public void setAvaliacaoQualidade(QualityAssessment avaliacaoQualidade) { this.avaliacaoQualidade = avaliacaoQualidade; }
        public void setAnaliseDimensional(DimensionalAnalysis analiseDimensional) { this.analiseDimensional = analiseDimensional; }
        public void setAnaliseColorimetrica(ColorAnalysis analiseColorimetrica) { this.analiseColorimetrica = analiseColorimetrica; }
        public void setAnaliseHistograma(HistogramAnalysis analiseHistograma) { this.analiseHistograma = analiseHistograma; }
        public void setAnaliseTexturaECaracteristicas(TextureAnalysis analiseTexturaECaracteristicas) { this.analiseTexturaECaracteristicas = analiseTexturaECaracteristicas; }
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
        public String getImage1Base64() { return image1Base64; }
        public String getImage1Id() { return image1Id; }
        public String getImage1DateTime() { return image1DateTime; }
        public String getImage2Base64() { return image2Base64; }
        public String getImage2Id() { return image2Id; }
        public String getImage2DateTime() { return image2DateTime; }
    }
    
    @Data
    public static class CompareImagesResponse {
        private ImageAnalysisResponse analiseImagem1;
        private ImageAnalysisResponse analiseImagem2;
        private ComparativeReport relatorioComparativo;
        public void setAnaliseImagem1(ImageAnalysisResponse analiseImagem1) { this.analiseImagem1 = analiseImagem1; }
        public void setAnaliseImagem2(ImageAnalysisResponse analiseImagem2) { this.analiseImagem2 = analiseImagem2; }
        public void setRelatorioComparativo(ComparativeReport relatorioComparativo) { this.relatorioComparativo = relatorioComparativo; }
    }
    
    @Data
    public static class ComparativeReport {
        private String periodoAnalise;
        private String intervaloTempo;
        private DataConsistency consistenciaDados;
        private QuantitativeProgress analiseQuantitativaProgressao;
        private String resumoDescritivoEvolucao;
        public void setPeriodoAnalise(String periodoAnalise) { this.periodoAnalise = periodoAnalise; }
        public void setIntervaloTempo(String intervaloTempo) { this.intervaloTempo = intervaloTempo; }
        public void setConsistenciaDados(DataConsistency consistenciaDados) { this.consistenciaDados = consistenciaDados; }
        public void setAnaliseQuantitativaProgressao(QuantitativeProgress analiseQuantitativaProgressao) { this.analiseQuantitativaProgressao = analiseQuantitativaProgressao; }
        public void setResumoDescritivoEvolucao(String resumoDescritivoEvolucao) { this.resumoDescritivoEvolucao = resumoDescritivoEvolucao; }
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
        public String getImage1Base64() { return image1Base64; }
        public String getImage2Base64() { return image2Base64; }
        public String getReport1Date() { return report1Date; }
        public String getReport2Date() { return report2Date; }
    }
}

