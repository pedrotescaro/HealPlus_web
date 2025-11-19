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
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
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
        log.info("Tentativa de registro para email: {}", data.getEmail());
        
        // Verificar se email já existe
        if (userRepository.findByEmail(data.getEmail()).isPresent()) {
            log.warn("Tentativa de registro com email já cadastrado: {}", data.getEmail());
            throw new BadRequestException("Email já cadastrado");
        }
        
        // Validar força da senha
        if (!passwordValidator.isValid(data.getPassword())) {
            String errorMessage = passwordValidator.getErrorMessage(
                passwordValidator.validate(data.getPassword())
            );
            log.warn("Senha não atende aos critérios para email: {}", data.getEmail());
            throw new BadRequestException("Senha não atende aos critérios de segurança: " + errorMessage);
        }
        
        // Criar usuário
        User user = new User();
        user.setId(UUID.randomUUID().toString());
        user.setEmail(data.getEmail());
        user.setName(data.getName());
        user.setRole(data.getRole() == null ? "professional" : data.getRole());
        user.setPassword(passwordEncoder.encode(data.getPassword()));
        user.setCreatedAt(Instant.now());
        
        user = userRepository.save(user);
        log.info("Usuário registrado com sucesso: {}", user.getId());
        
        // Auditoria
        auditService.logUserAction(user.getId(), "REGISTER", "Novo usuário registrado");
        
        // Gerar token
        String token = jwtUtil.createToken(user.getId());
        
        AuthDtos.TokenResponse response = new AuthDtos.TokenResponse();
        response.setToken(token);
        response.setUser(user);
        
        return response;
    }
    
    public AuthDtos.TokenResponse login(AuthDtos.UserLogin data) {
        log.info("Tentativa de login para email: {}", data.getEmail());
        
        User user = userRepository.findByEmail(data.getEmail())
            .orElseThrow(() -> {
                log.warn("Tentativa de login com email não encontrado: {}", data.getEmail());
                return new UnauthorizedException("Credenciais inválidas");
            });
        
        if (!passwordEncoder.matches(data.getPassword(), user.getPassword())) {
            log.warn("Tentativa de login com senha incorreta para email: {}", data.getEmail());
            auditService.logUserAction(user.getId(), "LOGIN_FAILED", "Senha incorreta");
            throw new UnauthorizedException("Credenciais inválidas");
        }
        
        log.info("Login bem-sucedido para usuário: {}", user.getId());
        auditService.logUserAction(user.getId(), "LOGIN_SUCCESS", "Login realizado com sucesso");
        
        String token = jwtUtil.createToken(user.getId());
        
        AuthDtos.TokenResponse response = new AuthDtos.TokenResponse();
        response.setToken(token);
        response.setUser(user);
        
        return response;
    }
    
    public User getCurrentUser() {
        Object principal = org.springframework.security.core.context.SecurityContextHolder
            .getContext()
            .getAuthentication()
            .getPrincipal();
        
        if (principal instanceof User) {
            return (User) principal;
        }
        
        throw new UnauthorizedException("Usuário não autenticado");
    }
}

