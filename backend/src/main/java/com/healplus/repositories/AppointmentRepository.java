package com.healplus.repositories;

import com.healplus.entities.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AppointmentRepository extends JpaRepository<Appointment, String> {
  List<Appointment> findByProfessionalIdOrderByScheduledDateAsc(String professionalId);
}