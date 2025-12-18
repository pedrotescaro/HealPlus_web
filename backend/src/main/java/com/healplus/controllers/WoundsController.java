package com.healplus.controllers;

import com.healplus.entities.WoundAnalysis;
import com.healplus.dto.AIDtos;
import com.healplus.dto.WoundDtos;
import com.healplus.entities.User;
import com.healplus.exception.UnauthorizedException;
import com.healplus.repositories.WoundAnalysisRepository;
import com.healplus.security.InputSanitizer;
import com.healplus.services.AIService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/wounds")
@io.swagger.v3.oas.annotations.security.SecurityRequirement(name = "bearer-jwt")
@RequiredArgsConstructor
@Slf4j
public class WoundsController {
  private final WoundAnalysisRepository repo;
  private final AIService aiService;
  private final ObjectMapper objectMapper;
  private final InputSanitizer inputSanitizer;

  @PostMapping("/analyze")
  public ResponseEntity<WoundAnalysis> analyze(@Valid @RequestBody WoundDtos.WoundAnalysisCreate data) {
    User u = getCurrentUser();
    
    // Validar e sanitizar patientId
    String patientId = inputSanitizer.sanitizeId(data.getPatientId());
    
    WoundAnalysis wa = new WoundAnalysis();
    wa.setId(UUID.randomUUID().toString());
    wa.setPatientId(patientId);
    wa.setProfessionalId(u.getId());
    wa.setImageBase64(data.getImageBase64());
    
    try {
      wa.setTimersDataJson(objectMapper.writeValueAsString(data.getTimersData()));
    } catch (JsonProcessingException e) {
      log.warn("Failed to serialize timers data: {}", e.getMessage());
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
      log.warn("Failed to serialize AI analysis: {}", e.getMessage());
      wa.setAiAnalysisJson("{}");
    }
    
    wa.setCreatedAt(Instant.now());
    repo.save(wa);
    
    log.info("Wound analysis created: {} by professional: {}", wa.getId(), u.getId());
    return ResponseEntity.ok(wa);
  }

  @GetMapping("/patient/{patientId}")
  public ResponseEntity<List<WoundAnalysis>> listByPatient(@PathVariable String patientId) {
    User u = getCurrentUser();
    
    // Validar patientId
    String sanitizedPatientId = inputSanitizer.sanitizeId(patientId);
    
    // Buscar análises e verificar se pertencem ao profissional
    List<WoundAnalysis> analyses = repo.findByPatientIdOrderByCreatedAtDesc(sanitizedPatientId);
    
    // Filtrar apenas as análises do profissional autenticado
    analyses = analyses.stream()
        .filter(wa -> u.getId().equals(wa.getProfessionalId()))
        .toList();
    
    return ResponseEntity.ok(analyses);
  }
  
  @GetMapping("/{woundId}")
  public ResponseEntity<WoundAnalysis> getById(@PathVariable String woundId) {
    User u = getCurrentUser();
    
    // Validar woundId
    String sanitizedWoundId = inputSanitizer.sanitizeId(woundId);
    
    return repo.findById(sanitizedWoundId)
        .map(wa -> {
          // Verificar se a análise pertence ao profissional
          if (!u.getId().equals(wa.getProfessionalId())) {
            log.warn("Unauthorized access attempt to wound {} by {}", woundId, u.getId());
            throw new UnauthorizedException("Você não tem permissão para acessar esta análise");
          }
          return ResponseEntity.ok(wa);
        })
        .orElse(ResponseEntity.notFound().build());
  }
  
  @PostMapping("/compare-images")
  public ResponseEntity<AIDtos.CompareImagesResponse> compareImages(
      @Valid @RequestBody AIDtos.CompareImagesRequest request) {
    
    User u = getCurrentUser();
    
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
    
    log.info("Image comparison performed by professional: {}", u.getId());
    return ResponseEntity.ok(response);
  }
  
  @PostMapping("/compare-reports")
  public ResponseEntity<AIDtos.CompareImagesResponse> compareReports(
      @Valid @RequestBody AIDtos.CompareReportsRequest request) {
    
    User u = getCurrentUser();
    
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
    
    log.info("Report comparison performed by professional: {}", u.getId());
    return ResponseEntity.ok(response);
  }
  
  private User getCurrentUser() {
    return (User) org.springframework.security.core.context.SecurityContextHolder
        .getContext().getAuthentication().getPrincipal();
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
