import { z } from 'zod';

export const createFacultySchema = z.object({
  email: z.string().trim().email('Invalid email address format'),
  password: z.string().min(6, 'Password must be at least 6 characters').optional().default('Campus@123'),
  employee_code: z.string().trim().min(3, 'Employee code must be at least 3 characters').max(30),
  first_name: z.string().trim().min(1, 'First name is required').max(50),
  last_name: z.string().trim().min(1, 'Last name is required').max(50),
  designation: z.string().trim().min(2, 'Designation is required').max(80),
  phone: z.string().trim().max(20).optional().nullable(),
  department_id: z.number().int().positive('Department ID must be a positive integer'),
});

export const updateFacultySchema = z.object({
  first_name: z.string().trim().min(1).max(50).optional(),
  last_name: z.string().trim().min(1).max(50).optional(),
  designation: z.string().trim().min(2).max(80).optional(),
  phone: z.string().trim().max(20).optional().nullable(),
  department_id: z.number().int().positive().optional(),
});

