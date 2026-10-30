import { z } from 'zod';

export const createCourseSchema = z.object({
  course_code: z.string().trim().min(2, 'Course code must be at least 2 characters').max(20).toUpperCase(),
  course_name: z.string().trim().min(2, 'Course name must be at least 2 characters').max(120),
  credits: z.number().int().min(1, 'Credits must be between 1 and 6').max(6),
  semester: z.number().int().min(1, 'Semester must be between 1 and 8').max(8),
  department_id: z.number().int().positive('Department ID must be a positive integer'),
  faculty_id: z.number().int().positive().optional().nullable(),
});

export const updateCourseSchema = z.object({
  course_name: z.string().trim().min(2).max(120).optional(),
  credits: z.number().int().min(1).max(6).optional(),
  semester: z.number().int().min(1).max(8).optional(),
  department_id: z.number().int().positive().optional(),
  faculty_id: z.number().int().positive().optional().nullable(),
});

