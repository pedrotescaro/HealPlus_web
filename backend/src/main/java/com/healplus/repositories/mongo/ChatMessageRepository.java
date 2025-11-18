package com.healplus.repositories.mongo;

import com.healplus.documents.ChatMessage;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ChatMessageRepository extends MongoRepository<ChatMessage, String> {
  List<ChatMessage> findBySessionIdAndUserIdOrderByCreatedAtAsc(String sessionId, String userId);
}