package com.healplus.entities;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

import java.time.Instant;
import java.time.OffsetDateTime;

@Entity
@Table(name = "appointments")
@Data
public class Appointment {
  @Id
  private String id;
  private String patientId;
  private String professionalId;
  private OffsetDateTime scheduledDate;
  private String notes;
  private String status;
  private Instant createdAt;
}