import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get('secret');

    if (secret !== 'populate_assets_2026') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const [tables]: any = await db.query('SHOW TABLES');
        console.log('Tables found:', tables);
        
        const [rooms]: any = await db.query('SELECT id, capacity FROM rooms');
        
        const assetValues: any[] = [];
        rooms.forEach((room: any) => {
            const roomId = room.id;
            const cap = room.capacity || 2;
            
            // 1 Air Conditioner
            assetValues.push([`AST-${roomId}-AC-1`, 'Aircond', 'Appliance', 'Good', roomId, 1200.00]);
            
            // Chairs
            for (let i = 1; i <= cap; i++) {
                assetValues.push([`AST-${roomId}-CHR-${i}`, 'Chair', 'Furniture', 'Good', roomId, 80.00]);
            }
            // Beds
            for (let i = 1; i <= cap; i++) {
                assetValues.push([`AST-${roomId}-BED-${i}`, 'Bed', 'Furniture', 'Good', roomId, 150.00]);
            }
            // Tables
            for (let i = 1; i <= cap; i++) {
                assetValues.push([`AST-${roomId}-TB-${i}`, 'Table', 'Furniture', 'Good', roomId, 120.00]);
            }
            // Lockers
            for (let i = 1; i <= cap; i++) {
                assetValues.push([`AST-${roomId}-LKR-${i}`, 'Locker', 'Furniture', 'Good', roomId, 250.00]);
            }
        });

        console.log(`Starting population for ${rooms.length} rooms...`);
        // Delete existing to avoid conflicts
        await db.query('SET FOREIGN_KEY_CHECKS = 0');
        await db.query('DELETE FROM maintenance_logs');
        await db.query('DELETE FROM room_assets');
        await db.query('SET FOREIGN_KEY_CHECKS = 1');

        console.log(`Total assets to insert: ${assetValues.length}`);

        // Insert in chunks to avoid packet size issues
        const chunkSize = 25;
        for (let i = 0; i < assetValues.length; i += chunkSize) {
            const chunk = assetValues.slice(i, i + chunkSize);
            const placeholders = chunk.map(() => '(?, ?, ?, ?, ?, ?)').join(', ');
            const flatValues = chunk.flat();
            await db.query(
                `INSERT INTO room_assets (id, name, type, status, location_id, value) VALUES ${placeholders}`,
                flatValues
            );
        }

        return NextResponse.json({ 
            success: true, 
            message: `Successfully populated ${assetValues.length} assets across ${rooms.length} rooms.`,
            count: assetValues.length 
        });
    } catch (error: any) {
        console.error('Population Error:', error);
        return NextResponse.json({ 
            error: error.message || 'Unknown Error',
            details: error.toString(),
            stack: error.stack
        }, { status: 500 });
    }
}
