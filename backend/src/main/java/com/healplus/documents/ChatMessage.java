package com.healplus.documents;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document("chat_messages")
public class ChatMessage {
  @Id
  private String id;
  private String userId;
  private String sessionId;
  private String message;
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