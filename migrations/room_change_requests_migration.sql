-- Room Change Requests Table Migration
-- This table manages student room change requests from submission to completion

CREATE TABLE IF NOT EXISTS room_change_requests (
    -- Primary identifier
    id VARCHAR(255) PRIMARY KEY,
    
    -- Student information
    student_id VARCHAR(255) NOT NULL,
    student_name VARCHAR(255) NOT NULL,
    
    -- Current room info (from active application)
    current_room_id VARCHAR(50) NOT NULL,
    current_bed_id VARCHAR(50) NOT NULL,
    
    -- Preferred new room (optional - student can specify preference)
    preferred_room_id VARCHAR(50) NULL,
    preferred_room_type VARCHAR(20) NULL,
    
    -- Request details
    reason TEXT NOT NULL,
    attachment_url VARCHAR(500) NULL,
    
    -- Status flow: Pending Review -> Approved (Assigned/Waitlist) / Rejected -> Completed
    status VARCHAR(30) DEFAULT 'Pending Review',
    
    -- Assignment details (populated when approved with room)
    new_room_id VARCHAR(50) NULL,
    new_bed_id VARCHAR(50) NULL,
    waitlist_position INT NULL,
    
    -- Admin decision tracking
    admin_notes TEXT NULL,
    reviewed_by VARCHAR(255) NULL,
    reviewed_at DATETIME NULL,
    
    -- Completion tracking (when student moves)
    old_room_checkout_date DATETIME NULL,
    new_room_checkin_date DATETIME NULL,
    completed_at DATETIME NULL,
    
    -- Timestamps
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign key constraints
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (current_room_id) REFERENCES rooms(id),
    FOREIGN KEY (current_bed_id) REFERENCES beds(id),
    FOREIGN KEY (new_room_id) REFERENCES rooms(id),
    FOREIGN KEY (new_bed_id) REFERENCES beds(id),
    
    -- Index for faster queries
    INDEX idx_student_status (student_id, status),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Valid status values (enforced at application level):
-- 'Pending Review' - Initial status when student submits
-- 'Approved - Assigned' - Admin approved and assigned a room
-- 'Approved - Waitlist' - Admin approved but no room available
-- 'Rejected' - Admin rejected the request
-- 'Completed' - Student has moved to new room
-- 'Cancelled' - Request cancelled by student or admin
