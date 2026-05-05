const mysql = require('mysql2/promise');

async function checkSchema() {
    const pool = mysql.createPool({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'stayunikl_db'
    });

    try {
        const [rows] = await pool.query('DESCRIBE complaints');
        console.log('Complaints Table Schema:');
        console.table(rows);
    } catch (err) {
        console.error('Error describing table:', err);
    } finally {
        await pool.end();
    }
}

checkSchema();
