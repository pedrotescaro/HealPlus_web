package com.healplus.controllers;

import com.healplus.dto.AuthDtos;
import com.healplus.entities.User;
import com.healplus.services.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Autenticação", description = "Endpoints para autenticação e registro de usuários")
@RequiredArgsConstructor
public class AuthController {
  
  private final AuthService authService;

  @PostMapping("/register")
  @Operation(summary = "Registrar novo usuário", description = "Cria uma nova conta de usuário no sistema")
  public ResponseEntity<AuthDtos.TokenResponse> register(@Valid @RequestBody AuthDtos.UserCreate data) {
    return ResponseEntity.ok(authService.register(data));
  }

  @PostMapping("/login")
  @Operation(summary = "Login de usuário", description = "Autentica um usuário e retorna um token JWT")
  public ResponseEntity<AuthDtos.TokenResponse> login(@Valid @RequestBody AuthDtos.UserLogin data) {
    return ResponseEntity.ok(authService.login(data));
  }

  @GetMapping("/me")
  @Operation(summary = "Obter usuário atual", description = "Retorna os dados do usuário autenticado")
  public ResponseEntity<User> me() {
    return ResponseEntity.ok(authService.getCurrentUser());
  }
}