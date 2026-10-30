import { z } from 'zod';

export const createExamSchema = z.object({
  course_id: z.number().int().positive('Course ID must be a positive integer'),
  exam_name: z.string().trim().min(2, 'Exam name must be at least 2 characters').max(100),
  exam_type: z.enum(['Midterm', 'Final', 'Quiz', 'Practical'], { required_error: 'Invalid exam type' }),
  exam_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Exam date must be in YYYY-MM-DD format'),
  max_marks: z.number().positive('Maximum marks must be greater than 0').max(1000),
});

export const bulkResultRecordSchema = z.object({
  enrollment_id: z.number().int().positive('Enrollment ID must be a positive integer'),
  marks_obtained: z.number().min(0, 'Marks obtained cannot be negative'),
});

export const bulkResultSchema = z.object({
  exam_id: z.number().int().positive('Exam ID must be a positive integer'),
  results: z.array(bulkResultRecordSchema).min(1, 'At least one student marks entry is required'),
});

