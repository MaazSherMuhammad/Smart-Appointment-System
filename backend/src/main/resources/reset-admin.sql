-- Run this in MySQL if admin login fails:
-- The BCrypt hash below is for password "admin123"

UPDATE users 
SET password = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LPVav68Bduy',
    is_active = 1,
    role = 'ADMIN'
WHERE email = 'admin@smartappt.com';

-- If admin user doesn't exist at all, insert it:
INSERT IGNORE INTO users (full_name, email, password, role, is_active, created_at, updated_at)
VALUES (
    'System Admin',
    'admin@smartappt.com',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LPVav68Bduy',
    'ADMIN',
    1,
    NOW(),
    NOW()
);

-- Verify:
SELECT id, full_name, email, role, is_active FROM users WHERE email = 'admin@smartappt.com';
