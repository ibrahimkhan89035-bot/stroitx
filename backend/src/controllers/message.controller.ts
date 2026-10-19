import { Request, Response } from 'express';
import { asyncHandler } from '../utils/async-handler';
import { sendSuccess } from '../utils/response';
import { messageService } from '../services/message.service';

export const getOrCreateConversation = asyncHandler(async (req: Request, res: Response) => {
  const { projectId, targetUserId } = req.body;
  const conversation = await messageService.getOrCreateConversation(projectId, req.user!.id, targetUserId);
  return sendSuccess(res, 'Conversation thread retrieved.', conversation);
});

export const sendMessage = asyncHandler(async (req: Request, res: Response) => {
  const { conversationId, content, fileData } = req.body;
  const message = await messageService.sendMessage(conversationId, req.user!.id, content, fileData);
  return sendSuccess(res, 'Message sent.', message, 201);
});

export const getMessages = asyncHandler(async (req: Request, res: Response) => {
  const { conversationId } = req.params;
  const messages = await messageService.getConversationMessages(conversationId, req.user!.id);
  return sendSuccess(res, 'Messages fetched successfully.', messages);
});

export const getUserConversations = asyncHandler(async (req: Request, res: Response) => {
  const conversations = await messageService.getUserConversations(req.user!.id);
  return sendSuccess(res, 'User conversation threads retrieved.', conversations);
});

export const closeConversation = asyncHandler(async (req: Request, res: Response) => {
  const { conversationId } = req.params;
  const result = await messageService.closeConversation(conversationId, req.user!.id);
  return sendSuccess(res, 'Conversation closed successfully.', result);
});

export const resumeConversation = asyncHandler(async (req: Request, res: Response) => {
  const { conversationId } = req.params;
  const result = await messageService.resumeConversation(conversationId, req.user!.id);
  return sendSuccess(res, 'Conversation resumed successfully.', result);
});
