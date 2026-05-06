const mysql = require('mysql2/promise');

async function run() {
    const pool = mysql.createPool({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'stayunikl_db'
    });

    const userId = '021019-03-0975'; // Cehzerraa / eiqwan's email

    try {
        console.log('--- CEHZERRAA INVOICES ---');
        const [invoices] = await pool.query(
            "SELECT id, status, amount, due_date FROM invoices WHERE user_id = ? ORDER BY due_date DESC",
            [userId]
        );
        console.table(invoices);

        console.log('\n--- CEHZERRAA APPLICATION ---');
        const [apps] = await pool.query(
            "SELECT student_id, room_id, bed_id, status FROM applications WHERE student_id = ?",
            [userId]
        );
        console.table(apps);

        console.log('\n--- ALL ROOM 304 GHOST HUNT (any app referencing these bed IDs) ---');
        const [ghost] = await pool.query(
            "SELECT a.student_id, u.name, a.room_id, a.bed_id, a.status FROM applications a JOIN users u ON a.student_id = u.id WHERE a.bed_id IN ('304-A','304-B','304-C','304-D')"
        );
        console.table(ghost);

        console.log('\n--- ALL COMPLAINTS BY CEHZERRAA ---');
        const [comps] = await pool.query(
            "SELECT id, title, description, asset, status, date FROM complaints WHERE student_id = ? ORDER BY date DESC",
            [userId]
        );
        console.table(comps);

        console.log('\n--- ALL COMPLAINTS MENTIONING TABLE OR 304 ---');
        const [tableComps] = await pool.query(
            "SELECT id, student_id, title, description, status, date FROM complaints WHERE title LIKE '%table%' OR description LIKE '%table%' OR title LIKE '%304%' OR description LIKE '%304%' ORDER BY date DESC"
        );
        console.table(tableComps);

    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await pool.end();
    }
}

run();
