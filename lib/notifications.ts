
import pool from '@/lib/db';

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

interface CreateNotificationParams {
    userId: string;
    title: string;
    message: string;
    type?: NotificationType;
    relatedEntityId?: string;
    relatedEntityType?: string;
}

export async function createNotification({
    userId,
    title,
    message,
    type = 'info',
    relatedEntityId,
    relatedEntityType
}: CreateNotificationParams) {
    try {
        // Fetch user preferences first
        let shouldSend = true;
        try {
            const [userPrefs]: any = await pool.query('SELECT alert_booking, alert_maintenance, alert_announcement FROM users WHERE id = ?', [userId]);
            if (userPrefs.length > 0) {
                const prefs = userPrefs[0];
                if (relatedEntityType === 'CourtBooking' && prefs.alert_booking === 0) shouldSend = false;
                // Add similar checks for maintenance if relatedEntityType is Maintenance
            }
        } catch(e) {
            // If DB migration hasn't run, fallback to true
        }

        if (!shouldSend) return null;

        const notificationId = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

        await pool.query(`
            INSERT INTO notifications (
                id, user_id, title, message, type, 
                related_entity_id, related_entity_type
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [
            notificationId, userId, title, message,
            type, relatedEntityId || null, relatedEntityType || null
        ]);

        return notificationId;
    } catch (error) {
        console.error('[createNotification Error]', error);
        // Don't throw, just log. Notifications failing shouldn't break the main flow.
        return null;
    }
}

export async function createSystemNotification({
    title,
    message,
    type = 'warning'
}: { title: string; message: string; type?: NotificationType }) {
    try {
        // 1. Fetch all student IDs AND their announcement preferences
        let users: any = [];
        try {
            [users] = await pool.query("SELECT id FROM users WHERE role = 'student' AND (alert_announcement IS NULL OR alert_announcement = 1)");
        } catch(e) {
             // Fallback if migration hasn't run
             [users] = await pool.query("SELECT id FROM users WHERE role = 'student'");
        }
        
        if (users.length === 0) return;

        // 2. Create notifications for each student
        // Using a batch insert for better performance
        const values = users.map((u: any) => [
            `notif_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            u.id,
            title,
            message,
            type
        ]);

        await pool.query(`
            INSERT INTO notifications (id, user_id, title, message, type)
            VALUES ?
        `, [values]);

        return true;
    } catch (error) {
        console.error('[createSystemNotification Error]', error);
        return false;
    }
}
