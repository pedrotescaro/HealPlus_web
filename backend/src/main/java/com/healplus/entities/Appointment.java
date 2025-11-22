package com.healplus.entities;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

import java.time.Instant;
import java.time.OffsetDateTime;

@Entity
@Table(name = "appointments")
public class Appointment {
  @Id
  private String id;
  private String patientId;
  private String professionalId;
  private OffsetDateTime scheduledDate;
  private String notes;
  private String status;
  private Instant createdAt;
  public String getId() { return id; }
  public void setId(String id) { this.id = id; }
  public String getPatientId() { return patientId; }
  public void setPatientId(String patientId) { this.patientId = patientId; }
  public String getProfessionalId() { return professionalId; }
  public void setProfessionalId(String professionalId) { this.professionalId = professionalId; }
  public OffsetDateTime getScheduledDate() { return scheduledDate; }
  public void setScheduledDate(OffsetDateTime scheduledDate) { this.scheduledDate = scheduledDate; }
  public String getNotes() { return notes; }
  public void setNotes(String notes) { this.notes = notes; }
  public String getStatus() { return status; }
  public void setStatus(String status) { this.status = status; }
  public Instant getCreatedAt() { return createdAt; }
  public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}