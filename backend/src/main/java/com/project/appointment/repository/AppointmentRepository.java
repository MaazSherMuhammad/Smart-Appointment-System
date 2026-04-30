package com.project.appointment.repository;

import com.project.appointment.entity.Appointment;
import com.project.appointment.enums.AppointmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    // ── User-facing queries ──────────────────────────────────────
    List<Appointment> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<Appointment> findByUserIdAndStatusOrderByAppointmentDateDesc(Long userId, AppointmentStatus status);

    // ── Service-provider-facing queries ─────────────────────────
    List<Appointment> findByServiceProviderIdOrderByAppointmentDateAsc(Long providerId);

    List<Appointment> findByServiceProviderIdAndAppointmentDate(Long providerId, LocalDate date);

    List<Appointment> findByServiceProviderIdAndStatus(Long providerId, AppointmentStatus status);

    // ── Admin / analytics queries ────────────────────────────────
    List<Appointment> findByCategoryId(Long categoryId);

    @Query("SELECT a FROM Appointment a WHERE a.appointmentDate = :date")
    List<Appointment> findAllByDate(@Param("date") LocalDate date);

    @Query("SELECT COUNT(a) FROM Appointment a WHERE a.status = :status")
    long countByStatus(@Param("status") AppointmentStatus status);

    @Query("SELECT COUNT(a) FROM Appointment a WHERE a.category.id = :categoryId")
    long countByCategoryId(@Param("categoryId") Long categoryId);

    @Query("""
            SELECT a FROM Appointment a
            WHERE a.serviceProvider.id = :providerId
              AND a.appointmentDate = :date
              AND a.status NOT IN ('CANCELLED')
            """)
    List<Appointment> findBookedSlotsByProviderAndDate(
            @Param("providerId") Long providerId,
            @Param("date") LocalDate date);

    boolean existsByServiceProviderIdAndAppointmentDateAndAppointmentTimeAndStatusNot(
            Long providerId, LocalDate date,
            java.time.LocalTime time, AppointmentStatus status);
}
