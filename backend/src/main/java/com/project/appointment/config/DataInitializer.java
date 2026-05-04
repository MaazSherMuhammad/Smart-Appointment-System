package com.project.appointment.config;

import com.project.appointment.entity.Category;
import com.project.appointment.entity.ServiceProvider;
import com.project.appointment.entity.User;
import com.project.appointment.enums.CategoryType;
import com.project.appointment.enums.Role;
import com.project.appointment.repository.CategoryRepository;
import com.project.appointment.repository.ServiceProviderRepository;
import com.project.appointment.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalTime;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final ServiceProviderRepository providerRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        initCategories();
        initAdminUser();
        initDemoProviders();
    }

    // ── Categories ──────────────────────────────────────────────
    private void initCategories() {
        record CatDef(CategoryType type, String name, String desc) {}
        var defs = new CatDef[]{
            new CatDef(CategoryType.HEALTHCARE,  "Healthcare",       "Doctors, clinics, and medical appointments"),
            new CatDef(CategoryType.BUSINESS,    "Business",         "Corporate meetings and business consultations"),
            new CatDef(CategoryType.EDUCATIONAL, "Educational",      "Tutors, schools, and academic advising"),
            new CatDef(CategoryType.GOVERNMENT,  "Government",       "Government offices and public services"),
            new CatDef(CategoryType.PERSONAL,    "Personal Services","Personal grooming, wellness, and lifestyle"),
            new CatDef(CategoryType.TECHNICAL,   "Technical/Repair", "IT support, repairs, and technical services"),
        };
        for (var d : defs) {
            if (!categoryRepository.existsByType(d.type())) {
                categoryRepository.save(Category.builder()
                        .type(d.type()).name(d.name()).description(d.desc()).isActive(true).build());
                log.info("Seeded category: {}", d.name());
            }
        }
    }

    // ── Admin user ──────────────────────────────────────────────
    private void initAdminUser() {
        String email = "admin@smartappt.com", pw = "admin123";
        userRepository.findByEmail(email).ifPresentOrElse(
            u -> {
                u.setPassword(passwordEncoder.encode(pw));
                u.setRole(Role.ADMIN);
                u.setActive(true);
                userRepository.save(u);
                log.info("Admin verified/refreshed: {}", email);
            },
            () -> {
                userRepository.save(User.builder()
                    .fullName("System Admin").email(email)
                    .password(passwordEncoder.encode(pw))
                    .role(Role.ADMIN).isActive(true).build());
                log.info("Admin created: {} / {}", email, pw);
            }
        );
        log.info("=== Admin: {} / {} ===", email, pw);
    }

    // ── Demo providers (one per category) ──────────────────────
    private void initDemoProviders() {
        record ProvDef(String email, String name, CategoryType catType,
                       String biz, String spec, String addr) {}
        var defs = new ProvDef[]{
            new ProvDef("dr.ahmed@demo.com",    "Dr. Ahmed Khan",     CategoryType.HEALTHCARE,
                "City Medical Center",      "General Physician",   "123 Health St"),
            new ProvDef("smith@demo.com",       "John Smith",         CategoryType.BUSINESS,
                "Smith Consulting Group",   "Business Strategy",   "456 Commerce Ave"),
            new ProvDef("prof.sara@demo.com",   "Prof. Sara Ali",     CategoryType.EDUCATIONAL,
                "Learning Hub",             "Mathematics & Science","789 Education Blvd"),
            new ProvDef("civil@demo.com",       "Civil Services Dept",CategoryType.GOVERNMENT,
                "City Hall Services",       "Public Administration","1 Government Plaza"),
            new ProvDef("sarah@demo.com",       "Sarah Beauty",       CategoryType.PERSONAL,
                "Sarah Beauty Salon",       "Hair & Makeup",       "321 Style Lane"),
            new ProvDef("techfix@demo.com",     "TechFix Solutions",  CategoryType.TECHNICAL,
                "TechFix Solutions",        "Computer Repair",     "654 Tech Park"),
        };

        for (var d : defs) {
            // Skip if user already exists (manually inserted via MySQL)
            if (userRepository.existsByEmail(d.email())) continue;

            Category cat = categoryRepository.findByType(d.catType()).orElse(null);
            if (cat == null) continue;

            // Create provider user
            User u = userRepository.save(User.builder()
                .fullName(d.name()).email(d.email())
                .password(passwordEncoder.encode("provider123"))
                .role(Role.SERVICE_PROVIDER).isActive(true).build());

            // Create provider profile
            providerRepository.save(ServiceProvider.builder()
                .user(u).category(cat)
                .businessName(d.biz()).specialization(d.spec())
                .description(d.spec() + " services").address(d.addr())
                .workStartTime(LocalTime.of(9, 0)).workEndTime(LocalTime.of(17, 0))
                .slotDurationMinutes(30).isActive(true).build());

            log.info("Seeded provider: {} ({})", d.biz(), d.catType());
        }
    }
}
