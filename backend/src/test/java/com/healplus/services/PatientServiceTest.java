package com.healplus.services;

import com.healplus.dto.PatientDtos;
import com.healplus.entities.Patient;
import com.healplus.exception.ResourceNotFoundException;
import com.healplus.repositories.PatientRepository;
import com.healplus.audit.AuditService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PatientServiceTest {
    
    @Mock
    private PatientRepository patientRepository;
    
    @Mock
    private AuditService auditService;
    
    @InjectMocks
    private PatientService patientService;
    
    private Patient testPatient;
    private PatientDtos.PatientCreate patientCreateDto;
    private String professionalId;
    
    @BeforeEach
    void setUp() {
        professionalId = UUID.randomUUID().toString();
        
        testPatient = new Patient();
        testPatient.setId(UUID.randomUUID().toString());
        testPatient.setName("John Doe");
        testPatient.setAge(30);
        testPatient.setGender("male");
        testPatient.setContact("123456789");
        testPatient.setProfessionalId(professionalId);
        testPatient.setCreatedAt(Instant.now());
        
        patientCreateDto = new PatientDtos.PatientCreate();
        patientCreateDto.setName("Jane Doe");
        patientCreateDto.setAge(25);
        patientCreateDto.setGender("female");
        patientCreateDto.setContact("987654321");
    }
    
    @Test
    void testCreate_Success() {
        // Arrange
        when(patientRepository.save(any(Patient.class))).thenReturn(testPatient);
        
        // Act
        Patient result = patientService.create(patientCreateDto, professionalId);
        
        // Assert
        assertNotNull(result);
        assertEquals(testPatient.getId(), result.getId());
        verify(patientRepository, times(1)).save(any(Patient.class));
        verify(auditService, times(1)).logPatientAction(
            eq(professionalId), eq("CREATE"), anyString(), anyString()
        );
    }
    
    @Test
    void testFindById_Success() {
        // Arrange
        when(patientRepository.findById(anyString())).thenReturn(Optional.of(testPatient));
        
        // Act
        Patient result = patientService.findById(testPatient.getId());
        
        // Assert
        assertNotNull(result);
        assertEquals(testPatient.getId(), result.getId());
    }
    
    @Test
    void testFindById_NotFound() {
        // Arrange
        when(patientRepository.findById(anyString())).thenReturn(Optional.empty());
        
        // Act & Assert
        assertThrows(ResourceNotFoundException.class, 
            () -> patientService.findById("non-existent-id"));
    }
    
    @Test
    void testUpdate_Success() {
        // Arrange
        PatientDtos.PatientUpdate updateDto = new PatientDtos.PatientUpdate();
        updateDto.setName("Updated Name");
        updateDto.setAge(35);
        
        when(patientRepository.findById(anyString())).thenReturn(Optional.of(testPatient));
        when(patientRepository.save(any(Patient.class))).thenReturn(testPatient);
        
        // Act
        Patient result = patientService.update(testPatient.getId(), updateDto);
        
        // Assert
        assertNotNull(result);
        verify(patientRepository, times(1)).save(any(Patient.class));
        verify(auditService, times(1)).logPatientAction(
            eq(professionalId), eq("UPDATE"), anyString(), anyString()
        );
    }
    
    @Test
    void testDelete_Success() {
        // Arrange
        when(patientRepository.findById(anyString())).thenReturn(Optional.of(testPatient));
        when(patientRepository.existsById(anyString())).thenReturn(true);
        doNothing().when(patientRepository).deleteById(anyString());
        
        // Act
        patientService.delete(testPatient.getId());
        
        // Assert
        verify(patientRepository, times(1)).deleteById(testPatient.getId());
        verify(auditService, times(1)).logPatientAction(
            eq(professionalId), eq("DELETE"), anyString(), anyString()
        );
    }
}

