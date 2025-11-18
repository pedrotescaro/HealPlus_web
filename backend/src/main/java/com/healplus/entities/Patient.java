package com.healplus.entities;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

import java.time.Instant;

@Entity
@Table(name = "patients")
@Data
public class Patient {
  @Id
  private String id;
  private String name;
  private int age;
  private String gender;
  private String contact;
  private String professionalId;
  private Instant createdAt;
}