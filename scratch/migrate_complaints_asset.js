const mysql = require('mysql2/promise');

async function migrate() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'stayunikl_db'
    });

    try {
        console.log('Adding asset column to complaints table...');
        await connection.query('ALTER TABLE complaints ADD COLUMN asset VARCHAR(100) AFTER description');
        console.log('Column added successfully.');
    } catch (err) {
        if (err.code === 'ER_DUP_COLUMN_NAME') {
            console.log('Column already exists.');
        } else {
            console.error('Migration failed:', err);
        }
    } finally {
        await connection.end();
    }
}

migrate();
