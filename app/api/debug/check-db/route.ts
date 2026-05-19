import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
    try {
        const [rooms]: any = await db.query('SELECT id FROM rooms');
        const [assetsCount]: any = await db.query('SELECT COUNT(*) as count FROM room_assets');
        return NextResponse.json({ 
            rooms: rooms.map((r: any) => r.id),
            assetsCount: assetsCount[0].count 
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
