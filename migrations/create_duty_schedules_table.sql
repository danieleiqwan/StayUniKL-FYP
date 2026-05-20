-- Create duty_schedules table
CREATE TABLE IF NOT EXISTS `duty_schedules` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `role` ENUM('SRC', 'Fellow') NOT NULL,
  `hostel_block` VARCHAR(50) NOT NULL,
  `floor` VARCHAR(50) NOT NULL,
  `duty_date` DATE NOT NULL,
  `start_time` TIME NOT NULL,
  `end_time` TIME NOT NULL,
  `contact_number` VARCHAR(50) NOT NULL,
  `status` ENUM('active', 'inactive') DEFAULT 'active',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
