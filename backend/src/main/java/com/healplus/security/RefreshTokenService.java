package com.healplus.security;

import com.healplus.entities.RefreshToken;
import com.healplus.entities.User;
import com.healplus.repositories.RefreshTokenRepository;
import com.healplus.repositories.UserRepository;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import java.util.Optional;

/**
 * Serviço para gerenciamento de Refresh Tokens
 * - Tokens são armazenados em cookies HttpOnly para segurança
 * - Suporta rotação de tokens para prevenção de replay attacks
 * - Limpeza automática de tokens expirados
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class RefreshTokenService {
    
    private static final String ACCESS_TOKEN_COOKIE = "healplus_access_token";
    private static final String REFRESH_TOKEN_COOKIE = "healplus_refresh_token";
    private static final int REFRESH_TOKEN_LENGTH = 64;
    private static final int MAX_ACTIVE_SESSIONS = 5;
    
    private final RefreshTokenRepository refreshTokenRepository;
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    
    @Value("${jwt.expirationHours:24}")
    private int accessTokenExpirationHours;
    
    @Value("${jwt.refreshExpirationDays:30}")
    private int refreshTokenExpirationDays;
    
    @Value("${server.servlet.session.cookie.secure:false}")
    private boolean secureCookie;
    
    @Value("${cors.origins:http://localhost:3000}")
    private String corsOrigins;
    
    /**
     * Gera um novo par de tokens (access + refresh) e configura cookies
     */
    @Transactional
    public TokenPair generateTokenPair(User user, HttpServletRequest request, HttpServletResponse response) {
        // Limitar sessões ativas por usuário
        enforceMaxSessions(user.getId());
        
        // Gerar access token JWT
        String accessToken = jwtUtil.createToken(user.getId(), user.getEmail(), user.getRole());
        
        // Gerar refresh token aleatório
        String refreshTokenValue = generateSecureToken();
        
        // Salvar refresh token no banco
        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setToken(hashToken(refreshTokenValue));
        refreshToken.setUserId(user.getId());
        refreshToken.setDeviceInfo(extractDeviceInfo(request));
        refreshToken.setIpAddress(extractClientIP(request));
        refreshToken.setExpiresAt(Instant.now().plus(refreshTokenExpirationDays, ChronoUnit.DAYS));
        refreshTokenRepository.save(refreshToken);
        
        // Configurar cookies seguros
        setSecureCookies(response, accessToken, refreshTokenValue);
        
        log.info("Token pair generated for user: {}", user.getId());
        
        return new TokenPair(accessToken, refreshTokenValue, user);
    }
    
    /**
     * Renova tokens usando refresh token válido
     * Implementa rotação de refresh token para segurança adicional
     */
    @Transactional
    public Optional<TokenPair> refreshTokens(String refreshTokenValue, HttpServletRequest request, HttpServletResponse response) {
        if (refreshTokenValue == null || refreshTokenValue.isBlank()) {
            log.warn("Attempt to refresh with empty token");
            return Optional.empty();
        }
        
        String hashedToken = hashToken(refreshTokenValue);
        
        return refreshTokenRepository.findByToken(hashedToken)
            .filter(RefreshToken::isValid)
            .flatMap(storedToken -> {
                // Buscar usuário
                return userRepository.findById(storedToken.getUserId())
                    .map(user -> {
                        // Revogar token antigo (rotação)
                        storedToken.revoke();
                        
                        // Gerar novo par de tokens
                        TokenPair newPair = generateTokenPair(user, request, response);
                        
                        // Vincular token antigo ao novo
                        storedToken.setReplacedByToken(hashToken(newPair.refreshToken()));
                        refreshTokenRepository.save(storedToken);
                        
                        log.info("Tokens refreshed for user: {}", user.getId());
                        return newPair;
                    });
            });
    }
    
    /**
     * Revoga todos os tokens de um usuário (logout completo)
     */
    @Transactional
    public void revokeAllUserTokens(String userId, HttpServletResponse response) {
        int revokedCount = refreshTokenRepository.revokeAllByUserId(userId, Instant.now());
        clearCookies(response);
        log.info("Revoked {} tokens for user: {}", revokedCount, userId);
    }
    
    /**
     * Revoga um token específico
     */
    @Transactional
    public void revokeToken(String refreshTokenValue, HttpServletResponse response) {
        String hashedToken = hashToken(refreshTokenValue);
        refreshTokenRepository.findByToken(hashedToken)
            .ifPresent(token -> {
                token.revoke();
                refreshTokenRepository.save(token);
                log.info("Token revoked for user: {}", token.getUserId());
            });
        clearCookies(response);
    }
    
    /**
     * Extrai refresh token do cookie
     */
    public Optional<String> extractRefreshTokenFromCookie(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if (REFRESH_TOKEN_COOKIE.equals(cookie.getName())) {
                    return Optional.ofNullable(cookie.getValue());
                }
            }
        }
        return Optional.empty();
    }
    
    /**
     * Extrai access token do cookie
     */
    public Optional<String> extractAccessTokenFromCookie(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if (ACCESS_TOKEN_COOKIE.equals(cookie.getName())) {
                    return Optional.ofNullable(cookie.getValue());
                }
            }
        }
        return Optional.empty();
    }
    
    // ==================== Métodos Privados ====================
    
    private void setSecureCookies(HttpServletResponse response, String accessToken, String refreshToken) {
        // Access Token Cookie (curta duração)
        Cookie accessCookie = new Cookie(ACCESS_TOKEN_COOKIE, accessToken);
        accessCookie.setHttpOnly(true);
        accessCookie.setSecure(secureCookie);
        accessCookie.setPath("/");
        accessCookie.setMaxAge(accessTokenExpirationHours * 3600);
        accessCookie.setAttribute("SameSite", "Strict");
        response.addCookie(accessCookie);
        
        // Refresh Token Cookie (longa duração)
        Cookie refreshCookie = new Cookie(REFRESH_TOKEN_COOKIE, refreshToken);
        refreshCookie.setHttpOnly(true);
        refreshCookie.setSecure(secureCookie);
        refreshCookie.setPath("/api/auth"); // Apenas endpoints de auth
        refreshCookie.setMaxAge(refreshTokenExpirationDays * 24 * 3600);
        refreshCookie.setAttribute("SameSite", "Strict");
        response.addCookie(refreshCookie);
    }
    
    private void clearCookies(HttpServletResponse response) {
        Cookie accessCookie = new Cookie(ACCESS_TOKEN_COOKIE, "");
        accessCookie.setHttpOnly(true);
        accessCookie.setSecure(secureCookie);
        accessCookie.setPath("/");
        accessCookie.setMaxAge(0);
        response.addCookie(accessCookie);
        
        Cookie refreshCookie = new Cookie(REFRESH_TOKEN_COOKIE, "");
        refreshCookie.setHttpOnly(true);
        refreshCookie.setSecure(secureCookie);
        refreshCookie.setPath("/api/auth");
        refreshCookie.setMaxAge(0);
        response.addCookie(refreshCookie);
    }
    
    private String generateSecureToken() {
        byte[] randomBytes = new byte[REFRESH_TOKEN_LENGTH];
        new SecureRandom().nextBytes(randomBytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);
    }
    
    private String hashToken(String token) {
        // Hash simples para armazenamento seguro
        // Em produção, considerar usar SHA-256
        try {
            java.security.MessageDigest md = java.security.MessageDigest.getInstance("SHA-256");
            byte[] hash = md.digest(token.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(hash);
        } catch (java.security.NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 not available", e);
        }
    }
    
    private String extractDeviceInfo(HttpServletRequest request) {
        String userAgent = request.getHeader("User-Agent");
        return userAgent != null ? userAgent.substring(0, Math.min(userAgent.length(), 255)) : "Unknown";
    }
    
    private String extractClientIP(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isBlank()) {
            return xForwardedFor.split(",")[0].trim();
        }
        String xRealIP = request.getHeader("X-Real-IP");
        if (xRealIP != null && !xRealIP.isBlank()) {
            return xRealIP;
        }
        return request.getRemoteAddr();
    }
    
    private void enforceMaxSessions(String userId) {
        long activeCount = refreshTokenRepository.countActiveTokensByUserId(userId, Instant.now());
        if (activeCount >= MAX_ACTIVE_SESSIONS) {
            // Revogar sessões mais antigas
            refreshTokenRepository.revokeAllByUserId(userId, Instant.now());
            log.info("Revoked all sessions for user {} due to max sessions limit", userId);
        }
    }
    
    /**
     * Limpa tokens expirados periodicamente (a cada hora)
     */
    @Scheduled(fixedRate = 3600000)
    @Transactional
    public void cleanupExpiredTokens() {
        Instant now = Instant.now();
        Instant threshold = now.minus(7, ChronoUnit.DAYS); // Manter tokens revogados por 7 dias para auditoria
        int deleted = refreshTokenRepository.deleteExpiredTokens(now, threshold);
        if (deleted > 0) {
            log.info("Cleaned up {} expired/old tokens", deleted);
        }
    }
    
    // ==================== Token Pair Record ====================
    
    public record TokenPair(String accessToken, String refreshToken, User user) {}
}
