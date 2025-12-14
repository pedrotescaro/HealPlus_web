package com.healplus.repositories;

import com.healplus.entities.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, String> {
  List<ChatMessage> findBySessionIdAndUserIdOrderByCreatedAtAsc(String sessionId, String userId);
}
