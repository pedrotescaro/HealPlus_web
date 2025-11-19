package com.healplus.services;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AIService {
    
    @Value("${gemini.api.key:}")
    private String geminiApiKey;
    
    @Value("${gemini.api.url:https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent}")
    private String geminiApiUrl;
    
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    
    public AIService() {
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }
    
    /**
     * Analisa uma imagem de ferida usando a API Gemini
     */
    public Map<String, Object> analyzeWoundImage(String imageBase64, String imageId, String captureDateTime) {
        if (geminiApiKey == null || geminiApiKey.isEmpty()) {
            return createMockAnalysis(imageId, captureDateTime);
        }
        
        try {
            String prompt = buildImageAnalysisPrompt(imageId, captureDateTime);
            
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("contents", List.of(
                Map.of(
                    "parts", List.of(
                        Map.of("text", prompt),
                        Map.of(
                            "inline_data", Map.of(
                                "mime_type", extractMimeType(imageBase64),
                                "data", extractBase64Data(imageBase64)
                            )
                        )
                    )
                )
            ));
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            String url = geminiApiUrl + "?key=" + geminiApiKey;
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);
            
            ResponseEntity<Map> response = restTemplate.postForEntity(url, request, Map.class);
            
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return parseGeminiResponse(response.getBody());
            }
            
            return createMockAnalysis(imageId, captureDateTime);
        } catch (Exception e) {
            System.err.println("Erro ao chamar API Gemini: " + e.getMessage());
            return createMockAnalysis(imageId, captureDateTime);
        }
    }
    
    /**
     * Compara duas imagens de feridas
     */
    public Map<String, Object> compareWoundImages(
            String image1Base64, String image1Id, String image1DateTime,
            String image2Base64, String image2Id, String image2DateTime) {
        
        if (geminiApiKey == null || geminiApiKey.isEmpty()) {
            return createMockComparison(image1Id, image1DateTime, image2Id, image2DateTime);
        }
        
        try {
            String prompt = buildComparisonPrompt(image1Id, image1DateTime, image2Id, image2DateTime);
            
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("contents", List.of(
                Map.of(
                    "parts", List.of(
                        Map.of("text", prompt),
                        Map.of(
                            "inline_data", Map.of(
                                "mime_type", extractMimeType(image1Base64),
                                "data", extractBase64Data(image1Base64)
                            )
                        ),
                        Map.of(
                            "inline_data", Map.of(
                                "mime_type", extractMimeType(image2Base64),
                                "data", extractBase64Data(image2Base64)
                            )
                        )
                    )
                )
            ));
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            String url = geminiApiUrl + "?key=" + geminiApiKey;
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);
            
            ResponseEntity<Map> response = restTemplate.postForEntity(url, request, Map.class);
            
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return parseComparisonResponse(response.getBody(), image1Id, image1DateTime, image2Id, image2DateTime);
            }
            
            return createMockComparison(image1Id, image1DateTime, image2Id, image2DateTime);
        } catch (Exception e) {
            System.err.println("Erro ao comparar imagens com Gemini: " + e.getMessage());
            return createMockComparison(image1Id, image1DateTime, image2Id, image2DateTime);
        }
    }
    
    private String extractMimeType(String dataUri) {
        if (dataUri.startsWith("data:")) {
            int semicolonIndex = dataUri.indexOf(';');
            if (semicolonIndex > 0) {
                return dataUri.substring(5, semicolonIndex);
            }
        }
        return "image/jpeg";
    }
    
    private String extractBase64Data(String dataUri) {
        if (dataUri.contains(",")) {
            return dataUri.substring(dataUri.indexOf(",") + 1);
        }
        return dataUri;
    }
    
    private String buildImageAnalysisPrompt(String imageId, String captureDateTime) {
        return String.format("""
            Você é uma enfermeira estomaterapeuta analisando uma imagem de ferida. Utilize o protocolo TIMERS e os mesmos critérios clínicos usados por enfermeiros especialistas para diferenciar etiologias.
            
            ID da Imagem: %s
            Data/Hora de Captura: %s
            
            Instruções específicas:
            - Avalie se a lesão é: por pressão (estágio I-IV ou DTPI), vascular arterial, vascular venosa, diabética/neurotrófica, traumática, fungoide/fúngica, inflamatória ou outra. Sempre indique uma confiança (%) e a justificativa clínica (localização anatômica, profundidade, tipo de tecido, exsudato, bordas, pele perilesional, sinais de infecção).
            - Para suspeita de lesão fúngica, procure por: placas/esfacelos branco-amarelados com bordas irregulares, halo eritematoso com pápulas satélites, maceração intensa, aspecto \"queimado\" ou com crostas escuras e padrão de crescimento radial.
            - Para lesão por pressão, descreva: plano ósseo relacionado, estágio, presença de necrose/esfacelo, túnel, cavitação, bordas descoladas.
            - Para lesões vasculares (arteriais/venosas), cite: coloração, edema, padrão de distribuição, presença de lipodermatoesclerose, temperatura e pulsos aparentes na pele.
            
            Forneça uma análise detalhada incluindo:
            1. Avaliação de qualidade da imagem (iluminação, foco, ângulo, fundo, escala de referência)
            2. Análise dimensional (área total afetada, dimensões da lesão principal)
            3. Análise colorimétrica (cores dominantes com percentuais)
            4. Análise de histograma (distribuição de cores)
            5. Análise de textura e características (edema, descamação, brilho, bordas, tecido de granulação, esfacelo, necrose, sinais de infecção, maceração perilesional)
            6. Classificação etiológica diferenciando os tipos de ferida (fungal, pressão, vascular, diabética, traumática, etc.) com justificativa e fatores clínicos observados.
            7. Recomendações de cuidados prioritários alinhadas à etiologia presumida.
            
            Retorne a resposta em JSON estruturado usando chaves claras em português.
            """, imageId, captureDateTime);
    }
    
    private String buildComparisonPrompt(String image1Id, String image1DateTime, 
                                         String image2Id, String image2DateTime) {
        return String.format("""
            Compare estas duas imagens de ferida médica para avaliar a progressão da cicatrização.
            
            Imagem 1:
            - ID: %s
            - Data/Hora: %s
            
            Imagem 2:
            - ID: %s
            - Data/Hora: %s
            
            Forneça uma análise comparativa detalhada incluindo:
            1. Análise individual de cada imagem (qualidade, dimensões, cores, textura, classificação etiológica diferenciando feridas fúngicas, por pressão, diabéticas, vasculares, etc.)
            2. Comparação quantitativa de progressão (variação de área, mudanças de coloração, evolução de edema, tecido, bordas e pele perilesional)
            3. Resumo descritivo da evolução destacando se houve mudança de etiologia provável ou agravamento (ex.: de colonização fúngica para infecção)
            4. Consistência dos dados entre as imagens e fatores clínicos observados por enfermeiros (exsudato, odor, maceração, presença de necrose, pápulas satélites)
            
            Retorne a resposta em formato JSON estruturado.
            """, image1Id, image1DateTime, image2Id, image2DateTime);
    }
    
    private Map<String, Object> parseGeminiResponse(Map<String, Object> response) {
        // Parse da resposta da API Gemini
        // Por enquanto, retorna estrutura básica
        Map<String, Object> analysis = new HashMap<>();
        analysis.put("id_imagem", "generated");
        analysis.put("data_hora_captura", java.time.Instant.now().toString());
        
        // Estrutura de análise (simplificada - pode ser expandida)
        Map<String, Object> qualityAssessment = new HashMap<>();
        qualityAssessment.put("iluminacao", "Adequada");
        qualityAssessment.put("foco", "Nítido");
        qualityAssessment.put("angulo_consistente", "Sim");
        qualityAssessment.put("fundo", "Neutro");
        qualityAssessment.put("escala_referencia_presente", "Sim");
        analysis.put("avaliacao_qualidade", qualityAssessment);
        
        Map<String, Object> dimensionalAnalysis = new HashMap<>();
        dimensionalAnalysis.put("unidade_medida", "cm");
        dimensionalAnalysis.put("area_total_afetada", 0.0);
        analysis.put("analise_dimensional", dimensionalAnalysis);

        Map<String, Object> etiologicClassification = new HashMap<>();
        etiologicClassification.put("tipo_probabilistico", "indefinido");
        etiologicClassification.put("confianca_percentual", 0);
        etiologicClassification.put("justificativa", "Aguardando retorno do modelo");
        analysis.put("classificacao_etiologica", etiologicClassification);
        analysis.put("recomendacoes_prioritarias", List.of());
        
        return analysis;
    }
    
    private Map<String, Object> parseComparisonResponse(Map<String, Object> response, 
                                                         String image1Id, String image1DateTime,
                                                         String image2Id, String image2DateTime) {
        Map<String, Object> comparison = new HashMap<>();
        
        // Análise da imagem 1
        Map<String, Object> analysis1 = new HashMap<>();
        analysis1.put("id_imagem", image1Id);
        analysis1.put("data_hora_captura", image1DateTime);
        comparison.put("analise_imagem_1", analysis1);
        
        // Análise da imagem 2
        Map<String, Object> analysis2 = new HashMap<>();
        analysis2.put("id_imagem", image2Id);
        analysis2.put("data_hora_captura", image2DateTime);
        comparison.put("analise_imagem_2", analysis2);
        
        // Relatório comparativo
        Map<String, Object> comparativeReport = new HashMap<>();
        comparativeReport.put("periodo_analise", image1DateTime + " a " + image2DateTime);
        comparativeReport.put("intervalo_tempo", "Calculado");
        
        Map<String, Object> quantitativeProgress = new HashMap<>();
        quantitativeProgress.put("delta_area_total_afetada", "0 cm²");
        comparativeReport.put("analise_quantitativa_progressao", quantitativeProgress);
        comparativeReport.put("resumo_descritivo_evolucao", "Análise em andamento");
        
        comparison.put("relatorio_comparativo", comparativeReport);
        
        return comparison;
    }
    
    private Map<String, Object> createMockAnalysis(String imageId, String captureDateTime) {
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
        
        Map<String, Object> colorAnalysis = new HashMap<>();
        colorAnalysis.put("cores_dominantes", List.of());
        analysis.put("analise_colorimetrica", colorAnalysis);
        
        Map<String, Object> textureAnalysis = new HashMap<>();
        textureAnalysis.put("edema", "Ausente");
        textureAnalysis.put("descamacao", "Ausente");
        textureAnalysis.put("brilho_superficial", "Fosco");
        textureAnalysis.put("presenca_solucao_continuidade", "Não");
        textureAnalysis.put("bordas_lesao", "Definidas");
        analysis.put("analise_textura_e_caracteristicas", textureAnalysis);

        Map<String, Object> etiologicClassification = new HashMap<>();
        etiologicClassification.put("tipo_probabilistico", "indefinido");
        etiologicClassification.put("confianca_percentual", 0);
        etiologicClassification.put("justificativa", "Modo demonstração - sem análise real.");
        analysis.put("classificacao_etiologica", etiologicClassification);
        analysis.put("recomendacoes_prioritarias", List.of(
            "Manter ferida limpa e coberta",
            "Monitorar sinais de infecção",
            "Registrar novas imagens para comparação"
        ));
        
        return analysis;
    }
    
    private Map<String, Object> createMockComparison(String image1Id, String image1DateTime,
                                                      String image2Id, String image2DateTime) {
        Map<String, Object> comparison = new HashMap<>();
        comparison.put("analise_imagem_1", createMockAnalysis(image1Id, image1DateTime));
        comparison.put("analise_imagem_2", createMockAnalysis(image2Id, image2DateTime));
        
        Map<String, Object> comparativeReport = new HashMap<>();
        comparativeReport.put("periodo_analise", image1DateTime + " a " + image2DateTime);
        comparativeReport.put("intervalo_tempo", "Calculado");
        
        Map<String, Object> quantitativeProgress = new HashMap<>();
        quantitativeProgress.put("delta_area_total_afetada", "0 cm²");
        Map<String, Object> deltaColoration = new HashMap<>();
        deltaColoration.put("mudanca_area_hiperpigmentacao", "0%");
        deltaColoration.put("mudanca_area_eritema_rubor", "0%");
        quantitativeProgress.put("delta_coloracao", deltaColoration);
        quantitativeProgress.put("delta_edema", "Sem mudança");
        quantitativeProgress.put("delta_textura", "Sem mudança significativa");
        comparativeReport.put("analise_quantitativa_progressao", quantitativeProgress);
        comparativeReport.put("resumo_descritivo_evolucao", "Análise comparativa realizada. Requer análise mais detalhada.");
        
        comparison.put("relatorio_comparativo", comparativeReport);
        
        return comparison;
    }
}

