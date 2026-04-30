package com.project.appointment.repository;

import com.project.appointment.entity.AvailableSlot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface AvailableSlotRepository extends JpaRepository<AvailableSlot, Long> {

    List<AvailableSlot> findByServiceProviderIdAndSlotDateAndIsBookedFalse(Long providerId, LocalDate date);

    List<AvailableSlot> findByServiceProviderIdAndSlotDate(Long providerId, LocalDate date);

    @Query("""
            SELECT s FROM AvailableSlot s
            WHERE s.serviceProvider.id = :providerId
              AND s.slotDate >= :fromDate
              AND s.isBooked = false
            ORDER BY s.slotDate, s.slotTime
            """)
    List<AvailableSlot> findAvailableSlotsFromDate(
            @Param("providerId") Long providerId,
            @Param("fromDate") LocalDate fromDate);

    void deleteByServiceProviderIdAndSlotDate(Long providerId, LocalDate date);
}
