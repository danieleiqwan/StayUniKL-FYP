const pool = require('./lib/db.ts').default;

async function check() {
    try {
        const [rows] = await pool.query('SELECT id, name, email, created_at, phone_number FROM users WHERE email = "admin02@stayunikl.edu.my"');
        console.log('User Record:', JSON.stringify(rows[0], null, 2));
    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
}
check();
