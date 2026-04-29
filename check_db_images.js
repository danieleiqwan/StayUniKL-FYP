const mysql = require('mysql2/promise');

async function check() {
    const pool = mysql.createPool({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'stayunikl_db'
    });

    try {
        const [rows] = await pool.query('SELECT id, name, email, profile_image FROM users');
        console.log('User Data in DB:');
        rows.forEach(row => {
            const hasValue = row.profile_image !== null;
            const valType = typeof row.profile_image;
            const len = hasValue ? row.profile_image.length : 'NULL';
            
            console.log(`- ${row.name} (${row.id}): Type=${valType}, Length=${len}`);
            if (hasValue && len < 100) {
                console.log(`  Value: "${row.profile_image}"`);
            }
        });
    } catch (err) {
        console.error('DB Error:', err);
    } finally {
        await pool.end();
    }
}

check();
