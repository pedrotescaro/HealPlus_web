package com.healplus.entities;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "reports")
public class Report {
  @Id
  private String id;
  private String woundAnalysisId;
  private String patientId;
  
  @Lob
  @Column(columnDefinition = "LONGTEXT")
  private String pdfBase64;
  
  @Lob
  @Column(columnDefinition = "TEXT")
  private String summary;
  
  private Instant createdAt;
  
  public String getId() { return id; }
  public void setId(String id) { this.id = id; }
  public String getWoundAnalysisId() { return woundAnalysisId; }
  public void setWoundAnalysisId(String woundAnalysisId) { this.woundAnalysisId = woundAnalysisId; }
  public String getPatientId() { return patientId; }
  public void setPatientId(String patientId) { this.patientId = patientId; }
  public String getPdfBase64() { return pdfBase64; }
  public void setPdfBase64(String pdfBase64) { this.pdfBase64 = pdfBase64; }
  public String getSummary() { return summary; }
  public void setSummary(String summary) { this.summary = summary; }
  public Instant getCreatedAt() { return createdAt; }
  public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
