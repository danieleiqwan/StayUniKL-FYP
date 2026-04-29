USE `stayunikl_db`;

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `documents`;

CREATE TABLE `documents` (
    `id` VARCHAR(50) NOT NULL,
    `user_id` VARCHAR(50) NOT NULL,
    `type` ENUM('Student ID', 'Payment Proof', 'Agreement', 'Other') NOT NULL,
    `file_url` TEXT NOT NULL,
    `status` ENUM('Pending', 'Verified', 'Rejected') DEFAULT 'Pending',
    `admin_notes` TEXT DEFAULT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    CONSTRAINT `fk_document_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SET FOREIGN_KEY_CHECKS = 1;
