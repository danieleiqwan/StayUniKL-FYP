import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getAuthUser, isAdmin } from '@/lib/auth';
import { createNotification } from '@/lib/notifications';
import { z } from 'zod';

const bookingSchema = z.object({
    studentId: z.string().min(1),
    sport: z.enum(['Badminton', 'Volleyball', 'Basketball', 'Football']),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    timeSlot: z.string().regex(/^\d{2}:\d{2}$/),
});

const statusUpdateSchema = z.object({
    id: z.string().min(1),
    status: z.enum(['Pending', 'Approved', 'Rejected', 'Cancelled']),
});

const cancelSchema = z.object({
    id: z.string().min(1),
});

const settingsUpdateSchema = z.object({
    settings: z.object({
        isOpen: z.boolean(),
        openTime: z.string(),
        closeTime: z.string(),
        blockedSlots: z.array(z.string()),
    }),
});

// GET: Fetch bookings and settings
export async function GET(request: Request) {
    try {
        const user = await getAuthUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Fetch Bookings
        const { searchParams } = new URL(request.url);
        const studentId = searchParams.get('studentId');

        // Security check: If not admin, you can only see your own bookings
        if (user.role !== 'admin' && studentId && user.id !== studentId) {
            return NextResponse.json({ error: 'Forbidden: You cannot access bookings for another user' }, { status: 403 });
        }

        // If no studentId is provided and not admin, default to the user's own ID
        const activeId = user.role === 'admin' ? studentId : user.id;

        let query = `
            SELECT b.*, u.name as student_name 
            FROM court_bookings b
            LEFT JOIN users u ON b.student_id = u.id
        `;
        let params: any[] = [];

        if (activeId) {
            query += ' WHERE b.student_id = ?';
            params.push(activeId);
        }

        query += ' ORDER BY b.date DESC';

        const [bookingsRows]: any = await pool.query(query, params);
        const bookings = bookingsRows.map((b: any) => ({
            id: b.id,
            studentId: b.student_id,
            studentName: b.student_name,
            sport: b.sport,
            date: b.date, // might need formatting depending on driver output
            timeSlot: b.time_slot,
            status: b.status,
            attendanceStatus: b.attendance_status
        }));

        // Fetch Settings
        const [settingsRows]: any = await pool.query('SELECT setting_value FROM court_settings WHERE setting_key = "main"');
        let settings = { isOpen: true, openTime: '09:00', closeTime: '22:00', blockedSlots: [] };
        if (settingsRows.length > 0) {
            settings = settingsRows[0].setting_value; // MySql2 automatically parses JSON if column type is JSON? usually returns string.
            if (typeof settings === 'string') settings = JSON.parse(settings);
            // If it returns object directly (dependent on driver config), we act accordingly.
            // Let's assume it might be an object if 'typeCast' handles JSON, but typically it's object in JS.
        }

        return NextResponse.json({ bookings, settings });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST: Create booking
export async function POST(request: Request) {
    try {
        const user = await getAuthUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();

        // Check if update settings or create booking
        if (body.action === 'update_settings') {
            if (user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
            
            const validation = settingsUpdateSchema.safeParse(body);
            if (!validation.success) {
                return NextResponse.json({ error: 'Invalid settings data', details: validation.error.format() }, { status: 400 });
            }

            const { settings } = validation.data;
            await pool.query(
                'INSERT INTO court_settings (setting_key, setting_value) VALUES ("main", ?) ON DUPLICATE KEY UPDATE setting_value = ?',
                [JSON.stringify(settings), JSON.stringify(settings)]
            );
            return NextResponse.json({ success: true });
        }

        if (body.action === 'update_status') {
            if (user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
            
            const validation = statusUpdateSchema.safeParse(body);
            if (!validation.success) {
                return NextResponse.json({ error: 'Invalid status data', details: validation.error.format() }, { status: 400 });
            }

            const { status, id } = validation.data;
            
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

        // Default: Create Booking
        const validation = bookingSchema.safeParse(body);
        if (!validation.success) {
            const formattedErrors = validation.error.format();
            return NextResponse.json({ 
                error: 'Invalid booking data', 
                details: formattedErrors,
                message: 'Please check your sport, date, and time slot selection.' 
            }, { status: 400 });
        }

        const { studentId, sport, date, timeSlot } = validation.data;
        // Fetch student name from DB
        const [studentRows]: any = await pool.query('SELECT name FROM users WHERE id = ?', [studentId]);
        const studentName = studentRows[0]?.name || 'Student';

        // Security check: Student can only book for themselves
        if (user.role !== 'admin' && user.id !== studentId) {
            return NextResponse.json({ error: 'Forbidden: You cannot create a booking for another user' }, { status: 403 });
        }

        // 0. ACCESS CONTROL: Check if student has an approved room application
        if (user.role !== 'admin') {
            const [appRows]: any = await pool.query(
                'SELECT status FROM applications WHERE student_id = ? AND status IN ("Approved", "Checked in") LIMIT 1',
                [studentId]
            );

            if (appRows.length === 0) {
                return NextResponse.json({ 
                    error: 'Access Denied: You must have an approved room application or active tenancy to book facilities.' 
                }, { status: 403 });
            }

            // Check for NO-SHOW bans
            const [banRows]: any = await pool.query('SELECT court_ban_until FROM users WHERE id = ?', [studentId]);
            if (banRows.length > 0 && banRows[0].court_ban_until) {
                const banDate = new Date(banRows[0].court_ban_until);
                if (banDate > new Date()) {
                    return NextResponse.json({ 
                        error: `Your court booking privileges are suspended until ${banDate.toLocaleDateString()} due to multiple no-shows.` 
                    }, { status: 403 });
                }
            }
        }

        // 1. Check if the slot is in the past
        const now = new Date();
        const requestDate = new Date(date);
        const [hours, minutes] = timeSlot.split(':').map(Number);
        requestDate.setHours(hours, minutes, 0, 0);

        if (requestDate < now) {
            return NextResponse.json({ error: 'This time slot has already passed and cannot be booked.' }, { status: 400 });
        }

        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            // 2. Strict double-booking check (FOR UPDATE locks the row to prevent races)
            const [existing]: any = await connection.query(
                'SELECT id FROM court_bookings WHERE DATE(date) = DATE(?) AND time_slot = ? AND status IN ("Pending", "Approved") FOR UPDATE',
                [date, timeSlot]
            );

            if (existing.length > 0) {
                await connection.rollback();
                return NextResponse.json({ error: 'This time slot was just reserved by someone else. Please select another slot.' }, { status: 400 });
            }

            // 3. Check if blocked by admin
            const [settingsRows]: any = await connection.query('SELECT setting_value FROM court_settings WHERE setting_key = "main"');
            if (settingsRows.length > 0) {
                let settings = settingsRows[0].setting_value;
                if (typeof settings === 'string') settings = JSON.parse(settings);
                if (settings.blockedSlots?.includes(`${date}T${timeSlot}`)) {
                    await connection.rollback();
                    return NextResponse.json({ error: 'This time slot is currently unavailable for maintenance.' }, { status: 400 });
                }
            }

            const id = `book_${Date.now()}`;

            await connection.query(
                'INSERT INTO court_bookings (id, student_id, sport, date, time_slot) VALUES (?, ?, ?, ?, ?)',
                [id, studentId, sport, date, timeSlot]
            );

            await connection.commit();

            // Send notification to student
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

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE: Cancel a booking (soft-delete — sets status to 'Cancelled')
export async function DELETE(request: Request) {
    try {
        const user = await getAuthUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await request.json();
        const validation = cancelSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json({ error: 'Invalid request. Booking ID is required.' }, { status: 400 });
        }

        const { id } = validation.data;
        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            // 1. Lock + fetch the booking row to prevent race conditions
            const [rows]: any = await connection.query(`
                SELECT id, student_id, student_name, sport, date, time_slot, status, attendance_status, created_at 
                FROM court_bookings 
                WHERE id = ? FOR UPDATE
            `, [id]);

            if (rows.length === 0) {
                await connection.rollback();
                return NextResponse.json({ error: 'Booking not found.' }, { status: 404 });
            }

            const booking = rows[0];

            // 2. Authorization: only the owner or admin can cancel
            if (user.role !== 'admin' && user.id !== booking.student_id) {
                await connection.rollback();
                return NextResponse.json({ error: 'Forbidden: You can only cancel your own bookings.' }, { status: 403 });
            }

            // 3. Guard: already cancelled or rejected
            if (booking.status === 'Cancelled' || booking.status === 'Rejected') {
                await connection.rollback();
                return NextResponse.json({ error: `Booking is already ${booking.status.toLowerCase()}.` }, { status: 400 });
            }

            // 4. Business rule: cannot cancel if the booking start time is in the past
            const bookingDate = new Date(booking.date);
            const [slotHour, slotMin] = booking.time_slot.split(':').map(Number);
            bookingDate.setHours(slotHour, slotMin, 0, 0);

            const now = new Date();
            if (bookingDate <= now) {
                await connection.rollback();
                return NextResponse.json({ error: 'Cannot cancel a booking that has already started or passed.' }, { status: 400 });
            }

            // 5. Business rule (student only): must cancel at least 2 hours before start
            const twoHoursBefore = new Date(bookingDate.getTime() - 2 * 60 * 60 * 1000);
            if (user.role !== 'admin' && now > twoHoursBefore) {
                await connection.rollback();
                return NextResponse.json({
                    error: 'Cancellations must be made at least 2 hours before the booking start time.'
                }, { status: 400 });
            }

            // 6. Soft-delete: mark as Cancelled (slot released automatically on next booking check)
            await connection.query(
                'UPDATE court_bookings SET status = "Cancelled" WHERE id = ?',
                [id]
            );

            await connection.commit();

            // 7. Notify the student
            const dateStr = new Date(booking.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
            await createNotification({
                userId: booking.student_id,
                title: 'Booking Cancelled',
                message: `Your ${booking.sport} booking for ${dateStr} at ${booking.time_slot} has been successfully cancelled. The slot is now available for others.`,
                type: 'info',
                relatedEntityId: id,
                relatedEntityType: 'CourtBooking'
            });

            return NextResponse.json({ success: true, message: 'Booking cancelled successfully. The slot is now available.' });

        } catch (err) {
            await connection.rollback();
            throw err;
        } finally {
            connection.release();
        }

    } catch (error: any) {
        console.error('[Cancel Booking Error]', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
