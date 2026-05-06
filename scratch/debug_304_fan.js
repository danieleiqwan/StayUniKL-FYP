const mysql = require('mysql2/promise');

async function run() {
    const pool = mysql.createPool({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'stayunikl_db'
    });

    try {
        const studentId = '021019-03-0975';
        
        console.log('--- SEARCHING FOR COMPLAINT OWNER ---');
        const [users] = await pool.query(
            "SELECT id, student_id, name FROM users WHERE id = ? OR student_id = ?",
            [studentId, studentId]
        );
        console.table(users);

        if (users.length > 0) {
            const internalId = users[0].id;
            console.log('\n--- ROOM ASSIGNMENTS FOR THIS STUDENT ---');
            const [apps] = await pool.query(
                "SELECT student_id, room_id, bed_id, status FROM applications WHERE student_id = ? OR student_id = ?",
                [internalId, studentId]
            );
            console.table(apps);
        }

        console.log('\n--- ALL COMPLAINTS MENTIONING 304 ---');
        const [comps304] = await pool.query(
            "SELECT id, student_id, title, description, status FROM complaints WHERE title LIKE '%304%' OR description LIKE '%304%'"
        );
        console.table(comps304);

        console.log('\n--- COMPLAINTS MENTIONING FAN IN APRIL 2026 ---');
        const [compsFan] = await pool.query(
            "SELECT id, student_id, title, description, status, date FROM complaints WHERE (title LIKE '%fan%' OR description LIKE '%fan%') AND date > '2026-04-01'"
        );
        console.table(compsFan);

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await pool.end();
    }
}

run();
