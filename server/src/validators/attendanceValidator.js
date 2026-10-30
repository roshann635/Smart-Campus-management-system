import { z } from 'zod';

export const bulkAttendanceRecordSchema = z.object({
  enrollment_id: z.number().int().positive('Enrollment ID must be a positive integer'),
  status: z.enum(['Present', 'Absent', 'Late'], { required_error: 'Status must be Present, Absent, or Late' }),
  remarks: z.string().trim().max(255).optional().nullable(),
});

export const bulkAttendanceSchema = z.object({
  course_id: z.number().int().positive('Course ID must be a positive integer'),
  attendance_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be formatted as YYYY-MM-DD'),
  records: z.array(bulkAttendanceRecordSchema).min(1, 'At least one student attendance record is required'),
});

