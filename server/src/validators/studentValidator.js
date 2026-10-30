import { z } from 'zod';

export const createStudentSchema = z.object({
  email: z.string().trim().email('Invalid email address format'),
  password: z.string().min(6, 'Password must be at least 6 characters').optional().default('Campus@123'),
  roll_number: z.string().trim().min(3, 'Roll number must be at least 3 characters').max(30),
  first_name: z.string().trim().min(1, 'First name is required').max(50),
  last_name: z.string().trim().min(1, 'Last name is required').max(50),
  dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'DOB must be in YYYY-MM-DD format'),
  phone: z.string().trim().max(20).optional().nullable(),
  address: z.string().trim().optional().nullable(),
  enrollment_year: z.number().int().min(2000).max(2100),
  department_id: z.number().int().positive('Department ID must be a positive integer'),
});

export const updateStudentSchema = z.object({
  first_name: z.string().trim().min(1).max(50).optional(),
  last_name: z.string().trim().min(1).max(50).optional(),
  dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'DOB must be in YYYY-MM-DD format').optional(),
  phone: z.string().trim().max(20).optional().nullable(),
  address: z.string().trim().optional().nullable(),
  department_id: z.number().int().positive().optional(),
});

export const updateStatusSchema = z.object({
  status: z.enum(['active', 'inactive'], { required_error: 'Status must be active or inactive' }),
});

