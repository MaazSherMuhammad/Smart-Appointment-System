package com.project.appointment;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class SmartAppointmentApplication {
    public static void main(String[] args) {
        SpringApplication.run(SmartAppointmentApplication.class, args);
    }
}
