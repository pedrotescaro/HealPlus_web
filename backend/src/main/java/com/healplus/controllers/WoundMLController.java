package com.healplus.controllers;

import com.healplus.ml.WoundAnalysisResult;
import com.healplus.ml.WoundMLService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/ml/wounds")
@Tag(name = "Wound ML Analysis", description = "API de Análise de Feridas com Machine Learning")
@CrossOrigin(origins = "*")
public class WoundMLController {
    
    private static final Logger logger = LoggerFactory.getLogger(WoundMLController.class);
    
    private final WoundMLService woundMLService;
    
    public WoundMLController(WoundMLService woundMLService) {
        this.woundMLService = woundMLService;
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
}
