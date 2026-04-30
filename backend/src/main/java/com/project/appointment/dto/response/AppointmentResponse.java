package com.project.appointment.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class AppointmentResponse {
    private Long id;
    private String tokenNumber;
    private LocalDate appointmentDate;
    private LocalTime appointmentTime;
    private String status;
    private String notes;
    private String cancellationReason;

    // User info
    private Long userId;
    private String userName;

    // Service provider info
    private Long serviceProviderId;
    private String serviceProviderName;
    private String specialization;

    // Category info
    private Long categoryId;
    private String categoryName;
    private String categoryType;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
