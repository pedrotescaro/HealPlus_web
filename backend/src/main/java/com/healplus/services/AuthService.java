package com.healplus.services;

import com.healplus.audit.AuditService;
import com.healplus.dto.AuthDtos;
import com.healplus.entities.User;
import com.healplus.exception.BadRequestException;
import com.healplus.exception.UnauthorizedException;
import com.healplus.repositories.UserRepository;
import com.healplus.security.JwtUtil;
import com.healplus.security.PasswordValidator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final PasswordValidator passwordValidator;
    private final AuditService auditService;
    
    @Transactional
    public AuthDtos.TokenResponse register(AuthDtos.UserCreate data) {
        log.info("Registration attempt for email: {}", data.getEmail());
        
        validateEmailNotExists(data.getEmail());
        validatePassword(data.getPassword(), data.getEmail());
        
        User user = createUser(data);
        user = userRepository.save(user);
        
        log.info("User registered successfully: {}", user.getId());
        auditService.logUserAction(user.getId(), "REGISTER", "New user registered");
        
        return buildTokenResponse(user);
    }
    
    public AuthDtos.TokenResponse login(AuthDtos.UserLogin data) {
        log.info("Login attempt for email: {}", data.getEmail());
        
        User user = userRepository.findByEmail(data.getEmail())
            .orElseThrow(() -> {
                log.warn("Login attempt with unknown email: {}", data.getEmail());
                return new UnauthorizedException("Invalid credentials");
            });
        
        if (!passwordEncoder.matches(data.getPassword(), user.getPassword())) {
            log.warn("Login attempt with incorrect password for email: {}", data.getEmail());
            auditService.logUserAction(user.getId(), "LOGIN_FAILED", "Incorrect password");
            throw new UnauthorizedException("Invalid credentials");
        }
        
        log.info("Login successful for user: {}", user.getId());
        auditService.logUserAction(user.getId(), "LOGIN_SUCCESS", "Login successful");
        
        return buildTokenResponse(user);
    }

    @Transactional
    public AuthDtos.TokenResponse loginWithGoogle(String email, String name, String googleId, String avatarUrl) {
        log.info("Google OAuth login for email: {}", email);

        User user = userRepository.findByEmail(email)
            .map(existingUser -> {
                if (existingUser.getGoogleId() == null) {
                    existingUser.setGoogleId(googleId);
                    existingUser.setAvatarUrl(avatarUrl);
                    return userRepository.save(existingUser);
                }
                return existingUser;
            })
            .orElseGet(() -> {
                log.info("Creating new user from Google OAuth: {}", email);
                User newUser = new User();
                newUser.setId(UUID.randomUUID().toString());
                newUser.setEmail(email);
                newUser.setName(name);
                newUser.setRole("professional");
                newUser.setGoogleId(googleId);
                newUser.setAvatarUrl(avatarUrl);
                newUser.setCreatedAt(Instant.now());
                return userRepository.save(newUser);
            });

        log.info("Google OAuth login successful for user: {}", user.getId());
        auditService.logUserAction(user.getId(), "GOOGLE_LOGIN", "Login via Google OAuth");

        return buildTokenResponse(user);
    }
    
    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new UnauthorizedException("User not authenticated");
        }
        
        Object principal = authentication.getPrincipal();
        
        if (principal instanceof User) {
            return (User) principal;
        }
        
        throw new UnauthorizedException("User not authenticated");
    }

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }
    
    private void validateEmailNotExists(String email) {
        if (userRepository.findByEmail(email).isPresent()) {
            log.warn("Registration attempt with existing email: {}", email);
            throw new BadRequestException("Email already registered");
        }
    }
    
    private void validatePassword(String password, String email) {
        if (!passwordValidator.isValid(password)) {
            String errorMessage = passwordValidator.getErrorMessage(
                passwordValidator.validate(password)
            );
            log.warn("Password does not meet criteria for email: {}", email);
            throw new BadRequestException("Password does not meet security criteria: " + errorMessage);
        }
    }
    
    private User createUser(AuthDtos.UserCreate data) {
        User user = new User();
        user.setId(UUID.randomUUID().toString());
        user.setEmail(data.getEmail());
        user.setName(data.getName());
        user.setRole(data.getRole() == null ? "professional" : data.getRole());
        user.setPassword(passwordEncoder.encode(data.getPassword()));
        user.setCreatedAt(Instant.now());
        return user;
    }
    
    private AuthDtos.TokenResponse buildTokenResponse(User user) {
        String token = jwtUtil.createToken(user.getId(), user.getEmail(), user.getRole());
        
        AuthDtos.TokenResponse response = new AuthDtos.TokenResponse();
        response.setToken(token);
        response.setUser(user);
        
        return response;
    }
}
