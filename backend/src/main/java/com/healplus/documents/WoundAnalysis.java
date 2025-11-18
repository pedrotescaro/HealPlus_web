package com.healplus.documents;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.Map;

@Document("wound_analyses")
@Data
public class WoundAnalysis {
  @Id
  private String id;
  private String patientId;
  private String professionalId;
  private String imageBase64;
  private Map<String, Object> timersData;
  private Map<String, Object> aiAnalysis;
  private Instant createdAt;
}