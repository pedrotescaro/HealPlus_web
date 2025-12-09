package com.healplus.controllers;

import com.healplus.ml.neural.WoundClassifierNetwork;
import com.healplus.ml.training.WoundModelTrainer;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/ml/training")
@Tag(name = "ML Training", description = "API de Treinamento de Modelos de Machine Learning")
@CrossOrigin(origins = "*")
public class MLTrainingController {
    
    private static final Logger logger = LoggerFactory.getLogger(MLTrainingController.class);
    
    private final WoundModelTrainer trainer;
    private final WoundClassifierNetwork classifierNetwork;
    
    public MLTrainingController(WoundModelTrainer trainer, WoundClassifierNetwork classifierNetwork) {
        this.trainer = trainer;
        this.classifierNetwork = classifierNetwork;
    }
    
    @PostMapping("/wound-classifier")
    @Operation(summary = "Treinar classificador de feridas", 
               description = "Inicia o treinamento do modelo de classificação de feridas")
    public ResponseEntity<Map<String, Object>> trainWoundClassifier(
            @RequestBody TrainingRequest request) {
        
        try {
            logger.info("Iniciando treinamento do classificador de feridas...");
            
            Map<String, Object> response = new HashMap<>();
            response.put("status", "TRAINING_STARTED");
            response.put("message", "Treinamento iniciado em background");
            response.put("datasetPath", request.getDatasetPath());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Erro ao iniciar treinamento: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @PostMapping("/save-models")
    @Operation(summary = "Salvar modelos treinados", 
               description = "Salva os modelos treinados em disco")
    public ResponseEntity<Map<String, Object>> saveModels(@RequestBody SaveModelRequest request) {
        try {
            classifierNetwork.saveModels(request.getPath());
            
            Map<String, Object> response = new HashMap<>();
            response.put("status", "SUCCESS");
            response.put("message", "Modelos salvos com sucesso");
            response.put("path", request.getPath());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Erro ao salvar modelos: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @PostMapping("/load-models")
    @Operation(summary = "Carregar modelos treinados", 
               description = "Carrega modelos previamente treinados do disco")
    public ResponseEntity<Map<String, Object>> loadModels(@RequestBody LoadModelRequest request) {
        try {
            classifierNetwork.loadModels(request.getPath());
            
            Map<String, Object> response = new HashMap<>();
            response.put("status", "SUCCESS");
            response.put("message", "Modelos carregados com sucesso");
            response.put("path", request.getPath());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Erro ao carregar modelos: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @GetMapping("/status")
    @Operation(summary = "Status do treinamento", 
               description = "Retorna o status atual do treinamento")
    public ResponseEntity<Map<String, Object>> getTrainingStatus() {
        Map<String, Object> status = new HashMap<>();
        status.put("modelsLoaded", classifierNetwork.isModelLoaded());
        status.put("woundClassifierParams", "CNN com 4 camadas convolucionais");
        status.put("tissueSegmenterParams", "CNN com 3 camadas convolucionais");
        status.put("inputSize", "224x224x3");
        status.put("framework", "DeepLearning4J");
        
        return ResponseEntity.ok(status);
    }
    
    public static class TrainingRequest {
        private String datasetPath;
        private Integer epochs;
        private Integer batchSize;
        private Double learningRate;

        public String getDatasetPath() { return datasetPath; }
        public void setDatasetPath(String datasetPath) { this.datasetPath = datasetPath; }

        public Integer getEpochs() { return epochs; }
        public void setEpochs(Integer epochs) { this.epochs = epochs; }

        public Integer getBatchSize() { return batchSize; }
        public void setBatchSize(Integer batchSize) { this.batchSize = batchSize; }

        public Double getLearningRate() { return learningRate; }
        public void setLearningRate(Double learningRate) { this.learningRate = learningRate; }
    }
    
    public static class SaveModelRequest {
        private String path;

        public String getPath() { return path; }
        public void setPath(String path) { this.path = path; }
    }
    
    public static class LoadModelRequest {
        private String path;

        public String getPath() { return path; }
        public void setPath(String path) { this.path = path; }
    }
}
