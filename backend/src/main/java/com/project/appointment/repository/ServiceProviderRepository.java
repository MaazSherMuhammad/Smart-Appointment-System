package com.project.appointment.repository;

import com.project.appointment.entity.ServiceProvider;
import com.project.appointment.enums.CategoryType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ServiceProviderRepository extends JpaRepository<ServiceProvider, Long> {

    Optional<ServiceProvider> findByUserId(Long userId);

    List<ServiceProvider> findByCategoryId(Long categoryId);

    List<ServiceProvider> findByCategoryIdAndIsActiveTrue(Long categoryId);

    @Query("SELECT sp FROM ServiceProvider sp WHERE sp.category.type = :type AND sp.isActive = true")
    List<ServiceProvider> findByCategoryType(@Param("type") CategoryType type);

    @Query("SELECT sp FROM ServiceProvider sp WHERE LOWER(sp.businessName) LIKE LOWER(CONCAT('%',:name,'%'))")
    List<ServiceProvider> searchByName(@Param("name") String name);

    List<ServiceProvider> findByIsActiveTrue();

    boolean existsByUserId(Long userId);
}
