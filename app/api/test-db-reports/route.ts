import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
    try {
        const [intake] = await pool.query(`
            SELECT 
                DATE_FORMAT(date, '%b %Y') as month,
                COUNT(*) as count
            FROM applications
            GROUP BY month
            ORDER BY MIN(date) ASC
            LIMIT 6
        `);
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
        return NextResponse.json({ intake, revenue });
    } catch (e: any) {
        return NextResponse.json({ error: JSON.stringify(e, Object.getOwnPropertyNames(e)) });
    }
}
