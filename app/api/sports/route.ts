import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// GET: Fetch all sports (active only for students, all for admin)
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const adminView = searchParams.get('admin') === 'true';

        let query = 'SELECT * FROM court_sports';
        if (!adminView) {
            query += ' WHERE is_active = TRUE';
        }
        query += ' ORDER BY display_order ASC, name ASC';

        const [rows]: any = await pool.query(query);

        const sports = rows.map((row: any) => ({
            id: row.id,
            name: row.name,
            colorTheme: row.color_theme,
            isActive: Boolean(row.is_active),
            displayOrder: row.display_order,
            createdAt: row.created_at,
        }));

        return NextResponse.json({ sports });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST: Create a new sport
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, colorTheme = 'orange', displayOrder = 0 } = body;

        if (!name || !name.trim()) {
            return NextResponse.json({ error: 'Sport name is required.' }, { status: 400 });
        }

        const id = name.trim().toLowerCase().replace(/\s+/g, '_');

        // Check for duplicate
        const [existing]: any = await pool.query('SELECT id FROM court_sports WHERE id = ? OR name = ?', [id, name.trim()]);
        if (existing.length > 0) {
            return NextResponse.json({ error: 'A sport with this name already exists.' }, { status: 409 });
        }

        await pool.query(
            'INSERT INTO court_sports (id, name, color_theme, is_active, display_order) VALUES (?, ?, ?, TRUE, ?)',
            [id, name.trim(), colorTheme, displayOrder]
        );

        return NextResponse.json({ success: true, sport: { id, name: name.trim(), colorTheme, isActive: true, displayOrder } });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PUT: Update a sport (name, color, active status, order)
export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { id, name, colorTheme, isActive, displayOrder } = body;

        if (!id) {
            return NextResponse.json({ error: 'Sport ID is required.' }, { status: 400 });
        }

        const updates: string[] = [];
        const params: any[] = [];

        if (name !== undefined) { updates.push('name = ?'); params.push(name.trim()); }
        if (colorTheme !== undefined) { updates.push('color_theme = ?'); params.push(colorTheme); }
        if (isActive !== undefined) { updates.push('is_active = ?'); params.push(isActive ? 1 : 0); }
        if (displayOrder !== undefined) { updates.push('display_order = ?'); params.push(displayOrder); }

        if (updates.length === 0) {
            return NextResponse.json({ error: 'No fields to update.' }, { status: 400 });
        }

        params.push(id);
        await pool.query(`UPDATE court_sports SET ${updates.join(', ')} WHERE id = ?`, params);

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE: Delete a sport (only if no bookings reference it)
export async function DELETE(request: Request) {
    try {
        const body = await request.json();
        const { id } = body;

        if (!id) {
            return NextResponse.json({ error: 'Sport ID is required.' }, { status: 400 });
        }

        // Fetch sport name first (bookings store name, not ID)
        const [sportRows]: any = await pool.query('SELECT name FROM court_sports WHERE id = ?', [id]);
        if (sportRows.length === 0) {
            return NextResponse.json({ error: 'Sport not found.' }, { status: 404 });
        }
        const sportName = sportRows[0].name;

        // Check if any bookings use this sport
        const [bookingRows]: any = await pool.query(
            'SELECT COUNT(*) as count FROM court_bookings WHERE sport = ?',
            [sportName]
        );
        const bookingCount = bookingRows[0].count;

        if (bookingCount > 0) {
            return NextResponse.json({
                error: `Cannot delete "${sportName}" — it has ${bookingCount} existing booking(s). Disable it instead.`,
                canDisable: true,
            }, { status: 409 });
        }

        await pool.query('DELETE FROM court_sports WHERE id = ?', [id]);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
