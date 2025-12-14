package com.healplus.entities;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;

@Entity
@Table(name = "patients")
public class Patient {
  @Id
  private String id;
  private String name;
  private int age;
  private String gender;
  private String contact;
  private String professionalId;
  private Instant createdAt;
  
  public String getId() { return id; }
  public void setId(String id) { this.id = id; }
  public String getName() { return name; }
  public void setName(String name) { this.name = name; }
  public int getAge() { return age; }
  public void setAge(int age) { this.age = age; }
  public String getGender() { return gender; }
  public void setGender(String gender) { this.gender = gender; }
  public String getContact() { return contact; }
  public void setContact(String contact) { this.contact = contact; }
  public String getProfessionalId() { return professionalId; }
  public void setProfessionalId(String professionalId) { this.professionalId = professionalId; }
  public Instant getCreatedAt() { return createdAt; }
  public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
