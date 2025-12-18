package com.healplus.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.time.Instant;
import java.util.List;

/**
 * Padronização de respostas da API REST
 * Todas as respostas seguem o formato:
 * {
 *   "status": "success" | "error",
 *   "message": "mensagem descritiva",
 *   "data": {},
 *   "errors": [],
 *   "timestamp": "2024-01-01T00:00:00Z"
 * }
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {
    
    public enum Status {
        success, error
    }
    
    private Status status;
    private String message;
    private T data;
    private List<ErrorDetail> errors;
    private Instant timestamp;
    private PageInfo page;
    
    // Construtor privado - usar builders
    private ApiResponse() {
        this.timestamp = Instant.now();
    }
    
    // ==================== Builders de Sucesso ====================
    
    public static <T> ApiResponse<T> success(T data) {
        ApiResponse<T> response = new ApiResponse<>();
        response.status = Status.success;
        response.data = data;
        return response;
    }
    
    public static <T> ApiResponse<T> success(T data, String message) {
        ApiResponse<T> response = new ApiResponse<>();
        response.status = Status.success;
        response.message = message;
        response.data = data;
        return response;
    }
    
    public static <T> ApiResponse<T> successMessage(String message) {
        ApiResponse<T> response = new ApiResponse<>();
        response.status = Status.success;
        response.message = message;
        return response;
    }
    
    public static <T> ApiResponse<T> successWithPage(T data, int page, int size, long totalElements, int totalPages) {
        ApiResponse<T> response = new ApiResponse<>();
        response.status = Status.success;
        response.data = data;
        response.page = new PageInfo(page, size, totalElements, totalPages);
        return response;
    }
    
    // ==================== Builders de Erro ====================
    
    public static <T> ApiResponse<T> error(String message) {
        ApiResponse<T> response = new ApiResponse<>();
        response.status = Status.error;
        response.message = message;
        return response;
    }
    
    public static <T> ApiResponse<T> error(String message, List<ErrorDetail> errors) {
        ApiResponse<T> response = new ApiResponse<>();
        response.status = Status.error;
        response.message = message;
        response.errors = errors;
        return response;
    }
    
    public static <T> ApiResponse<T> validationError(String message, List<ErrorDetail> errors) {
        ApiResponse<T> response = new ApiResponse<>();
        response.status = Status.error;
        response.message = message;
        response.errors = errors;
        return response;
    }
    
    // ==================== Error Detail Inner Class ====================
    
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class ErrorDetail {
        private String field;
        private String message;
        private String code;
        private Object rejectedValue;
        
        public ErrorDetail() {}
        
        public ErrorDetail(String message) {
            this.message = message;
        }
        
        public ErrorDetail(String field, String message) {
            this.field = field;
            this.message = message;
        }
        
        public ErrorDetail(String field, String message, Object rejectedValue) {
            this.field = field;
            this.message = message;
            this.rejectedValue = rejectedValue;
        }
        
        public ErrorDetail(String field, String message, String code, Object rejectedValue) {
            this.field = field;
            this.message = message;
            this.code = code;
            this.rejectedValue = rejectedValue;
        }
        
        // Getters e Setters
        public String getField() { return field; }
        public void setField(String field) { this.field = field; }
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
        public String getCode() { return code; }
        public void setCode(String code) { this.code = code; }
        public Object getRejectedValue() { return rejectedValue; }
        public void setRejectedValue(Object rejectedValue) { this.rejectedValue = rejectedValue; }
    }
    
    // ==================== Page Info Inner Class ====================
    
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class PageInfo {
        private int number;
        private int size;
        private long totalElements;
        private int totalPages;
        
        public PageInfo() {}
        
        public PageInfo(int number, int size, long totalElements, int totalPages) {
            this.number = number;
            this.size = size;
            this.totalElements = totalElements;
            this.totalPages = totalPages;
        }
        
        // Getters e Setters
        public int getNumber() { return number; }
        public void setNumber(int number) { this.number = number; }
        public int getSize() { return size; }
        public void setSize(int size) { this.size = size; }
        public long getTotalElements() { return totalElements; }
        public void setTotalElements(long totalElements) { this.totalElements = totalElements; }
        public int getTotalPages() { return totalPages; }
        public void setTotalPages(int totalPages) { this.totalPages = totalPages; }
    }
    
    // ==================== Getters e Setters ====================
    
    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public T getData() { return data; }
    public void setData(T data) { this.data = data; }
    public List<ErrorDetail> getErrors() { return errors; }
    public void setErrors(List<ErrorDetail> errors) { this.errors = errors; }
    public Instant getTimestamp() { return timestamp; }
    public void setTimestamp(Instant timestamp) { this.timestamp = timestamp; }
    public PageInfo getPage() { return page; }
    public void setPage(PageInfo page) { this.page = page; }
}
