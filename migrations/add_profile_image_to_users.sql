-- Run this script to add profile image support to the users table
USE stayunikl_db;

-- Add profile_image column to users table
ALTER TABLE users ADD COLUMN profile_image LONGTEXT DEFAULT NULL;
