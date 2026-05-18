const mysql = require('mysql2/promise');
const fs = require('fs');

async function migrate() {
    let host = 'localhost', user = 'root', password = '', database = 'stayunikl_db';
    try {
        const env = fs.readFileSync('.env.local', 'utf-8');
        const lines = env.split('\n');
        for (const line of lines) {
            if (line.startsWith('DB_HOST=')) host = line.split('=')[1].trim();
            if (line.startsWith('DB_USER=')) user = line.split('=')[1].trim();
            if (line.startsWith('DB_PASSWORD=')) password = line.split('=')[1].trim();
            if (line.startsWith('DB_NAME=')) database = line.split('=')[1].trim();
        }
    } catch (e) {
        // use defaults
    }

    const connection = await mysql.createConnection({
        host, user, password, database, multipleStatements: true
    });

    const sql = `
        ALTER TABLE invoices
            MODIFY COLUMN type VARCHAR(100) NOT NULL,
            ADD COLUMN IF NOT EXISTS created_by VARCHAR(50) DEFAULT 'System',
            ADD COLUMN IF NOT EXISTS due_date DATE NULL AFTER amount;

        CREATE TABLE IF NOT EXISTS invoice_evidence (
            id INT AUTO_INCREMENT PRIMARY KEY,
            invoice_id VARCHAR(50) NOT NULL,
            file_url VARCHAR(255) NOT NULL,
            file_type VARCHAR(50) NOT NULL,
            uploaded_by VARCHAR(50) NOT NULL,
            uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS invoice_audit_logs (
            id INT AUTO_INCREMENT PRIMARY KEY,
            invoice_id VARCHAR(50) NOT NULL,
            action VARCHAR(100) NOT NULL,
            performed_by VARCHAR(50) NOT NULL,
            details TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `;

    try {
        console.log('Running migration...');
        await connection.query(sql);
        console.log('Migration successful.');
    } catch (e) {
        console.error('Migration failed:', e);
    } finally {
        await connection.end();
    }
}

migrate();
