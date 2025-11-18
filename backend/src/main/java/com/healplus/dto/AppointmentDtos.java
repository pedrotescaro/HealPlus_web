package com.healplus.dto;

import lombok.Data;
import java.time.OffsetDateTime;

@Data
public class AppointmentDtos {
  @Data
  public static class AppointmentCreate {
    private String patientId;
    private OffsetDateTime scheduledDate;
    private String notes;
  }
}