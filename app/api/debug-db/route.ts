import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { isAdmin } from '@/lib/auth';

export async function GET() {
    try {
        const admin = await isAdmin();
        if (!admin) {
            return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 401 });
        }
        let results: any = {};

        try {
            const [rows]: any = await pool.query('SELECT COUNT(*) as count FROM applications');
            results.applications = rows[0].count;
        } catch (e: any) { results.applications = `Error: ${e.message}`; }

        try {
            const [rows]: any = await pool.query('SELECT COUNT(*) as count FROM rooms');
            results.rooms = rows[0].count;
        } catch (e: any) { results.rooms = `Error: ${e.message}`; }

        try {
            const [rows]: any = await pool.query('SELECT COUNT(*) as count FROM beds');
            results.beds = rows[0].count;
        } catch (e: any) { results.beds = `Error: ${e.message}`; }

        return NextResponse.json({ success: true, ...results });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
