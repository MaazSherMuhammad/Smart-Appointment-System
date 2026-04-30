package com.project.appointment.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class ServiceProviderResponse {
    private Long id;
    private String businessName;
    private String specialization;
    private String description;
    private String address;
    private LocalTime workStartTime;
    private LocalTime workEndTime;
    private Integer slotDurationMinutes;
    private boolean isActive;

    private Long userId;
    private String ownerName;
    private String ownerEmail;

    private Long categoryId;
    private String categoryName;
    private String categoryType;
}
