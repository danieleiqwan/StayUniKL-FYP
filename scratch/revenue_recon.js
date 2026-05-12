const mysql = require('mysql2/promise');

async function runDiagnostic() {
    const pool = await mysql.createPool({
        host: '127.0.0.1',
        user: 'root',
        password: '',
        database: 'stayunikl_db'
    });

    console.log('--- REVENUE RECONCILIATION ---');

    // 1. Applications for May
    const [apps] = await pool.query("SELECT SUM(total_price) as total FROM applications WHERE (status LIKE 'Approved%' OR status = 'Checked in') AND DATE_FORMAT(date, '%b %Y') = 'May 2026'");
    console.log('Applications (Approved/Checked-in) for May:', apps[0].total || 0);

    // 2. Paid Invoices for May
    const [invoices] = await pool.query("SELECT SUM(amount) as total FROM invoices WHERE status = 'Paid' AND DATE_FORMAT(created_at, '%b %Y') = 'May 2026'");
    console.log('Paid Invoices created in May:', invoices[0].total || 0);

    // 3. Successful Payments for May
    const [payments] = await pool.query("SELECT SUM(amount) as total FROM payments WHERE status IN ('Success', 'Paid') AND DATE_FORMAT(created_at, '%b %Y') = 'May 2026'");
    console.log('Successful Payments in May:', payments[0].total || 0);

    // 4. Global Total Collected
    const [allPaidInvoices] = await pool.query("SELECT SUM(amount) as total FROM invoices WHERE status = 'Paid'");
    console.log('GLOBAL Total Collected (All Paid Invoices):', allPaidInvoices[0].total || 0);

    // 5. Check if any application exists without a paid invoice
    const [unpaidApps] = await pool.query(`
        SELECT a.id, a.user_id, a.total_price 
        FROM applications a 
        LEFT JOIN invoices i ON a.id = i.application_id AND i.status = 'Paid'
        WHERE (a.status LIKE 'Approved%' OR a.status = 'Checked in') 
        AND DATE_FORMAT(a.date, '%b %Y') = 'May 2026'
        AND i.id IS NULL
    `);
    
    if (unpaidApps.length > 0) {
        console.log('\nPotential Discrepancy Found:');
        unpaidApps.forEach(app => {
            console.log(`- Application ${app.id} (User: ${app.user_id}) has a price of RM ${app.total_price} but NO paid invoice linked.`);
        });
    }

    await pool.end();
}

runDiagnostic().catch(console.error);
