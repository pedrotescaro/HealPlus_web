package com.healplus.dto;

import jakarta.validation.constraints.*;

public class AuthDtos {
  
  public static class UserCreate {
    @NotBlank(message = "Email é obrigatório")
    @Email(message = "Email deve ter um formato válido")
    @Size(max = 100, message = "Email deve ter no máximo 100 caracteres")
    private String email;
    
    @NotBlank(message = "Senha é obrigatória")
    @Size(min = 8, max = 128, message = "Senha deve ter entre 8 e 128 caracteres")
    private String password;
    
    @NotBlank(message = "Nome é obrigatório")
    @Size(min = 3, max = 100, message = "Nome deve ter entre 3 e 100 caracteres")
    @Pattern(regexp = "^[\\p{L}\\s'-]+$", message = "Nome deve conter apenas letras, espaços, apóstrofos e hífens")
    private String name;
    
    @Pattern(regexp = "^(professional|admin)$", message = "Role deve ser professional ou admin")
    private String role;

    public UserCreate() {}

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email != null ? email.trim().toLowerCase() : null; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name != null ? name.trim() : null; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
  }
  
  public static class UserLogin {
    @NotBlank(message = "Email é obrigatório")
    @Email(message = "Email deve ter um formato válido")
    @Size(max = 100, message = "Email deve ter no máximo 100 caracteres")
    private String email;
    
    @NotBlank(message = "Senha é obrigatória")
    @Size(max = 128, message = "Senha deve ter no máximo 128 caracteres")
    private String password;

    public UserLogin() {}

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email != null ? email.trim().toLowerCase() : null; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
  }
  
  public static class TokenResponse {
    private String token;
    private Object user;

    public TokenResponse() {}

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public Object getUser() { return user; }
    public void setUser(Object user) { this.user = user; }
  }

  public static class GoogleAuthRequest {
    @NotBlank(message = "Email é obrigatório")
    @Email(message = "Email deve ter um formato válido")
    @Size(max = 100, message = "Email deve ter no máximo 100 caracteres")
    private String email;
    
    @NotBlank(message = "Nome é obrigatório")
    @Size(min = 1, max = 100, message = "Nome deve ter entre 1 e 100 caracteres")
    private String name;
    
    @NotBlank(message = "Google ID é obrigatório")
    @Size(max = 255, message = "Google ID deve ter no máximo 255 caracteres")
    private String googleId;
    
    @Size(max = 500, message = "URL do avatar deve ter no máximo 500 caracteres")
    private String avatarUrl;

    public GoogleAuthRequest() {}

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email != null ? email.trim().toLowerCase() : null; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name != null ? name.trim() : null; }

    public String getGoogleId() { return googleId; }
    public void setGoogleId(String googleId) { this.googleId = googleId; }

    public String getAvatarUrl() { return avatarUrl; }
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }
  }
}
