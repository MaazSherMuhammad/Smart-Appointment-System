package com.project.appointment.controller;

import com.project.appointment.dto.request.ServiceProviderRequest;
import com.project.appointment.dto.response.ApiResponse;
import com.project.appointment.dto.response.ServiceProviderResponse;
import com.project.appointment.enums.CategoryType;
import com.project.appointment.service.ServiceProviderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * ServiceProviderController – maps to:
 *   NEW/healthcare.html, business.html, etc. → GET /api/providers/category/{type}
 *   dashboard/doctor.html                    → GET /api/providers/me
 *   dashboard/doctor_category.html           → GET /api/providers/category/HEALTHCARE
 */
@RestController
@RequestMapping("/api/providers")
@RequiredArgsConstructor
public class ServiceProviderController {

    private final ServiceProviderService serviceProviderService;

    /** List providers by numeric category ID */
    @GetMapping("/category-id/{categoryId}")
    public ResponseEntity<ApiResponse<List<ServiceProviderResponse>>> getByCategory(
            @PathVariable Long categoryId) {
        return ResponseEntity.ok(ApiResponse.success(serviceProviderService.getByCategory(categoryId)));
    }

    /** List by CategoryType string e.g. HEALTHCARE – used by booking pages */
    @GetMapping("/category/{type}")
    public ResponseEntity<ApiResponse<List<ServiceProviderResponse>>> getByType(
            @PathVariable CategoryType type) {
        return ResponseEntity.ok(ApiResponse.success(serviceProviderService.getByCategoryType(type)));
    }

    /** Search by name */
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<ServiceProviderResponse>>> search(
            @RequestParam String name) {
        return ResponseEntity.ok(ApiResponse.success(serviceProviderService.search(name)));
    }

    /** Provider detail */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ServiceProviderResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(serviceProviderService.getById(id)));
    }

    /** dashboard/doctor.html – own profile */
    @GetMapping("/me")
    @PreAuthorize("hasRole('SERVICE_PROVIDER')")
    public ResponseEntity<ApiResponse<ServiceProviderResponse>> getMyProfile() {
        return ResponseEntity.ok(ApiResponse.success(serviceProviderService.getMyProfile()));
    }

    /** Create provider profile */
    @PostMapping
    @PreAuthorize("hasRole('SERVICE_PROVIDER')")
    public ResponseEntity<ApiResponse<ServiceProviderResponse>> create(
            @Valid @RequestBody ServiceProviderRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Profile created", serviceProviderService.createProfile(request)));
    }

    /** Update provider profile */
    @PutMapping("/me")
    @PreAuthorize("hasRole('SERVICE_PROVIDER')")
    public ResponseEntity<ApiResponse<ServiceProviderResponse>> update(
            @Valid @RequestBody ServiceProviderRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Profile updated", serviceProviderService.updateProfile(request)));
    }
}
