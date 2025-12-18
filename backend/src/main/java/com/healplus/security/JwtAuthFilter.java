package com.healplus.security;

import com.healplus.entities.User;
import com.healplus.repositories.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthFilter extends OncePerRequestFilter {

    private static final String BEARER_PREFIX = "Bearer ";
    private static final String ACCESS_TOKEN_COOKIE = "healplus_access_token";

    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain chain) throws ServletException, IOException {
        try {
            // Tentar extrair token do header Authorization primeiro, depois do cookie
            extractToken(request)
                .flatMap(jwtUtil::parseUserId)
                .flatMap(userRepository::findById)
                .ifPresent(user -> setAuthentication(user, request));
        } catch (Exception e) {
            log.error("Cannot set user authentication: {}", e.getMessage());
        }

        chain.doFilter(request, response);
    }

    private Optional<String> extractToken(HttpServletRequest request) {
        // 1. Tentar header Authorization (Bearer token)
        String header = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (StringUtils.hasText(header) && header.startsWith(BEARER_PREFIX)) {
            return Optional.of(header.substring(BEARER_PREFIX.length()));
        }
        
        // 2. Tentar cookie HttpOnly
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if (ACCESS_TOKEN_COOKIE.equals(cookie.getName())) {
                    String cookieValue = cookie.getValue();
                    if (StringUtils.hasText(cookieValue)) {
                        return Optional.of(cookieValue);
                    }
                }
            }
        }
        
        return Optional.empty();
    }

    private void setAuthentication(User user, HttpServletRequest request) {
        List<SimpleGrantedAuthority> authorities = user.getRole() != null
            ? List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().toUpperCase()))
            : Collections.emptyList();

        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
            user, null, authorities
        );
        auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
        SecurityContextHolder.getContext().setAuthentication(auth);

        log.debug("Authenticated user: {} with role: {}", user.getId(), user.getRole());
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getServletPath();
        return path.startsWith("/api/auth/login") ||
               path.startsWith("/api/auth/register") ||
               path.startsWith("/api/auth/refresh") ||
               path.startsWith("/api/auth/google") ||
               path.startsWith("/oauth2/") ||
               path.startsWith("/login/oauth2/") ||
               path.startsWith("/actuator/") ||
               path.startsWith("/swagger-ui") ||
               path.startsWith("/api-docs") ||
               path.startsWith("/v3/api-docs") ||
               path.startsWith("/h2-console");
    }
}
