package com.project.appointment.controller;

import com.project.appointment.dto.response.ApiResponse;
import com.project.appointment.entity.Category;
import com.project.appointment.enums.CategoryType;
import com.project.appointment.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * CategoryController – maps to:
 *   index.html → GET /api/categories (show all category cards)
 *   NEW/healthcare.html, business.html, etc. → GET /api/categories/{type}
 */
@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    /** index.html – list all active categories */
    @GetMapping
    public ResponseEntity<ApiResponse<List<Category>>> getAllCategories() {
        return ResponseEntity.ok(ApiResponse.success(categoryService.getAllActive()));
    }

    /** Category detail by ID */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Category>> getCategoryById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(categoryService.getById(id)));
    }

    /** Healthcare / business / govt pages filter by type */
    @GetMapping("/type/{type}")
    public ResponseEntity<ApiResponse<Category>> getCategoryByType(@PathVariable CategoryType type) {
        return ResponseEntity.ok(ApiResponse.success(categoryService.getByType(type)));
    }
}
