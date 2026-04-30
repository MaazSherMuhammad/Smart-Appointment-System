package com.project.appointment.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalTime;

@Data
public class ServiceProviderRequest {

    @NotBlank(message = "Business name is required")
    private String businessName;

    @NotNull(message = "Category ID is required")
    private Long categoryId;

    private String specialization;
    private String description;
    private String address;
    private LocalTime workStartTime;
    private LocalTime workEndTime;
    private Integer slotDurationMinutes;
}
