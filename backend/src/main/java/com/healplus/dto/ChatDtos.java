package com.healplus.dto;

import lombok.Data;

@Data
public class ChatDtos {
  @Data
  public static class ChatMessageCreate {
    private String message;
    private String sessionId;
  }
}