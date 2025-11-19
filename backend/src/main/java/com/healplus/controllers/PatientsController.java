package com.healplus.controllers;

import com.healplus.dto.PatientDtos;
import com.healplus.entities.Patient;
import com.healplus.services.AuthService;
import com.healplus.services.PatientService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/patients")
@Tag(name = "Pacientes", description = "Endpoints para gestão de pacientes")
@SecurityRequirement(name = "bearer-jwt")
@RequiredArgsConstructor
public class PatientsController {
  
  private final PatientService patientService;
  private final AuthService authService;

  @PostMapping
  @Operation(summary = "Criar paciente", description = "Cadastra um novo paciente no sistema")
  public ResponseEntity<Patient> create(@Valid @RequestBody PatientDtos.PatientCreate data) {
    String professionalId = authService.getCurrentUser().getId();
    return ResponseEntity.ok(patientService.create(data, professionalId));
  }

  @GetMapping
  @Operation(summary = "Listar pacientes", description = "Retorna a lista de pacientes do profissional autenticado")
  public ResponseEntity<List<Patient>> list(
      @Parameter(description = "Paginação (page, size, sort)")
      @PageableDefault(size = 20) Pageable pageable) {
    String professionalId = authService.getCurrentUser().getId();
    return ResponseEntity.ok(patientService.findAllByProfessionalId(professionalId));
  }

  @GetMapping("/paged")
  @Operation(summary = "Listar pacientes paginados", description = "Retorna a lista paginada de pacientes")
  public ResponseEntity<Page<Patient>> listPaged(
      @Parameter(description = "Paginação (page, size, sort)")
      @PageableDefault(size = 20) Pageable pageable) {
    String professionalId = authService.getCurrentUser().getId();
    return ResponseEntity.ok(patientService.findAllByProfessionalId(professionalId, pageable));
  }

  @GetMapping("/{id}")
  @Operation(summary = "Obter paciente", description = "Retorna os dados de um paciente específico")
  public ResponseEntity<Patient> get(@PathVariable String id) {
    return ResponseEntity.ok(patientService.findById(id));
  }
  
  @PutMapping("/{id}")
  @Operation(summary = "Atualizar paciente", description = "Atualiza os dados de um paciente")
  public ResponseEntity<Patient> update(
      @PathVariable String id,
      @Valid @RequestBody PatientDtos.PatientUpdate data) {
    return ResponseEntity.ok(patientService.update(id, data));
  }
  
  @DeleteMapping("/{id}")
  @Operation(summary = "Deletar paciente", description = "Remove um paciente do sistema")
  public ResponseEntity<Void> delete(@PathVariable String id) {
    patientService.delete(id);
    return ResponseEntity.noContent().build();
  }
}