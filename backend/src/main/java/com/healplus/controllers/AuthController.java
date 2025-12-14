package com.healplus.controllers;

import com.healplus.dto.AuthDtos;
import com.healplus.entities.User;
import com.healplus.services.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication", description = "Endpoints for user authentication and registration")
@RequiredArgsConstructor
public class AuthController {
  
    private final AuthService authService;

    @PostMapping("/register")
    @Operation(summary = "Register new user", description = "Creates a new user account in the system")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "User registered successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid data or email already exists")
    })
    public ResponseEntity<AuthDtos.TokenResponse> register(@Valid @RequestBody AuthDtos.UserCreate data) {
        return ResponseEntity.ok(authService.register(data));
    }

    @PostMapping("/login")
    @Operation(summary = "User login", description = "Authenticates a user and returns a JWT token")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Login successful"),
        @ApiResponse(responseCode = "401", description = "Invalid credentials")
    })
    public ResponseEntity<AuthDtos.TokenResponse> login(@Valid @RequestBody AuthDtos.UserLogin data) {
        return ResponseEntity.ok(authService.login(data));
    }

    @GetMapping("/me")
    @Operation(summary = "Get current user", description = "Returns the authenticated user's data")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "User data returned"),
        @ApiResponse(responseCode = "401", description = "User not authenticated")
    })
    public ResponseEntity<User> me() {
        return ResponseEntity.ok(authService.getCurrentUser());
    }

    @GetMapping("/google/url")
    @Operation(summary = "Get Google OAuth URL", description = "Returns the URL to initiate Google OAuth login")
    public ResponseEntity<Map<String, String>> getGoogleAuthUrl() {
        String authUrl = "/oauth2/authorize/google";
        return ResponseEntity.ok(Map.of(
            "url", authUrl,
            "provider", "google"
        ));
    }

    @PostMapping("/google/callback")
    @Operation(summary = "Google OAuth callback", description = "Handles the Google OAuth callback with user info")
    public ResponseEntity<AuthDtos.TokenResponse> googleCallback(@RequestBody AuthDtos.GoogleAuthRequest request) {
        return ResponseEntity.ok(authService.loginWithGoogle(
            request.getEmail(),
            request.getName(),
            request.getGoogleId(),
            request.getAvatarUrl()
        ));
    }
}
