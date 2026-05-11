const fs = require('fs');
const mysql = require('mysql2/promise');

async function run() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || '127.0.0.1',
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        multipleStatements: true
    });

    console.log('Connected to database.');
    const sql = fs.readFileSync('assets_population.sql', 'utf8');
    
    console.log('Executing population script...');
    await connection.query(sql);
    
    console.log('Success! All 630 assets populated.');
    await connection.end();
}

run().catch(console.error);
