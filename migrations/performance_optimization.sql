-- StayUniKL Database Optimization Script
-- This script adds indexes to frequently queried columns to speed up the system as data Grows.

USE stayunikl_db;

-- 1. Optimize Applications
CREATE INDEX idx_apps_status ON applications(status);
CREATE INDEX idx_apps_student ON applications(student_id);
CREATE INDEX idx_apps_date ON applications(date);

-- 2. Optimize Complaints
CREATE INDEX idx_complaints_status ON complaints(status);
CREATE INDEX idx_complaints_student ON complaints(student_id);
CREATE INDEX idx_complaints_date ON complaints(date);

-- 3. Optimize Court Bookings
CREATE INDEX idx_court_date ON court_bookings(date);
CREATE INDEX idx_court_student ON court_bookings(student_id);
CREATE INDEX idx_court_timeslot ON court_bookings(time_slot);

-- 4. Optimize Audit Logs (Very critical for performance)
CREATE INDEX idx_audit_created ON audit_logs(created_at);
CREATE INDEX idx_audit_actor ON audit_logs(actor_id);
CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);

-- 5. Optimize Users
CREATE INDEX idx_users_role ON users(role);

-- 6. Optimize Rooms & Beds
CREATE INDEX idx_beds_room ON beds(room_id);
CREATE INDEX idx_beds_status ON beds(status);
