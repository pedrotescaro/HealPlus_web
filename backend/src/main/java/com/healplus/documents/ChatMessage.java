package com.healplus.documents;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document("chat_messages")
@Data
public class ChatMessage {
  @Id
  private String id;
  private String userId;
  private String sessionId;
  private String message;
  private String response;
  private Instant createdAt;
}