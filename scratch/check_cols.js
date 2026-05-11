const pool = require('./lib/db.ts').default;

async function check() {
    try {
        const [rows] = await pool.query('DESCRIBE users');
        console.log('Users Columns:', rows.map(r => r.Field));
    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
}
check();
