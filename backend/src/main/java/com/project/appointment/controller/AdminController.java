package com.project.appointment.controller;

import com.project.appointment.dto.response.ApiResponse;
import com.project.appointment.dto.response.AppointmentResponse;
import com.project.appointment.dto.response.ServiceProviderResponse;
import com.project.appointment.dto.response.UserResponse;
import com.project.appointment.enums.CategoryType;
import com.project.appointment.service.AdminService;
import com.project.appointment.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * AdminController – maps to:
 *   dashboard/admin.html              → GET /api/admin/dashboard
 *   dashboard/admin_healthcare.html   → GET /api/admin/appointments/category/HEALTHCARE
 *   dashboard/admin_business.html     → GET /api/admin/appointments/category/BUSINESS
 *   dashboard/admin_educational.html  → GET /api/admin/appointments/category/EDUCATIONAL
 *   dashboard/admin_government.html   → GET /api/admin/appointments/category/GOVERNMENT
 *   dashboard/admin_personal.html     → GET /api/admin/appointments/category/PERSONAL
 *   dashboard/admin_technical.html    → GET /api/admin/appointments/category/TECHNICAL
 */
@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;
    private final CategoryService categoryService;

    // ── Dashboard ─────────────────────────────────────────────────
    /** admin.html */
    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<Map<String, Object>>> dashboard() {
        return ResponseEntity.ok(ApiResponse.success(adminService.getDashboardStats()));
    }

    // ── User management ───────────────────────────────────────────
    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getAllUsers() {
        return ResponseEntity.ok(ApiResponse.success(adminService.getAllUsers()));
    }

    @GetMapping("/providers")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getAllProviders() {
        return ResponseEntity.ok(ApiResponse.success(adminService.getAllServiceProviders()));
    }

    @PatchMapping("/users/{userId}/toggle-status")
    public ResponseEntity<ApiResponse<Void>> toggleUserStatus(@PathVariable Long userId) {
        adminService.toggleUserStatus(userId);
        return ResponseEntity.ok(ApiResponse.success("User status toggled", null));
    }

    @PatchMapping("/users/{userId}/promote")
    public ResponseEntity<ApiResponse<Void>> promoteToProvider(
            @PathVariable Long userId,
            @RequestParam Long categoryId) {
        adminService.promoteToServiceProvider(userId, categoryId);
        return ResponseEntity.ok(ApiResponse.success("User promoted to service provider", null));
    }

    // ── Appointment management ────────────────────────────────────
    /** admin.html – all appointments */
    @GetMapping("/appointments")
    public ResponseEntity<ApiResponse<List<AppointmentResponse>>> allAppointments() {
        return ResponseEntity.ok(ApiResponse.success(adminService.getAllAppointments()));
    }

    /** admin_healthcare.html, admin_business.html, etc. */
    @GetMapping("/appointments/category/{type}")
    public ResponseEntity<ApiResponse<List<AppointmentResponse>>> appointmentsByCategory(
            @PathVariable CategoryType type) {
        var category = categoryService.getByType(type);
        return ResponseEntity.ok(ApiResponse.success(adminService.getAppointmentsByCategory(category.getId())));
    }

    @PatchMapping("/appointments/{id}/confirm")
    public ResponseEntity<ApiResponse<AppointmentResponse>> confirmAppointment(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Appointment confirmed", adminService.confirmAppointment(id)));
    }

    @PatchMapping("/appointments/{id}/complete")
    public ResponseEntity<ApiResponse<AppointmentResponse>> completeAppointment(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Appointment marked completed", adminService.markCompleted(id)));
    }

    // ── Provider management by category ──────────────────────────
    /** admin_healthcare.html / admin_business.html etc. – providers list */
    @GetMapping("/providers/category/{type}")
    public ResponseEntity<ApiResponse<List<ServiceProviderResponse>>> providersByCategory(
            @PathVariable CategoryType type) {
        return ResponseEntity.ok(ApiResponse.success(adminService.getProvidersByCategory(type)));
    }

    /** Initialize seed categories */
    @PostMapping("/categories/init")
    public ResponseEntity<ApiResponse<Void>> initCategories() {
        categoryService.initializeDefaultCategories();
        return ResponseEntity.ok(ApiResponse.success("Categories initialized", null));
    }
}
