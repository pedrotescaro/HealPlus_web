package com.healplus.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.Optional;

@Component
public class JwtUtil {

    private static final Logger log = LoggerFactory.getLogger(JwtUtil.class);

    private final SecretKey secretKey;
    private final int expirationHours;

    public JwtUtil(@Value("${jwt.secret}") String secret,
                   @Value("${jwt.expirationHours}") int expirationHours) {
        if (secret.length() < 32) {
            secret = secret + "0".repeat(32 - secret.length());
        }
        this.secretKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expirationHours = expirationHours;
    }

    public String createToken(String userId) {
        Instant now = Instant.now();
        return Jwts.builder()
            .subject(userId)
            .claim("user_id", userId)
            .issuedAt(Date.from(now))
            .expiration(Date.from(now.plus(expirationHours, ChronoUnit.HOURS)))
            .signWith(secretKey)
            .compact();
    }

    public String createToken(String userId, String email, String role) {
        Instant now = Instant.now();
        return Jwts.builder()
            .subject(userId)
            .claim("user_id", userId)
            .claim("email", email)
            .claim("role", role)
            .issuedAt(Date.from(now))
            .expiration(Date.from(now.plus(expirationHours, ChronoUnit.HOURS)))
            .signWith(secretKey)
            .compact();
    }

    public Optional<String> parseUserId(String token) {
        try {
            Claims claims = Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
            return Optional.ofNullable(claims.get("user_id", String.class));
        } catch (ExpiredJwtException e) {
            log.warn("JWT token expired");
            return Optional.empty();
        } catch (JwtException e) {
            log.warn("Invalid JWT token: {}", e.getMessage());
            return Optional.empty();
        }
    }

    public Optional<Claims> parseClaims(String token) {
        try {
            return Optional.of(Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload());
        } catch (JwtException e) {
            log.warn("Failed to parse JWT claims: {}", e.getMessage());
            return Optional.empty();
        }
    }

    public boolean isTokenValid(String token) {
        return parseUserId(token).isPresent();
    }
}
