const mysql = require('mysql2/promise');

async function check() {
    const pool = mysql.createPool({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'stayunikl_db'
    });
    
    // Check what beds exist in room 104
    const [beds] = await pool.query("SELECT id, label, room_id, status FROM beds WHERE room_id = '104'");
    console.log('\n=== BEDS IN ROOM 104 ===');
    console.table(beds);

    const bedIds = beds.map(b => b.id);
    if (bedIds.length === 0) { console.log('No beds found!'); process.exit(0); }

    // Check applications pointing to these beds
    const [apps] = await pool.query(
        `SELECT a.id, a.student_id, u.name, a.status, a.bed_id, a.room_id
         FROM applications a
         LEFT JOIN users u ON a.student_id = u.id
         WHERE a.bed_id IN (?)`,
        [bedIds]
    );
    console.log('\n=== APPLICATIONS POINTING TO ROOM 104 BEDS ===');
    console.table(apps);

    await pool.end();
}

check().catch(console.error);
