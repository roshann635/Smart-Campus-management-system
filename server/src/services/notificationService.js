import { query } from '../config/db.js';

export class NotificationService {
  static async getNotifications(userId) {
    const [rows] = await query(
      `SELECT notification_id, user_id, title, message, type, is_read, created_at
       FROM notifications
       WHERE user_id = ?
       ORDER BY created_at DESC
       LIMIT 50`,
      [userId]
    );

    const list = Array.isArray(rows) ? rows : [];
    const unreadCount = list.filter(n => !n.is_read || n.is_read === 0).length;

    return {
      unreadCount,
      notifications: list,
    };
  }

  static async markAsRead(notificationId, userId) {
    await query(
      `UPDATE notifications SET is_read = 1 WHERE notification_id = ? AND user_id = ?`,
      [notificationId, userId]
    );
    return true;
  }

  static async markAllAsRead(userId) {
    await query(
      `UPDATE notifications SET is_read = 1 WHERE user_id = ?`,
      [userId]
    );
    return true;
  }

  static async createNotification({ userId, title, message, type = 'SYSTEM_ANNOUNCEMENT' }) {
    const [result] = await query(
      `INSERT INTO notifications (user_id, title, message, type, is_read)
       VALUES (?, ?, ?, ?, 0)`,
      [userId, title, message, type]
    );
    return result ? result.insertId : null;
  }
}

