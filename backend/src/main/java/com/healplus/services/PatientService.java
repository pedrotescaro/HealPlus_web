package com.healplus.services;

import com.healplus.audit.AuditService;
import com.healplus.dto.PatientDtos;
import com.healplus.entities.Patient;
import com.healplus.exception.ResourceNotFoundException;
import com.healplus.repositories.PatientRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class PatientService {
    
    private final PatientRepository patientRepository;
    private final AuditService auditService;
    
    @Transactional
    public Patient create(PatientDtos.PatientCreate data, String professionalId) {
        log.info("Criando paciente para profissional: {}", professionalId);
        
        Patient patient = new Patient();
        patient.setId(UUID.randomUUID().toString());
        patient.setName(data.getName());
        patient.setAge(data.getAge());
        patient.setGender(data.getGender());
        patient.setContact(data.getContact());
        patient.setProfessionalId(professionalId);
        patient.setCreatedAt(Instant.now());
        
        patient = patientRepository.save(patient);
        log.info("Paciente criado com sucesso: {}", patient.getId());
        
        // Auditoria
        auditService.logPatientAction(professionalId, "CREATE", patient.getId(), 
            String.format("Paciente %s criado", patient.getName()));
        
        return patient;
    }
    
    public List<Patient> findAllByProfessionalId(String professionalId) {
        log.debug("Listando pacientes para profissional: {}", professionalId);
        return patientRepository.findByProfessionalId(professionalId);
    }
    
    public Page<Patient> findAllByProfessionalId(String professionalId, Pageable pageable) {
        log.debug("Listando pacientes paginados para profissional: {}", professionalId);
        return patientRepository.findByProfessionalId(professionalId, pageable);
    }
    
    public Patient findById(String id) {
        log.debug("Buscando paciente: {}", id);
        return patientRepository.findById(id)
            .orElseThrow(() -> {
                log.warn("Paciente não encontrado: {}", id);
                return new ResourceNotFoundException("Paciente", "id", id);
            });
    }
    
    @Transactional
    public Patient update(String id, PatientDtos.PatientUpdate data) {
        log.info("Atualizando paciente: {}", id);
        
        Patient patient = findById(id);
        
        if (data.getName() != null) {
            patient.setName(data.getName());
        }
        if (data.getAge() != null) {
            patient.setAge(data.getAge());
        }
        if (data.getGender() != null) {
            patient.setGender(data.getGender());
        }
        if (data.getContact() != null) {
            patient.setContact(data.getContact());
        }
        
        patient = patientRepository.save(patient);
        log.info("Paciente atualizado com sucesso: {}", id);
        
        // Auditoria
        auditService.logPatientAction(patient.getProfessionalId(), "UPDATE", id, 
            String.format("Paciente %s atualizado", patient.getName()));
        
        return patient;
    }
    
    @Transactional
    public void delete(String id) {
        log.info("Deletando paciente: {}", id);
        
        Patient patient = findById(id);
        String professionalId = patient.getProfessionalId();
        String patientName = patient.getName();
        
        patientRepository.deleteById(id);
        log.info("Paciente deletado com sucesso: {}", id);
        
        // Auditoria
        auditService.logPatientAction(professionalId, "DELETE", id, 
            String.format("Paciente %s deletado", patientName));
    }
}

