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
import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import java.util.Date;
import java.util.Optional;

@Component
public class JwtUtil {

    private static final Logger log = LoggerFactory.getLogger(JwtUtil.class);
    private static final int MIN_SECRET_LENGTH = 64; // 512 bits para HS512
    private static final String ISSUER = "healplus-api";
    private static final String AUDIENCE = "healplus-web";

    private final SecretKey secretKey;
    private final int expirationHours;

    public JwtUtil(@Value("${jwt.secret}") String secret,
                   @Value("${jwt.expirationHours}") int expirationHours) {
        // Validar força do secret
        if (secret == null || secret.length() < 32) {
            log.warn("JWT secret é muito curto! Usando secret gerado automaticamente. Configure jwt.secret no ambiente de produção.");
            secret = generateSecureSecret();
        }
        
        // Expandir secret para tamanho adequado usando derivação
        if (secret.length() < MIN_SECRET_LENGTH) {
            secret = expandSecret(secret);
        }
        
        this.secretKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expirationHours = Math.min(expirationHours, 24 * 7); // Máximo 7 dias
        
        log.info("JWT configurado com expiração de {} horas", this.expirationHours);
    }
    
    /**
     * Gera um secret seguro aleatoriamente
     */
    private String generateSecureSecret() {
        byte[] randomBytes = new byte[64];
        new SecureRandom().nextBytes(randomBytes);
        return Base64.getEncoder().encodeToString(randomBytes);
    }
    
    /**
     * Expande um secret curto para o tamanho mínimo
     */
    private String expandSecret(String secret) {
        StringBuilder expanded = new StringBuilder(secret);
        while (expanded.length() < MIN_SECRET_LENGTH) {
            expanded.append(secret);
        }
        return expanded.substring(0, MIN_SECRET_LENGTH);
    }

    public String createToken(String userId) {
        return createToken(userId, null, null);
    }

    public String createToken(String userId, String email, String role) {
        if (userId == null || userId.isBlank()) {
            throw new IllegalArgumentException("UserId não pode ser nulo ou vazio");
        }
        
        Instant now = Instant.now();
        var builder = Jwts.builder()
            .subject(userId)
            .claim("user_id", userId)
            .issuer(ISSUER)
            .audience().add(AUDIENCE).and()
            .issuedAt(Date.from(now))
            .notBefore(Date.from(now))
            .expiration(Date.from(now.plus(expirationHours, ChronoUnit.HOURS)))
            .id(java.util.UUID.randomUUID().toString()); // JTI para prevenção de replay
        
        if (email != null && !email.isBlank()) {
            builder.claim("email", email);
        }
        if (role != null && !role.isBlank()) {
            builder.claim("role", role);
        }
        
        return builder.signWith(secretKey).compact();
    }

    public Optional<String> parseUserId(String token) {
        try {
            Claims claims = parseAndValidateClaims(token);
            return Optional.ofNullable(claims.get("user_id", String.class));
        } catch (ExpiredJwtException e) {
            log.warn("JWT token expirado");
            return Optional.empty();
        } catch (JwtException e) {
            log.warn("Token JWT inválido: {}", e.getMessage());
            return Optional.empty();
        }
    }

    public Optional<Claims> parseClaims(String token) {
        try {
            return Optional.of(parseAndValidateClaims(token));
        } catch (JwtException e) {
            log.warn("Falha ao parsear claims JWT: {}", e.getMessage());
            return Optional.empty();
        }
    }
    
    private Claims parseAndValidateClaims(String token) {
        Claims claims = Jwts.parser()
            .verifyWith(secretKey)
            .requireIssuer(ISSUER)
            .requireAudience(AUDIENCE)
            .build()
            .parseSignedClaims(token)
            .getPayload();
        
        // Validação adicional
        if (claims.getSubject() == null || claims.getSubject().isBlank()) {
            throw new JwtException("Token sem subject válido");
        }
        
        return claims;
    }

    public boolean isTokenValid(String token) {
        if (token == null || token.isBlank()) {
            return false;
        }
        return parseUserId(token).isPresent();
    }
}
