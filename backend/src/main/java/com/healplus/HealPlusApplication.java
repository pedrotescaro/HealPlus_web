package com.healplus;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@SpringBootApplication
@EnableScheduling
@RestController
public class HealPlusApplication {

  public static void main(String[] args) {
    SpringApplication.run(HealPlusApplication.class, args);
  }

  @GetMapping("/")
  public String welcome() {
    return "Welcome to HealPlus API!";
  }
}