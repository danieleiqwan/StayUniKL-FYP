USE stayunikl_db;

-- ============================================================
-- INSTALLMENT PAYMENT SYSTEM MIGRATION
-- UniKL Hostel Policy: Fixed RM600/semester, Full or Installment
-- ============================================================

-- 1. Add payment_method to applications table
ALTER TABLE applications
    ADD COLUMN IF NOT EXISTS payment_method ENUM('Full Payment', 'Installment Plan') NOT NULL DEFAULT 'Full Payment',
    MODIFY COLUMN stay_duration INT NOT NULL DEFAULT 4,
    MODIFY COLUMN duration_type VARCHAR(50) NOT NULL DEFAULT '1_semester',
    MODIFY COLUMN total_price DECIMAL(10,2) NOT NULL DEFAULT 600.00;

-- 2. Extend invoices table to support installment tracking
ALTER TABLE invoices
    ADD COLUMN IF NOT EXISTS description VARCHAR(255) DEFAULT NULL AFTER type,
    ADD COLUMN IF NOT EXISTS payment_plan ENUM('Full', 'Installment') NOT NULL DEFAULT 'Full' AFTER description,
    ADD COLUMN IF NOT EXISTS installment_no INT DEFAULT NULL AFTER payment_plan,
    ADD COLUMN IF NOT EXISTS installment_total INT DEFAULT NULL AFTER installment_no,
    ADD COLUMN IF NOT EXISTS paid_at TIMESTAMP NULL DEFAULT NULL AFTER status,
    MODIFY COLUMN type ENUM('Hostel Fee', 'Hostel Fee - Installment', 'Deposit', 'Fine', 'Other') NOT NULL,
    MODIFY COLUMN status ENUM('Unpaid', 'Paid', 'Partially Paid', 'Overdue', 'Cancelled') DEFAULT 'Unpaid';

-- 3. Backfill existing invoices with default payment_plan = 'Full'
UPDATE invoices SET payment_plan = 'Full' WHERE payment_plan IS NULL OR payment_plan = '';

-- 4. Backfill existing applications: set payment_method based on total_price
UPDATE applications 
SET payment_method = 'Full Payment', stay_duration = 4, duration_type = '1_semester', total_price = 600.00
WHERE total_price = 600 OR total_price = 480;

UPDATE applications 
SET payment_method = 'Installment Plan', stay_duration = 4, duration_type = '1_semester', total_price = 600.00
WHERE total_price = 120;

-- Ensure all applications have a total_price of 600
UPDATE applications SET total_price = 600.00 WHERE total_price != 600.00 OR total_price IS NULL;

-- 5. Application-level payment status (semester fee aggregate)
ALTER TABLE applications
    ADD COLUMN IF NOT EXISTS payment_status ENUM('Pending', 'Partially Paid', 'Fully Paid', 'Overdue') NOT NULL DEFAULT 'Pending';

-- 6. Admin-configurable grace period (7–14 days)
CREATE TABLE IF NOT EXISTS hostel_billing_settings (
    setting_key VARCHAR(64) PRIMARY KEY,
    setting_value VARCHAR(255) NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
INSERT IGNORE INTO hostel_billing_settings (setting_key, setting_value) VALUES ('grace_period_days', '10');

-- 7. Create index for faster installment queries
CREATE INDEX idx_invoices_application_installment 
    ON invoices (application_id, installment_no);

SELECT 'Installment migration completed successfully.' AS result;
