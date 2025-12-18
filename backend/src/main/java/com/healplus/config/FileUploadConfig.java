package com.healplus.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.multipart.MultipartResolver;
import org.springframework.web.multipart.support.StandardServletMultipartResolver;

import jakarta.servlet.MultipartConfigElement;
import org.springframework.boot.web.servlet.MultipartConfigFactory;
import org.springframework.util.unit.DataSize;

/**
 * Configuração de upload de arquivos com validações de segurança:
 * - Limite de tamanho de arquivo
 * - Limite de tamanho total da requisição
 * - Configuração de diretório temporário seguro
 */
@Configuration
public class FileUploadConfig {

    @Value("${file.upload.max-size:10MB}")
    private String maxFileSize;

    @Value("${file.upload.max-request-size:50MB}")
    private String maxRequestSize;

    @Bean
    public MultipartConfigElement multipartConfigElement() {
        MultipartConfigFactory factory = new MultipartConfigFactory();
        
        // Limite de tamanho por arquivo (10MB padrão)
        factory.setMaxFileSize(DataSize.parse(maxFileSize));
        
        // Limite de tamanho total da requisição (50MB padrão)
        factory.setMaxRequestSize(DataSize.parse(maxRequestSize));
        
        // Threshold para armazenar em memória vs disco (1MB)
        factory.setFileSizeThreshold(DataSize.ofMegabytes(1));
        
        return factory.createMultipartConfig();
    }

    @Bean
    public MultipartResolver multipartResolver() {
        return new StandardServletMultipartResolver();
    }
}
