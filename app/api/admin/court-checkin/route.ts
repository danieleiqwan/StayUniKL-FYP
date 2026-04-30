import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { getAuthUser } from '@/lib/auth';
import pool from '@/lib/db';
import { createNotification } from '@/lib/notifications';

export async function PUT(request: Request) {
    try {
        const admin = await getAuthUser();
        if (!admin || admin.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden. Admin access required.' }, { status: 403 });
        }

        const { token } = await request.json();
        
        let decoded: any;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
        } catch (err: any) {
            if (err.name === 'TokenExpiredError') {
                return NextResponse.json({ error: 'QR Code expired. Ask student to refresh their QR code.' }, { status: 400 });
            }
            return NextResponse.json({ error: 'Invalid or forged QR Code.' }, { status: 400 });
        }

        const bookingId = decoded.bookingId;

        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            const [rows]: any = await connection.query(`
                SELECT b.*, u.name as student_name, u.court_no_shows, u.court_ban_until 
                FROM court_bookings b
                JOIN users u ON b.student_id = u.id
                WHERE b.id = ? FOR UPDATE
            `, [bookingId]);

            if (rows.length === 0) {
                await connection.rollback();
                return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
            }

            const booking = rows[0];

            if (booking.attendance_status === 'Show') {
                await connection.rollback();
                return NextResponse.json({ error: 'Student has already checked in.' }, { status: 400 });
            }

            if (booking.attendance_status === 'No-Show') {
                await connection.rollback();
                return NextResponse.json({ error: 'Booking was already marked as No-Show.' }, { status: 400 });
            }

            // Validate time window (e.g., check-in opens 30 mins before, closes 15 mins after)
            const now = new Date();
            const bookingDate = new Date(booking.date);
            const [hours, minutes] = booking.time_slot.split(':').map(Number);
            bookingDate.setHours(hours, minutes, 0, 0);

            const diffMinutes = (now.getTime() - bookingDate.getTime()) / 60000;

            if (diffMinutes < -30) {
                await connection.rollback();
                return NextResponse.json({ error: 'Too early to check in. Check-in opens 30 minutes before the slot.' }, { status: 400 });
            }

            if (diffMinutes > 15) {
                // Time window missed -> Auto NO-SHOW & Penalty
                await connection.query('UPDATE court_bookings SET attendance_status = "No-Show" WHERE id = ?', [bookingId]);
                
                const newNoShows = (booking.court_no_shows || 0) + 1;
                let banQuery = 'UPDATE users SET court_no_shows = ? WHERE id = ?';
                let banParams: any[] = [newNoShows, booking.student_id];
                
                let message = `You missed your ${booking.sport} booking on ${bookingDate.toLocaleDateString()}. `;
                if (newNoShows === 1) {
                    message += "This is your first warning.";
                } else {
                    const banDays = newNoShows === 2 ? 3 : 7;
                    const banUntil = new Date(now.getTime() + banDays * 24 * 60 * 60 * 1000);
                    banQuery = 'UPDATE users SET court_no_shows = ?, court_ban_until = ? WHERE id = ?';
                    banParams = [newNoShows, banUntil, booking.student_id];
                    message += `Due to multiple no-shows, your court booking privileges are suspended until ${banUntil.toLocaleDateString()}.`;
                }

                await connection.query(banQuery, banParams);
                await connection.commit();

                // Notify student
                await createNotification({
                    userId: booking.student_id,
                    title: 'Court Booking No-Show',
                    message,
                    type: 'error',
                    relatedEntityId: bookingId,
                    relatedEntityType: 'CourtBooking'
                });

                return NextResponse.json({ error: 'Time window missed. Marked as No-Show.' }, { status: 400 });
            }

            // Check-in successful
            await connection.query('UPDATE court_bookings SET attendance_status = "Show" WHERE id = ?', [bookingId]);
            await connection.commit();

            return NextResponse.json({ 
                success: true, 
                message: 'Check-in successful!',
                student: { name: booking.student_name, sport: booking.sport, timeSlot: booking.time_slot, studentId: booking.student_id }
            });

        } catch (err) {
            await connection.rollback();
            throw err;
        } finally {
            connection.release();
        }

    } catch (e: any) {
        return NextResponse.json({ error: e.message || 'Server error' }, { status: 500 });
    }
}
