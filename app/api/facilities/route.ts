import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { createNotification, createSystemNotification } from '@/lib/notifications';

// GET: Fetch bookings and all facility settings
export async function GET(request: Request) {
    try {
        // Fetch Bookings (for court)
        const { searchParams } = new URL(request.url);
        const studentId = searchParams.get('studentId');

        let query = `
            SELECT b.*, u.name as student_name 
            FROM court_bookings b
            LEFT JOIN users u ON b.student_id = u.id
        `;
        let params: any[] = [];

        if (studentId) {
            query += ' WHERE b.student_id = ?';
            params.push(studentId);
        }
        query += ' ORDER BY b.date DESC';

        const [bookingsRows]: any = await pool.query(query, params);
        const bookings = bookingsRows.map((b: any) => ({
            id: b.id,
            studentId: b.student_id,
            studentName: b.student_name,
            sport: b.sport,
            // Normalize date to YYYY-MM-DD string — MySQL returns Date objects, not strings
            date: b.date instanceof Date
                ? b.date.toISOString().split('T')[0]
                : String(b.date).split('T')[0],
            timeSlot: b.time_slot,
            status: b.status
        }));

        // Fetch All Settings (court, gym, laundry)
        const [settingsRows]: any = await pool.query('SELECT setting_key, setting_value FROM court_settings');
        const settings: any = {};

        // Initialize defaults
        settings.court = { isOpen: true, openTime: '08:00', closeTime: '22:00', blockedSlots: [] };
        settings.gym = { isOpen: true, openTime: '06:00', closeTime: '23:00', blockedSlots: [] };
        settings.laundry = { isOpen: true, openTime: '00:00', closeTime: '23:59', blockedSlots: [] };

        settingsRows.forEach((row: any) => {
            let val = row.setting_value;
            if (typeof val === 'string') val = JSON.parse(val);
            if (row.setting_key === 'main') settings.court = val;
            else settings[row.setting_key] = val;
        });

        return NextResponse.json({ bookings, settings });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST: Manage facilities (status updates and settings)
export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Update Settings (General for all facilities)
        if (body.action === 'update_settings') {
            const dbKey = body.key === 'court' ? 'main' : body.key;
            await pool.query(
                'INSERT INTO court_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?',
                [dbKey, JSON.stringify(body.settings), JSON.stringify(body.settings)]
            );

            // Notify all students if the facility is CLOSED
            if (body.settings.isOpen === false) {
                const facilityName = body.key.charAt(0).toUpperCase() + body.key.slice(1);
                await createSystemNotification({
                    title: `${facilityName} Maintenance`,
                    message: `Please take note that the ${facilityName} is currently closed for maintenance until further notice.`,
                    type: 'warning'
                });
            }

            return NextResponse.json({ success: true });
        }

        // Update Booking Status (Court only for now)
        if (body.action === 'update_status') {
            const { id, status } = body;
            
            // 1. Fetch booking info to notify the student
            const [rows]: any = await pool.query('SELECT student_id, sport, date, time_slot FROM court_bookings WHERE id = ?', [id]);
            
            if (rows.length > 0) {
                const booking = rows[0];
                const studentId = booking.student_id;
                const dateStr = new Date(booking.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
                
                // 2. Update status
                await pool.query('UPDATE court_bookings SET status = ? WHERE id = ?', [status, id]);

                // 3. Send notification
                const title = status === 'Approved' ? 'Booking Accepted' : 'Booking Rejected';
                const message = status === 'Approved' 
                    ? `Good news! Your ${booking.sport} booking for ${dateStr} at ${booking.time_slot} has been approved.`
                    : `Unfortunately, your ${booking.sport} booking for ${dateStr} at ${booking.time_slot} was not accepted.`;
                const type = status === 'Approved' ? 'success' : 'error';

                await createNotification({
                    userId: studentId,
                    title,
                    message,
                    type,
                    relatedEntityId: id,
                    relatedEntityType: 'CourtBooking'
                });
            }

            return NextResponse.json({ success: true });
        }

        // Create Court Booking (Existing logic)
        const { studentId, studentName, sport, date, timeSlot } = body;
        if (studentId && sport && date && timeSlot) {
            // 1. Check for double booking
            const [existing]: any = await pool.query(
                'SELECT id FROM court_bookings WHERE date = ? AND time_slot = ? AND status IN ("Pending", "Approved")',
                [date, timeSlot]
            );

            if (existing.length > 0) {
                return NextResponse.json({ error: 'This time slot has already been reserved. Please select another slot.' }, { status: 400 });
            }

            // 2. Check if blocked by admin
            const [settingsRows]: any = await pool.query('SELECT setting_value FROM court_settings WHERE setting_key = "main"');
            if (settingsRows.length > 0) {
                const settings = JSON.parse(settingsRows[0].setting_value);
                if (settings.blockedSlots?.includes(`${date}T${timeSlot}`)) {
                    return NextResponse.json({ error: 'This time slot is currently unavailable for maintenance.' }, { status: 400 });
                }
            }

            const id = `book_${Date.now()}`;
            await pool.query(
                'INSERT INTO court_bookings (id, student_id, student_name, sport, date, time_slot) VALUES (?, ?, ?, ?, ?, ?)',
                [id, studentId, studentName, sport, date, timeSlot]
            );

            // 3. Send notification to student
            const dateStr = new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
            await createNotification({
                userId: studentId,
                title: 'Booking Pending',
                message: `Your ${sport} booking request for ${dateStr} at ${timeSlot} has been submitted and is currently pending review.`,
                type: 'info',
                relatedEntityId: id,
                relatedEntityType: 'CourtBooking'
            });

            return NextResponse.json({ success: true, booking: { id, studentId, studentName, sport, date, timeSlot, status: 'Pending' } });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
