package com.project.appointment.dto.request;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class RescheduleAppointmentRequest {

    @NotNull(message = "Appointment ID is required")
    private Long appointmentId;

    @NotNull(message = "New date is required")
    @FutureOrPresent(message = "New date must be today or in the future")
    private LocalDate newDate;

    @NotNull(message = "New time is required")
    private LocalTime newTime;

    private Long newSlotId;

    private String reason;
}
