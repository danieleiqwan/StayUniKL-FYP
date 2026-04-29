USE stayunikl_db;

-- 1. Create Invoices Table
CREATE TABLE IF NOT EXISTS invoices (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    application_id VARCHAR(50) DEFAULT NULL, -- Links to specific booking if applicable
    type ENUM('Hostel Fee', 'Deposit', 'Fine', 'Other') NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    status ENUM('Unpaid', 'Paid', 'Partially Paid', 'Overdue', 'Cancelled') DEFAULT 'Unpaid',
    due_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 2. Create Refunds Table
CREATE TABLE IF NOT EXISTS refunds (
    id VARCHAR(50) PRIMARY KEY,
    payment_id VARCHAR(50) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    reason TEXT,
    status ENUM('Pending', 'Processed', 'Rejected') DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE CASCADE
);

-- 3. Update Payments Table to link to Invoices
-- We use a safe approach: try to add the column, if it fails (exists), we ignore.
ALTER TABLE payments ADD COLUMN invoice_id VARCHAR(50) DEFAULT NULL;
ALTER TABLE payments ADD INDEX (invoice_id);

-- 4. Initial Seed / Backfill (Optional)
-- If we had existing payments for bookings, we could backfill invoices, but for now we start fresh.
