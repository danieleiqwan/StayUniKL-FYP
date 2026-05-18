import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS invoice_evidence (
                id INT AUTO_INCREMENT PRIMARY KEY,
                invoice_id VARCHAR(50) NOT NULL,
                file_url VARCHAR(255) NOT NULL,
                file_type VARCHAR(50) NOT NULL,
                uploaded_by VARCHAR(50) NOT NULL,
                uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
            )
        `);
        return NextResponse.json({ success: true, message: 'Table created' });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
