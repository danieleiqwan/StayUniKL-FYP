-- Migration: Decouple Student ID from primary key
-- Run this in TablePlus / MySQL to apply the schema change

-- Add student_id as a separate nullable column (the official issued ID)
-- The primary key (id) is now a generated identifier (e.g. NRIC-based or UUID)
ALTER TABLE `users`
    ADD COLUMN `student_id` VARCHAR(50) NULL DEFAULT NULL UNIQUE AFTER `id`;

-- Optional: For existing users who were registered with their student ID as `id`,
-- copy it into the new student_id column so existing data is preserved.
UPDATE `users` 
    SET `student_id` = `id`
    WHERE `id` REGEXP '^[0-9]+$' AND `student_id` IS NULL;
