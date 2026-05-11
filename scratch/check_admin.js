const pool = require('./lib/db.ts').default;

async function check() {
    try {
        const [rows] = await pool.query('SELECT id, name, created_at, phone_number FROM users WHERE id = "ADMIN002"');
        console.log('User Record:', rows[0]);
    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
}
check();
