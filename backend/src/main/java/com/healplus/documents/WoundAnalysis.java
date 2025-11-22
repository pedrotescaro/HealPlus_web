package com.healplus.documents;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.Map;

@Document("wound_analyses")
public class WoundAnalysis {
  @Id
  private String id;
  private String patientId;
  private String professionalId;
  private String imageBase64;
  private Map<String, Object> timersData;
  private Map<String, Object> aiAnalysis;
  private Instant createdAt;
  public String getId() { return id; }
  public void setId(String id) { this.id = id; }
  public String getPatientId() { return patientId; }
  public void setPatientId(String patientId) { this.patientId = patientId; }
  public String getProfessionalId() { return professionalId; }
  public void setProfessionalId(String professionalId) { this.professionalId = professionalId; }
  public String getImageBase64() { return imageBase64; }
  public void setImageBase64(String imageBase64) { this.imageBase64 = imageBase64; }
  public java.util.Map<String, Object> getTimersData() { return timersData; }
  public void setTimersData(java.util.Map<String, Object> timersData) { this.timersData = timersData; }
  public java.util.Map<String, Object> getAiAnalysis() { return aiAnalysis; }
  public void setAiAnalysis(java.util.Map<String, Object> aiAnalysis) { this.aiAnalysis = aiAnalysis; }
  public Instant getCreatedAt() { return createdAt; }
  public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}