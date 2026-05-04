require('dotenv').config({ path: '.env.local' });
const mysql = require('mysql2/promise');

async function checkDb() {
    try {
        const pool = mysql.createPool({
            host: process.env.DB_HOST || '127.0.0.1',
            port: parseInt(process.env.DB_PORT || '3306'),
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'stayunikl_db',
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
        process.exit(0);
    } catch (e) {
        console.error("SQL Error:", e);
        process.exit(1);
    }
}

checkDb();
