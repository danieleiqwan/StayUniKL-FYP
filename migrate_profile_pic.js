
const mysql = require('mysql2/promise');

async function migrate() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'stayunikl_db'
    });

    try {
        await connection.query("ALTER TABLE users ADD COLUMN profile_image VARCHAR(255) DEFAULT NULL");
        console.log("Column added successfully or already exists (if handled).");
    } catch (e) {
        console.log("Error (probably column exists):", e.message);
    }
    await connection.end();
}

migrate();
