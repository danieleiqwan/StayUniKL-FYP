import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { getAuthUser } from '@/lib/auth';
import pool from '@/lib/db';

export async function GET(request: Request) {
    try {
        const user = await getAuthUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { searchParams } = new URL(request.url);
        const bookingId = searchParams.get('bookingId');

        if (!bookingId) return NextResponse.json({ error: 'bookingId is required' }, { status: 400 });

        const [rows]: any = await pool.query('SELECT * FROM court_bookings WHERE id = ? AND student_id = ?', [bookingId, user.id]);
        
        if (rows.length === 0) return NextResponse.json({ error: 'Booking not found or access denied' }, { status: 404 });

        const booking = rows[0];

        if (booking.status !== 'Approved') {
            return NextResponse.json({ error: 'Only approved bookings can generate a QR code' }, { status: 400 });
        }

        if (booking.attendance_status !== 'Pending') {
            return NextResponse.json({ error: `Check-in is already marked as ${booking.attendance_status}` }, { status: 400 });
        }

        // Generate a short-lived token (5 mins) to prevent screenshot sharing
        const token = jwt.sign(
            { bookingId: booking.id, studentId: user.id }, 
            process.env.JWT_SECRET || 'fallback_secret', 
            { expiresIn: '5m' }
        );

        return NextResponse.json({ success: true, token });
    } catch (e: any) {
        return NextResponse.json({ error: 'Failed to generate token' }, { status: 500 });
    }
}
