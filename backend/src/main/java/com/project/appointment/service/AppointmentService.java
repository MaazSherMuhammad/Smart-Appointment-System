package com.project.appointment.service;

import com.project.appointment.dto.request.BookAppointmentRequest;
import com.project.appointment.dto.request.CancelAppointmentRequest;
import com.project.appointment.dto.request.RescheduleAppointmentRequest;
import com.project.appointment.dto.response.AppointmentResponse;
import com.project.appointment.entity.*;
import com.project.appointment.enums.AppointmentStatus;
import com.project.appointment.exception.AppointmentException;
import com.project.appointment.exception.ResourceNotFoundException;
import com.project.appointment.exception.UnauthorizedException;
import com.project.appointment.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final ServiceProviderRepository serviceProviderRepository;
    private final CategoryRepository categoryRepository;
    private final AvailableSlotRepository slotRepository;
    private final AppointmentHistoryRepository historyRepository;
    private final AuthService authService;

    // ────────────────────────────────────────────────────────────
    // BOOK
    // ────────────────────────────────────────────────────────────
    @Transactional
    public AppointmentResponse book(BookAppointmentRequest request) {
        User currentUser = authService.getCurrentUser();

        ServiceProvider provider = serviceProviderRepository.findById(request.getServiceProviderId())
                .orElseThrow(() -> new ResourceNotFoundException("ServiceProvider", request.getServiceProviderId()));

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", request.getCategoryId()));

        // Check if slot is already taken
        boolean slotTaken = appointmentRepository
                .existsByServiceProviderIdAndAppointmentDateAndAppointmentTimeAndStatusNot(
                        provider.getId(),
                        request.getAppointmentDate(),
                        request.getAppointmentTime(),
                        AppointmentStatus.CANCELLED);

        if (slotTaken) {
            throw new AppointmentException("This time slot is already booked. Please choose another slot.");
        }

        // Build appointment
        Appointment appointment = Appointment.builder()
                .user(currentUser)
                .serviceProvider(provider)
                .category(category)
                .appointmentDate(request.getAppointmentDate())
                .appointmentTime(request.getAppointmentTime())
                .status(AppointmentStatus.PENDING)
                .notes(request.getNotes())
                .tokenNumber(generateToken())
                .build();

        // Mark slot as booked if provided
        if (request.getSlotId() != null) {
            AvailableSlot slot = slotRepository.findById(request.getSlotId())
                    .orElseThrow(() -> new ResourceNotFoundException("Slot", request.getSlotId()));
            if (slot.isBooked()) {
                throw new AppointmentException("This slot is already booked.");
            }
            slot.setBooked(true);
            slotRepository.save(slot);
            appointment.setSlot(slot);
        }

        appointment = appointmentRepository.save(appointment);
        recordHistory(appointment, null, AppointmentStatus.PENDING, "Appointment booked", currentUser.getEmail());

        return mapToResponse(appointment);
    }

    // ────────────────────────────────────────────────────────────
    // CANCEL
    // ────────────────────────────────────────────────────────────
    @Transactional
    public AppointmentResponse cancel(CancelAppointmentRequest request) {
        User currentUser = authService.getCurrentUser();
        Appointment appointment = findAndAuthorize(request.getAppointmentId(), currentUser);

        if (appointment.getStatus() == AppointmentStatus.CANCELLED) {
            throw new AppointmentException("Appointment is already cancelled.");
        }
        if (appointment.getStatus() == AppointmentStatus.COMPLETED) {
            throw new AppointmentException("Cannot cancel a completed appointment.");
        }

        AppointmentStatus previous = appointment.getStatus();
        appointment.setStatus(AppointmentStatus.CANCELLED);
        appointment.setCancellationReason(request.getReason() != null ? request.getReason() : "Cancelled by user");

        // Free the slot
        if (appointment.getSlot() != null) {
            appointment.getSlot().setBooked(false);
            slotRepository.save(appointment.getSlot());
        }

        appointmentRepository.save(appointment);
        recordHistory(appointment, previous, AppointmentStatus.CANCELLED, request.getReason(), currentUser.getEmail());

        return mapToResponse(appointment);
    }

    // ────────────────────────────────────────────────────────────
    // RESCHEDULE
    // ────────────────────────────────────────────────────────────
    @Transactional
    public AppointmentResponse reschedule(RescheduleAppointmentRequest request) {
        User currentUser = authService.getCurrentUser();
        Appointment appointment = findAndAuthorize(request.getAppointmentId(), currentUser);

        if (appointment.getStatus() == AppointmentStatus.CANCELLED ||
            appointment.getStatus() == AppointmentStatus.COMPLETED) {
            throw new AppointmentException("Cannot reschedule a " + appointment.getStatus().name().toLowerCase() + " appointment.");
        }

        // Check new slot availability
        boolean newSlotTaken = appointmentRepository
                .existsByServiceProviderIdAndAppointmentDateAndAppointmentTimeAndStatusNot(
                        appointment.getServiceProvider().getId(),
                        request.getNewDate(),
                        request.getNewTime(),
                        AppointmentStatus.CANCELLED);

        if (newSlotTaken) {
            throw new AppointmentException("The new time slot is already booked. Please choose another.");
        }

        // Free old slot
        if (appointment.getSlot() != null) {
            appointment.getSlot().setBooked(false);
            slotRepository.save(appointment.getSlot());
        }

        AppointmentStatus previous = appointment.getStatus();
        appointment.setAppointmentDate(request.getNewDate());
        appointment.setAppointmentTime(request.getNewTime());
        appointment.setStatus(AppointmentStatus.RESCHEDULED);

        // Assign new slot if provided
        if (request.getNewSlotId() != null) {
            AvailableSlot newSlot = slotRepository.findById(request.getNewSlotId())
                    .orElseThrow(() -> new ResourceNotFoundException("Slot", request.getNewSlotId()));
            if (newSlot.isBooked()) {
                throw new AppointmentException("The selected new slot is already booked.");
            }
            newSlot.setBooked(true);
            slotRepository.save(newSlot);
            appointment.setSlot(newSlot);
        }

        appointmentRepository.save(appointment);
        recordHistory(appointment, previous, AppointmentStatus.RESCHEDULED,
                "Rescheduled to " + request.getNewDate() + " " + request.getNewTime(), currentUser.getEmail());

        return mapToResponse(appointment);
    }

    // ────────────────────────────────────────────────────────────
    // HISTORY / LISTING
    // ────────────────────────────────────────────────────────────
    @Transactional(readOnly = true)
    public List<AppointmentResponse> getMyAppointments() {
        User currentUser = authService.getCurrentUser();
        return appointmentRepository.findByUserIdOrderByCreatedAtDesc(currentUser.getId())
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AppointmentResponse> getMyHistory() {
        User currentUser = authService.getCurrentUser();
        return appointmentRepository.findByUserIdAndStatusOrderByAppointmentDateDesc(
                        currentUser.getId(), AppointmentStatus.COMPLETED)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public AppointmentResponse getById(Long id) {
        User currentUser = authService.getCurrentUser();
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", id));

        // Only owner, service provider, or admin can view
        boolean isOwner = appointment.getUser().getId().equals(currentUser.getId());
        boolean isProvider = appointment.getServiceProvider().getUser().getId().equals(currentUser.getId());
        boolean isAdmin = currentUser.getRole().name().equals("ADMIN");

        if (!isOwner && !isProvider && !isAdmin) {
            throw new UnauthorizedException("Access denied");
        }

        return mapToResponse(appointment);
    }

    // ────────────────────────────────────────────────────────────
    // PROVIDER – view own appointments
    // ────────────────────────────────────────────────────────────
    @Transactional(readOnly = true)
    public List<AppointmentResponse> getProviderAppointments(LocalDate date) {
        User currentUser = authService.getCurrentUser();
        ServiceProvider provider = serviceProviderRepository.findByUserId(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Service provider profile not found"));

        List<Appointment> appointments;
        if (date != null) {
            appointments = appointmentRepository.findByServiceProviderIdAndAppointmentDate(provider.getId(), date);
        } else {
            appointments = appointmentRepository.findByServiceProviderIdOrderByAppointmentDateAsc(provider.getId());
        }

        return appointments.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    // ────────────────────────────────────────────────────────────
    // Helpers
    // ────────────────────────────────────────────────────────────
    private Appointment findAndAuthorize(Long appointmentId, User currentUser) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", appointmentId));

        boolean isOwner = appointment.getUser().getId().equals(currentUser.getId());
        boolean isAdmin = currentUser.getRole().name().equals("ADMIN");

        if (!isOwner && !isAdmin) {
            throw new UnauthorizedException("You are not authorized to modify this appointment.");
        }

        return appointment;
    }

    private void recordHistory(Appointment appointment, AppointmentStatus previous,
                                AppointmentStatus next, String remarks, String changedBy) {
        AppointmentHistory history = AppointmentHistory.builder()
                .appointment(appointment)
                .previousStatus(previous)
                .newStatus(next)
                .remarks(remarks)
                .changedBy(changedBy)
                .build();
        historyRepository.save(history);
    }

    private String generateToken() {
        return "APT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    public AppointmentResponse mapToResponse(Appointment a) {
        return AppointmentResponse.builder()
                .id(a.getId())
                .tokenNumber(a.getTokenNumber())
                .appointmentDate(a.getAppointmentDate())
                .appointmentTime(a.getAppointmentTime())
                .status(a.getStatus().name())
                .notes(a.getNotes())
                .cancellationReason(a.getCancellationReason())
                .userId(a.getUser().getId())
                .userName(a.getUser().getFullName())
                .serviceProviderId(a.getServiceProvider().getId())
                .serviceProviderName(a.getServiceProvider().getBusinessName())
                .specialization(a.getServiceProvider().getSpecialization())
                .categoryId(a.getCategory().getId())
                .categoryName(a.getCategory().getName())
                .categoryType(a.getCategory().getType().name())
                .createdAt(a.getCreatedAt())
                .updatedAt(a.getUpdatedAt())
                .build();
    }
}
