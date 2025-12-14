package com.healplus.repositories;

import com.healplus.entities.WoundAnalysis;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WoundAnalysisRepository extends JpaRepository<WoundAnalysis, String> {
  List<WoundAnalysis> findByPatientIdOrderByCreatedAtDesc(String patientId);
  long countByProfessionalId(String professionalId);
}
