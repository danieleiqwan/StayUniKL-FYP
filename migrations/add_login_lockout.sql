USE stayunikl_db;

ALTER TABLE users 
ADD COLUMN login_attempts INT DEFAULT 0,
ADD COLUMN locked_until TIMESTAMP NULL DEFAULT NULL;
