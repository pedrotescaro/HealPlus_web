package com.healplus.security;

import org.passay.*;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;


@Component
public class PasswordValidator {
    
    private final org.passay.PasswordValidator validator;
    
    public PasswordValidator() {
        this.validator = new org.passay.PasswordValidator(Arrays.asList(
            // Mínimo 8 caracteres
            new LengthRule(8, 128),
            // Pelo menos uma letra maiúscula
            new CharacterRule(EnglishCharacterData.UpperCase, 1),
            // Pelo menos uma letra minúscula
            new CharacterRule(EnglishCharacterData.LowerCase, 1),
            // Pelo menos um dígito
            new CharacterRule(EnglishCharacterData.Digit, 1),
            // Pelo menos um caractere especial
            new CharacterRule(EnglishCharacterData.Special, 1),
            // Não permitir sequências comuns
            new IllegalSequenceRule(EnglishSequenceData.Alphabetical, 5, false),
            new IllegalSequenceRule(EnglishSequenceData.Numerical, 5, false),
            new IllegalSequenceRule(EnglishSequenceData.USQwerty, 5, false),
            // Não permitir espaços em branco
            new WhitespaceRule()
        ));
    }
    
    public RuleResult validate(String password) {
        return validator.validate(new PasswordData(password));
    }
    
    public boolean isValid(String password) {
        return validate(password).isValid();
    }
    
    public String getErrorMessage(RuleResult result) {
        List<String> messages = validator.getMessages(result);
        return String.join(", ", messages);
    }
}

