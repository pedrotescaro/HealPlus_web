package com.healplus.entities;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

import java.time.Instant;

@Entity
@Table(name = "users")
@Data
public class User {
  @Id
  private String id;
  private String email;
  private String name;
  private String role;
  private String password;
  private Instant createdAt;
}