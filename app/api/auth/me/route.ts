import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

export async function GET() {
    try {
        const authUser = await getAuthUser();
        
        if (!authUser) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        // Fetch full user data from DB using the ID from the token
        let rows: any = [];
        const fullColumns = `
            id, name, email, role, gender, student_id, nric, profile_image, 
            phone_number, created_at, last_login, status,
            alert_booking, alert_maintenance, alert_announcement,
            address, city, state, postcode,
            emergency_contact1_name, emergency_contact1_relation, emergency_contact1_phone,
            emergency_contact2_name, emergency_contact2_relation, emergency_contact2_phone,
            two_factor_enabled, notifications_enabled, must_change_password
        `;

        try {
            [rows] = await pool.query(`SELECT ${fullColumns} FROM users WHERE id = ?`, [authUser.id]);
        } catch (e) {
            // If some columns are missing (e.g. migration hasn't run), try to get as much as possible
            try {
                [rows] = await pool.query(
                    'SELECT id, name, email, role, gender, student_id, nric, profile_image, phone_number, created_at, address, city, state, postcode, emergency_contact1_name, emergency_contact1_relation, emergency_contact1_phone, emergency_contact2_name, emergency_contact2_relation, emergency_contact2_phone, must_change_password FROM users WHERE id = ?',
                    [authUser.id]
                );
            } catch (e2) {
                [rows] = await pool.query(
                    'SELECT id, name, email, role, gender, student_id FROM users WHERE id = ?',
                    [authUser.id]
                );
            }
        }

        if (rows.length === 0) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const user = rows[0];

        return NextResponse.json({
            success: true,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                gender: user.gender,
                studentId: user.student_id,
                nric: user.nric,
                profileImage: user.profile_image,
                phoneNumber: user.phone_number,
                address: user.address,
                city: user.city,
                state: user.state,
                postcode: user.postcode,
                emergencyContact1Name: user.emergency_contact1_name,
                emergencyContact1Relation: user.emergency_contact1_relation,
                emergencyContact1Phone: user.emergency_contact1_phone,
                emergencyContact2Name: user.emergency_contact2_name,
                emergencyContact2Relation: user.emergency_contact2_relation,
                emergencyContact2Phone: user.emergency_contact2_phone,
                alertBooking: user.alert_booking !== undefined ? !!user.alert_booking : true,
                alertMaintenance: user.alert_maintenance !== undefined ? !!user.alert_maintenance : true,
                alertAnnouncement: user.alert_announcement !== undefined ? !!user.alert_announcement : true,
                twoFactorEnabled: !!user.two_factor_enabled,
                notificationsEnabled: !!user.notifications_enabled,
                mustChangePassword: user.must_change_password !== undefined ? !!user.must_change_password : false,
                // Read from JWT token payload (set at login time, before last_login is updated)
                isFirstLogin: !!(authUser as any).isFirstLogin,
                createdAt: user.created_at
            }
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
