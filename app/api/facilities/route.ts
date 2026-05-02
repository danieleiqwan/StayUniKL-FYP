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
            const newSettings = body.settings;
            
            // Get previous settings to see what changed
            const [oldSettingsRows]: any = await pool.query('SELECT setting_value FROM court_settings WHERE setting_key = ?', [dbKey]);
            const oldSettings = oldSettingsRows.length > 0 ? JSON.parse(oldSettingsRows[0].setting_value) : {};

            await pool.query(
                'INSERT INTO court_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?',
                [dbKey, JSON.stringify(newSettings), JSON.stringify(newSettings)]
            );

            const facilityName = body.key.charAt(0).toUpperCase() + body.key.slice(1);

            // Handle mass cancellations if facility is CLOSED
            if (newSettings.isOpen === false && oldSettings.isOpen !== false) {
                // Fetch all future bookings for this facility
                // Court manages 'Badminton', 'Table Tennis', 'Basketball'
                const sports = body.key === 'court' ? ['Badminton', 'Table Tennis', 'Basketball'] : [];
                
                if (sports.length > 0) {
                    const [conflicts]: any = await pool.query(
                        'SELECT id, student_id, sport, date, time_slot FROM court_bookings WHERE sport IN (?) AND date >= CURDATE() AND status IN ("Pending", "Approved")',
                        [sports]
                    );

                    for (const booking of conflicts) {
                        await pool.query('UPDATE court_bookings SET status = "Rejected" WHERE id = ?', [booking.id]);
                        const dateStr = new Date(booking.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
                        await createNotification({
                            userId: booking.student_id,
                            title: 'Booking Cancelled',
                            message: `Your ${booking.sport} booking for ${dateStr} at ${booking.time_slot} has been cancelled because the ${facilityName} is closed for maintenance.`,
                            type: 'error',
                            relatedEntityId: booking.id,
                            relatedEntityType: 'CourtBooking'
                        });
                    }
                }

                await createSystemNotification({
                    title: `${facilityName} Maintenance`,
                    message: `Please take note that the ${facilityName} is currently closed for maintenance until further notice.`,
                    type: 'warning'
                });
            } 
            
            // Handle specific BLOCKED SLOTS
            else if (newSettings.blockedSlots && newSettings.blockedSlots.length > 0) {
                // Find slots that are newly blocked
                const newlyBlocked = newSettings.blockedSlots.filter((s: string) => !oldSettings.blockedSlots?.includes(s));
                
                for (const slot of newlyBlocked) {
                    // slot format: "2024-05-20T10:00"
                    const [datePart, timePart] = slot.split('T');
                    
                    const [conflicts]: any = await pool.query(
                        'SELECT id, student_id, sport, date, time_slot FROM court_bookings WHERE date = ? AND time_slot = ? AND status IN ("Pending", "Approved")',
                        [datePart, timePart]
                    );

                    for (const booking of conflicts) {
                        await pool.query('UPDATE court_bookings SET status = "Rejected" WHERE id = ?', [booking.id]);
                        const dateStr = new Date(booking.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
                        await createNotification({
                            userId: booking.student_id,
                            title: 'Booking Cancelled (Event)',
                            message: `Your ${booking.sport} booking for ${dateStr} at ${booking.time_slot} has been cancelled due to a hostel event/maintenance.`,
                            type: 'error',
                            relatedEntityId: booking.id,
                            relatedEntityType: 'CourtBooking'
                        });
                    }
                }
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
