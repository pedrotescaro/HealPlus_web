package com.healplus.controllers;

import com.healplus.dto.AuthDtos;
import com.healplus.entities.User;
import com.healplus.repositories.UserRepository;
import com.healplus.security.JwtUtil;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
  private final UserRepository userRepository;
  private final PasswordEncoder passwordEncoder;
  private final JwtUtil jwtUtil;

  public AuthController(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
    this.userRepository = userRepository;
    this.passwordEncoder = passwordEncoder;
    this.jwtUtil = jwtUtil;
  }

  @PostMapping("/register")
  public ResponseEntity<?> register(@RequestBody AuthDtos.UserCreate data) {
    Optional<User> existing = userRepository.findByEmail(data.getEmail());
    if (existing.isPresent()) return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Email already registered");
    User u = new User();
    u.setId(UUID.randomUUID().toString());
    u.setEmail(data.getEmail());
    u.setName(data.getName());
    u.setRole(data.getRole() == null ? "professional" : data.getRole());
    u.setPassword(passwordEncoder.encode(data.getPassword()));
    u.setCreatedAt(Instant.now());
    userRepository.save(u);
    AuthDtos.TokenResponse resp = new AuthDtos.TokenResponse();
    resp.setToken(jwtUtil.createToken(u.getId()));
    resp.setUser(u);
    return ResponseEntity.ok(resp);
  }

  @PostMapping("/login")
  public ResponseEntity<?> login(@RequestBody AuthDtos.UserLogin data) {
    Optional<User> existing = userRepository.findByEmail(data.getEmail());
    if (existing.isEmpty()) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    User u = existing.get();
    if (!passwordEncoder.matches(data.getPassword(), u.getPassword())) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    AuthDtos.TokenResponse resp = new AuthDtos.TokenResponse();
    resp.setToken(jwtUtil.createToken(u.getId()));
    resp.setUser(u);
    return ResponseEntity.ok(resp);
  }

  @GetMapping("/me")
  public ResponseEntity<?> me(@RequestAttribute(value = "org.springframework.security.core.context.SecurityContext", required = false) Object sc) {
    Object principal = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication() != null ? org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getPrincipal() : null;
    if (principal instanceof User) return ResponseEntity.ok(principal);
    return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
  }
}