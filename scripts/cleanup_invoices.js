const mysql = require('mysql2/promise');

(async () => {
    // 1. Clean Local
    console.log('Cleaning local DB...');
    const localPool = mysql.createPool({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'stayunikl_db'
    });
    try {
        const [res] = await localPool.query("DELETE i FROM invoices i JOIN applications a ON i.application_id = a.id WHERE i.id LIKE 'INV-AUTO-%' AND a.duration_type = '1_semester'");
        console.log(`Local DB: Deleted ${res.affectedRows} wrong auto-invoices.`);
    } catch (err) {
        console.error('Local DB Error:', err.message);
    }

    // 2. Clean Railway
    console.log('\nCleaning Railway DB...');
    const railwayPool = mysql.createPool({
        host: 'switchback.proxy.rlwy.net',
        port: 45297,
        user: 'root',
        password: 'MnhccJNnAxzCmDerzGSUCVboIlsmNyTl',
        database: 'railway'
    });
    try {
        const [res] = await railwayPool.query("DELETE i FROM invoices i JOIN applications a ON i.application_id = a.id WHERE i.id LIKE 'INV-AUTO-%' AND a.duration_type = '1_semester'");
        console.log(`Railway DB: Deleted ${res.affectedRows} wrong auto-invoices.`);
    } catch (err) {
        console.error('Railway DB Error:', err.message);
    }

    process.exit(0);
})();
