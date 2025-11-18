package com.healplus.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;

@Component
public class JwtUtil {
  @Value("${jwt.secret}")
  private String secret;

  @Value("${jwt.expirationHours}")
  private int expirationHours;

  public String createToken(String userId) {
    Instant now = Instant.now();
    return Jwts.builder()
        .claim("user_id", userId)
        .expiration(Date.from(now.plus(expirationHours, ChronoUnit.HOURS)))
        .issuedAt(Date.from(now))
        .signWith(Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8)))
        .compact();
  }

  public String parseUserId(String token) {
    return Jwts.parser()
        .verifyWith(Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8)))
        .build()
        .parseSignedClaims(token)
        .getPayload()
        .get("user_id", String.class);
  }
}