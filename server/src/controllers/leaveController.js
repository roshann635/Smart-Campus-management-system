import { LeaveService } from '../services/leaveService.js';
import { ApiResponse } from '../utils/apiResponse.js';

export class LeaveController {
  static async submitLeave(req, res, next) {
    try {
      const { enrollment_id, leave_date, reason } = req.body;
      const studentId = req.user.student_id;

      if (!studentId) {
        return ApiResponse.error(res, { statusCode: 403, message: 'Only active students can submit leave applications.' });
      }

      const leave = await LeaveService.submitLeaveRequest({
        studentId,
        enrollmentId: Number(enrollment_id),
        leaveDate: leave_date,
        reason,
        actorUserId: req.user.user_id,
        ipAddress: req.ip,
      });

      return ApiResponse.success(res, {
        statusCode: 201,
        message: 'Leave application submitted successfully.',
        data: leave,
      });
    } catch (err) {
      next(err);
    }
  }

  static async getLeaves(req, res, next) {
    try {
      const leaves = await LeaveService.getLeaveRequests({
        userRole: req.user.role,
        studentId: req.user.student_id,
        facultyId: req.user.faculty_id,
      });

      return ApiResponse.success(res, { data: leaves });
    } catch (err) {
      next(err);
    }
  }

  static async reviewLeave(req, res, next) {
    try {
      const leaveId = Number(req.params.id);
      const { status, review_remarks } = req.body;

      const result = await LeaveService.reviewLeaveRequest({
        leaveId,
        status,
        reviewRemarks: review_remarks,
        reviewerUserId: req.user.user_id,
        reviewerFacultyId: req.user.faculty_id,
        reviewerRole: req.user.role,
        ipAddress: req.ip,
      });

      return ApiResponse.success(res, {
        message: `Leave request has been marked as ${status}.`,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }
}
