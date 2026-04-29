USE `stayunikl_db`;

SET FOREIGN_KEY_CHECKS = 0;

-- Ensure rooms table exists (Prerequisite for Foreign Key)
CREATE TABLE IF NOT EXISTS `rooms` (
    `id` VARCHAR(10) PRIMARY KEY,
    `floor_id` INT NOT NULL,
    `gender` ENUM('Male', 'Female') NOT NULL,
    `room_type` VARCHAR(50) NOT NULL,
    `capacity` INT NOT NULL,
    `status` ENUM('Active', 'Maintenance') DEFAULT 'Active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Drop and Recreate Assets
DROP TABLE IF EXISTS `assets`;
CREATE TABLE `assets` (
    `id` VARCHAR(50) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `type` ENUM('Furniture', 'Appliance', 'Fixture', 'Electronics') NOT NULL,
    `status` ENUM('Good', 'Damaged', 'Maintenance', 'Written Off') DEFAULT 'Good',
    `location_id` VARCHAR(10) DEFAULT NULL,
    `purchase_date` DATE DEFAULT NULL,
    `value` DECIMAL(10, 2) DEFAULT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    CONSTRAINT `fk_asset_location` FOREIGN KEY (`location_id`) REFERENCES `rooms` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Drop and Recreate Maintenance Logs
DROP TABLE IF EXISTS `maintenance_logs`;
CREATE TABLE `maintenance_logs` (
    `id` VARCHAR(50) NOT NULL,
    `asset_id` VARCHAR(50) NOT NULL,
    `action` ENUM('Repair', 'Replace', 'Service') NOT NULL,
    `description` TEXT DEFAULT NULL,
    `cost` DECIMAL(10, 2) DEFAULT NULL,
    `performed_by` VARCHAR(100) DEFAULT NULL,
    `date` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    CONSTRAINT `fk_log_asset` FOREIGN KEY (`asset_id`) REFERENCES `assets` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- Seed some initial assets
INSERT IGNORE INTO `assets` (`id`, `name`, `type`, `status`, `location_id`, `value`) VALUES
('AST-001', 'Study Desk', 'Furniture', 'Good', '101', 150.00),
('AST-002', 'Study Chair', 'Furniture', 'Good', '101', 80.00),
('AST-003', 'Study Desk', 'Furniture', 'Damaged', '102', 150.00),
('AST-004', 'Air Conditioner', 'Appliance', 'Good', '101', 1200.00),
('AST-005', 'Ceiling Fan', 'Fixture', 'Good', '101', 200.00);

