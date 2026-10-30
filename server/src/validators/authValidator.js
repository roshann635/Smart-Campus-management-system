import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().trim().email('Invalid email address format'),
  password: z.string().min(1, 'Password is required'),
});

export const idParamSchema = z.object({
  id: z.string().regex(/^\d+$/, 'ID must be an integer').transform(Number),
});

