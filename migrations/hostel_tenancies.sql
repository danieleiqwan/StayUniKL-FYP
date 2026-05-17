CREATE TABLE IF NOT EXISTS hostel_tenancies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(64) NOT NULL,
    room_id VARCHAR(64) NOT NULL,
    check_in_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    check_out_date DATETIME NULL,
    status ENUM('Active', 'Completed') DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Note: We maintain backward compatibility by also checking the applications table
-- for historical 'Checked in' statuses until legacy records are fully migrated to tenancies.
