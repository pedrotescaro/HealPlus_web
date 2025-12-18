package com.healplus.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

public class ChatDtos {
  @Data
  public static class ChatMessageCreate {
    @NotBlank(message = "Mensagem é obrigatória")
    @Size(min = 1, max = 10000, message = "Mensagem deve ter entre 1 e 10000 caracteres")
    private String message;
    
    @Size(max = 100, message = "Session ID deve ter no máximo 100 caracteres")
    private String sessionId;
    
    public String getMessage() { return message; }
    public String getSessionId() { return sessionId; }
  }
}