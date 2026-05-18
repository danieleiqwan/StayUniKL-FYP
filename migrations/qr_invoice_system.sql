USE stayunikl_db;

-- 1. Extend invoices table to support new Phase 4 fields and statuses
-- Convert 'type' to VARCHAR to support the new detailed invoice types
ALTER TABLE invoices
    MODIFY COLUMN type VARCHAR(100) NOT NULL,
    ADD COLUMN IF NOT EXISTS created_by VARCHAR(50) DEFAULT 'System',
    ADD COLUMN IF NOT EXISTS due_date DATE NULL AFTER amount;

-- If 'evidence_url' was added previously, we will migrate it to the new table if needed,
-- but standardizing on a new `invoice_evidence` table is safer.

-- 2. Create invoice_evidence table
CREATE TABLE IF NOT EXISTS invoice_evidence (
    id INT AUTO_INCREMENT PRIMARY KEY,
    invoice_id VARCHAR(50) NOT NULL,
    file_url VARCHAR(255) NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    uploaded_by VARCHAR(50) NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
);

-- 3. Create Audit Log table for all invoice actions (Phase 5)
CREATE TABLE IF NOT EXISTS invoice_audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    invoice_id VARCHAR(50) NOT NULL,
    action VARCHAR(100) NOT NULL,
    performed_by VARCHAR(50) NOT NULL,
    details TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

SELECT 'QR Invoice System Migration completed successfully.' AS result;
