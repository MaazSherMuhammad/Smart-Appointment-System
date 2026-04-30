package com.project.appointment.service;

import com.project.appointment.dto.response.AppointmentResponse;
import com.project.appointment.dto.response.ServiceProviderResponse;
import com.project.appointment.dto.response.UserResponse;
import com.project.appointment.entity.User;
import com.project.appointment.enums.AppointmentStatus;
import com.project.appointment.enums.CategoryType;
import com.project.appointment.enums.Role;
import com.project.appointment.exception.ResourceNotFoundException;
import com.project.appointment.repository.AppointmentRepository;
import com.project.appointment.repository.ServiceProviderRepository;
import com.project.appointment.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final AppointmentRepository appointmentRepository;
    private final ServiceProviderRepository serviceProviderRepository;
    private final AppointmentService appointmentService;
    private final ServiceProviderService serviceProviderService;

    // ── Dashboard stats ──────────────────────────────────────────
    @Transactional(readOnly = true)
    public Map<String, Object> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", userRepository.countByRole(Role.USER));
        stats.put("totalServiceProviders", userRepository.countByRole(Role.SERVICE_PROVIDER));
        stats.put("totalAppointments", appointmentRepository.count());
        stats.put("pendingAppointments", appointmentRepository.countByStatus(AppointmentStatus.PENDING));
        stats.put("confirmedAppointments", appointmentRepository.countByStatus(AppointmentStatus.CONFIRMED));
        stats.put("cancelledAppointments", appointmentRepository.countByStatus(AppointmentStatus.CANCELLED));
        stats.put("completedAppointments", appointmentRepository.countByStatus(AppointmentStatus.COMPLETED));
        return stats;
    }

    // ── User management ──────────────────────────────────────────
    @Transactional(readOnly = true)
    public List<UserResponse> getAllUsers() {
        return userRepository.findByRole(Role.USER)
                .stream().map(this::mapUserToResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<UserResponse> getAllServiceProviders() {
        return userRepository.findByRole(Role.SERVICE_PROVIDER)
                .stream().map(this::mapUserToResponse).collect(Collectors.toList());
    }

    @Transactional
    public void toggleUserStatus(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
        user.setActive(!user.isActive());
        userRepository.save(user);
    }

    @Transactional
    public void promoteToServiceProvider(Long userId, Long categoryId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
        user.setRole(Role.SERVICE_PROVIDER);
        userRepository.save(user);
    }

    // ── Appointment management ───────────────────────────────────
    @Transactional(readOnly = true)
    public List<AppointmentResponse> getAllAppointments() {
        return appointmentRepository.findAll()
                .stream().map(appointmentService::mapToResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AppointmentResponse> getAppointmentsByCategory(Long categoryId) {
        return appointmentRepository.findByCategoryId(categoryId)
                .stream().map(appointmentService::mapToResponse).collect(Collectors.toList());
    }

    @Transactional
    public AppointmentResponse confirmAppointment(Long appointmentId) {
        var appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", appointmentId));
        appointment.setStatus(AppointmentStatus.CONFIRMED);
        return appointmentService.mapToResponse(appointmentRepository.save(appointment));
    }

    @Transactional
    public AppointmentResponse markCompleted(Long appointmentId) {
        var appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", appointmentId));
        appointment.setStatus(AppointmentStatus.COMPLETED);
        return appointmentService.mapToResponse(appointmentRepository.save(appointment));
    }

    // ── Provider management per category ─────────────────────────
    @Transactional(readOnly = true)
    public List<ServiceProviderResponse> getProvidersByCategory(CategoryType type) {
        return serviceProviderRepository.findByCategoryType(type)
                .stream().map(serviceProviderService::mapToResponse).collect(Collectors.toList());
    }

    private UserResponse mapUserToResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole().name())
                .isActive(user.isActive())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
