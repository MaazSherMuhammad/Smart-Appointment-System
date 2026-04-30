package com.project.appointment.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CancelAppointmentRequest {

    @NotNull(message = "Appointment ID is required")
    private Long appointmentId;

    private String reason; // Optional – defaults to "Cancelled by user"
}
