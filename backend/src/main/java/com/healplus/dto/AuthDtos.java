package com.healplus.dto;

import lombok.Data;

@Data
public class AuthDtos {
  @Data
  public static class UserCreate {
    private String email;
    private String password;
    private String name;
    private String role;
  }
  @Data
  public static class UserLogin {
    private String email;
    private String password;
  }
  @Data
  public static class TokenResponse {
    private String token;
    private Object user;
  }
}