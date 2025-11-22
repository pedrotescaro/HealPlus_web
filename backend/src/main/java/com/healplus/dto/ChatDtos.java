package com.healplus.dto;

import lombok.Data;

public class ChatDtos {
  @Data
  public static class ChatMessageCreate {
    private String message;
    private String sessionId;
    public String getMessage() { return message; }
    public String getSessionId() { return sessionId; }
  }
}