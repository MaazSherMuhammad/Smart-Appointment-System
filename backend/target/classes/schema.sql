-- ============================================================
--  Smart Appointment Management System
--  MySQL Database Schema
-- ============================================================

CREATE DATABASE IF NOT EXISTS smart_appointment_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE smart_appointment_db;

-- ────────────────────────────────────────────────────────────
-- 1. USERS
-- ────────────────────────────────────────────────────────────
CREATE TABLE users (
    id              BIGINT          NOT NULL AUTO_INCREMENT,
    full_name       VARCHAR(100)    NOT NULL,
    email           VARCHAR(150)    NOT NULL UNIQUE,
    password        VARCHAR(255)    NOT NULL,
    phone           VARCHAR(20)     UNIQUE,
    role            ENUM('ADMIN','USER','SERVICE_PROVIDER') NOT NULL DEFAULT 'USER',
    is_active       TINYINT(1)      NOT NULL DEFAULT 1,
    profile_picture VARCHAR(255),
    created_at      DATETIME        DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME        DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    INDEX idx_users_email  (email),
    INDEX idx_users_role   (role)
) ENGINE=InnoDB;

-- ────────────────────────────────────────────────────────────
-- 2. CATEGORIES
-- ────────────────────────────────────────────────────────────
CREATE TABLE categories (
    id          BIGINT      NOT NULL AUTO_INCREMENT,
    type        ENUM('HEALTHCARE','BUSINESS','EDUCATIONAL','GOVERNMENT','PERSONAL','TECHNICAL')
                            NOT NULL UNIQUE,
    name        VARCHAR(100) NOT NULL,
    description VARCHAR(500),
    icon_url    VARCHAR(255),
    is_active   TINYINT(1)  NOT NULL DEFAULT 1,
    created_at  DATETIME    DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    INDEX idx_categories_type (type)
) ENGINE=InnoDB;

-- Seed default categories
INSERT INTO categories (type, name, description) VALUES
    ('HEALTHCARE',  'Healthcare',   'Doctors, clinics, and medical appointments'),
    ('BUSINESS',    'Business',     'Corporate meetings and business consultations'),
    ('EDUCATIONAL', 'Educational',  'Tutors, schools, and academic advising'),
    ('GOVERNMENT',  'Government',   'Government offices and public services'),
    ('PERSONAL',    'Personal',     'Personal grooming, wellness, and lifestyle'),
    ('TECHNICAL',   'Technical',    'IT support, repairs, and technical services');

-- ────────────────────────────────────────────────────────────
-- 3. SERVICE_PROVIDERS
-- ────────────────────────────────────────────────────────────
CREATE TABLE service_providers (
    id                    BIGINT      NOT NULL AUTO_INCREMENT,
    user_id               BIGINT      NOT NULL UNIQUE,
    category_id           BIGINT      NOT NULL,
    business_name         VARCHAR(150) NOT NULL,
    specialization        VARCHAR(100),
    description           VARCHAR(500),
    address               VARCHAR(255),
    work_start_time       TIME,
    work_end_time         TIME,
    slot_duration_minutes INT         NOT NULL DEFAULT 30,
    is_active             TINYINT(1)  NOT NULL DEFAULT 1,
    created_at            DATETIME    DEFAULT CURRENT_TIMESTAMP,
    updated_at            DATETIME    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    CONSTRAINT fk_sp_user     FOREIGN KEY (user_id)     REFERENCES users(id)       ON DELETE CASCADE,
    CONSTRAINT fk_sp_category FOREIGN KEY (category_id) REFERENCES categories(id)  ON DELETE RESTRICT,
    INDEX idx_sp_category (category_id),
    INDEX idx_sp_user     (user_id)
) ENGINE=InnoDB;

-- ────────────────────────────────────────────────────────────
-- 4. AVAILABLE_SLOTS
-- ────────────────────────────────────────────────────────────
CREATE TABLE available_slots (
    id                  BIGINT      NOT NULL AUTO_INCREMENT,
    service_provider_id BIGINT      NOT NULL,
    slot_date           DATE        NOT NULL,
    slot_time           TIME        NOT NULL,
    is_booked           TINYINT(1)  NOT NULL DEFAULT 0,

    PRIMARY KEY (id),
    UNIQUE KEY uq_slot (service_provider_id, slot_date, slot_time),
    CONSTRAINT fk_slot_sp FOREIGN KEY (service_provider_id) REFERENCES service_providers(id) ON DELETE CASCADE,
    INDEX idx_slot_date (slot_date),
    INDEX idx_slot_sp   (service_provider_id)
) ENGINE=InnoDB;

-- ────────────────────────────────────────────────────────────
-- 5. APPOINTMENTS
-- ────────────────────────────────────────────────────────────
CREATE TABLE appointments (
    id                  BIGINT      NOT NULL AUTO_INCREMENT,
    user_id             BIGINT      NOT NULL,
    service_provider_id BIGINT      NOT NULL,
    category_id         BIGINT      NOT NULL,
    slot_id             BIGINT,
    appointment_date    DATE        NOT NULL,
    appointment_time    TIME        NOT NULL,
    status              ENUM('PENDING','CONFIRMED','CANCELLED','RESCHEDULED','COMPLETED','NO_SHOW')
                                    NOT NULL DEFAULT 'PENDING',
    notes               VARCHAR(500),
    cancellation_reason VARCHAR(500),
    token_number        VARCHAR(50),
    created_at          DATETIME    DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    CONSTRAINT fk_appt_user     FOREIGN KEY (user_id)             REFERENCES users(id)             ON DELETE RESTRICT,
    CONSTRAINT fk_appt_sp       FOREIGN KEY (service_provider_id) REFERENCES service_providers(id) ON DELETE RESTRICT,
    CONSTRAINT fk_appt_category FOREIGN KEY (category_id)         REFERENCES categories(id)        ON DELETE RESTRICT,
    CONSTRAINT fk_appt_slot     FOREIGN KEY (slot_id)             REFERENCES available_slots(id)   ON DELETE SET NULL,

    INDEX idx_appt_user     (user_id),
    INDEX idx_appt_sp       (service_provider_id),
    INDEX idx_appt_date     (appointment_date),
    INDEX idx_appt_status   (status),
    INDEX idx_appt_category (category_id)
) ENGINE=InnoDB;

-- ────────────────────────────────────────────────────────────
-- 6. APPOINTMENT_HISTORY  (audit trail)
-- ────────────────────────────────────────────────────────────
CREATE TABLE appointment_history (
    id              BIGINT      NOT NULL AUTO_INCREMENT,
    appointment_id  BIGINT      NOT NULL,
    previous_status ENUM('PENDING','CONFIRMED','CANCELLED','RESCHEDULED','COMPLETED','NO_SHOW'),
    new_status      ENUM('PENDING','CONFIRMED','CANCELLED','RESCHEDULED','COMPLETED','NO_SHOW') NOT NULL,
    remarks         VARCHAR(500),
    changed_by      VARCHAR(100),
    changed_at      DATETIME    DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    CONSTRAINT fk_history_appt FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE,
    INDEX idx_history_appt (appointment_id)
) ENGINE=InnoDB;

-- ────────────────────────────────────────────────────────────
-- Default ADMIN user  (password: admin123  – BCrypt encoded)
-- ────────────────────────────────────────────────────────────
INSERT INTO users (full_name, email, password, role) VALUES
    ('System Admin',
     'admin@smartappt.com',
     '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lh52',
     'ADMIN');
