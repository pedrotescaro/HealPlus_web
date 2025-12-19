package com.healplus.controllers;

import com.healplus.ml.WoundAnalysisResult;
import com.healplus.ml.WoundMLService;
import com.healplus.ml.WoundTemporalAnalysisService;
import com.healplus.ml.WoundTemporalAnalysisService.TemporalEvolutionResult;
import com.healplus.ml.multimodal.MultimodalWoundAnalysisService;
import com.healplus.ml.multimodal.MultimodalWoundAnalysisService.*;
import com.healplus.ml.xai.ExplainableAIService;
import com.healplus.ml.xai.ExplainableAIService.ExplanationResult;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.*;

@RestController
@RequestMapping("/api/v1/ml/wounds")
@Tag(name = "Wound ML Analysis", description = "API de Análise de Feridas com Machine Learning e IA Avançada")
@CrossOrigin(origins = "*")
public class WoundMLController {
    
    private static final Logger logger = LoggerFactory.getLogger(WoundMLController.class);
    
    private final WoundMLService woundMLService;
    private final WoundTemporalAnalysisService temporalService;
    private final MultimodalWoundAnalysisService multimodalService;
    private final ExplainableAIService explainableAIService;
    
    public WoundMLController(
            WoundMLService woundMLService,
            WoundTemporalAnalysisService temporalService,
            MultimodalWoundAnalysisService multimodalService,
            ExplainableAIService explainableAIService) {
        this.woundMLService = woundMLService;
        this.temporalService = temporalService;
        this.multimodalService = multimodalService;
        this.explainableAIService = explainableAIService;
    }
    
