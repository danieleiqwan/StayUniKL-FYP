const pool = require('../lib/db').default;

async function checkSchema() {
    try {
        const [columns] = await pool.query('DESCRIBE complaints');
        console.log('Complaints Table Schema:');
        console.table(columns);
        
        const [complaints] = await pool.query('SELECT * FROM complaints LIMIT 5');
        console.log('Sample Complaints:');
        console.table(complaints);

        const [users] = await pool.query('SELECT id, name, student_id FROM users LIMIT 5');
        console.log('Sample Users:');
        console.table(users);
        
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkSchema();
