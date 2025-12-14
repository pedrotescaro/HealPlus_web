package com.healplus.controllers;

import com.healplus.entities.WoundAnalysis;
import com.healplus.dto.AIDtos;
import com.healplus.dto.WoundDtos;
import com.healplus.entities.User;
import com.healplus.repositories.WoundAnalysisRepository;
import com.healplus.services.AIService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/wounds")
@io.swagger.v3.oas.annotations.security.SecurityRequirement(name = "bearer-jwt")
public class WoundsController {
  private final WoundAnalysisRepository repo;
  private final AIService aiService;
  private final ObjectMapper objectMapper;

  public WoundsController(WoundAnalysisRepository repo, AIService aiService, ObjectMapper objectMapper) {
    this.repo = repo;
    this.aiService = aiService;
    this.objectMapper = objectMapper;
  }

  @PostMapping("/analyze")
  public ResponseEntity<WoundAnalysis> analyze(@jakarta.validation.Valid @RequestBody WoundDtos.WoundAnalysisCreate data) {
    User u = (User) org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    WoundAnalysis wa = new WoundAnalysis();
    wa.setId(UUID.randomUUID().toString());
    wa.setPatientId(data.getPatientId());
    wa.setProfessionalId(u.getId());
    wa.setImageBase64(data.getImageBase64());
    
    try {
      wa.setTimersDataJson(objectMapper.writeValueAsString(data.getTimersData()));
    } catch (JsonProcessingException e) {
      wa.setTimersDataJson("{}");
    }
    
    String imageId = wa.getId();
    String captureDateTime = Instant.now().toString();
    Map<String, Object> aiAnalysisResult = aiService.analyzeWoundImage(
        data.getImageBase64(),
        imageId,
        captureDateTime
    );
    
    try {
      wa.setAiAnalysisJson(objectMapper.writeValueAsString(aiAnalysisResult));
    } catch (JsonProcessingException e) {
      wa.setAiAnalysisJson("{}");
    }
    
    wa.setCreatedAt(Instant.now());
    repo.save(wa);
    return ResponseEntity.ok(wa);
  }

  @GetMapping("/patient/{patientId}")
  public ResponseEntity<List<WoundAnalysis>> listByPatient(@PathVariable String patientId) {
    return ResponseEntity.ok(repo.findByPatientIdOrderByCreatedAtDesc(patientId));
  }
  
  @GetMapping("/{woundId}")
  public ResponseEntity<WoundAnalysis> getById(@PathVariable String woundId) {
    return repo.findById(woundId)
        .map(ResponseEntity::ok)
        .orElse(ResponseEntity.notFound().build());
  }
  
  @PostMapping("/compare-images")
  public ResponseEntity<AIDtos.CompareImagesResponse> compareImages(
      @jakarta.validation.Valid @RequestBody AIDtos.CompareImagesRequest request) {
    
    User u = (User) org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    
    Map<String, Object> comparisonResult = aiService.compareWoundImages(
        request.getImage1Base64(),
        request.getImage1Id(),
        request.getImage1DateTime(),
        request.getImage2Base64(),
        request.getImage2Id(),
        request.getImage2DateTime()
    );
    
    AIDtos.CompareImagesResponse response = new AIDtos.CompareImagesResponse();
    
    AIDtos.ImageAnalysisResponse analysis1 = convertToImageAnalysis(comparisonResult.get("analise_imagem_1"));
    response.setAnaliseImagem1(analysis1);
    
    AIDtos.ImageAnalysisResponse analysis2 = convertToImageAnalysis(comparisonResult.get("analise_imagem_2"));
    response.setAnaliseImagem2(analysis2);
    
    AIDtos.ComparativeReport comparativeReport = convertToComparativeReport(comparisonResult.get("relatorio_comparativo"));
    response.setRelatorioComparativo(comparativeReport);
    
    return ResponseEntity.ok(response);
  }
  
  @PostMapping("/compare-reports")
  public ResponseEntity<AIDtos.CompareImagesResponse> compareReports(
      @jakarta.validation.Valid @RequestBody AIDtos.CompareReportsRequest request) {
    
    User u = (User) org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    
    Map<String, Object> comparisonResult = aiService.compareWoundImages(
        request.getImage1Base64(),
        "report1",
        request.getReport1Date(),
        request.getImage2Base64(),
        "report2",
        request.getReport2Date()
    );
    
    AIDtos.CompareImagesResponse response = new AIDtos.CompareImagesResponse();
    
    AIDtos.ImageAnalysisResponse analysis1 = convertToImageAnalysis(comparisonResult.get("analise_imagem_1"));
    response.setAnaliseImagem1(analysis1);
    
    AIDtos.ImageAnalysisResponse analysis2 = convertToImageAnalysis(comparisonResult.get("analise_imagem_2"));
    response.setAnaliseImagem2(analysis2);
    
    AIDtos.ComparativeReport comparativeReport = convertToComparativeReport(comparisonResult.get("relatorio_comparativo"));
    response.setRelatorioComparativo(comparativeReport);
    
    return ResponseEntity.ok(response);
  }
  
  private AIDtos.ImageAnalysisResponse convertToImageAnalysis(Object obj) {
    if (obj instanceof Map) {
      @SuppressWarnings("unchecked")
      Map<String, Object> map = (Map<String, Object>) obj;
      AIDtos.ImageAnalysisResponse response = new AIDtos.ImageAnalysisResponse();
      response.setIdImagem((String) map.get("id_imagem"));
      response.setDataHoraCaptura((String) map.get("data_hora_captura"));
      return response;
    }
    return new AIDtos.ImageAnalysisResponse();
  }
  
  private AIDtos.ComparativeReport convertToComparativeReport(Object obj) {
    if (obj instanceof Map) {
      @SuppressWarnings("unchecked")
      Map<String, Object> map = (Map<String, Object>) obj;
      AIDtos.ComparativeReport report = new AIDtos.ComparativeReport();
      report.setPeriodoAnalise((String) map.get("periodo_analise"));
      report.setIntervaloTempo((String) map.get("intervalo_tempo"));
      report.setResumoDescritivoEvolucao((String) map.get("resumo_descritivo_evolucao"));
      return report;
    }
    return new AIDtos.ComparativeReport();
  }
}