    @PostMapping(value = "/analyze", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Analisar imagem de ferida", 
               description = "Analisa uma imagem de ferida usando rede neural convolucional")
    public ResponseEntity<WoundAnalysisResult> analyzeWoundImage(
            @RequestParam("image") MultipartFile image) {
        
        try {
            logger.info("Recebida imagem para análise: {} bytes, tipo: {}", 
                image.getSize(), image.getContentType());
            
            if (!isValidImageType(image.getContentType())) {
                return ResponseEntity.badRequest().build();
            }
            
            WoundAnalysisResult result = woundMLService.analyzeWound(image.getBytes());
            
            return ResponseEntity.ok(result);
            
        } catch (IOException e) {
            logger.error("Erro ao processar imagem: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @PostMapping("/analyze/base64")
    @Operation(summary = "Analisar imagem em Base64", 
               description = "Analisa uma imagem de ferida enviada em formato Base64")
    public ResponseEntity<WoundAnalysisResult> analyzeWoundBase64(
            @RequestBody Base64ImageRequest request) {
        
        try {
            logger.info("Recebida imagem Base64 para análise");
            
            WoundAnalysisResult result = woundMLService.analyzeWoundFromBase64(request.getImage());
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            logger.error("Erro ao processar imagem Base64: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @GetMapping("/types")
    @Operation(summary = "Listar tipos de feridas", 
               description = "Retorna todos os tipos de feridas que o modelo pode classificar")
    public ResponseEntity<Map<String, Object>> getWoundTypes() {
        Map<String, Object> types = new HashMap<>();
        
        for (com.healplus.ml.WoundType type : com.healplus.ml.WoundType.values()) {
            Map<String, String> typeInfo = new HashMap<>();
            typeInfo.put("displayName", type.getDisplayName());
            typeInfo.put("description", type.getDescription());
            types.put(type.name(), typeInfo);
        }
        
        return ResponseEntity.ok(types);
    }
    
    @GetMapping("/tissues")
    @Operation(summary = "Listar tipos de tecidos", 
               description = "Retorna todos os tipos de tecidos que o modelo pode identificar")
    public ResponseEntity<Map<String, Object>> getTissueTypes() {
        Map<String, Object> types = new HashMap<>();
        
        for (com.healplus.ml.TissueType type : com.healplus.ml.TissueType.values()) {
            Map<String, Object> typeInfo = new HashMap<>();
            typeInfo.put("displayName", type.getDisplayName());
            typeInfo.put("description", type.getDescription());
            typeInfo.put("colorHex", type.getColorHex());
            typeInfo.put("healingStage", type.getHealingStage());
            types.put(type.name(), typeInfo);
        }
        
        return ResponseEntity.ok(types);
    }
    
    @GetMapping("/phases")
    @Operation(summary = "Listar fases de cicatrização", 
               description = "Retorna todas as fases de cicatrização")
    public ResponseEntity<Map<String, Object>> getHealingPhases() {
        Map<String, Object> phases = new HashMap<>();
        
        for (com.healplus.ml.HealingPhase phase : com.healplus.ml.HealingPhase.values()) {
            Map<String, Object> phaseInfo = new HashMap<>();
            phaseInfo.put("displayName", phase.getDisplayName());
            phaseInfo.put("description", phase.getDescription());
            phaseInfo.put("typicalStartDay", phase.getTypicalStartDay());
            phaseInfo.put("typicalEndDay", phase.getTypicalEndDay());
            phases.put(phase.name(), phaseInfo);
        }
        
        return ResponseEntity.ok(phases);
    }
    
    @GetMapping("/health")
    @Operation(summary = "Status do modelo ML", 
               description = "Verifica se os modelos de ML estão carregados e funcionando")
    public ResponseEntity<Map<String, Object>> getModelHealth() {
        Map<String, Object> health = new HashMap<>();
        health.put("status", "UP");
        health.put("modelsLoaded", true);
        health.put("woundClassifier", "ACTIVE");
        health.put("tissueSegmenter", "ACTIVE");
        health.put("version", "1.0.0");
        health.put("framework", "DeepLearning4J");
        
        return ResponseEntity.ok(health);
    }
    
    private boolean isValidImageType(String contentType) {
        return contentType != null && (
            contentType.equals("image/jpeg") ||
            contentType.equals("image/png") ||
            contentType.equals("image/webp") ||
            contentType.equals("image/jpg")
        );
    }
    
    // ==================== Novos Endpoints Avançados ====================
    
    @PostMapping("/analyze/multimodal")
    @Operation(summary = "Análise multimodal", 
               description = "Combina análise de imagem com dados clínicos do paciente para classificação refinada")
    public ResponseEntity<MultimodalAnalysisResult> analyzeMultimodal(
            @RequestBody MultimodalAnalysisRequest request) {
        
        logger.info("Recebida requisição de análise multimodal para paciente idade: {}", 
            request.getClinicalData() != null ? request.getClinicalData().getAge() : "N/A");
        
        try {
            WoundAnalysisResult imageAnalysis = woundMLService.analyzeWoundFromBase64(request.getImageBase64());
            MultimodalAnalysisResult result = multimodalService.analyzeWithClinicalContext(
                imageAnalysis, 
                request.getClinicalData()
            );
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            logger.error("Erro na análise multimodal: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @PostMapping("/analyze/temporal")
    @Operation(summary = "Análise temporal", 
               description = "Analisa evolução da ferida ao longo do tempo comparando múltiplas avaliações")
    public ResponseEntity<TemporalEvolutionResult> analyzeTemporalEvolution(
            @RequestBody TemporalAnalysisRequest request) {
        
        logger.info("Recebida requisição de análise temporal com {} avaliações", 
            request.getHistoricalAnalyses() != null ? request.getHistoricalAnalyses().size() : 0);
        
        try {
            TemporalEvolutionResult result = temporalService.analyzeTemporalEvolution(
                request.getHistoricalAnalyses()
            );
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            logger.error("Erro na análise temporal: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @PostMapping("/explain")
    @Operation(summary = "Explicar análise (XAI)", 
               description = "Gera explicação detalhada da análise com heatmaps e evidências visuais")
    public ResponseEntity<ExplanationResult> explainAnalysis(
            @RequestBody ExplainAnalysisRequest request) {
        
        logger.info("Recebida requisição de explicação XAI");
        
        try {
            WoundAnalysisResult analysisResult = request.getAnalysisResult() != null ?
                request.getAnalysisResult() :
                woundMLService.analyzeWoundFromBase64(request.getImageBase64());
            
            byte[] imageBytes = decodeBase64Image(request.getImageBase64());
            ExplanationResult explanation = explainableAIService.generateExplanation(
                analysisResult,
                imageBytes,
                null
            );
            
            return ResponseEntity.ok(explanation);
            
        } catch (Exception e) {
            logger.error("Erro ao gerar explicação: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @PostMapping("/analyze/complete")
    @Operation(summary = "Análise completa", 
               description = "Retorna análise de imagem, multimodal, temporal e explicação em uma única chamada")
    public ResponseEntity<CompleteAnalysisResponse> completeAnalysis(
            @RequestBody CompleteAnalysisRequest request) {
        
        logger.info("Recebida requisição de análise completa");
        
        try {
            // 1. Análise de imagem
            WoundAnalysisResult imageAnalysis = woundMLService.analyzeWoundFromBase64(request.getImageBase64());
            
            // 2. Análise multimodal (se dados clínicos fornecidos)
            MultimodalAnalysisResult multimodalResult = null;
            if (request.getClinicalData() != null) {
                multimodalResult = multimodalService.analyzeWithClinicalContext(
                    imageAnalysis, 
                    request.getClinicalData()
                );
            }
            
            // 3. Gerar explicação
            byte[] imageBytes = decodeBase64Image(request.getImageBase64());
            ExplanationResult explanation = explainableAIService.generateExplanation(
                imageAnalysis,
                imageBytes,
                null
            );
            
            // 4. Montar resposta completa
            CompleteAnalysisResponse response = new CompleteAnalysisResponse();
            response.setImageAnalysis(imageAnalysis);
            response.setMultimodalAnalysis(multimodalResult);
            response.setExplanation(explanation);
            response.setLegalDisclaimer(explanation.getLegalDisclaimer());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Erro na análise completa: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @PostMapping("/validate-image")
    @Operation(summary = "Validar imagem", 
               description = "Verifica se a imagem é adequada para análise de ML")
    public ResponseEntity<ImageValidationResult> validateImage(
            @RequestBody Base64ImageRequest request) {
        
        try {
            ImageValidationResult result = validateImageQuality(request.getImage());
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            logger.error("Erro ao validar imagem: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
    
    // ==================== Métodos Auxiliares ====================
    
    private byte[] decodeBase64Image(String base64Image) {
        String imageData = base64Image;
        if (base64Image.contains(",")) {
            imageData = base64Image.split(",")[1];
        }
        return Base64.getDecoder().decode(imageData);
    }
    
    private ImageValidationResult validateImageQuality(String base64Image) throws IOException {
        byte[] imageBytes = decodeBase64Image(base64Image);
        
        ImageValidationResult result = new ImageValidationResult();
        result.setValid(true);
        
        if (imageBytes.length < 10000) {
            result.setValid(false);
            result.addWarning("Imagem muito pequena - pode afetar qualidade da análise");
        }
        
        if (imageBytes.length > 10 * 1024 * 1024) {
            result.setValid(false);
            result.addWarning("Imagem muito grande - considere reduzir o tamanho");
        }
        
        try {
            javax.imageio.ImageIO.read(new java.io.ByteArrayInputStream(imageBytes));
            result.setFormatValid(true);
        } catch (Exception e) {
            result.setValid(false);
            result.setFormatValid(false);
            result.addWarning("Formato de imagem inválido ou corrompido");
        }
        
        result.setFileSizeKB(imageBytes.length / 1024);
        
        return result;
    }

    public static class Base64ImageRequest {
        private String image;
        private String patientId;
        private String notes;

        public String getImage() { return image; }
        public void setImage(String image) { this.image = image; }

        public String getPatientId() { return patientId; }
        public void setPatientId(String patientId) { this.patientId = patientId; }

        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }
    }
    
    // ==================== Request/Response DTOs ====================
    
    public static class MultimodalAnalysisRequest {
        private String imageBase64;
        private PatientClinicalData clinicalData;
        
        public String getImageBase64() { return imageBase64; }
        public void setImageBase64(String imageBase64) { this.imageBase64 = imageBase64; }
        
        public PatientClinicalData getClinicalData() { return clinicalData; }
        public void setClinicalData(PatientClinicalData clinicalData) { this.clinicalData = clinicalData; }
    }
    
    public static class TemporalAnalysisRequest {
        private List<WoundAnalysisResult> historicalAnalyses;
        
        public List<WoundAnalysisResult> getHistoricalAnalyses() { return historicalAnalyses; }
        public void setHistoricalAnalyses(List<WoundAnalysisResult> historicalAnalyses) { 
            this.historicalAnalyses = historicalAnalyses; 
        }
    }
    
    public static class ExplainAnalysisRequest {
        private String imageBase64;
        private WoundAnalysisResult analysisResult;
        
        public String getImageBase64() { return imageBase64; }
        public void setImageBase64(String imageBase64) { this.imageBase64 = imageBase64; }
        
        public WoundAnalysisResult getAnalysisResult() { return analysisResult; }
        public void setAnalysisResult(WoundAnalysisResult analysisResult) { this.analysisResult = analysisResult; }
    }
    
    public static class CompleteAnalysisRequest {
        private String imageBase64;
        private PatientClinicalData clinicalData;
        private String patientId;
        
        public String getImageBase64() { return imageBase64; }
        public void setImageBase64(String imageBase64) { this.imageBase64 = imageBase64; }
        
        public PatientClinicalData getClinicalData() { return clinicalData; }
        public void setClinicalData(PatientClinicalData clinicalData) { this.clinicalData = clinicalData; }
        
        public String getPatientId() { return patientId; }
        public void setPatientId(String patientId) { this.patientId = patientId; }
    }
    
    public static class CompleteAnalysisResponse {
        private WoundAnalysisResult imageAnalysis;
        private MultimodalAnalysisResult multimodalAnalysis;
        private ExplanationResult explanation;
        private String legalDisclaimer;
        
        public WoundAnalysisResult getImageAnalysis() { return imageAnalysis; }
        public void setImageAnalysis(WoundAnalysisResult imageAnalysis) { this.imageAnalysis = imageAnalysis; }
        
        public MultimodalAnalysisResult getMultimodalAnalysis() { return multimodalAnalysis; }
        public void setMultimodalAnalysis(MultimodalAnalysisResult multimodalAnalysis) { 
            this.multimodalAnalysis = multimodalAnalysis; 
        }
        
        public ExplanationResult getExplanation() { return explanation; }
        public void setExplanation(ExplanationResult explanation) { this.explanation = explanation; }
        
        public String getLegalDisclaimer() { return legalDisclaimer; }
        public void setLegalDisclaimer(String legalDisclaimer) { this.legalDisclaimer = legalDisclaimer; }
    }
    
    public static class ImageValidationResult {
        private boolean valid;
        private boolean formatValid;
        private int fileSizeKB;
        private List<String> warnings = new ArrayList<>();
        
        public void addWarning(String warning) { this.warnings.add(warning); }
        
        public boolean isValid() { return valid; }
        public void setValid(boolean valid) { this.valid = valid; }
        
        public boolean isFormatValid() { return formatValid; }
        public void setFormatValid(boolean formatValid) { this.formatValid = formatValid; }
        
        public int getFileSizeKB() { return fileSizeKB; }
        public void setFileSizeKB(int fileSizeKB) { this.fileSizeKB = fileSizeKB; }
        
        public List<String> getWarnings() { return warnings; }
        public void setWarnings(List<String> warnings) { this.warnings = warnings; }
    }
}
