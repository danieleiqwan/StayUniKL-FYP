const pool = require('./lib/db').default;

async function check() {
    try {
        const [tables]: any = await pool.query("SHOW TABLES");
        console.log("Tables in database:", tables.map((t: any) => Object.values(t)[0]));

        const [beds]: any = await pool.query("SELECT COUNT(*) as count FROM beds");
        console.log("Beds count:", beds[0].count);

        const [users]: any = await pool.query("SELECT COUNT(*) as count FROM users");
        console.log("Users count:", users[0].count);

        const [apps]: any = await pool.query("SELECT COUNT(*) as count FROM applications");
        console.log("Applications count:", apps[0].count);

        process.exit(0);
    } catch (err) {
        console.error("Database check failed:", err);
        process.exit(1);
    }
}

check();
