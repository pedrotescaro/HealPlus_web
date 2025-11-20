package com.healplus.services;

import com.healplus.dto.AuthDtos;
import com.healplus.entities.User;
import com.healplus.exception.BadRequestException;
import com.healplus.exception.UnauthorizedException;
import com.healplus.repositories.UserRepository;
import com.healplus.security.JwtUtil;
import com.healplus.security.PasswordValidator;
import com.healplus.audit.AuditService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {
    
    @Mock
    private UserRepository userRepository;
    
    @Mock
    private PasswordEncoder passwordEncoder;
    
    @Mock
    private JwtUtil jwtUtil;
    
    @Mock
    private PasswordValidator passwordValidator;
    
    @Mock
    private AuditService auditService;
    
    @InjectMocks
    private AuthService authService;
    
    private User testUser;
    private AuthDtos.UserCreate userCreateDto;
    private AuthDtos.UserLogin userLoginDto;
    
    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(UUID.randomUUID().toString());
        testUser.setEmail("test@example.com");
        testUser.setName("Test User");
        testUser.setPassword("encodedPassword");
        testUser.setRole("professional");
        testUser.setCreatedAt(Instant.now());
        
        userCreateDto = new AuthDtos.UserCreate();
        userCreateDto.setEmail("newuser@example.com");
        userCreateDto.setName("New User");
        userCreateDto.setPassword("StrongPass123!");
        userCreateDto.setRole("professional");
        
        userLoginDto = new AuthDtos.UserLogin();
        userLoginDto.setEmail("test@example.com");
        userLoginDto.setPassword("password123");
    }
    
    @Test
    void testRegister_Success() {
        // Arrange
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.empty());
        when(passwordValidator.isValid(anyString())).thenReturn(true);
        when(passwordEncoder.encode(anyString())).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(testUser);
        when(jwtUtil.createToken(anyString())).thenReturn("jwt-token");
        
        // Act
        AuthDtos.TokenResponse response = authService.register(userCreateDto);
        
        // Assert
        assertNotNull(response);
        assertEquals("jwt-token", response.getToken());
        assertNotNull(response.getUser());
        verify(userRepository, times(1)).save(any(User.class));
        verify(auditService, times(1)).logUserAction(anyString(), eq("REGISTER"), anyString());
    }
    
    @Test
    void testRegister_EmailAlreadyExists() {
        // Arrange
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(testUser));
        
        // Act & Assert
        assertThrows(BadRequestException.class, () -> authService.register(userCreateDto));
        verify(userRepository, never()).save(any(User.class));
    }
    
    @Test
    void testRegister_WeakPassword() {
        // Arrange
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.empty());
        when(passwordValidator.isValid(anyString())).thenReturn(false);
        when(passwordValidator.validate(anyString())).thenReturn(
            org.passay.RuleResult.validate()
        );
        
        // Act & Assert
        assertThrows(BadRequestException.class, () -> authService.register(userCreateDto));
        verify(userRepository, never()).save(any(User.class));
    }
    
    @Test
    void testLogin_Success() {
        // Arrange
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches(anyString(), anyString())).thenReturn(true);
        when(jwtUtil.createToken(anyString())).thenReturn("jwt-token");
        
        // Act
        AuthDtos.TokenResponse response = authService.login(userLoginDto);
        
        // Assert
        assertNotNull(response);
        assertEquals("jwt-token", response.getToken());
        assertNotNull(response.getUser());
        verify(auditService, times(1)).logUserAction(anyString(), eq("LOGIN_SUCCESS"), anyString());
    }
    
    @Test
    void testLogin_UserNotFound() {
        // Arrange
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.empty());
        
        // Act & Assert
        assertThrows(UnauthorizedException.class, () -> authService.login(userLoginDto));
        verify(jwtUtil, never()).createToken(anyString());
    }
    
    @Test
    void testLogin_WrongPassword() {
        // Arrange
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches(anyString(), anyString())).thenReturn(false);
        
        // Act & Assert
        assertThrows(UnauthorizedException.class, () -> authService.login(userLoginDto));
        verify(auditService, times(1)).logUserAction(anyString(), eq("LOGIN_FAILED"), anyString());
        verify(jwtUtil, never()).createToken(anyString());
    }
}

