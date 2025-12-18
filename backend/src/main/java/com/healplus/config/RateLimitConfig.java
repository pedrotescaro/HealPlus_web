package com.healplus.config;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Configuration
public class RateLimitConfig {
    
    // Rate limit geral: 100 requests por minuto por IP
    private static final int REQUESTS_PER_MINUTE = 100;
    
    // Rate limit para autenticação: 10 requests por minuto por IP (proteção contra brute force)
    private static final int AUTH_REQUESTS_PER_MINUTE = 10;
    
    // Rate limit para uploads: 20 requests por minuto por IP
    private static final int UPLOAD_REQUESTS_PER_MINUTE = 20;
    
    private final Map<String, Bucket> generalBuckets = new ConcurrentHashMap<>();
    private final Map<String, Bucket> authBuckets = new ConcurrentHashMap<>();
    private final Map<String, Bucket> uploadBuckets = new ConcurrentHashMap<>();
    
    @Bean
    public Map<String, Bucket> rateLimitBuckets() {
        return generalBuckets;
    }
    
    /**
     * Resolve bucket para rate limiting geral
     */
    public Bucket resolveBucket(String key) {
        return generalBuckets.computeIfAbsent(key, k -> {
            Bandwidth limit = Bandwidth.classic(
                REQUESTS_PER_MINUTE,
                Refill.intervally(REQUESTS_PER_MINUTE, Duration.ofMinutes(1))
            );
            return Bucket.builder()
                .addLimit(limit)
                .build();
        });
    }
    
    /**
     * Resolve bucket para rate limiting de autenticação (mais restritivo)
     * Proteção contra ataques de brute force
     */
    public Bucket resolveAuthBucket(String key) {
        return authBuckets.computeIfAbsent(key, k -> {
            Bandwidth limit = Bandwidth.classic(
                AUTH_REQUESTS_PER_MINUTE,
                Refill.intervally(AUTH_REQUESTS_PER_MINUTE, Duration.ofMinutes(1))
            );
            // Limite adicional: máximo 3 tentativas em 10 segundos
            Bandwidth burstLimit = Bandwidth.classic(
                3,
                Refill.intervally(3, Duration.ofSeconds(10))
            );
            return Bucket.builder()
                .addLimit(limit)
                .addLimit(burstLimit)
                .build();
        });
    }
    
    /**
     * Resolve bucket para rate limiting de uploads
     */
    public Bucket resolveUploadBucket(String key) {
        return uploadBuckets.computeIfAbsent(key, k -> {
            Bandwidth limit = Bandwidth.classic(
                UPLOAD_REQUESTS_PER_MINUTE,
                Refill.intervally(UPLOAD_REQUESTS_PER_MINUTE, Duration.ofMinutes(1))
            );
            return Bucket.builder()
                .addLimit(limit)
                .build();
        });
    }
    
    /**
     * Limpa buckets expirados (deve ser chamado periodicamente)
     */
    public void cleanupExpiredBuckets() {
        // Implementação simplificada - em produção usar cache com TTL
        if (generalBuckets.size() > 10000) {
            generalBuckets.clear();
        }
        if (authBuckets.size() > 10000) {
            authBuckets.clear();
        }
        if (uploadBuckets.size() > 10000) {
            uploadBuckets.clear();
        }
    }
}

