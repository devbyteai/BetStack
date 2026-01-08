import type { Request, Response, NextFunction } from 'express';
import { messagesService } from './messages.service.js';
import type { MessagesListQueryInput, MarkReadBodyInput, DismissBodyInput } from './messages.schema.js';

export class MessagesController {
  async getMessages(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const query = req.query as unknown as MessagesListQueryInput;
      const result = await messagesService.getMessages(userId, query);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getMessageById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      const message = await messagesService.getMessageById(id, userId);

      res.json({
        success: true,
        data: message,
      });
    } catch (error) {
      next(error);
    }
  }

  async markAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const body = req.body as MarkReadBodyInput;
      const result = await messagesService.markMessagesAsRead(userId, body.messageIds);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async markAllAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const result = await messagesService.markAllAsRead(userId);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async dismissMessage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const body = req.body as DismissBodyInput;
      await messagesService.dismissMessage(userId, body.messageId);

      res.json({
        success: true,
        message: 'Message dismissed',
      });
    } catch (error) {
      next(error);
    }
  }

  async getUnreadCount(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const count = await messagesService.getUnreadCount(userId);

      res.json({
        success: true,
        data: { unreadCount: count },
      });
    } catch (error) {
      next(error);
    }
  }
}

export const messagesController = new MessagesController();
