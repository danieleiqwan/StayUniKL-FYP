
const mysql = require('mysql2/promise');

async function checkUser() {
    const pool = mysql.createPool({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'stayunikl_db',
    });

    try {
        const [rows] = await pool.query(
            'SELECT id, email, role, name, password FROM users WHERE email = ?',
            ['daniel@unikl.edu.my']
        );
        console.log('User found:', JSON.stringify(rows, null, 2));
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await pool.end();
    }
}

checkUser();
