import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { isAdmin } from '@/lib/auth';
import { logAction } from '@/lib/audit';

export async function POST(request: Request) {
    try {
        const admin = await isAdmin();
        if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

        const body = await request.json();
        const { userId, isActive } = body;

        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }

        // Prevent admin from deactivating themselves
        if (userId === admin.id) {
            return NextResponse.json({ error: 'You cannot deactivate your own account' }, { status: 400 });
        }

        // Update the user status
        await pool.query(
            'UPDATE users SET is_active = ? WHERE id = ?',
            [isActive ? 1 : 0, userId]
        );

        // Log the action
        await logAction({
            actorId: admin.id,
            actorName: (admin as any).name || admin.id,
            action: isActive ? 'ACTIVATE_USER' : 'DEACTIVATE_USER',
            entityType: 'User',
            entityId: userId,
            details: { 
                status: isActive ? 'Active' : 'Deactivated',
                timestamp: new Date().toISOString()
            }
        });

        return NextResponse.json({ 
            success: true, 
            message: `User successfully ${isActive ? 'activated' : 'deactivated'}` 
        });

    } catch (error: any) {
        console.error('[User Toggle Status API Error]:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
