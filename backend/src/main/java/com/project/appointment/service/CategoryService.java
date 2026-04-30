package com.project.appointment.service;

import com.project.appointment.entity.Category;
import com.project.appointment.enums.CategoryType;
import com.project.appointment.exception.ResourceNotFoundException;
import com.project.appointment.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;

    @Transactional(readOnly = true)
    public List<Category> getAllActive() {
        return categoryRepository.findByIsActiveTrue();
    }

    @Transactional(readOnly = true)
    public Category getById(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", id));
    }

    @Transactional(readOnly = true)
    public Category getByType(CategoryType type) {
        return categoryRepository.findByType(type)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found for type: " + type));
    }

    @Transactional
    public Category save(Category category) {
        return categoryRepository.save(category);
    }

    @Transactional
    public void initializeDefaultCategories() {
        for (CategoryType type : CategoryType.values()) {
            if (!categoryRepository.existsByType(type)) {
                Category category = Category.builder()
                        .type(type)
                        .name(type.name().charAt(0) + type.name().substring(1).toLowerCase())
                        .description("Default " + type.name().toLowerCase() + " category")
                        .isActive(true)
                        .build();
                categoryRepository.save(category);
            }
        }
    }
}
