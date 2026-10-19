import { Request, Response } from 'express';
import { asyncHandler } from '../utils/async-handler';
import { sendSuccess } from '../utils/response';
import { chatService } from '../services/chat.service';

export const getOrCreateSession = asyncHandler(async (req: Request, res: Response) => {
  const session = await chatService.getOrCreateActiveSession(req.user!.id);
  return sendSuccess(res, 'Active 24-hour live chat session loaded.', session);
});

export const getSessionMessages = asyncHandler(async (req: Request, res: Response) => {
  const { sessionId } = req.params;
  const messages = await chatService.getSessionMessages(sessionId, req.user!.id);
  return sendSuccess(res, 'Live chat messages retrieved.', messages);
});

export const sendChatMessage = asyncHandler(async (req: Request, res: Response) => {
  const { sessionId, content } = req.body;
  const message = await chatService.sendChatMessage(sessionId, req.user!.id, content);
  return sendSuccess(res, 'Live chat message sent.', message, 201);
});

export const getAdminLiveChats = asyncHandler(async (req: Request, res: Response) => {
  const sessions = await chatService.getAdminActiveChatSessions();
  return sendSuccess(res, 'Admin live chat management sessions loaded.', sessions);
});

export const searchUserSession = asyncHandler(async (req: Request, res: Response) => {
  const { query } = req.query;
  const sessions = await chatService.searchOrGetAdminUserSession(String(query || ''));
  return sendSuccess(res, 'Matched user chat sessions retrieved.', sessions);
});
