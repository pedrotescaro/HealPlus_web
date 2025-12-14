package com.healplus.entities;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "chat_messages")
public class ChatMessage {
  @Id
  private String id;
  private String userId;
  private String sessionId;
  
  @Lob
  @Column(columnDefinition = "TEXT")
  private String message;
  
  @Lob
  @Column(columnDefinition = "TEXT")
  private String response;
  
  private Instant createdAt;
  
  public String getId() { return id; }
  public void setId(String id) { this.id = id; }
  public String getUserId() { return userId; }
  public void setUserId(String userId) { this.userId = userId; }
  public String getSessionId() { return sessionId; }
  public void setSessionId(String sessionId) { this.sessionId = sessionId; }
  public String getMessage() { return message; }
  public void setMessage(String message) { this.message = message; }
  public String getResponse() { return response; }
  public void setResponse(String response) { this.response = response; }
  public Instant getCreatedAt() { return createdAt; }
  public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
