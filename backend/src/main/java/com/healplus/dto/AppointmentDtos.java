package com.healplus.dto;

import lombok.Data;
import java.time.OffsetDateTime;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

@Data
public class AppointmentDtos {
  @Data
  public static class AppointmentCreate {
    @NotBlank(message = "Paciente é obrigatório")
    private String patientId;
    @NotNull(message = "Data agendada é obrigatória")
    private OffsetDateTime scheduledDate;
    @Size(max = 500, message = "Notas devem ter no máximo 500 caracteres")
    private String notes;
    public String getPatientId() { return patientId; }
    public OffsetDateTime getScheduledDate() { return scheduledDate; }
    public String getNotes() { return notes; }
  }
}