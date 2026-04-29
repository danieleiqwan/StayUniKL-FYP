const fs = require('fs');

let sql = `USE stayunikl_db;

-- 1. Create Rooms Table
CREATE TABLE IF NOT EXISTS rooms (
    id VARCHAR(10) PRIMARY KEY,
    floor_id INT NOT NULL,
    gender ENUM('Male', 'Female') NOT NULL,
    room_type VARCHAR(50) NOT NULL,
    capacity INT NOT NULL,
    status ENUM('Active', 'Maintenance') DEFAULT 'Active'
);

-- 2. Create Beds Table
CREATE TABLE IF NOT EXISTS beds (
    id VARCHAR(20) PRIMARY KEY,
    room_id VARCHAR(10) NOT NULL,
    label VARCHAR(5) NOT NULL, -- A, B, C, D
    status ENUM('Available', 'Occupied', 'Maintenance') DEFAULT 'Available',
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
);

-- 3. Add bed_id to Applications
-- We simply try to add the column. 
-- Note: If running this multiple times, this specific line might error if column exists, 
-- but the main goal is ensuring the tables exist and are seeded.
ALTER TABLE applications ADD COLUMN bed_id VARCHAR(20) DEFAULT NULL;

-- 4. Seed Data
DELETE FROM beds;
DELETE FROM rooms;

INSERT INTO rooms (id, floor_id, gender, room_type, capacity) VALUES 
`;

const roomValues = [];
const bedValues = [];

// Floors 1-3: Male, 4-7: Female
for (let f = 1; f <= 7; f++) {
    const gender = f <= 3 ? 'Male' : 'Female';
    for (let r = 1; r <= 5; r++) {
        const roomId = `${f}0${r}`;
        const roomType = 'Shared (4)'; // Defaulting all to Shared 4 for simplicity as per mock
        const capacity = 4;

        roomValues.push(`('${roomId}', ${f}, '${gender}', '${roomType}', ${capacity})`);

        ['A', 'B', 'C', 'D'].forEach(label => {
            const bedId = `${roomId}-${label}`;
            bedValues.push(`('${bedId}', '${roomId}', '${label}')`);
        });
    }
}

sql += roomValues.join(',\n') + ';\n\n';
sql += 'INSERT INTO beds (id, room_id, label) VALUES \n';
sql += bedValues.join(',\n') + ';\n';

fs.writeFileSync('room_migration.sql', sql);
console.log('room_migration.sql generated!');
