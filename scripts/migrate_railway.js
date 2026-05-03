/**
 * Railway Production DB Migration
 * Run: node scripts/migrate_railway.js
 * 
 * Set env vars first:
 *   $env:PROD_DB_HOST="..."
 *   $env:PROD_DB_USER="..."
 *   $env:PROD_DB_PASSWORD="..."
 *   $env:PROD_DB_NAME="..."
 *   $env:PROD_DB_PORT="..."
 */

const mysql = require('mysql2/promise');

const config = {
    host: process.env.PROD_DB_HOST,
    user: process.env.PROD_DB_USER,
    password: process.env.PROD_DB_PASSWORD,
    database: process.env.PROD_DB_NAME,
    port: parseInt(process.env.PROD_DB_PORT || '3306'),
    ssl: { rejectUnauthorized: false }
};

async function run() {
    if (!config.host || !config.user || !config.database) {
        console.error('Missing required env vars: PROD_DB_HOST, PROD_DB_USER, PROD_DB_PASSWORD, PROD_DB_NAME');
        process.exit(1);
    }

    console.log(`Connecting to ${config.host}:${config.port}/${config.database}...`);
    const pool = mysql.createPool(config);

    const migrations = [
        // invoices: add description column
        {
            label: 'invoices.description',
            sql: "ALTER TABLE invoices ADD COLUMN description TEXT DEFAULT NULL AFTER type",
            ignoreDuplicate: true
        },
        // users: add student_id
        {
            label: 'users.student_id',
            sql: "ALTER TABLE users ADD COLUMN student_id VARCHAR(50) DEFAULT NULL",
            ignoreDuplicate: true
        },
        // documents: create table if missing
        {
            label: 'documents table',
            sql: `CREATE TABLE IF NOT EXISTS documents (
                id VARCHAR(50) PRIMARY KEY,
                user_id VARCHAR(50) NOT NULL,
                type VARCHAR(100) NOT NULL,
                name VARCHAR(255) NOT NULL,
                file_url TEXT NOT NULL,
                status ENUM('Pending','Verified','Rejected') DEFAULT 'Pending',
                rejection_reason TEXT DEFAULT NULL,
                admin_notes TEXT DEFAULT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`,
            ignoreDuplicate: false
        },
        // documents: add name column if table existed without it
        {
            label: 'documents.name',
            sql: "ALTER TABLE documents ADD COLUMN name VARCHAR(255) NOT NULL DEFAULT '' AFTER type",
            ignoreDuplicate: true
        },
        // documents: fix type column to accept any string
        {
            label: 'documents.type to VARCHAR',
            sql: "ALTER TABLE documents MODIFY COLUMN type VARCHAR(100) NOT NULL",
            ignoreDuplicate: false
        },
        // documents: add rejection_reason if missing
        {
            label: 'documents.rejection_reason',
            sql: "ALTER TABLE documents ADD COLUMN rejection_reason TEXT DEFAULT NULL",
            ignoreDuplicate: true
        }
    ];

    for (const m of migrations) {
        try {
            await pool.query(m.sql);
            console.log(`✓ ${m.label}`);
        } catch (err) {
            if (m.ignoreDuplicate && err.code === 'ER_DUP_FIELDNAME') {
                console.log(`~ ${m.label} (already exists, skipped)`);
            } else if (err.code === 'ER_TABLE_EXISTS_ERROR') {
                console.log(`~ ${m.label} (table already exists, skipped)`);
            } else {
                console.error(`✗ ${m.label}: ${err.message}`);
            }
        }
    }

    console.log('\nDone. Verify with: SHOW COLUMNS FROM documents; SHOW COLUMNS FROM users;');
    process.exit(0);
}

run();
