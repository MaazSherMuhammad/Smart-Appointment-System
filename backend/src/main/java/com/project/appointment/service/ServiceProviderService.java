package com.project.appointment.service;

import com.project.appointment.dto.request.ServiceProviderRequest;
import com.project.appointment.dto.response.ServiceProviderResponse;
import com.project.appointment.entity.Category;
import com.project.appointment.entity.ServiceProvider;
import com.project.appointment.entity.User;
import com.project.appointment.enums.CategoryType;
import com.project.appointment.exception.AppointmentException;
import com.project.appointment.exception.ResourceNotFoundException;
import com.project.appointment.repository.CategoryRepository;
import com.project.appointment.repository.ServiceProviderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ServiceProviderService {

    private final ServiceProviderRepository providerRepository;
    private final CategoryRepository categoryRepository;
    private final AuthService authService;

    @Transactional
    public ServiceProviderResponse createProfile(ServiceProviderRequest request) {
        User currentUser = authService.getCurrentUser();

        if (providerRepository.existsByUserId(currentUser.getId())) {
            throw new AppointmentException("Service provider profile already exists for this user.");
        }

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", request.getCategoryId()));

        ServiceProvider provider = ServiceProvider.builder()
                .user(currentUser)
                .category(category)
                .businessName(request.getBusinessName())
                .specialization(request.getSpecialization())
                .description(request.getDescription())
                .address(request.getAddress())
                .workStartTime(request.getWorkStartTime())
                .workEndTime(request.getWorkEndTime())
                .slotDurationMinutes(request.getSlotDurationMinutes() != null ? request.getSlotDurationMinutes() : 30)
                .isActive(true)
                .build();

        provider = providerRepository.save(provider);
        return mapToResponse(provider);
    }

    @Transactional
    public ServiceProviderResponse updateProfile(ServiceProviderRequest request) {
        User currentUser = authService.getCurrentUser();
        ServiceProvider provider = providerRepository.findByUserId(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Service provider profile not found"));

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", request.getCategoryId()));

        provider.setBusinessName(request.getBusinessName());
        provider.setCategory(category);
        provider.setSpecialization(request.getSpecialization());
        provider.setDescription(request.getDescription());
        provider.setAddress(request.getAddress());
        provider.setWorkStartTime(request.getWorkStartTime());
        provider.setWorkEndTime(request.getWorkEndTime());
        if (request.getSlotDurationMinutes() != null) {
            provider.setSlotDurationMinutes(request.getSlotDurationMinutes());
        }

        return mapToResponse(providerRepository.save(provider));
    }

    @Transactional(readOnly = true)
    public List<ServiceProviderResponse> getByCategory(Long categoryId) {
        return providerRepository.findByCategoryIdAndIsActiveTrue(categoryId)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ServiceProviderResponse> getByCategoryType(CategoryType type) {
        return providerRepository.findByCategoryType(type)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ServiceProviderResponse> search(String name) {
        return providerRepository.searchByName(name)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ServiceProviderResponse getMyProfile() {
        User currentUser = authService.getCurrentUser();
        ServiceProvider provider = providerRepository.findByUserId(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Service provider profile not found"));
        return mapToResponse(provider);
    }

    @Transactional(readOnly = true)
    public ServiceProviderResponse getById(Long id) {
        ServiceProvider provider = providerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ServiceProvider", id));
        return mapToResponse(provider);
    }

    public ServiceProviderResponse mapToResponse(ServiceProvider sp) {
        return ServiceProviderResponse.builder()
                .id(sp.getId())
                .businessName(sp.getBusinessName())
                .specialization(sp.getSpecialization())
                .description(sp.getDescription())
                .address(sp.getAddress())
                .workStartTime(sp.getWorkStartTime())
                .workEndTime(sp.getWorkEndTime())
                .slotDurationMinutes(sp.getSlotDurationMinutes())
                .isActive(sp.isActive())
                .userId(sp.getUser().getId())
                .ownerName(sp.getUser().getFullName())
                .ownerEmail(sp.getUser().getEmail())
                .categoryId(sp.getCategory().getId())
                .categoryName(sp.getCategory().getName())
                .categoryType(sp.getCategory().getType().name())
                .build();
    }
}
