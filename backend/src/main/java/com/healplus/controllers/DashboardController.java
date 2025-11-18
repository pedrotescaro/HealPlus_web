package com.healplus.controllers;

import com.healplus.entities.User;
import com.healplus.repositories.PatientRepository;
import com.healplus.repositories.mongo.WoundAnalysisRepository;
import com.healplus.repositories.AppointmentRepository;
import com.healplus.entities.Appointment;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {
  private final PatientRepository patientRepo;
  private final WoundAnalysisRepository woundRepo;
  private final AppointmentRepository appointmentRepo;

  public DashboardController(PatientRepository patientRepo, WoundAnalysisRepository woundRepo, AppointmentRepository appointmentRepo) {
    this.patientRepo = patientRepo;
    this.woundRepo = woundRepo;
    this.appointmentRepo = appointmentRepo;
  }

  @GetMapping("/stats")
  public ResponseEntity<Map<String, Object>> stats() {
    User u = (User) org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    Map<String, Object> res = new HashMap<>();
    res.put("total_patients", patientRepo.findByProfessionalId(u.getId()).size());
    res.put("total_analyses", woundRepo.countByProfessionalId(u.getId()));
    res.put("total_reports", 0);
    List<Appointment> upcoming = appointmentRepo.findByProfessionalIdOrderByScheduledDateAsc(u.getId());
    res.put("upcoming_appointments", upcoming.stream().filter(a -> "scheduled".equalsIgnoreCase(a.getStatus())).limit(5).toList());
    return ResponseEntity.ok(res);
  }
}