const mysql = require('mysql2/promise');

async function run() {
    const pool = mysql.createPool({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'stayunikl_db'
    });

    const testComplaint = {
        id: `test_${Date.now()}`,
        studentId: '021019-03-0975', // Cehzerraa
        title: 'Broken Table Test',
        description: 'Testing the table complaint submission logic.',
        asset: 'Study Table'
    };

    try {
        console.log('--- ATTEMPTING TEST INSERT ---');
        const [result] = await pool.query(
            'INSERT INTO complaints (id, student_id, title, description, asset) VALUES (?, ?, ?, ?, ?)',
            [testComplaint.id, testComplaint.studentId, testComplaint.title, testComplaint.description, testComplaint.asset]
        );
        console.log('Insert success:', result);

        const [verify] = await pool.query('SELECT * FROM complaints WHERE id = ?', [testComplaint.id]);
        console.log('Verification:', verify);

    } catch (err) {
        console.error('Insert FAILED:', err.message);
        
        if (err.message.includes("Unknown column 'asset'")) {
            console.log('Column "asset" is missing. Attempting fix...');
            await pool.query('ALTER TABLE complaints ADD COLUMN asset VARCHAR(255) DEFAULT NULL AFTER description');
            console.log('Fixed. Try running again.');
        }
    } finally {
        await pool.end();
    }
}

run();
