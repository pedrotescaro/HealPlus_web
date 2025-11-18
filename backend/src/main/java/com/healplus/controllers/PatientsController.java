package com.healplus.controllers;

import com.healplus.dto.PatientDtos;
import com.healplus.entities.Patient;
import com.healplus.entities.User;
import com.healplus.repositories.PatientRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/patients")
public class PatientsController {
  private final PatientRepository patientRepository;

  public PatientsController(PatientRepository patientRepository) {
    this.patientRepository = patientRepository;
  }

  @PostMapping
  public ResponseEntity<Patient> create(@RequestBody PatientDtos.PatientCreate data, @RequestAttribute("org.springframework.security.core.context.SecurityContext") Object sc) {
    User u = (User) org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    Patient p = new Patient();
    p.setId(UUID.randomUUID().toString());
    p.setName(data.getName());
    p.setAge(data.getAge());
    p.setGender(data.getGender());
    p.setContact(data.getContact());
    p.setProfessionalId(u.getId());
    p.setCreatedAt(Instant.now());
    patientRepository.save(p);
    return ResponseEntity.ok(p);
  }

  @GetMapping
  public ResponseEntity<List<Patient>> list() {
    User u = (User) org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    return ResponseEntity.ok(patientRepository.findByProfessionalId(u.getId()));
  }

  @GetMapping("/{id}")
  public ResponseEntity<?> get(@PathVariable String id) {
    Optional<Patient> p = patientRepository.findById(id);
    return p.<ResponseEntity<?>>map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.status(404).body("Patient not found"));
  }
}