import { z } from 'zod';

export const createDepartmentSchema = z.object({
  code: z.string().trim().min(2, 'Code must be at least 2 characters').max(10).toUpperCase(),
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  description: z.string().trim().optional().nullable(),
});

export const updateDepartmentSchema = createDepartmentSchema.partial();

