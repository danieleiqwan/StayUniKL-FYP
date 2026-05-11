import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
    try {
        const [result]: any = await db.query('SELECT 1 as ok');
        return NextResponse.json({ result: result[0].ok });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
