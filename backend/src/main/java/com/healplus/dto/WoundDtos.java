package com.healplus.dto;

import lombok.Data;
import java.util.Map;

@Data
public class WoundDtos {
  @Data
  public static class WoundAnalysisCreate {
    private String patientId;
    private String imageBase64;
    private Map<String, Object> timersData;
  }
}