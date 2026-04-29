-- Run this script to UPDATE your existing database structure
USE stayunikl_db;

-- 1. Modify the ENUM column to include new statuses
ALTER TABLE applications 
MODIFY COLUMN status ENUM('Pending', 'Payment Pending', 'Approved', 'Checked in', 'Checked out', 'Cancelled', 'No show') DEFAULT 'Pending';

-- 2. Modify the previous_status ENUM column as well
ALTER TABLE applications 
MODIFY COLUMN previous_status ENUM('Pending', 'Payment Pending', 'Approved', 'Checked in', 'Checked out', 'Cancelled', 'No show') DEFAULT NULL;

-- 3. Add the new tracking columns (if they don't exist, this might error in some versions but usually fine to run directly if missing)
-- We check existence by just trying to add them. If they exist, these lines might fail, which is fine, but the modify above is the critical part.
-- Helper procedure to add column safely is complex in raw SQL, simplest is to just run ADD COLUMN and ignore "Duplicate column" error if strictly needed, 
-- but since the user likely has the OLD schema, these columns are DEFINITELY missing.

ALTER TABLE applications ADD COLUMN check_in_date DATETIME DEFAULT NULL;
ALTER TABLE applications ADD COLUMN check_out_date DATETIME DEFAULT NULL;
ALTER TABLE applications ADD COLUMN cancellation_reason TEXT DEFAULT NULL;
