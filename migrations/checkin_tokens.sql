USE stayunikl_db;

CREATE TABLE IF NOT EXISTS checkin_tokens (
    token VARCHAR(255) PRIMARY KEY,
    application_id VARCHAR(50) NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE
) ENGINE=InnoDB;
