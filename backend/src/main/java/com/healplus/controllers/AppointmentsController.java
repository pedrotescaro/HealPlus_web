package com.healplus.controllers;

import com.healplus.dto.AppointmentDtos;
import com.healplus.entities.Appointment;
import com.healplus.entities.User;
import com.healplus.repositories.AppointmentRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/appointments")
public class AppointmentsController {
  private final AppointmentRepository repo;

  public AppointmentsController(AppointmentRepository repo) {
    this.repo = repo;
  }

  @PostMapping
  public ResponseEntity<Appointment> create(@RequestBody AppointmentDtos.AppointmentCreate data) {
    User u = (User) org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    Appointment a = new Appointment();
    a.setId(UUID.randomUUID().toString());
    a.setPatientId(data.getPatientId());
    a.setProfessionalId(u.getId());
    a.setScheduledDate(data.getScheduledDate());
    a.setNotes(data.getNotes());
    a.setStatus("scheduled");
    a.setCreatedAt(Instant.now());
    repo.save(a);
    return ResponseEntity.ok(a);
  }

  @GetMapping
  public ResponseEntity<List<Appointment>> list() {
    User u = (User) org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    return ResponseEntity.ok(repo.findByProfessionalIdOrderByScheduledDateAsc(u.getId()));
  }
}