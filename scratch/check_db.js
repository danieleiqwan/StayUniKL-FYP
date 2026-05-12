const mysql = require('mysql2/promise');

async function checkTriggers() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'stayunikl_db'
    });

    try {
        const [triggers] = await connection.query('SHOW TRIGGERS');
        console.log('--- TRIGGERS ---');
        console.log(JSON.stringify(triggers, null, 2));
        
        const [tables] = await connection.query('SHOW TABLES');
        console.log('--- TABLES ---');
        console.log(tables);
    } catch (err) {
        console.error(err);
    } finally {
        await connection.end();
    }
}

checkTriggers();
