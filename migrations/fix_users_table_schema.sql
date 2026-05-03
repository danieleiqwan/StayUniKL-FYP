-- Split SQL Fix for Users Table
-- Run these one-by-one and skip any that say "Duplicate column"

ALTER TABLE `users` ADD COLUMN `nric` VARCHAR(20) NULL UNIQUE AFTER `name`;
ALTER TABLE `users` ADD COLUMN `nationality` VARCHAR(50) DEFAULT 'Local' AFTER `password`;
ALTER TABLE `users` ADD COLUMN `birth_date` DATE DEFAULT NULL AFTER `nationality`;
ALTER TABLE `users` ADD COLUMN `student_id` VARCHAR(50) NULL DEFAULT NULL UNIQUE AFTER `id`;
