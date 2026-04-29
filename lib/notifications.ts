
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
        // 1. Fetch all student IDs
        const [users]: any = await pool.query("SELECT id FROM users WHERE role = 'student'");
        
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
