-- Migration: Add is_active column to users table
-- Run this on your production database

ALTER TABLE users ADD COLUMN is_active TINYINT(1) DEFAULT 1 AFTER role;

-- Note: All existing users will be set to is_active = 1 (Active) by default.
