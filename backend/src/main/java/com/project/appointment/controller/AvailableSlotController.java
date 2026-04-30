package com.project.appointment.controller;

import com.project.appointment.dto.response.ApiResponse;
import com.project.appointment.entity.AvailableSlot;
import com.project.appointment.repository.AvailableSlotRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

/**
 * AvailableSlotController – maps to:
 *   NEW/book.html → GET /api/slots/{providerId}/available?date=
 */
@RestController
@RequestMapping("/api/slots")
@RequiredArgsConstructor
public class AvailableSlotController {

    private final AvailableSlotRepository slotRepository;

    /**
     * Get available (unbooked) slots for a given provider on a given date.
     * Called by book.html when user selects a provider and date.
     */
    @GetMapping("/{providerId}/available")
    public ResponseEntity<ApiResponse<List<AvailableSlot>>> getAvailable(
            @PathVariable Long providerId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {

        List<AvailableSlot> slots =
                slotRepository.findByServiceProviderIdAndSlotDateAndIsBookedFalse(providerId, date);
        return ResponseEntity.ok(ApiResponse.success(slots));
    }

    /**
     * Get ALL slots (booked + available) for a provider on a date.
     * Used by doctor dashboard to show full schedule.
     */
    @GetMapping("/{providerId}/all")
    public ResponseEntity<ApiResponse<List<AvailableSlot>>> getAll(
            @PathVariable Long providerId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {

        List<AvailableSlot> slots =
                slotRepository.findByServiceProviderIdAndSlotDate(providerId, date);
        return ResponseEntity.ok(ApiResponse.success(slots));
    }

    /**
     * Get upcoming available slots from today onwards.
     */
    @GetMapping("/{providerId}/upcoming")
    public ResponseEntity<ApiResponse<List<AvailableSlot>>> getUpcoming(@PathVariable Long providerId) {
        List<AvailableSlot> slots =
                slotRepository.findAvailableSlotsFromDate(providerId, LocalDate.now());
        return ResponseEntity.ok(ApiResponse.success(slots));
    }
}
