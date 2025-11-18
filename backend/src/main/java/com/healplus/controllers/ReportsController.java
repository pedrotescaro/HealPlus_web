package com.healplus.controllers;

import com.healplus.documents.Report;
import com.healplus.documents.WoundAnalysis;
import com.healplus.entities.Patient;
import com.healplus.repositories.PatientRepository;
import com.healplus.repositories.mongo.ReportRepository;
import com.healplus.repositories.mongo.WoundAnalysisRepository;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayOutputStream;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Base64;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/reports")
public class ReportsController {
  private final WoundAnalysisRepository woundRepo;
  private final ReportRepository reportRepo;
  private final PatientRepository patientRepo;

  public ReportsController(WoundAnalysisRepository woundRepo, ReportRepository reportRepo, PatientRepository patientRepo) {
    this.woundRepo = woundRepo;
    this.reportRepo = reportRepo;
    this.patientRepo = patientRepo;
  }

  @PostMapping("/generate/{woundId}")
  public ResponseEntity<?> generate(@PathVariable String woundId) throws Exception {
    Optional<WoundAnalysis> woundOpt = woundRepo.findById(woundId);
    if (woundOpt.isEmpty()) return ResponseEntity.status(404).body("Wound analysis not found");
    WoundAnalysis wound = woundOpt.get();
    Optional<Patient> patientOpt = patientRepo.findById(wound.getPatientId());

    PDDocument doc = new PDDocument();
    PDPage page = new PDPage();
    doc.addPage(page);
    PDPageContentStream cs = new PDPageContentStream(doc, page);
    cs.beginText();
    cs.setFont(PDType1Font.HELVETICA_BOLD, 18);
    cs.newLineAtOffset(50, 750);
    cs.showText("Relatorio de Analise de Ferida");
    cs.setFont(PDType1Font.HELVETICA, 12);
    cs.newLineAtOffset(0, -30);
    if (patientOpt.isPresent()) {
      Patient p = patientOpt.get();
      cs.showText("Paciente: " + p.getName());
      cs.newLineAtOffset(0, -18);
      cs.showText("Idade: " + p.getAge());
      cs.newLineAtOffset(0, -18);
      cs.showText("Genero: " + p.getGender());
    }
    cs.newLineAtOffset(0, -30);
    DateTimeFormatter fmt = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm").withZone(ZoneId.systemDefault());
    cs.showText("Data da Avaliacao: " + fmt.format(wound.getCreatedAt()));
    cs.newLineAtOffset(0, -30);
    cs.setFont(PDType1Font.HELVETICA_BOLD, 14);
    cs.showText("Avaliacao TIMERS:");
    cs.setFont(PDType1Font.HELVETICA, 12);
    Map<String, Object> t = wound.getTimersData();
    if (t != null) {
      cs.newLineAtOffset(0, -18);
      cs.showText("Tipo de Tecido: " + String.valueOf(t.getOrDefault("tissue_type", "N/A")));
      cs.newLineAtOffset(0, -18);
      cs.showText("Sinais de Infeccao: " + String.valueOf(t.getOrDefault("infection_signs", "N/A")));
      cs.newLineAtOffset(0, -18);
      cs.showText("Nivel de Umidade: " + String.valueOf(t.getOrDefault("moisture_level", "N/A")));
      cs.newLineAtOffset(0, -18);
      cs.showText("Status das Bordas: " + String.valueOf(t.getOrDefault("edges_status", "N/A")));
    }
    cs.endText();
    cs.close();
    ByteArrayOutputStream bos = new ByteArrayOutputStream();
    doc.save(bos);
    doc.close();
    String pdfBase64 = Base64.getEncoder().encodeToString(bos.toByteArray());

    Report r = new Report();
    r.setId(UUID.randomUUID().toString());
    r.setWoundAnalysisId(woundId);
    r.setPatientId(wound.getPatientId());
    r.setPdfBase64(pdfBase64);
    r.setSummary("Relatorio de analise de ferida");
    r.setCreatedAt(java.time.Instant.now());
    reportRepo.save(r);

    return ResponseEntity.ok(Map.of("report_id", r.getId(), "pdf_base64", pdfBase64));
  }
}