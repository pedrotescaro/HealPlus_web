package com.healplus.security;

import org.apache.tika.Tika;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.Set;
import java.util.UUID;

/**
 * Validador de arquivos para upload seguro
 * - Valida MIME type real do arquivo (não confia no header)
 * - Bloqueia arquivos executáveis
 * - Gera nomes seguros para arquivos
 */
@Component
public class FileValidator {

    private final Tika tika = new Tika();

    // MIME types permitidos para imagens médicas
    private static final Set<String> ALLOWED_IMAGE_TYPES = Set.of(
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
        "image/bmp"
    );

    // MIME types permitidos para documentos
    private static final Set<String> ALLOWED_DOCUMENT_TYPES = Set.of(
        "application/pdf",
        "text/plain",
        "application/json"
    );

    // Extensões bloqueadas (executáveis)
    private static final Set<String> BLOCKED_EXTENSIONS = Set.of(
        ".exe", ".bat", ".cmd", ".sh", ".ps1", ".vbs", ".js",
        ".jar", ".war", ".class", ".dll", ".so", ".msi",
        ".php", ".asp", ".aspx", ".jsp", ".py", ".rb", ".pl"
    );

    /**
     * Valida se o arquivo é uma imagem permitida
     */
    public ValidationResult validateImage(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return ValidationResult.error("Arquivo não fornecido");
        }

        // Verificar tamanho (máximo 10MB)
        if (file.getSize() > 10 * 1024 * 1024) {
            return ValidationResult.error("Arquivo muito grande. Máximo permitido: 10MB");
        }

        // Verificar extensão bloqueada
        String originalName = file.getOriginalFilename();
        if (originalName != null && isBlockedExtension(originalName)) {
            return ValidationResult.error("Tipo de arquivo não permitido");
        }

        // Detectar MIME type real
        try (InputStream is = file.getInputStream()) {
            String detectedType = tika.detect(is);
            
            if (!ALLOWED_IMAGE_TYPES.contains(detectedType)) {
                return ValidationResult.error("Tipo de imagem não permitido: " + detectedType);
            }
            
            return ValidationResult.success(detectedType);
        } catch (IOException e) {
            return ValidationResult.error("Erro ao processar arquivo");
        }
    }

    /**
     * Valida se o arquivo é um documento permitido
     */
    public ValidationResult validateDocument(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return ValidationResult.error("Arquivo não fornecido");
        }

        // Verificar tamanho (máximo 50MB)
        if (file.getSize() > 50 * 1024 * 1024) {
            return ValidationResult.error("Arquivo muito grande. Máximo permitido: 50MB");
        }

        // Verificar extensão bloqueada
        String originalName = file.getOriginalFilename();
        if (originalName != null && isBlockedExtension(originalName)) {
            return ValidationResult.error("Tipo de arquivo não permitido");
        }

        // Detectar MIME type real
        try (InputStream is = file.getInputStream()) {
            String detectedType = tika.detect(is);
            
            if (!ALLOWED_DOCUMENT_TYPES.contains(detectedType) && 
                !ALLOWED_IMAGE_TYPES.contains(detectedType)) {
                return ValidationResult.error("Tipo de arquivo não permitido: " + detectedType);
            }
            
            return ValidationResult.success(detectedType);
        } catch (IOException e) {
            return ValidationResult.error("Erro ao processar arquivo");
        }
    }

    /**
     * Gera um nome seguro para o arquivo (UUID + extensão válida)
     */
    public String generateSecureFilename(String originalFilename, String mimeType) {
        String extension = getExtensionForMimeType(mimeType);
        String uniqueId = UUID.randomUUID().toString();
        byte[] randomBytes = new byte[8];
        new SecureRandom().nextBytes(randomBytes);
        String randomPart = Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);
        
        return uniqueId + "_" + randomPart + extension;
    }

    /**
     * Verifica se a extensão é bloqueada
     */
    private boolean isBlockedExtension(String filename) {
        String lower = filename.toLowerCase();
        for (String ext : BLOCKED_EXTENSIONS) {
            if (lower.endsWith(ext)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Obtém extensão segura baseada no MIME type real
     */
    private String getExtensionForMimeType(String mimeType) {
        return switch (mimeType) {
            case "image/jpeg", "image/jpg" -> ".jpg";
            case "image/png" -> ".png";
            case "image/gif" -> ".gif";
            case "image/webp" -> ".webp";
            case "image/bmp" -> ".bmp";
            case "application/pdf" -> ".pdf";
            case "text/plain" -> ".txt";
            case "application/json" -> ".json";
            default -> ".bin";
        };
    }

    /**
     * Resultado da validação
     */
    public record ValidationResult(boolean valid, String message, String detectedMimeType) {
        public static ValidationResult success(String mimeType) {
            return new ValidationResult(true, "Arquivo válido", mimeType);
        }
        
        public static ValidationResult error(String message) {
            return new ValidationResult(false, message, null);
        }
    }
}
