-- CONSOLIDATED PRODUCTION SETUP SCRIPT
-- RUN THIS IN TABLEPLUS TO SET UP THE ENTIRE DATABASE

SET FOREIGN_KEY_CHECKS = 0;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS `users` (
    `id` VARCHAR(50) PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL,
    `nric` VARCHAR(20) NOT NULL UNIQUE,
    `email` VARCHAR(100) NOT NULL UNIQUE,
    `role` ENUM('student', 'admin') NOT NULL,
    `gender` ENUM('Male', 'Female') NOT NULL,
    `phone_number` VARCHAR(20),
    `parent_phone_number` VARCHAR(20),
    `password` VARCHAR(255),
    `profile_image` VARCHAR(255) DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Rooms Table
CREATE TABLE IF NOT EXISTS `rooms` (
    `id` VARCHAR(10) PRIMARY KEY,
    `floor_id` INT NOT NULL,
    `gender` ENUM('Male', 'Female') NOT NULL,
    `room_type` VARCHAR(50) NOT NULL,
    `capacity` INT NOT NULL,
    `status` ENUM('Active', 'Maintenance') DEFAULT 'Active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Beds Table
CREATE TABLE IF NOT EXISTS `beds` (
    `id` VARCHAR(20) PRIMARY KEY,
    `room_id` VARCHAR(10) NOT NULL,
    `label` VARCHAR(5) NOT NULL,
    `status` ENUM('Available', 'Occupied', 'Maintenance') DEFAULT 'Available',
    FOREIGN KEY (`room_id`) REFERENCES `rooms`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Applications Table
CREATE TABLE IF NOT EXISTS `applications` (
    `id` VARCHAR(50) PRIMARY KEY,
    `student_id` VARCHAR(50) NOT NULL,
    `student_name` VARCHAR(100) NOT NULL,
    `room_type` VARCHAR(50) NOT NULL,
    `bed_id` VARCHAR(50) DEFAULT NULL,
    `floor_id` VARCHAR(10),
    `stay_duration` INT DEFAULT 1,
    `total_price` DECIMAL(10, 2) DEFAULT 120.00,
    `status` ENUM('Pending', 'Payment Pending', 'Approved', 'Checked in', 'Checked out', 'Cancelled', 'No show') DEFAULT 'Pending',
    `previous_status` ENUM('Pending', 'Payment Pending', 'Approved', 'Checked in', 'Checked out', 'Cancelled', 'No show') DEFAULT NULL,
    `check_in_date` DATETIME DEFAULT NULL,
    `check_out_date` DATETIME DEFAULT NULL,
    `cancellation_reason` TEXT DEFAULT NULL,
    `date` DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`student_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Complaints Table
CREATE TABLE IF NOT EXISTS `complaints` (
    `id` VARCHAR(50) PRIMARY KEY,
    `student_id` VARCHAR(50) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT NOT NULL,
    `images` LONGTEXT DEFAULT NULL,
    `status` ENUM('Pending', 'In Progress', 'Resolved') DEFAULT 'Pending',
    `technician_appointment` DATE DEFAULT NULL,
    `resolved_at` DATETIME DEFAULT NULL,
    `date` DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`student_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Court Bookings Table
CREATE TABLE IF NOT EXISTS `court_bookings` (
    `id` VARCHAR(50) PRIMARY KEY,
    `student_id` VARCHAR(50) NOT NULL,
    `student_name` VARCHAR(100) NOT NULL,
    `sport` VARCHAR(50) NOT NULL,
    `date` DATE NOT NULL,
    `time_slot` VARCHAR(10) NOT NULL,
    `status` ENUM('Pending', 'Approved', 'Rejected', 'Cancelled') DEFAULT 'Pending',
    `cancelled_at` TIMESTAMP NULL DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    -- Unique constraint ensures only one active booking per slot (Cancelled/Rejected slots are excluded at app layer)
    FOREIGN KEY (`student_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Migration: Run this on existing databases to add cancellation support
-- ALTER TABLE `court_bookings` MODIFY COLUMN `status` ENUM('Pending', 'Approved', 'Rejected', 'Cancelled') DEFAULT 'Pending';
-- ALTER TABLE `court_bookings` ADD COLUMN `cancelled_at` TIMESTAMP NULL DEFAULT NULL AFTER `status`;

-- 7. Notifications Table
CREATE TABLE IF NOT EXISTS `notifications` (
    `id` VARCHAR(50) PRIMARY KEY,
    `user_id` VARCHAR(50) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `message` TEXT NOT NULL,
    `type` ENUM('info', 'success', 'warning', 'error') DEFAULT 'info',
    `is_read` BOOLEAN DEFAULT FALSE,
    `related_entity_id` VARCHAR(50) DEFAULT NULL,
    `related_entity_type` VARCHAR(50) DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Audit Logs Table
CREATE TABLE IF NOT EXISTS `audit_logs` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `actor_id` VARCHAR(50) NOT NULL,
    `actor_name` VARCHAR(255) NOT NULL,
    `action` VARCHAR(100) NOT NULL,
    `entity_type` VARCHAR(50) NOT NULL,
    `entity_id` VARCHAR(50) DEFAULT NULL,
    `details` LONGTEXT DEFAULT NULL,
    `ip_address` VARCHAR(45) DEFAULT NULL,
    `user_agent` TEXT DEFAULT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Court Settings Table
CREATE TABLE IF NOT EXISTS `court_settings` (
    `setting_key` VARCHAR(50) PRIMARY KEY,
    `setting_value` JSON NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. Payments Table
CREATE TABLE IF NOT EXISTS `payments` (
    `id` VARCHAR(50) PRIMARY KEY,
    `user_id` VARCHAR(50) NOT NULL,
    `reference_id` VARCHAR(50) NOT NULL,
    `amount` DECIMAL(10, 2) NOT NULL,
    `method` VARCHAR(50),
    `status` ENUM('Pending', 'Success', 'Failed') DEFAULT 'Pending',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. Assets Table
CREATE TABLE IF NOT EXISTS `assets` (
    `id` VARCHAR(50) NOT NULL PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL,
    `type` ENUM('Furniture', 'Appliance', 'Fixture', 'Electronics') NOT NULL,
    `status` ENUM('Good', 'Damaged', 'Maintenance', 'Written Off') DEFAULT 'Good',
    `location_id` VARCHAR(10) DEFAULT NULL,
    `purchase_date` DATE DEFAULT NULL,
    `value` DECIMAL(10, 2) DEFAULT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`location_id`) REFERENCES `rooms` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. Room Change Requests Table
CREATE TABLE IF NOT EXISTS `room_change_requests` (
    `id` VARCHAR(50) PRIMARY KEY,
    `student_id` VARCHAR(50) NOT NULL,
    `current_room_id` VARCHAR(10) NOT NULL,
    `preferred_room_type` VARCHAR(50),
    `preferred_bed_id` VARCHAR(50),
    `reason` TEXT NOT NULL,
    `status` ENUM('Pending Review', 'Approved - Assigned', 'Approved - Waitlist', 'Rejected', 'Completed') DEFAULT 'Pending Review',
    `waitlist_position` INT DEFAULT NULL,
    `admin_notes` TEXT,
    `reviewed_by` VARCHAR(50),
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`student_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`current_room_id`) REFERENCES `rooms`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- SEED DATA
-- Default Admin
INSERT INTO `users` (`id`, `name`, `email`, `role`, `gender`, `password`) VALUES 
('admin', 'System Admin', 'admin@unikl.edu.my', 'admin', 'Male', 'admin123')
ON DUPLICATE KEY UPDATE name=name;

-- Default Court Settings
INSERT IGNORE INTO `court_settings` (`setting_key`, `setting_value`) VALUES 
('main', '{"isOpen": true, "openTime": "08:00", "closeTime": "22:00", "blockedSlots": []}'),
('gym', '{"isOpen": true, "openTime": "08:00", "closeTime": "20:00"}'),
('laundry', '{"isOpen": true, "openTime": "00:00", "closeTime": "23:59"}');

-- Seed Rooms (Floors 1-7)
INSERT IGNORE INTO `rooms` (`id`, `floor_id`, `gender`, `room_type`, `capacity`) VALUES 
('101', 1, 'Male', 'Shared (4)', 4), ('102', 1, 'Male', 'Shared (4)', 4), ('103', 1, 'Male', 'Shared (4)', 4), ('104', 1, 'Male', 'Shared (4)', 4), ('105', 1, 'Male', 'Shared (4)', 4),
('201', 2, 'Male', 'Shared (4)', 4), ('202', 2, 'Male', 'Shared (4)', 4), ('203', 2, 'Male', 'Shared (4)', 4), ('204', 2, 'Male', 'Shared (4)', 4), ('205', 2, 'Male', 'Shared (4)', 4),
('301', 3, 'Male', 'Shared (4)', 4), ('302', 3, 'Male', 'Shared (4)', 4), ('303', 3, 'Male', 'Shared (4)', 4), ('304', 3, 'Male', 'Shared (4)', 4), ('305', 3, 'Male', 'Shared (4)', 4),
('401', 4, 'Female', 'Shared (4)', 4), ('402', 4, 'Female', 'Shared (4)', 4), ('403', 4, 'Female', 'Shared (4)', 4), ('404', 4, 'Female', 'Shared (4)', 4), ('405', 4, 'Female', 'Shared (4)', 4),
('501', 5, 'Female', 'Shared (4)', 4), ('502', 5, 'Female', 'Shared (4)', 4), ('503', 5, 'Female', 'Shared (4)', 4), ('504', 5, 'Female', 'Shared (4)', 4), ('505', 5, 'Female', 'Shared (4)', 4),
('601', 6, 'Female', 'Shared (4)', 4), ('602', 6, 'Female', 'Shared (4)', 4), ('603', 6, 'Female', 'Shared (4)', 4), ('604', 6, 'Female', 'Shared (4)', 4), ('605', 6, 'Female', 'Shared (4)', 4),
('701', 7, 'Female', 'Shared (4)', 4), ('702', 7, 'Female', 'Shared (4)', 4), ('703', 7, 'Female', 'Shared (4)', 4), ('704', 7, 'Female', 'Shared (4)', 4), ('705', 7, 'Female', 'Shared (4)', 4);

-- Seed Beds for Room 101-105 (Examples)
INSERT IGNORE INTO `beds` (`id`, `room_id`, `label`) VALUES 
('101-A', '101', 'A'), ('101-B', '101', 'B'), ('101-C', '101', 'C'), ('101-D', '101', 'D'),
('102-A', '102', 'A'), ('102-B', '102', 'B'), ('102-C', '102', 'C'), ('102-D', '102', 'D'),
('103-A', '103', 'A'), ('103-B', '103', 'B'), ('103-C', '103', 'C'), ('103-D', '103', 'D');
