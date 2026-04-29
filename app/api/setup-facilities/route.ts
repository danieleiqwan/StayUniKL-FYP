import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { isAdmin } from '@/lib/auth';

export async function GET() {
    try {
        const admin = await isAdmin();
        if (!admin) {
            return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 401 });
        }
        // Insert default Gym settings
        await pool.query(
            "INSERT IGNORE INTO court_settings (setting_key, setting_value) VALUES (?, ?)",
            ['gym', JSON.stringify({ isOpen: true, openTime: '06:00', closeTime: '23:00', blockedSlots: [] })]
        );

        // Insert default Laundry settings
        await pool.query(
            "INSERT IGNORE INTO court_settings (setting_key, setting_value) VALUES (?, ?)",
            ['laundry', JSON.stringify({ isOpen: true, openTime: '00:00', closeTime: '23:59', blockedSlots: [] })]
        );

        return NextResponse.json({ success: true, message: 'Facility settings initialized' });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
