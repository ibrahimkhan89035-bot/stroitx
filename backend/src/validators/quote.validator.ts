import { z } from 'zod';

export const QuoteItemSchema = z.object({
  category: z.enum(['LABOUR', 'MATERIAL', 'EQUIPMENT', 'TRANSPORTATION', 'SUBCONTRACTOR', 'DESIGN', 'OTHER']),
  description: z.string().min(2, 'Item description required'),
  quantity: z.number().gt(0, 'Quantity must be greater than 0'),
  unit: z.string().min(1, 'Unit required'),
  unitRate: z.number().gt(0, 'Unit rate must be greater than 0'),
});

export const CreateQuoteSchema = z.object({
  projectId: z.string().uuid(),
  professionalFee: z.number().min(0).default(0),
  taxAmount: z.number().min(0).default(0),
  discountAmount: z.number().min(0).default(0),
  estimatedDays: z.number().gt(0, 'Estimated completion days required'),
  paymentTerms: z.string().min(10, 'Payment terms description required'),
  notes: z.string().optional(),
  validUntil: z.string(),
  items: z.array(QuoteItemSchema).min(1, 'At least one line item is required'),
});
