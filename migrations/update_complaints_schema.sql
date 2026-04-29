USE `stayunikl_db`;

ALTER TABLE `complaints` 
ADD COLUMN `resolved_at` DATETIME DEFAULT NULL AFTER `status`;

-- Update existing resolved complaints to have a resolved_at date (mocking it for existing data)
UPDATE `complaints` 
SET `resolved_at` = `date` 
WHERE `status` = 'Resolved' AND `resolved_at` IS NULL;
