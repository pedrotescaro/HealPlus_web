package com.healplus.entities;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "wound_analyses")
public class WoundAnalysis {
  @Id
  private String id;
  private String patientId;
  private String professionalId;
  
  @Lob
  @Column(columnDefinition = "LONGTEXT")
  private String imageBase64;
  
  @Lob
  @Column(columnDefinition = "TEXT")
  private String timersDataJson;
  
  @Lob
  @Column(columnDefinition = "TEXT")
  private String aiAnalysisJson;
  
  private Instant createdAt;
  
  public String getId() { return id; }
  public void setId(String id) { this.id = id; }
  public String getPatientId() { return patientId; }
  public void setPatientId(String patientId) { this.patientId = patientId; }
  public String getProfessionalId() { return professionalId; }
  public void setProfessionalId(String professionalId) { this.professionalId = professionalId; }
  public String getImageBase64() { return imageBase64; }
  public void setImageBase64(String imageBase64) { this.imageBase64 = imageBase64; }
  public String getTimersDataJson() { return timersDataJson; }
  public void setTimersDataJson(String timersDataJson) { this.timersDataJson = timersDataJson; }
  public String getAiAnalysisJson() { return aiAnalysisJson; }
  public void setAiAnalysisJson(String aiAnalysisJson) { this.aiAnalysisJson = aiAnalysisJson; }
  public Instant getCreatedAt() { return createdAt; }
  public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
