package com.healplus.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Filtro de segurança que adiciona headers HTTP de proteção contra XSS, Clickjacking e outros ataques.
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class SecurityHeadersConfig extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain filterChain) throws ServletException, IOException {
        
        // Proteção contra XSS
        response.setHeader("X-XSS-Protection", "1; mode=block");
        
        // Proteção contra Clickjacking
        response.setHeader("X-Frame-Options", "DENY");
        
        // Prevenir sniffing de MIME type
        response.setHeader("X-Content-Type-Options", "nosniff");
        
        // Referrer Policy - não enviar referrer para outros domínios
        response.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
        
        // Permissions Policy - desabilitar APIs sensíveis
        response.setHeader("Permissions-Policy", 
            "accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()");
        
        // Content Security Policy - restringir origens de recursos
        response.setHeader("Content-Security-Policy", 
            "default-src 'self'; " +
            "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
            "font-src 'self' https://fonts.gstatic.com; " +
            "img-src 'self' data: blob: https:; " +
            "connect-src 'self' https://api.openai.com https://accounts.google.com; " +
            "frame-ancestors 'none'; " +
            "form-action 'self'; " +
            "base-uri 'self'");
        
        // Strict Transport Security (HSTS) - forçar HTTPS
        response.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
        
        // Cache Control para dados sensíveis
        if (request.getRequestURI().contains("/api/auth") || 
            request.getRequestURI().contains("/api/patients") ||
            request.getRequestURI().contains("/api/wounds")) {
            response.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, private");
            response.setHeader("Pragma", "no-cache");
            response.setHeader("Expires", "0");
        }
        
        filterChain.doFilter(request, response);
    }
}
