package com.healplus.repositories;

import com.healplus.entities.Patient;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PatientRepository extends JpaRepository<Patient, String> {
  List<Patient> findByProfessionalId(String professionalId);
}