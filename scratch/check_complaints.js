const pool = require('./lib/db').default;

async function checkComplaints() {
    try {
        const [rows] = await pool.query('SELECT * FROM complaints ORDER BY date DESC LIMIT 10');
        console.log('Recent Complaints:');
        console.table(rows);
        
        const [users] = await pool.query('SELECT id, name, student_id FROM users WHERE id IN (?)', [rows.map(r => r.student_id)]);
        console.log('Related Users:');
        console.table(users);
        
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkComplaints();
