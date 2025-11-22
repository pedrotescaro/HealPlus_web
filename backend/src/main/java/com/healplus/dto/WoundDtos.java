package com.healplus.dto;

import lombok.Data;
import java.util.Map;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Data
public class WoundDtos {
  @Data
  public static class WoundAnalysisCreate {
    @NotBlank(message = "Paciente é obrigatório")
    private String patientId;
    @NotBlank(message = "Imagem é obrigatória")
    private String imageBase64;
    @NotNull(message = "Dados de temporização são obrigatórios")
    private Map<String, Object> timersData;
    public String getPatientId() { return patientId; }
    public String getImageBase64() { return imageBase64; }
    public Map<String, Object> getTimersData() { return timersData; }
  }
}