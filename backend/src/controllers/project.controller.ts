import { Request, Response } from 'express';
import { asyncHandler } from '../utils/async-handler';
import { sendSuccess } from '../utils/response';
import { projectService } from '../services/project.service';

export const createProject = asyncHandler(async (req: Request, res: Response) => {
  const project = await projectService.createProject((req as any).user.id, req.body);
  return sendSuccess(res, 'Project created successfully.', project, 201);
});

export const getHomeownerProjects = asyncHandler(async (req: Request, res: Response) => {
  const projects = await projectService.getHomeownerProjects((req as any).user.id);
  return sendSuccess(res, 'Homeowner projects retrieved successfully.', projects);
});

export const getProjectDetails = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const project = await projectService.getProjectDetails(id);
  return sendSuccess(res, 'Project details retrieved.', project);
});

export const getProfessionalFeed = asyncHandler(async (req: Request, res: Response) => {
  const feed = await projectService.getProfessionalFeed((req as any).user.id);
  return sendSuccess(res, 'Professional project feed retrieved.', feed);
});

export const submitBid = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { amount, proposal } = req.body;
  const bid = await projectService.submitBid((req as any).user.id, id, amount ? parseFloat(amount) : undefined, proposal);
  return sendSuccess(res, 'Bid submitted successfully.', bid, 201);
});

export const acceptBid = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { bidId } = req.body;
  const project = await projectService.acceptBid((req as any).user.id, id, bidId);
  return sendSuccess(res, 'Bid accepted! Project status updated to PENDING_AWARD for Admin verification.', project);
});

export const requestCompletion = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const project = await projectService.requestCompletion((req as any).user.id, id);
  return sendSuccess(res, 'Project completion requested! Status updated to PENDING_COMPLETION for Admin verification.', project);
});