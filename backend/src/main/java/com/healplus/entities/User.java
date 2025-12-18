package com.healplus.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.Instant;

@Entity
@Table(name = "users")
public class User {
  @Id
  private String id;
  
  @Email
  @NotBlank
  @Size(max = 100)
  @Column(unique = true)
  private String email;
  
  @NotBlank
  @Size(min = 2, max = 100)
  private String name;
  
  @Size(max = 20)
  private String role;
  
  // Senha NUNCA deve ser exposta em respostas JSON
  @JsonIgnore
  @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
  private String password;
  
  @Column(name = "google_id")
  private String googleId;
  
  @Column(name = "avatar_url")
  private String avatarUrl;
  
  @Column(name = "created_at")
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