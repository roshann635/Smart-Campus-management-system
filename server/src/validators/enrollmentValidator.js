import { z } from 'zod';

export const createEnrollmentSchema = z.object({
  student_id: z.number().int().positive('Student ID must be a positive integer'),
  course_id: z.number().int().positive('Course ID must be a positive integer'),
  semester: z.number().int().min(1, 'Semester must be between 1 and 8').max(8),
  academic_year: z.string().regex(/^\d{4}-\d{4}$/, 'Academic year must be formatted as YYYY-YYYY (e.g. 2025-2026)'),
  status: z.enum(['enrolled', 'dropped', 'completed']).optional().default('enrolled'),
});

export const updateEnrollmentStatusSchema = z.object({
  status: z.enum(['enrolled', 'dropped', 'completed'], { required_error: 'Status is required' }),
});

