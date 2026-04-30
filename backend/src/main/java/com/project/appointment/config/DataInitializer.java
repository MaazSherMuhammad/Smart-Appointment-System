package com.project.appointment.config;

import com.project.appointment.entity.Category;
import com.project.appointment.entity.User;
import com.project.appointment.enums.CategoryType;
import com.project.appointment.enums.Role;
import com.project.appointment.repository.CategoryRepository;
import com.project.appointment.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        initCategories();
        initAdminUser();
    }

    private void initCategories() {
        record CatDef(CategoryType type, String name, String description) {}

        var defs = new CatDef[]{
            new CatDef(CategoryType.HEALTHCARE,  "Healthcare",       "Doctors, clinics, and medical appointments"),
            new CatDef(CategoryType.BUSINESS,    "Business",         "Corporate meetings and business consultations"),
            new CatDef(CategoryType.EDUCATIONAL, "Educational",      "Tutors, schools, and academic advising"),
            new CatDef(CategoryType.GOVERNMENT,  "Government",       "Government offices and public services"),
            new CatDef(CategoryType.PERSONAL,    "Personal Services","Personal grooming, wellness, and lifestyle"),
            new CatDef(CategoryType.TECHNICAL,   "Technical/Repair", "IT support, repairs, and technical services"),
        };

        for (var def : defs) {
            if (!categoryRepository.existsByType(def.type())) {
                categoryRepository.save(Category.builder()
                        .type(def.type())
                        .name(def.name())
                        .description(def.description())
                        .isActive(true)
                        .build());
                log.info("Seeded category: {}", def.name());
            }
        }
    }

    private void initAdminUser() {
        String adminEmail    = "admin@smartappt.com";
        String adminPassword = "admin123";

        userRepository.findByEmail(adminEmail).ifPresentOrElse(
            existing -> {
                // Always reset password + ensure ADMIN role + ensure active
                // This fixes stale DB state from previous runs
                existing.setPassword(passwordEncoder.encode(adminPassword));
                existing.setRole(Role.ADMIN);
                existing.setActive(true);
                userRepository.save(existing);
                log.info("Admin user verified and password refreshed: {}", adminEmail);
            },
            () -> {
                userRepository.save(User.builder()
                        .fullName("System Admin")
                        .email(adminEmail)
                        .password(passwordEncoder.encode(adminPassword))
                        .role(Role.ADMIN)
                        .isActive(true)
                        .build());
                log.info("Admin user created: {} / {}", adminEmail, adminPassword);
            }
        );

        log.info("=================================================");
        log.info("  Admin login:  {}  /  {}", adminEmail, adminPassword);
        log.info("=================================================");
    }
}
