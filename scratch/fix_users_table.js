const mysql = require('mysql2/promise');

async function main() {
    const connection = await mysql.createConnection({
        host: '127.0.0.1',
        port: 3306,
        user: 'root',
        password: '',
        database: 'stayunikl_db'
    });

    try {
        console.log("Checking columns for 'users' table...");
        const [columns] = await connection.query('SHOW COLUMNS FROM users');
        const colNames = columns.map(c => c.Field);
        console.log("Current columns:", colNames);

        if (!colNames.includes('login_attempts')) {
            console.log("Adding 'login_attempts' column...");
            await connection.query('ALTER TABLE users ADD COLUMN login_attempts INT DEFAULT 0');
        }
        if (!colNames.includes('locked_until')) {
            console.log("Adding 'locked_until' column...");
            await connection.query('ALTER TABLE users ADD COLUMN locked_until TIMESTAMP NULL DEFAULT NULL');
        }
        if (!colNames.includes('last_login')) {
            console.log("Adding 'last_login' column...");
            await connection.query('ALTER TABLE users ADD COLUMN last_login TIMESTAMP NULL DEFAULT NULL');
        }
        if (!colNames.includes('last_login_at')) {
            console.log("Adding 'last_login_at' column...");
            await connection.query('ALTER TABLE users ADD COLUMN last_login_at TIMESTAMP NULL DEFAULT NULL');
        }

        console.log("Users table columns updated successfully!");
    } catch (err) {
        console.error("Failed to alter users table:", err);
    } finally {
        await connection.end();
    }
}

main();
