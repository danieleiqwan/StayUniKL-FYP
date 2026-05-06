const mysql = require('mysql2/promise');

async function run() {
    const pool = mysql.createPool({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'stayunikl_db'
    });

    try {
        console.log('--- FIXING ROOM 304 SYNC ---');
        
        // 1. Get User IDs for the residents shown in UI
        // names: eiqwan (Cehzerraa), daniel, bot, mohd
        const [users] = await pool.query(
            "SELECT id, name FROM users WHERE name LIKE '%Cehzerraa%' OR name LIKE '%daniel%' OR name LIKE '%Bot%' OR name LIKE '%mohd%'"
        );
        console.log('Found users:', users.map(u => u.name));

        const cehId = users.find(u => u.name === 'Cehzerraa')?.id;
        const danId = users.find(u => u.name.toLowerCase().includes('daniel'))?.id;
        const botId = users.find(u => u.name.toLowerCase().includes('bot'))?.id;
        const mohdId = users.find(u => u.name.toLowerCase().includes('mohd'))?.id;

        // 2. Assign them to Room 304 beds
        const assignments = [
            { uid: cehId, bed: '304-A' },
            { uid: danId, bed: '304-B' },
            { uid: botId, bed: '304-C' },
            { uid: mohdId, bed: '304-D' }
        ];

        for (const { uid, bed } of assignments) {
            if (uid) {
                console.log(`Assigning ${uid} to ${bed}...`);
                // Update Application
                await pool.query(
                    "UPDATE applications SET room_id = '304', bed_id = ?, floor_id = 3, status = 'Checked in' WHERE student_id = ? AND status != 'Cancelled'",
                    [bed, uid]
                );
                // Update Bed Status
                await pool.query(
                    "UPDATE beds SET status = 'Occupied' WHERE id = ?",
                    [bed]
                );
            }
        }

        console.log('Room 304 sync complete.');

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await pool.end();
    }
}

run();
