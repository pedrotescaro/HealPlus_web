package com.healplus.dto;

import lombok.Data;

@Data
public class PatientDtos {
  @Data
  public static class PatientCreate {
    private String name;
    private int age;
    private String gender;
    private String contact;
  }
}