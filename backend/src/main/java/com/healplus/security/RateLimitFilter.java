package com.healplus.security;

import com.healplus.config.RateLimitConfig;
import io.github.bucket4j.Bucket;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class RateLimitFilter extends OncePerRequestFilter {
    
    private static final Logger log = LoggerFactory.getLogger(RateLimitFilter.class);
    private final RateLimitConfig rateLimitConfig;
    
    public RateLimitFilter(RateLimitConfig rateLimitConfig) {
        this.rateLimitConfig = rateLimitConfig;
    }
    
    @Override
    protected void doFilterInternal(@org.springframework.lang.NonNull HttpServletRequest request, 
                                   @org.springframework.lang.NonNull HttpServletResponse response, 
                                   @org.springframework.lang.NonNull FilterChain filterChain) throws ServletException, IOException {
        
        String path = request.getRequestURI();
        
        // Paths que não precisam de rate limiting
        if (path.startsWith("/actuator") || 
            path.startsWith("/swagger-ui") || 
            path.startsWith("/api-docs") ||
            path.startsWith("/v3/api-docs")) {
            filterChain.doFilter(request, response);
            return;
        }
        
        String clientIp = getClientIp(request);
        Bucket bucket;
        
        // Rate limiting mais restritivo para endpoints de autenticação (proteção brute force)
        if (path.startsWith("/api/auth/login") || 
            path.startsWith("/api/auth/register") ||
            path.startsWith("/api/auth/google")) {
            bucket = rateLimitConfig.resolveAuthBucket(clientIp);
        }
        // Rate limiting para uploads
        else if (path.contains("/analyze") || path.contains("/upload")) {
            bucket = rateLimitConfig.resolveUploadBucket(clientIp);
        }
        // Rate limiting geral
        else {
            bucket = rateLimitConfig.resolveBucket(clientIp);
        }
        
        if (bucket.tryConsume(1)) {
            filterChain.doFilter(request, response);
        } else {
            log.warn("Rate limit excedido para IP: {} no path: {}", clientIp, path);
            
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setContentType("application/json;charset=UTF-8");
            response.setHeader("Retry-After", "60");
            response.getWriter().write(
                "{\"error\":\"Too Many Requests\",\"message\":\"Rate limit excedido. Tente novamente em 60 segundos.\",\"status\":429}"
            );
        }
    }
    
    /**
     * Obtém o IP real do cliente, considerando proxies
     */
    private String getClientIp(@org.springframework.lang.NonNull HttpServletRequest request) {
        // X-Forwarded-For pode conter múltiplos IPs (cliente, proxies)
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            // Pegar o primeiro IP (cliente original)
            String clientIp = xForwardedFor.split(",")[0].trim();
            // Validar formato básico do IP para evitar spoofing
            if (isValidIp(clientIp)) {
                return clientIp;
            }
        }
        
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty() && isValidIp(xRealIp)) {
            return xRealIp;
        }
        
        return request.getRemoteAddr();
    }
    
    /**
     * Valida formato básico de IP (IPv4 ou IPv6)
     */
    private boolean isValidIp(String ip) {
        if (ip == null || ip.isEmpty()) {
            return false;
        }
        // Validação básica - não permite caracteres perigosos
        return ip.matches("^[0-9a-fA-F.:]+$") && ip.length() <= 45;
    }
}
