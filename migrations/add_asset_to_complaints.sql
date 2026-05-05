USE stayunikl_db;

-- Add asset column to complaints table
ALTER TABLE complaints ADD COLUMN asset VARCHAR(255) DEFAULT NULL AFTER description;
