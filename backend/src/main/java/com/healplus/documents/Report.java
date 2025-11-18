package com.healplus.documents;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document("reports")
@Data
public class Report {
  @Id
  private String id;
  private String woundAnalysisId;
  private String patientId;
  private String pdfBase64;
  private String summary;
  private Instant createdAt;
}