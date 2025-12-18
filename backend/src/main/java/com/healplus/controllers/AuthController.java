package com.healplus.controllers;

import com.healplus.dto.ApiResponse;
import com.healplus.dto.AuthDtos;
import com.healplus.entities.User;
import com.healplus.security.RefreshTokenService;
import com.healplus.services.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication", description = "Endpoints for user authentication and registration")
@RequiredArgsConstructor
@Slf4j
public class AuthController {
  
    private final AuthService authService;
    private final RefreshTokenService refreshTokenService;

    @PostMapping("/register")
    @Operation(summary = "Register new user", description = "Creates a new user account in the system")
    @ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "User registered successfully"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid data or email already exists"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "429", description = "Too many requests")
    })
    public ResponseEntity<ApiResponse<AuthDtos.TokenResponse>> register(
            @Valid @RequestBody AuthDtos.UserCreate data,
            HttpServletRequest request,
            HttpServletResponse response) {
        log.info("Registration request for email: {}", data.getEmail());
        
        AuthDtos.TokenResponse tokenResponse = authService.register(data);
        User user = authService.getCurrentUser();
        
        // Gerar tokens com cookies seguros
        RefreshTokenService.TokenPair tokenPair = refreshTokenService.generateTokenPair(user, request, response);
        
        tokenResponse.setToken(tokenPair.accessToken());
        tokenResponse.setRefreshToken(null); // Não expor refresh token no body (está no cookie)
        tokenResponse.setExpiresIn(24 * 3600L); // 24 horas em segundos
        
        return ResponseEntity.ok(ApiResponse.success(tokenResponse, "Usuário registrado com sucesso"));
    }

    @PostMapping("/login")
    @Operation(summary = "User login", description = "Authenticates a user and returns a JWT token")
    @ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Login successful"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Invalid credentials"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "429", description = "Too many requests - possible brute force attack")
    })
    public ResponseEntity<ApiResponse<AuthDtos.TokenResponse>> login(
            @Valid @RequestBody AuthDtos.UserLogin data,
            HttpServletRequest request,
            HttpServletResponse response) {
        log.info("Login attempt for email: {}", data.getEmail());
        
        AuthDtos.TokenResponse tokenResponse = authService.login(data);
        User user = (User) tokenResponse.getUser();
        
        // Gerar tokens com cookies seguros
        RefreshTokenService.TokenPair tokenPair = refreshTokenService.generateTokenPair(user, request, response);
        
        tokenResponse.setToken(tokenPair.accessToken());
        tokenResponse.setRefreshToken(null); // Não expor refresh token no body
        tokenResponse.setExpiresIn(24 * 3600L);
        
        return ResponseEntity.ok(ApiResponse.success(tokenResponse, "Login realizado com sucesso"));
    }

    @PostMapping("/refresh")
    @Operation(summary = "Refresh tokens", description = "Refreshes access token using refresh token from cookie")
    @ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Tokens refreshed successfully"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Invalid or expired refresh token")
    })
    public ResponseEntity<ApiResponse<AuthDtos.TokenResponse>> refreshToken(
            HttpServletRequest request,
            HttpServletResponse response) {
        
        return refreshTokenService.extractRefreshTokenFromCookie(request)
            .flatMap(refreshToken -> refreshTokenService.refreshTokens(refreshToken, request, response))
            .map(tokenPair -> {
                AuthDtos.TokenResponse tokenResponse = new AuthDtos.TokenResponse();
                tokenResponse.setToken(tokenPair.accessToken());
                tokenResponse.setUser(tokenPair.user());
                tokenResponse.setExpiresIn(24 * 3600L);
                
                return ResponseEntity.ok(ApiResponse.success(tokenResponse, "Token renovado com sucesso"));
            })
            .orElseGet(() -> {
                log.warn("Failed to refresh token - invalid or missing refresh token");
                return ResponseEntity.status(401)
                    .body(ApiResponse.error("Sessão expirada. Faça login novamente."));
            });
    }

    @PostMapping("/logout")
    @Operation(summary = "Logout user", description = "Invalidates all tokens and clears cookies")
    public ResponseEntity<ApiResponse<Void>> logout(
            HttpServletRequest request,
            HttpServletResponse response) {
        
        try {
            User currentUser = authService.getCurrentUser();
            refreshTokenService.revokeAllUserTokens(currentUser.getId(), response);
            log.info("User logged out: {}", currentUser.getId());
        } catch (Exception e) {
            // Mesmo se não autenticado, limpar cookies
            refreshTokenService.extractRefreshTokenFromCookie(request)
                .ifPresent(token -> refreshTokenService.revokeToken(token, response));
        }
        
        return ResponseEntity.ok(ApiResponse.successMessage("Logout realizado com sucesso"));
    }

    @GetMapping("/me")
    @Operation(summary = "Get current user", description = "Returns the authenticated user's data")
    @ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "User data returned"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "User not authenticated")
    })
    public ResponseEntity<ApiResponse<AuthDtos.UserResponse>> me() {
        User user = authService.getCurrentUser();
        AuthDtos.UserResponse userResponse = new AuthDtos.UserResponse(
            user.getId(),
            user.getEmail(),
            user.getName(),
            user.getRole(),
            user.getAvatarUrl()
        );
        return ResponseEntity.ok(ApiResponse.success(userResponse));
    }

    @GetMapping("/google/url")
    @Operation(summary = "Get Google OAuth URL", description = "Returns the URL to initiate Google OAuth login")
    public ResponseEntity<ApiResponse<Map<String, String>>> getGoogleAuthUrl() {
        String authUrl = "/oauth2/authorize/google";
        return ResponseEntity.ok(ApiResponse.success(Map.of(
            "url", authUrl,
            "provider", "google"
        )));
    }

    @PostMapping("/google/callback")
    @Operation(summary = "Google OAuth callback", description = "Handles the Google OAuth callback with user info")
    @ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "OAuth login successful"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid OAuth data")
    })
    public ResponseEntity<ApiResponse<AuthDtos.TokenResponse>> googleCallback(
            @Valid @RequestBody AuthDtos.GoogleAuthRequest authRequest,
            HttpServletRequest request,
            HttpServletResponse response) {
        log.info("Google OAuth login for email: {}", authRequest.getEmail());
        
        AuthDtos.TokenResponse tokenResponse = authService.loginWithGoogle(
            authRequest.getEmail(),
            authRequest.getName(),
            authRequest.getGoogleId(),
            authRequest.getAvatarUrl()
        );
        
        User user = (User) tokenResponse.getUser();
        RefreshTokenService.TokenPair tokenPair = refreshTokenService.generateTokenPair(user, request, response);
        
        tokenResponse.setToken(tokenPair.accessToken());
        tokenResponse.setRefreshToken(null);
        tokenResponse.setExpiresIn(24 * 3600L);
        
        return ResponseEntity.ok(ApiResponse.success(tokenResponse, "Login com Google realizado com sucesso"));
    }

    @GetMapping("/check")
    @Operation(summary = "Check authentication status", description = "Checks if user is authenticated")
    public ResponseEntity<ApiResponse<Map<String, Object>>> checkAuth() {
        try {
            User user = authService.getCurrentUser();
            return ResponseEntity.ok(ApiResponse.success(Map.of(
                "authenticated", true,
                "userId", user.getId(),
                "email", user.getEmail()
            )));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponse.success(Map.of(
                "authenticated", false
            )));
        }
    }
}
