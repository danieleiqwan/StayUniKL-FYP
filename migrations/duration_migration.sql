USE stayunikl_db;

-- Safely add duration_type ENUM column to applications table if it doesn't exist
SET @dbname = DATABASE();
SET @tablename = "applications";
SET @columnname = "duration_type";
SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE TABLE_SCHEMA = @dbname
     AND TABLE_NAME = @tablename
     AND COLUMN_NAME = @columnname) > 0,
  "SELECT 1",
  CONCAT("ALTER TABLE ", @tablename,
         " ADD COLUMN ", @columnname,
         " ENUM('1_month', '1_semester') DEFAULT NULL AFTER stay_duration;")
));
PREPARE stmt FROM @preparedStatement;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Back-fill existing rows based on stay_duration value
UPDATE applications SET duration_type = '1_month'    WHERE stay_duration = 1  AND duration_type IS NULL;
UPDATE applications SET duration_type = '1_semester' WHERE stay_duration = 4  AND duration_type IS NULL;
