import { z } from 'zod';

export const CreateProjectSchema = z.object({
  name: z.string().min(3, 'Project name must be at least 3 characters').optional(),
  title: z.string().min(3).optional(),
  type: z.string().min(2, 'Project type is required').optional(),
  projectType: z.string().optional(),
  description: z.string().optional(),
  budget: z.string().optional(),
  minBudget: z.number().optional(),
  maxBudget: z.number().optional(),
  location: z.string().optional(),
  city: z.string().optional(),
});
