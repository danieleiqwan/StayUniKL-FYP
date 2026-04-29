USE stayunikl_db;

-- Safely add images column to complaints table
SET @dbname = DATABASE();
SET @tablename = "complaints";
SET @columnname = "images";
SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE TABLE_SCHEMA = @dbname
     AND TABLE_NAME = @tablename
     AND COLUMN_NAME = @columnname) > 0,
  "SELECT 1",
  CONCAT("ALTER TABLE ", @tablename,
         " ADD COLUMN ", @columnname,
         " JSON DEFAULT NULL AFTER description;")
));
PREPARE stmt FROM @preparedStatement;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
