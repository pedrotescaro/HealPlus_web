package com.healplus.controllers;

import com.healplus.documents.ChatMessage;
import com.healplus.dto.ChatDtos;
import com.healplus.entities.User;
import com.healplus.repositories.mongo.ChatMessageRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/chat")
public class ChatController {
  private final ChatMessageRepository repo;

  public ChatController(ChatMessageRepository repo) {
    this.repo = repo;
  }

  @PostMapping
  public ResponseEntity<ChatMessage> chat(@RequestBody ChatDtos.ChatMessageCreate data) {
    User u = (User) org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    String sessionId = data.getSessionId() != null && !data.getSessionId().isEmpty() ? data.getSessionId() : UUID.randomUUID().toString();
    ChatMessage m = new ChatMessage();
    m.setId(UUID.randomUUID().toString());
    m.setUserId(u.getId());
    m.setSessionId(sessionId);
    m.setMessage(data.getMessage());
    m.setResponse("Zelo: " + data.getMessage());
    m.setCreatedAt(Instant.now());
    repo.save(m);
    return ResponseEntity.ok(m);
  }

  @GetMapping("/history/{sessionId}")
  public ResponseEntity<List<ChatMessage>> history(@PathVariable String sessionId) {
    User u = (User) org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    return ResponseEntity.ok(repo.findBySessionIdAndUserIdOrderByCreatedAtAsc(sessionId, u.getId()));
  }
}