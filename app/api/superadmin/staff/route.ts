import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { isSuperAdmin } from '@/lib/auth';
import { logAction } from '@/lib/audit';
import bcrypt from 'bcryptjs';

// GET: List all admin staff members
export async function GET() {
    const superadmin = await isSuperAdmin();
    if (!superadmin) {
        return NextResponse.json({ error: 'Forbidden: Superadmin access required' }, { status: 403 });
    }

    try {
        // Safe backward-compatible schema expansion
        try {
            await pool.query("ALTER TABLE users ADD COLUMN must_change_password TINYINT DEFAULT 0");
        } catch {}
        try {
            await pool.query("ALTER TABLE users ADD COLUMN created_by VARCHAR(50) DEFAULT NULL");
        } catch {}

        const [rows]: any = await pool.query(
            `SELECT id, name, email, role, is_active, last_login, created_at, phone_number, must_change_password, created_by
             FROM users
             WHERE role IN ('admin', 'superadmin')
             ORDER BY role DESC, created_at DESC`
        );
        return NextResponse.json({ staff: rows });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

// POST: Create a new admin account
export async function POST(request: Request) {
    const superadmin = await isSuperAdmin();
    if (!superadmin) {
        return NextResponse.json({ error: 'Forbidden: Superadmin access required' }, { status: 403 });
    }

    try {
        // Safe backward-compatible schema expansion
        try {
            await pool.query("ALTER TABLE users ADD COLUMN must_change_password TINYINT DEFAULT 0");
        } catch {}
        try {
            await pool.query("ALTER TABLE users ADD COLUMN created_by VARCHAR(50) DEFAULT NULL");
        } catch {}

        const { name, email, password, customId, phone_number, created_at } = await request.json();

        if (!name || !email || !password) {
            return NextResponse.json({ error: 'name, email and password are required.' }, { status: 400 });
        }
        if (password.length < 8) {
            return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 });
        }

        const [existing]: any = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
            return NextResponse.json({ error: 'This email is already registered.' }, { status: 409 });
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        const id = customId || `admin_${Date.now()}`;
        const activationDate = (created_at && created_at.trim() !== '') ? new Date(created_at) : new Date();

        await pool.query(
            `INSERT INTO users (id, name, email, password, role, is_active, created_at, phone_number, must_change_password, created_by)
             VALUES (?, ?, ?, ?, 'admin', 1, ?, ?, 1, ?)`,
            [id, name, email, hashedPassword, activationDate, phone_number || null, superadmin.id]
        );

        await logAction({
            actorId: superadmin.id,
            actorName: superadmin.email,
            action: 'ADMIN_ACCOUNT_CREATED',
            entityType: 'User',
            entityId: id,
            details: { name, email }
        });

        return NextResponse.json({ success: true, message: `Admin account created for ${email}.`, id });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

// PATCH: Update admin status (ACTIVE, SUSPENDED, DEACTIVATED) or reset password
export async function PATCH(request: Request) {
    const superadmin = await isSuperAdmin();
    if (!superadmin) {
        return NextResponse.json({ error: 'Forbidden: Superadmin access required' }, { status: 403 });
    }

    try {
        const body = await request.json();
        const { id, action, newPassword, name, email, newId, phone_number, created_at } = body;

        if (!id || !action) {
            return NextResponse.json({ error: 'id and action are required.' }, { status: 400 });
        }

        // Prevent superadmin from modifying their own account via this endpoint
        if (id === superadmin.id) {
            return NextResponse.json({ error: 'You cannot modify your own superadmin account via this panel.' }, { status: 403 });
        }

        // Prevent privilege escalation: ensure the target is only an 'admin'
        const [targetRows]: any = await pool.query('SELECT role FROM users WHERE id = ?', [id]);
        if (targetRows.length === 0) return NextResponse.json({ error: 'User not found.' }, { status: 404 });
        if (targetRows[0].role === 'superadmin') {
            return NextResponse.json({ error: 'Cannot modify another superadmin account.' }, { status: 403 });
        }

        let auditAction = '';

        switch (action) {
            case 'SUSPEND':
                await pool.query('UPDATE users SET is_active = 0 WHERE id = ?', [id]);
                auditAction = 'ADMIN_ACCOUNT_SUSPENDED';
                break;
            case 'ACTIVATE':
                await pool.query('UPDATE users SET is_active = 1 WHERE id = ?', [id]);
                auditAction = 'ADMIN_ACCOUNT_ACTIVATED';
                break;
            case 'DEACTIVATE':
                await pool.query('UPDATE users SET is_active = 0 WHERE id = ?', [id]);
                auditAction = 'ADMIN_ACCOUNT_DEACTIVATED';
                break;
            case 'RESET_PASSWORD':
                if (!newPassword || newPassword.length < 8) {
                    return NextResponse.json({ error: 'New password must be at least 8 characters.' }, { status: 400 });
                }
                const hashed = await bcrypt.hash(newPassword, 12);
                await pool.query('UPDATE users SET password = ?, login_attempts = 0, locked_until = NULL WHERE id = ?', [hashed, id]);
                auditAction = 'ADMIN_PASSWORD_RESET';
                break;
            case 'UPDATE_DETAILS':
                if (!name && !email && !newId && !phone_number && !created_at) {
                    return NextResponse.json({ error: 'No update data provided.' }, { status: 400 });
                }
                
                // If ID is changing, check uniqueness
                if (newId && newId !== id) {
                    const [existing]: any = await pool.query('SELECT id FROM users WHERE id = ?', [newId]);
                    if (existing.length > 0) return NextResponse.json({ error: 'New ID already in use.' }, { status: 409 });
                    
                    // Update ID (Primary Key)
                    await pool.query('UPDATE users SET id = ? WHERE id = ?', [newId, id]);
                    
                    // Cascade update to audit_logs (actor_id) to maintain history
                    await pool.query('UPDATE audit_logs SET actor_id = ? WHERE actor_id = ?', [newId, id]);
                }

                const targetId = newId || id;
                const activationDate = created_at ? new Date(created_at) : null;

                await pool.query(
                    'UPDATE users SET name = COALESCE(?, name), email = COALESCE(?, email), phone_number = COALESCE(?, phone_number), created_at = COALESCE(?, created_at) WHERE id = ?', 
                    [name || null, email || null, phone_number || null, activationDate, targetId]
                );
                auditAction = 'ADMIN_DETAILS_UPDATED';
                break;
            default:
                return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
        }

        await logAction({
            actorId: superadmin.id,
            actorName: superadmin.email,
            action: auditAction,
            entityType: 'User',
            entityId: id,
            details: { action }
        });

        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
