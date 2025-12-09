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
    private String name;
    
    @Pattern(regexp = "^(professional|admin)$", message = "Role deve ser professional ou admin")
    private String role;

    public UserCreate() {}

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
  }
  
  public static class UserLogin {
    @NotBlank(message = "Email é obrigatório")
    @Email(message = "Email deve ter um formato válido")
    private String email;
    
    @NotBlank(message = "Senha é obrigatória")
    private String password;

    public UserLogin() {}

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

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
}
