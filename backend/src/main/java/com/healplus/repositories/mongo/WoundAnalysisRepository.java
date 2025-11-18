package com.healplus.repositories.mongo;

import com.healplus.documents.WoundAnalysis;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface WoundAnalysisRepository extends MongoRepository<WoundAnalysis, String> {
  List<WoundAnalysis> findByPatientIdOrderByCreatedAtDesc(String patientId);
  long countByProfessionalId(String professionalId);
}