-- Database Schema for StayUniKL System
-- Import this file into your XAMPP MySQL Database (phpMyAdmin)

CREATE DATABASE IF NOT EXISTS stayunikl_db;
USE stayunikl_db;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY, -- Student ID or Admin ID
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    role ENUM('student', 'admin') NOT NULL,
    gender ENUM('Male', 'Female') NOT NULL,
    phone_number VARCHAR(20),
    parent_phone_number VARCHAR(20),
    password VARCHAR(255), -- In a real app, this should be hashed!
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Applications Table
CREATE TABLE IF NOT EXISTS applications (
    id VARCHAR(50) PRIMARY KEY,
    student_id VARCHAR(50) NOT NULL,
    student_name VARCHAR(100) NOT NULL,
    room_type VARCHAR(50) NOT NULL,
    floor_id VARCHAR(10),
    stay_duration INT DEFAULT 1, -- In months (1 or 4)
    total_price DECIMAL(10, 2) DEFAULT 120.00,
    status ENUM('Pending', 'Payment Pending', 'Approved', 'Checked in', 'Checked out', 'Cancelled', 'No show') DEFAULT 'Pending',
    previous_status ENUM('Pending', 'Payment Pending', 'Approved', 'Checked in', 'Checked out', 'Cancelled', 'No show') DEFAULT NULL,
    check_in_date DATETIME DEFAULT NULL,
    check_out_date DATETIME DEFAULT NULL,
    cancellation_reason TEXT DEFAULT NULL,
    date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Complaints Table
CREATE TABLE IF NOT EXISTS complaints (
    id VARCHAR(50) PRIMARY KEY,
    student_id VARCHAR(50) NOT NULL,
    student_name VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    status ENUM('Pending', 'In Progress', 'Resolved') DEFAULT 'Pending',
    technician_appointment DATE,
    date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 4. Court Bookings Table
CREATE TABLE IF NOT EXISTS court_bookings (
    id VARCHAR(50) PRIMARY KEY,
    student_id VARCHAR(50) NOT NULL,
    student_name VARCHAR(100) NOT NULL,
    sport VARCHAR(50) NOT NULL,
    date DATE NOT NULL,
    time_slot VARCHAR(10) NOT NULL, -- Format: "09:00"
    status ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 5. Court Settings (Key-Value Store for simple settings)
CREATE TABLE IF NOT EXISTS court_settings (
    setting_key VARCHAR(50) PRIMARY KEY,
    setting_value JSON NOT NULL
);

-- 6. Payments Table
CREATE TABLE IF NOT EXISTS payments (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    reference_id VARCHAR(50) NOT NULL, -- Links to Application ID or Court Booking ID
    amount DECIMAL(10, 2) NOT NULL,
    method VARCHAR(50),
    status ENUM('Pending', 'Success', 'Failed') DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Insert Default Admin User
INSERT INTO users (id, name, email, role, gender, password) VALUES 
('admin', 'System Admin', 'admin@unikl.edu.my', 'admin', 'Male', 'admin123')
ON DUPLICATE KEY UPDATE name=name;

-- Insert Default Court Settings
INSERT IGNORE INTO court_settings (setting_key, setting_value) VALUES 
('main', '{"isOpen": true, "openTime": "08:00", "closeTime": "22:00", "blockedSlots": []}');
