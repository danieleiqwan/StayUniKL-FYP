import pool from './db';

export interface AuditLogEntry {
    actorId: string;
    actorName: string;
    action: string;
    entityType: string;
    entityId?: string;
    details?: any;
    ipAddress?: string;
    userAgent?: string;
}

/**
 * Logs an action to the audit_logs table.
 * This utility handles database insertion and error logging.
 */
export async function logAction(entry: AuditLogEntry) {
    try {
        const {
            actorId,
            actorName,
            action,
            entityType,
            entityId,
            details,
            ipAddress,
            userAgent
        } = entry;

        await pool.query(
            `INSERT INTO audit_logs 
            (actor_id, actor_name, action, entity_type, entity_id, details, ip_address, user_agent) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                actorId,
                actorName,
                action,
                entityType,
                entityId || null,
                details ? JSON.stringify(details) : null,
                ipAddress || null,
                userAgent || null
            ]
        );

        console.log(`[AuditLog] ${actorName} (${actorId}) performed ${action} on ${entityType} ${entityId || ''}`);
        return true;
    } catch (error) {
        console.error('[AuditLog Error]', error);
        return false;
    }
}
