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
    
    // Rate limit: 100 requests per minute por IP
    private static final int REQUESTS_PER_MINUTE = 100;
    
    @Bean
    public Map<String, Bucket> rateLimitBuckets() {
        return new ConcurrentHashMap<>();
    }
    
    public Bucket resolveBucket(String key) {
        return rateLimitBuckets().computeIfAbsent(key, k -> {
            Bandwidth limit = Bandwidth.classic(
                REQUESTS_PER_MINUTE,
                Refill.intervally(REQUESTS_PER_MINUTE, Duration.ofMinutes(1))
            );
            return Bucket.builder()
                .addLimit(limit)
                .build();
        });
    }
}

