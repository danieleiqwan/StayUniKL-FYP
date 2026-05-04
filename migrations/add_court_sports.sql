-- Migration: Add court_sports table for dynamic sport management
-- Run this in your MySQL database

CREATE TABLE IF NOT EXISTS court_sports (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    color_theme VARCHAR(20) NOT NULL DEFAULT 'orange',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Seed the 4 existing sports
INSERT INTO court_sports (id, name, color_theme, is_active, display_order) VALUES
    ('badminton', 'Badminton', 'emerald', TRUE, 1),
    ('volleyball', 'Volleyball', 'amber', TRUE, 2),
    ('basketball', 'Basketball', 'orange', TRUE, 3),
    ('football', 'Football', 'rose', TRUE, 4)
ON DUPLICATE KEY UPDATE name = VALUES(name);
