package com.healplus.config;

import com.healplus.security.JwtAuthFilter;
import com.healplus.security.OAuth2AuthenticationFailureHandler;
import com.healplus.security.OAuth2AuthenticationSuccessHandler;
import com.healplus.security.RateLimitFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.header.writers.XXssProtectionHeaderWriter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    @Value("${cors.origins:http://localhost:3000}")
    private String corsOrigins;
    
    @Value("${spring.profiles.active:default}")
    private String activeProfile;

    private final JwtAuthFilter jwtAuthFilter;
    private final RateLimitFilter rateLimitFilter;
    private final SecurityHeadersConfig securityHeadersConfig;
    private final OAuth2AuthenticationSuccessHandler oAuth2SuccessHandler;
    private final OAuth2AuthenticationFailureHandler oAuth2FailureHandler;

    // Caminhos públicos - NUNCA expor console H2 em produção
    private static final List<String> PUBLIC_PATHS = List.of(
        "/api/auth/login",
        "/api/auth/register",
        "/api/auth/refresh",
        "/api/auth/google/**",
        "/api/auth/check",
        "/actuator/health",
        "/actuator/info",
        "/swagger-ui/**",
        "/swagger-ui.html",
        "/api-docs/**",
        "/v3/api-docs/**",
        "/oauth2/**",
        "/login/oauth2/**"
    );
    
    // Caminhos apenas para desenvolvimento
    private static final List<String> DEV_ONLY_PATHS = List.of(
        "/h2-console/**"
    );

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        boolean isDev = "dev".equals(activeProfile) || "default".equals(activeProfile);
        
        http
            // CSRF - Desabilitado para APIs REST stateless com JWT
            // Se houver endpoints baseados em cookies/sessão, habilitar CSRF
            .csrf(csrf -> csrf.disable())
            
            // Headers de segurança
            .headers(headers -> headers
                .xssProtection(xss -> xss
                    .headerValue(XXssProtectionHeaderWriter.HeaderValue.ENABLED_MODE_BLOCK))
                .frameOptions(frame -> {
                    if (isDev) {
                        frame.sameOrigin(); // Permite H2 console em dev
                    } else {
                        frame.deny(); // Bloqueia em produção
                    }
                })
                .contentTypeOptions(contentType -> {})
                .cacheControl(cache -> {})
            )
            
            // Sessão stateless para JWT
            .sessionManagement(sm -> sm
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                .sessionFixation().none()
            )
            
            // Autorizações
            .authorizeHttpRequests(auth -> {
                PUBLIC_PATHS.forEach(path -> auth.requestMatchers(path).permitAll());
                
                // Permitir H2 console apenas em dev
                if (isDev) {
                    DEV_ONLY_PATHS.forEach(path -> auth.requestMatchers(path).permitAll());
                }
                
                auth.requestMatchers(HttpMethod.GET, "/").permitAll();
                auth.requestMatchers(HttpMethod.OPTIONS, "/**").permitAll(); // CORS preflight
                
                // Endpoints admin apenas para ROLE_ADMIN
                auth.requestMatchers("/api/admin/**").hasRole("ADMIN");
                auth.requestMatchers("/actuator/**").hasRole("ADMIN");
                
                auth.anyRequest().authenticated();
            })
            
            // OAuth2
            .oauth2Login(oauth2 -> oauth2
                .authorizationEndpoint(endpoint -> endpoint
                    .baseUri("/oauth2/authorize"))
                .redirectionEndpoint(endpoint -> endpoint
                    .baseUri("/login/oauth2/code/*"))
                .successHandler(oAuth2SuccessHandler)
                .failureHandler(oAuth2FailureHandler)
            )
            
            // Filtros customizados
            .addFilterBefore(securityHeadersConfig, UsernamePasswordAuthenticationFilter.class)
            .addFilterBefore(rateLimitFilter, UsernamePasswordAuthenticationFilter.class)
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        // BCrypt com fator de custo 12 (recomendado para produção)
        return new BCryptPasswordEncoder(12);
    }

    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowCredentials(true);
        
        // Validar origens permitidas
        List<String> origins = Arrays.asList(corsOrigins.split(","));
        config.setAllowedOrigins(origins);
        
        // Headers permitidos - ser específico por segurança
        config.setAllowedHeaders(List.of(
            "Authorization",
            "Content-Type",
            "X-Requested-With",
            "Accept",
            "Origin",
            "Access-Control-Request-Method",
            "Access-Control-Request-Headers",
            "X-CSRF-TOKEN"
        ));
        
        // Métodos permitidos
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        
        // Headers expostos ao cliente
        config.setExposedHeaders(List.of(
            "Authorization",
            "Content-Type",
            "X-Total-Count",
            "X-Page-Number",
            "X-Page-Size"
        ));
        
        // Cache preflight por 1 hora
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }
}
