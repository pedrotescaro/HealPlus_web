package com.healplus.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class AuthDtos {
  @Data
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
  }
  
  @Data
  public static class UserLogin {
    @NotBlank(message = "Email é obrigatório")
    @Email(message = "Email deve ter um formato válido")
    private String email;
    
    @NotBlank(message = "Senha é obrigatória")
    private String password;
  }
  
  @Data
  public static class TokenResponse {
    private String token;
    private Object user;
  }
}