package com.healplus.controllers;

import com.healplus.entities.ChatMessage;
import com.healplus.dto.ChatDtos;
import com.healplus.entities.User;
import com.healplus.repositories.ChatMessageRepository;
import com.healplus.security.InputSanitizer;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/chat")
@io.swagger.v3.oas.annotations.security.SecurityRequirement(name = "bearer-jwt")
public class ChatController {
  private final ChatMessageRepository repo;
  private final InputSanitizer inputSanitizer;

  public ChatController(ChatMessageRepository repo, InputSanitizer inputSanitizer) {
    this.repo = repo;
    this.inputSanitizer = inputSanitizer;
  }

  @PostMapping
  public ResponseEntity<ChatMessage> chat(@Valid @RequestBody ChatDtos.ChatMessageCreate data) {
    User u = (User) org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    
    // Sanitizar entrada para prevenir XSS
    String sanitizedMessage = inputSanitizer.sanitizeCompletely(data.getMessage());
    String sessionId = data.getSessionId() != null && !data.getSessionId().isEmpty() 
        ? inputSanitizer.sanitizeId(data.getSessionId()) 
        : UUID.randomUUID().toString();
    
    ChatMessage m = new ChatMessage();
    m.setId(UUID.randomUUID().toString());
    m.setUserId(u.getId());
    m.setSessionId(sessionId);
    m.setMessage(sanitizedMessage);
    m.setResponse("Zelo: " + sanitizedMessage);
    m.setCreatedAt(Instant.now());
    repo.save(m);
    return ResponseEntity.ok(m);
  }

  @GetMapping("/history/{sessionId}")
  public ResponseEntity<List<ChatMessage>> history(@PathVariable String sessionId) {
    User u = (User) org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    
    // Validar sessionId para prevenir injection
    String sanitizedSessionId = inputSanitizer.sanitizeId(sessionId);
    
    return ResponseEntity.ok(repo.findBySessionIdAndUserIdOrderByCreatedAtAsc(sanitizedSessionId, u.getId()));
  }
}
