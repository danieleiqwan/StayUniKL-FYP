const pool = require('./lib/db').default;

async function check() {
    try {
        const [rows]: any = await pool.query("SELECT id, student_id, total_price, status FROM applications LIMIT 10");
        console.log("Sample Applications:", rows);
        
        const [sumRows]: any = await pool.query("SELECT SUM(total_price) as total FROM applications WHERE status LIKE 'Approved%' OR status = 'Checked in'");
        console.log("Total Potential Revenue from Apps:", sumRows[0].total);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
