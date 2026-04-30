package com.project.appointment.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "available_slots",
        uniqueConstraints = @UniqueConstraint(columnNames = {"service_provider_id", "slot_date", "slot_time"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AvailableSlot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "slot_date", nullable = false)
    private LocalDate slotDate;

    @Column(name = "slot_time", nullable = false)
    private LocalTime slotTime;

    @Column(name = "is_booked", nullable = false)
    @Builder.Default
    private boolean isBooked = false;

    // ─── Relationships ───────────────────────────────────────────
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_provider_id", nullable = false)
    private ServiceProvider serviceProvider;

    @OneToOne(mappedBy = "slot", fetch = FetchType.LAZY)
    private Appointment appointment;
}
