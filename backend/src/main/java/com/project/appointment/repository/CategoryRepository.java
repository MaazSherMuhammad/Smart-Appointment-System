package com.project.appointment.repository;

import com.project.appointment.entity.Category;
import com.project.appointment.enums.CategoryType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {

    Optional<Category> findByType(CategoryType type);

    List<Category> findByIsActiveTrue();

    boolean existsByType(CategoryType type);
}
