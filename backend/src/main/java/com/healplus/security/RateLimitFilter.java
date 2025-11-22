package com.healplus.security;

import com.healplus.config.RateLimitConfig;
import io.github.bucket4j.Bucket;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
@Slf4j
public class RateLimitFilter extends OncePerRequestFilter {
    
    private final RateLimitConfig rateLimitConfig;
    
    @Override
    protected void doFilterInternal(@org.springframework.lang.NonNull HttpServletRequest request, @org.springframework.lang.NonNull HttpServletResponse response, 
                                   @org.springframework.lang.NonNull FilterChain filterChain) throws ServletException, IOException {
        
        // Pular rate limit para health checks e documentação
        String path = request.getRequestURI();
        if (path.startsWith("/actuator") || 
            path.startsWith("/swagger-ui") || 
            path.startsWith("/api-docs")) {
            filterChain.doFilter(request, response);
            return;
        }
        
        String clientIp = getClientIp(request);
        Bucket bucket = rateLimitConfig.resolveBucket(clientIp);
        
        if (bucket.tryConsume(1)) {
            filterChain.doFilter(request, response);
        } else {
            log.warn("Rate limit excedido para IP: {}", clientIp);
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setContentType("application/json");
            response.getWriter().write(
                "{\"error\":\"Too Many Requests\",\"message\":\"Rate limit excedido. Tente novamente mais tarde.\"}"
            );
        }
    }
    
    private String getClientIp(@org.springframework.lang.NonNull HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty()) {
            return xRealIp;
        }
        
        return request.getRemoteAddr();
    }
}

