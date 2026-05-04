const mysql = require('mysql2/promise');

async function checkDb() {
    try {
        const pool = mysql.createPool({
            host: '127.0.0.1',
            port: 3306,
            user: 'root',
            password: '',
            database: 'stayunikl_db',
        });
        const [revenue] = await pool.query(`
            SELECT 
                DATE_FORMAT(date, '%b %Y') as month,
                SUM(total_price) as total
            FROM applications 
            WHERE status LIKE 'Approved%' OR status = 'Checked in'
            GROUP BY month
            ORDER BY MIN(date) ASC
            LIMIT 6
        `);
        console.log('Revenue Fallback:', revenue);

        const [intake] = await pool.query(`
            SELECT 
                DATE_FORMAT(date, '%b %Y') as month,
                COUNT(*) as count
            FROM applications
            GROUP BY month
            ORDER BY MIN(date) ASC
            LIMIT 6
        `);
        console.log('Intake Data:', intake);

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

checkDb();
