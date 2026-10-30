import { query } from '../config/db.js';

/**
 * Enterprise Audit Logging Service
 * Records audit trails inside ACID transactions or standalone queries.
 */
export class AuditService {
  /**
   * Sanitizes metadata to ensure sensitive credentials or tokens are never logged.
   */
  static sanitizeMetadata(data) {
    if (!data || typeof data !== 'object') return data;
    const sanitized = { ...data };
    const sensitiveKeys = ['password', 'password_hash', 'session_id', 'cookie', 'secret', 'token'];
    for (const key of Object.keys(sanitized)) {
      if (sensitiveKeys.includes(key.toLowerCase())) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof sanitized[key] === 'object') {
        sanitized[key] = this.sanitizeMetadata(sanitized[key]);
      }
    }
    return sanitized;
  }

  /**
   * Writes an audit entry. Accepts optional transactional connection.
   */
  static async log({ actorUserId = null, action, entityType, entityId = null, metadata = null, ipAddress = null, connection = null }) {
    const cleanMeta = metadata ? JSON.stringify(this.sanitizeMetadata(metadata)) : null;
    const sql = `
      INSERT INTO audit_logs (actor_user_id, action, entity_type, entity_id, metadata, ip_address)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const params = [actorUserId, action, entityType, entityId ? String(entityId) : null, cleanMeta, ipAddress];

    if (connection) {
      await connection.query(sql, params);
    } else {
      await query(sql, params);
    }
  }

  /**
   * Retrieves paginated audit logs with actor user details.
   */
  static async getLogs({ page = 1, limit = 20, action = null, entityType = null }) {
    const offset = (page - 1) * limit;
    const conditions = [];
    const params = [];

    if (action) {
      conditions.push('al.action = ?');
      params.push(action);
    }
    if (entityType) {
      conditions.push('al.entity_type = ?');
      params.push(entityType);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countSql = `SELECT COUNT(*) AS total FROM audit_logs al ${whereClause}`;
    const [countRows] = await query(countSql, params);
    const total = countRows[0].total;

    const dataSql = `
      SELECT 
        al.log_id,
        al.actor_user_id,
        u.email AS actor_email,
        u.role AS actor_role,
        al.action,
        al.entity_type,
        al.entity_id,
        al.metadata,
        al.ip_address,
        al.created_at
      FROM audit_logs al
      LEFT JOIN users u ON al.actor_user_id = u.user_id
      ${whereClause}
      ORDER BY al.created_at DESC
      LIMIT ? OFFSET ?
    `;

    const [rows] = await query(dataSql, [...params, Number(limit), Number(offset)]);
    return {
      logs: rows.map(r => ({
        ...r,
        metadata: typeof r.metadata === 'string' ? JSON.parse(r.metadata) : r.metadata,
      })),
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit) || 1,
    };
  }
}

