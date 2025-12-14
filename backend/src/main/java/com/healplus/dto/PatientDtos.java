package com.healplus.dto;

import jakarta.validation.constraints.*;

public class PatientDtos {
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
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public Integer getAge() { return age; }
    public void setAge(Integer age) { this.age = age; }
    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }
    public String getContact() { return contact; }
    public void setContact(String contact) { this.contact = contact; }
  }
  
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
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public Integer getAge() { return age; }
    public void setAge(Integer age) { this.age = age; }
    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }
    public String getContact() { return contact; }
    public void setContact(String contact) { this.contact = contact; }
  }
}
