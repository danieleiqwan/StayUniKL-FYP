import pool from './db';
import { sendCriticalErrorAlert } from './email';

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

/**
 * Reports a critical system error by logging it to the audit trail and 
 * sending an immediate email alert to the administrator.
 */
export async function reportCriticalError(error: any, context: { path: string; userId?: string; userName?: string; details?: any }) {
    // 1. Log to database for permanent record
    await logAction({
        actorId: context.userId || 'SYSTEM',
        actorName: context.userName || 'System Monitor',
        action: 'CRITICAL_SYSTEM_ERROR',
        entityType: 'SYSTEM',
        details: {
            errorMessage: error instanceof Error ? error.message : String(error),
            path: context.path,
            ...context.details
        }
    });

    // 2. Send immediate email alert
    await sendCriticalErrorAlert(error, context);
}
