const mysql = require('mysql2/promise');
const fs = require('fs');

const envConfig = fs.readFileSync('.env.local', 'utf8').split('\n').reduce((acc, line) => {
    const [key, ...value] = line.split('=');
    if (key && key.trim()) acc[key.trim()] = value.join('=').trim();
    return acc;
}, {});

process.env = { ...process.env, ...envConfig };

(async () => {
    const pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'stayunikl'
    });

    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS documents (
                id VARCHAR(50) PRIMARY KEY,
                user_id VARCHAR(50) NOT NULL,
                type VARCHAR(50) NOT NULL,
                name VARCHAR(255) NOT NULL,
                file_url VARCHAR(1000) NOT NULL,
                status ENUM('Pending', 'Verified', 'Rejected') DEFAULT 'Pending',
                rejection_reason TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            );
        `);
        console.log('Documents table created successfully');
    } catch (err) {
        console.error('Error creating table:', err);
    }
    process.exit(0);
})();
