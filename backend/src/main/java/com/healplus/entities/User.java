package com.healplus.entities;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;

@Entity
@Table(name = "users")
public class User {
  @Id
  private String id;
  private String email;
  private String name;
  private String role;
  private String password;
  private String googleId;
  private String avatarUrl;
  private Instant createdAt;
  public String getId() { return id; }
  public void setId(String id) { this.id = id; }
  public String getEmail() { return email; }
  public void setEmail(String email) { this.email = email; }
  public String getName() { return name; }
  public void setName(String name) { this.name = name; }
  public String getRole() { return role; }
  public void setRole(String role) { this.role = role; }
  public String getPassword() { return password; }
  public void setPassword(String password) { this.password = password; }
  public String getGoogleId() { return googleId; }
  public void setGoogleId(String googleId) { this.googleId = googleId; }
  public String getAvatarUrl() { return avatarUrl; }
  public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }
  public Instant getCreatedAt() { return createdAt; }
  public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}