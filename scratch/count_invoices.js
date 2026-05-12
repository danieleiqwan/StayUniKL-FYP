const mysql = require('mysql2/promise');
const fs = require('fs');

async function run() {
    let config = {
        DB_HOST: '127.0.0.1',
        DB_USER: 'root',
        DB_PASSWORD: '',
        DB_NAME: 'stayunikl_db',
        DB_PORT: 3306
    };

    try {
        const env = fs.readFileSync('.env.local', 'utf8');
        env.split('\n').forEach(line => {
            const parts = line.split('=');
            if (parts.length >= 2) {
                config[parts[0].trim()] = parts[1].trim();
            }
        });
    } catch (e) {}

    console.log('Connecting to:', config.DB_HOST, 'on port', config.DB_PORT);

    try {
        const connection = await mysql.createConnection({
            host: config.DB_HOST,
            user: config.DB_USER,
            password: config.DB_PASSWORD,
            database: config.DB_NAME,
            port: parseInt(config.DB_PORT)
        });

        const [rows] = await connection.execute('SELECT COUNT(*) as count FROM invoices');
        console.log(`RESULT: ${rows[0].count}`);
        await connection.end();
    } catch (err) {
        console.log('CONNECTION ERROR:', err);
    }
}
run().catch(err => console.log(`UNCAUGHT ERROR:`, err));
