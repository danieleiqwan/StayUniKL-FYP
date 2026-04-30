const mysql = require('mysql2/promise');

async function migrate() {
    const conn = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'stayunikl_db'
    });
    console.log('Connected. Running court QR check-in migration...');

    try {
        await conn.execute("ALTER TABLE court_bookings ADD COLUMN attendance_status ENUM('Pending', 'Show', 'No-Show') DEFAULT 'Pending'");
        console.log('[OK] attendance_status added to court_bookings');
    } catch(e) { console.log('[SKIP] attendance_status:', e.message); }

    try {
        await conn.execute("ALTER TABLE users ADD COLUMN court_no_shows INT DEFAULT 0");
        console.log('[OK] court_no_shows added to users');
    } catch(e) { console.log('[SKIP] court_no_shows:', e.message); }

    try {
        await conn.execute("ALTER TABLE users ADD COLUMN court_ban_until DATETIME NULL DEFAULT NULL");
        console.log('[OK] court_ban_until added to users');
    } catch(e) { console.log('[SKIP] court_ban_until:', e.message); }

    await conn.end();
}
migrate().catch(console.error);
