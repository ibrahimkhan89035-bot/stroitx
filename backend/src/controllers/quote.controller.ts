import { Request, Response } from 'express';
import { asyncHandler } from '../utils/async-handler';
import { sendSuccess } from '../utils/response';
import { quoteService } from '../services/quote.service';
import { CreateQuoteSchema } from '../validators/quote.validator';

export const createQuote = asyncHandler(async (req: Request, res: Response) => {
  const validatedData = CreateQuoteSchema.parse(req.body);
  const quote = await quoteService.createQuote(req.user!.id, validatedData);
  return sendSuccess(res, 'Quotation draft created successfully.', quote, 201);
});

export const sendQuote = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const quote = await quoteService.sendQuote(req.user!.id, id);
  return sendSuccess(res, 'Quotation sent to homeowner.', quote);
});

export const acceptQuote = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const quote = await quoteService.acceptQuote(req.user!.id, id);
  return sendSuccess(res, 'Quotation accepted. Contract draft created.', quote);
});

export const getQuoteComparison = asyncHandler(async (req: Request, res: Response) => {
  const { projectId } = req.params;
  const comparison = await quoteService.getQuoteComparison(projectId, req.user!.id);
  return sendSuccess(res, 'Quotation comparison matrix loaded.', comparison);
});
