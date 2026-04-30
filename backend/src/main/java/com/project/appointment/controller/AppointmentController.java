package com.project.appointment.controller;

import com.project.appointment.dto.request.BookAppointmentRequest;
import com.project.appointment.dto.request.CancelAppointmentRequest;
import com.project.appointment.dto.request.RescheduleAppointmentRequest;
import com.project.appointment.dto.response.ApiResponse;
import com.project.appointment.dto.response.AppointmentResponse;
import com.project.appointment.service.AppointmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

/**
 * AppointmentController – maps to:
 *   NEW/book.html        → POST /api/appointments/book
 *   NEW/cancel.html      → POST /api/appointments/cancel
 *   NEW/reschedule.html  → PUT  /api/appointments/reschedule
 *   NEW/history.html     → GET  /api/appointments/history
 *   dashboard/user.html  → GET  /api/appointments/my
 */
@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
public class AppointmentController {

    private final AppointmentService appointmentService;

    /** book.html */
    @PostMapping("/book")
    public ResponseEntity<ApiResponse<AppointmentResponse>> book(
            @Valid @RequestBody BookAppointmentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Appointment booked successfully", appointmentService.book(request)));
    }

    /** cancel.html */
    @PostMapping("/cancel")
    public ResponseEntity<ApiResponse<AppointmentResponse>> cancel(
            @Valid @RequestBody CancelAppointmentRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Appointment cancelled", appointmentService.cancel(request)));
    }

    /** reschedule.html */
    @PutMapping("/reschedule")
    public ResponseEntity<ApiResponse<AppointmentResponse>> reschedule(
            @Valid @RequestBody RescheduleAppointmentRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Appointment rescheduled", appointmentService.reschedule(request)));
    }

    /** history.html – completed appointments */
    @GetMapping("/history")
    public ResponseEntity<ApiResponse<List<AppointmentResponse>>> history() {
        return ResponseEntity.ok(ApiResponse.success(appointmentService.getMyHistory()));
    }

    /** dashboard/user.html – all appointments */
    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<AppointmentResponse>>> myAppointments() {
        return ResponseEntity.ok(ApiResponse.success(appointmentService.getMyAppointments()));
    }

    /** Single appointment detail */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AppointmentResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(appointmentService.getById(id)));
    }

    /** dashboard/doctor.html / appointer.html – provider's appointments */
    @GetMapping("/provider")
    public ResponseEntity<ApiResponse<List<AppointmentResponse>>> providerAppointments(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(ApiResponse.success(appointmentService.getProviderAppointments(date)));
    }
}
