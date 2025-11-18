package com.healplus.controllers;

import com.healplus.documents.WoundAnalysis;
import com.healplus.dto.WoundDtos;
import com.healplus.entities.User;
import com.healplus.repositories.mongo.WoundAnalysisRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/wounds")
public class WoundsController {
  private final WoundAnalysisRepository repo;

  public WoundsController(WoundAnalysisRepository repo) {
    this.repo = repo;
  }

  @PostMapping("/analyze")
  public ResponseEntity<WoundAnalysis> analyze(@RequestBody WoundDtos.WoundAnalysisCreate data) {
    User u = (User) org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    WoundAnalysis wa = new WoundAnalysis();
    wa.setId(UUID.randomUUID().toString());
    wa.setPatientId(data.getPatientId());
    wa.setProfessionalId(u.getId());
    wa.setImageBase64(data.getImageBase64());
    wa.setTimersData(data.getTimersData());
    wa.setAiAnalysis(Collections.emptyMap());
    wa.setCreatedAt(Instant.now());
    repo.save(wa);
    return ResponseEntity.ok(wa);
  }

  @GetMapping("/patient/{patientId}")
  public ResponseEntity<List<WoundAnalysis>> listByPatient(@PathVariable String patientId) {
    return ResponseEntity.ok(repo.findByPatientIdOrderByCreatedAtDesc(patientId));
  }
}