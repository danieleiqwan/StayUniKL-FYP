const mysql = require('mysql2/promise');

async function migrate() {
    const conn = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'stayunikl_db'
    });
    console.log('Connected. Running court_bookings migration...');

    // 1. Add 'Cancelled' to status ENUM
    try {
        await conn.execute(
            "ALTER TABLE court_bookings MODIFY COLUMN `status` ENUM('Pending','Approved','Rejected','Cancelled') DEFAULT 'Pending'"
        );
        console.log('[OK] status ENUM updated with Cancelled');
    } catch (e) {
        console.log('[SKIP] status ENUM:', e.message);
    }

    // 2. Add cancelled_at column (idempotent - skips if already exists)
    try {
        await conn.execute(
            'ALTER TABLE court_bookings ADD COLUMN `cancelled_at` TIMESTAMP NULL DEFAULT NULL AFTER `status`'
        );
        console.log('[OK] cancelled_at column added');
    } catch (e) {
        console.log('[SKIP] cancelled_at:', e.message);
    }

    await conn.end();
    console.log('Migration complete.');
}

migrate().catch(console.error);
