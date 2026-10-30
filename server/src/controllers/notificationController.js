import { NotificationService } from '../services/notificationService.js';
import { ApiResponse } from '../utils/apiResponse.js';

export class NotificationController {
  static async getNotifications(req, res, next) {
    try {
      const data = await NotificationService.getNotifications(req.user.user_id);
      return ApiResponse.success(res, { data });
    } catch (err) {
      next(err);
    }
  }

  static async markAsRead(req, res, next) {
    try {
      const notificationId = Number(req.params.id);
      await NotificationService.markAsRead(notificationId, req.user.user_id);
      return ApiResponse.success(res, { message: 'Notification marked as read.' });
    } catch (err) {
      next(err);
    }
  }

  static async markAllAsRead(req, res, next) {
    try {
      await NotificationService.markAllAsRead(req.user.user_id);
      return ApiResponse.success(res, { message: 'All notifications marked as read.' });
    } catch (err) {
      next(err);
    }
  }
}

