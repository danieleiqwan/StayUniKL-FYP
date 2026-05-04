
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Manually parse .env.local to avoid dependency on dotenv
const envPath = path.resolve(process.cwd(), '.env.local');
const envConfig = fs.readFileSync(envPath, 'utf8');
envConfig.split('\n').forEach(line => {
    const [key, ...value] = line.split('=');
    if (key && value) {
        process.env[key.trim()] = value.join('=').trim();
    }
});

async function backfillInvoices() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '3306'),
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'stayunikl_db',
    });

    console.log('--- Starting Invoice Backfill ---');

    try {
        const [payments] = await pool.query(
            "SELECT * FROM payments WHERE reference_id LIKE 'app_%' AND (invoice_id IS NULL OR invoice_id = '')"
        );

        console.log(`Found ${payments.length} potential application payments without invoices.`);

        for (const payment of payments) {
            const appId = payment.reference_id;
            const userId = payment.user_id;
            const amount = payment.amount;
            
            const [existingInvoices] = await pool.query(
                "SELECT id FROM invoices WHERE application_id = ?",
                [appId]
            );

            if (existingInvoices.length > 0) {
                console.log(`Payment ${payment.id}: Invoice already exists for app ${appId}. Linking...`);
                await pool.query(
                    "UPDATE payments SET invoice_id = ? WHERE id = ?",
                    [existingInvoices[0].id, payment.id]
                );
                continue;
            }

            const invoiceId = `INV-BF-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
            const description = `Hostel Application Fee (Ref: ${appId})`;
            
            console.log(`Creating invoice ${invoiceId} for user ${userId}, app ${appId}`);

            await pool.query(
                `INSERT INTO invoices (id, user_id, application_id, type, description, amount, status, due_date, created_at)
                 VALUES (?, ?, ?, 'Hostel Fee', ?, ?, 'Paid', ?, ?)`,
                [
                    invoiceId, 
                    userId, 
                    appId, 
                    description, 
                    amount, 
                    payment.created_at, 
                    payment.created_at
                ]
            );

            await pool.query(
                "UPDATE payments SET invoice_id = ? WHERE id = ?",
                [invoiceId, payment.id]
            );
            
            console.log(`Successfully backfilled and linked invoice for payment ${payment.id}`);
        }

        console.log('--- Backfill Completed Successfully ---');
    } catch (error) {
        console.error('Backfill failed:', error);
    } finally {
        await pool.end();
    }
}

backfillInvoices();
