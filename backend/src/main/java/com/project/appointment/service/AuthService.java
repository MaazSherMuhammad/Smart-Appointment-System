package com.project.appointment.service;

import com.project.appointment.dto.request.LoginRequest;
import com.project.appointment.dto.request.RegisterRequest;
import com.project.appointment.dto.response.AuthResponse;
import com.project.appointment.dto.response.UserResponse;
import com.project.appointment.entity.User;
import com.project.appointment.enums.Role;
import com.project.appointment.exception.AppointmentException;
import com.project.appointment.exception.ResourceNotFoundException;
import com.project.appointment.repository.UserRepository;
import com.project.appointment.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;

    @Transactional
    public UserResponse register(RegisterRequest request) {
        // Validate uniqueness
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new AppointmentException("Email is already registered");
        }
        // Sanitize phone: treat empty string as null
        String phone = (request.getPhone() != null && !request.getPhone().trim().isEmpty())
                ? request.getPhone().trim() : null;

        if (phone != null && userRepository.existsByPhoneAndPhoneIsNotNull(phone)) {
            throw new AppointmentException("Phone number is already registered");
        }

        // Determine role (only ADMIN can create SERVICE_PROVIDER via this endpoint)
        Role role = Role.USER;
        if (request.getRole() != null) {
            try {
                role = Role.valueOf(request.getRole().toUpperCase());
                // SERVICE_PROVIDER must be created by ADMIN
                if (role == Role.SERVICE_PROVIDER || role == Role.ADMIN) {
                    role = Role.USER; // default to USER for public registration
                }
            } catch (IllegalArgumentException ignored) {}
        }

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(phone)
                .role(role)
                .isActive(true)
                .build();

        user = userRepository.save(user);

        return mapToUserResponse(user);
    }

    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String token = jwtUtil.generateToken(authentication);

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return AuthResponse.builder()
                .token(token)
                .type("Bearer")
                .userId(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .build();
    }

    public User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found"));
    }

    private UserResponse mapToUserResponse(User user) {
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
