const pool = require('./lib/db').default;

async function checkDb() {
    try {
        const [apps] = await pool.query('SELECT status, count(*) FROM applications GROUP BY status');
        console.log('Applications:', apps);

        const [payments] = await pool.query('SELECT status, count(*) FROM payments GROUP BY status');
        console.log('Payments:', payments);

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

checkDb();
