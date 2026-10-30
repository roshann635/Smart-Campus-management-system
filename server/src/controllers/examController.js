import { ExamService } from '../services/examService.js';
import { ApiResponse } from '../utils/apiResponse.js';

export class ExamController {
  static async getAll(req, res, next) {
    try {
      const { course_id } = req.query;
      const exams = await ExamService.getExams({
        course_id: course_id ? Number(course_id) : null,
      });
      return ApiResponse.success(res, { data: exams });
    } catch (err) {
      next(err);
    }
  }

  static async getById(req, res, next) {
    try {
      const { id } = req.params;
      const exam = await ExamService.getExamById(id);
      return ApiResponse.success(res, { data: exam });
    } catch (err) {
      next(err);
    }
  }

  static async create(req, res, next) {
    try {
      const exam = await ExamService.createExam(
        req.body,
        req.user ? req.user.user_id : null,
        req.ip
      );
      return ApiResponse.success(res, {
        statusCode: 201,
        message: 'Exam schedule created successfully.',
        data: exam,
      });
    } catch (err) {
      next(err);
    }
  }

  static async getResultsByExam(req, res, next) {
    try {
      const { examId } = req.params;
      const result = await ExamService.getResultsByExam(examId);
      return ApiResponse.success(res, { data: result });
    } catch (err) {
      next(err);
    }
  }

  static async getResultsByStudent(req, res, next) {
    try {
      const { studentId } = req.params;

      if (req.user.role === 'student' && String(req.user.student_id) !== String(studentId)) {
        return ApiResponse.error(res, {
          statusCode: 403,
          code: 'FORBIDDEN',
          message: 'Forbidden: You can only view your own exam results.',
        });
      }

      const results = await ExamService.getResultsByStudent(studentId);
      return ApiResponse.success(res, { data: results });
    } catch (err) {
      next(err);
    }
  }

  static async submitBulkResults(req, res, next) {
    try {
      const { exam_id, results } = req.body;
      const response = await ExamService.submitBulkResults(
        { exam_id, results },
        req.user.user_id,
        req.ip
      );
      return ApiResponse.success(res, {
        statusCode: 201,
        message: 'Exam results graded and recorded successfully.',
        data: response,
      });
    } catch (err) {
      next(err);
    }
  }
}

