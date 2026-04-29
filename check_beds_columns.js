const mysql = require('mysql2/promise');

async function check() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'stayunikl_db'
    });

    try {
        const [rows] = await connection.query("SHOW COLUMNS FROM beds");
        console.log("Columns in 'beds' table:");
        rows.forEach(row => console.log(`- ${row.Field} (${row.Type})`));
    } catch (e) {
        console.error("Error checking columns:", e.message);
    }
    await connection.end();
}

check();
