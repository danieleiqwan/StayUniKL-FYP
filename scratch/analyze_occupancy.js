const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

const envPath = path.resolve(process.cwd(), '.env.local');
const envConfig = fs.readFileSync(envPath, 'utf8');
envConfig.split('\n').forEach(line => {
    const [key, ...value] = line.split('=');
    if (key && value) {
        process.env[key.trim()] = value.join('=').trim();
    }
});

async function analyze() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '3306'),
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'stayunikl_db',
    });

    try {
        const [beds] = await pool.query("SELECT COUNT(*) as c FROM beds WHERE status = 'Occupied'");
        console.log("Beds marked as Occupied:", beds[0].c);

        const [appsAll] = await pool.query("SELECT COUNT(*) as c FROM applications");
        console.log("Total Applications ever:", appsAll[0].c);
        
        const [appsActive] = await pool.query("SELECT COUNT(*) as c FROM applications WHERE status IN ('Approved', 'Checked in', 'Payment Pending')");
        console.log("Active Applications:", appsActive[0].c);
        
        const [students] = await pool.query("SELECT COUNT(*) as c FROM users WHERE role = 'student'");
        console.log("Total Students in DB:", students[0].c);

        const [intake6M] = await pool.query(`
            SELECT SUM(count) as c FROM (
                SELECT COUNT(*) as count FROM applications GROUP BY DATE_FORMAT(date, '%b %Y') ORDER BY MIN(date) ASC LIMIT 6
            ) as t
        `);
        console.log("Intake 6 Months query result:", intake6M[0].c);

    } catch (e) {
        console.error(e.message);
    } finally {
        await pool.end();
    }
}
analyze();
