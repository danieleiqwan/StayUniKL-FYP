-- Migration: Create checkout_tokens table
-- Run this if the table doesn't exist yet in your database
CREATE TABLE IF NOT EXISTS checkout_tokens (
    token VARCHAR(255) PRIMARY KEY,
    application_id VARCHAR(50) NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_application_id (application_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
