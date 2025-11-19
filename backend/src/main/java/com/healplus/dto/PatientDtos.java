package com.healplus.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class PatientDtos {
  @Data
  public static class PatientCreate {
    @NotBlank(message = "Nome é obrigatório")
    @Size(min = 3, max = 100, message = "Nome deve ter entre 3 e 100 caracteres")
    private String name;
    
    @NotNull(message = "Idade é obrigatória")
    @Min(value = 0, message = "Idade deve ser maior ou igual a 0")
    @Max(value = 150, message = "Idade deve ser menor ou igual a 150")
    private Integer age;
    
    @NotBlank(message = "Gênero é obrigatório")
    @Pattern(regexp = "^(male|female|other)$", message = "Gênero deve ser male, female ou other")
    private String gender;
    
    @Size(max = 20, message = "Contato deve ter no máximo 20 caracteres")
    private String contact;
  }
  
  @Data
  public static class PatientUpdate {
    @Size(min = 3, max = 100, message = "Nome deve ter entre 3 e 100 caracteres")
    private String name;
    
    @Min(value = 0, message = "Idade deve ser maior ou igual a 0")
    @Max(value = 150, message = "Idade deve ser menor ou igual a 150")
    private Integer age;
    
    @Pattern(regexp = "^(male|female|other)$", message = "Gênero deve ser male, female ou other")
    private String gender;
    
    @Size(max = 20, message = "Contato deve ter no máximo 20 caracteres")
    private String contact;
  }
}