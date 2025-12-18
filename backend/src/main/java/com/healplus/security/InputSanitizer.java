package com.healplus.security;

import org.springframework.stereotype.Component;
import org.springframework.web.util.HtmlUtils;

import java.util.regex.Pattern;

/**
 * Utilitário para sanitização de entrada de dados, prevenindo XSS e Injection attacks.
 */
@Component
public class InputSanitizer {

    // Padrões perigosos para SQL Injection
    private static final Pattern SQL_INJECTION_PATTERN = Pattern.compile(
        "('|--|;|/\\*|\\*/|xp_|sp_|0x|union|select|insert|update|delete|drop|create|alter|exec|execute|declare|cast|convert)",
        Pattern.CASE_INSENSITIVE
    );
    
    // Padrões perigosos para XSS
    private static final Pattern XSS_PATTERN = Pattern.compile(
        "(<script|javascript:|on\\w+=|<iframe|<object|<embed|<form|expression\\(|url\\(|data:text/html)",
        Pattern.CASE_INSENSITIVE
    );
    
    // Padrões perigosos para Command Injection
    private static final Pattern COMMAND_INJECTION_PATTERN = Pattern.compile(
        "(\\||;|&|`|\\$\\(|\\$\\{|\\\\n|\\\\r|%0a|%0d)",
        Pattern.CASE_INSENSITIVE
    );
    
    // Padrões perigosos para Path Traversal
    private static final Pattern PATH_TRAVERSAL_PATTERN = Pattern.compile(
        "(\\.\\./|\\.\\.\\\\|%2e%2e%2f|%2e%2e/|%2e%2e%5c)",
        Pattern.CASE_INSENSITIVE
    );

    /**
     * Sanitiza string para prevenir XSS escapando caracteres HTML.
     */
    public String sanitizeForXSS(String input) {
        if (input == null) {
            return null;
        }
        return HtmlUtils.htmlEscape(input);
    }
    
    /**
     * Remove tags HTML de uma string.
     */
    public String stripHtmlTags(String input) {
        if (input == null) {
            return null;
        }
        return input.replaceAll("<[^>]*>", "");
    }
    
    /**
     * Valida se a string contém padrões de SQL Injection.
     */
    public boolean containsSqlInjection(String input) {
        if (input == null) {
            return false;
        }
        return SQL_INJECTION_PATTERN.matcher(input).find();
    }
    
    /**
     * Valida se a string contém padrões de XSS.
     */
    public boolean containsXssPatterns(String input) {
        if (input == null) {
            return false;
        }
        return XSS_PATTERN.matcher(input).find();
    }
    
    /**
     * Valida se a string contém padrões de Command Injection.
     */
    public boolean containsCommandInjection(String input) {
        if (input == null) {
            return false;
        }
        return COMMAND_INJECTION_PATTERN.matcher(input).find();
    }
    
    /**
     * Valida se a string contém padrões de Path Traversal.
     */
    public boolean containsPathTraversal(String input) {
        if (input == null) {
            return false;
        }
        return PATH_TRAVERSAL_PATTERN.matcher(input).find();
    }
    
    /**
     * Valida se a entrada é segura (não contém nenhum padrão perigoso).
     */
    public boolean isSafeInput(String input) {
        if (input == null) {
            return true;
        }
        return !containsSqlInjection(input) && 
               !containsXssPatterns(input) && 
               !containsCommandInjection(input) &&
               !containsPathTraversal(input);
    }
    
    /**
     * Sanitiza entrada removendo todos os padrões perigosos.
     */
    public String sanitizeCompletely(String input) {
        if (input == null) {
            return null;
        }
        
        String sanitized = input;
        
        // Remove tags HTML
        sanitized = stripHtmlTags(sanitized);
        
        // Escapa caracteres especiais HTML
        sanitized = HtmlUtils.htmlEscape(sanitized);
        
        // Remove caracteres de controle
        sanitized = sanitized.replaceAll("[\\x00-\\x08\\x0B\\x0C\\x0E-\\x1F]", "");
        
        return sanitized.trim();
    }
    
    /**
     * Valida e sanitiza um UUID/ID.
     */
    public String sanitizeId(String id) {
        if (id == null) {
            return null;
        }
        // IDs devem conter apenas caracteres alfanuméricos e hífens
        if (!id.matches("^[a-zA-Z0-9\\-]+$")) {
            throw new IllegalArgumentException("ID inválido");
        }
        return id;
    }
    
    /**
     * Valida um email.
     */
    public boolean isValidEmail(String email) {
        if (email == null || email.isEmpty()) {
            return false;
        }
        String emailRegex = "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$";
        return email.matches(emailRegex) && email.length() <= 254;
    }
}
