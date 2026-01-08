import { Router } from 'express';
import { messagesController } from './messages.controller.js';
import { authenticate } from '../../shared/middleware/index.js';
import { validateQuery, validateParams, validateBody } from '../../shared/middleware/index.js';
import {
  messagesListQuerySchema,
  messageIdParamSchema,
  markReadBodySchema,
  dismissBodySchema,
} from './messages.schema.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get all messages for user
router.get(
  '/',
  validateQuery(messagesListQuerySchema),
  messagesController.getMessages.bind(messagesController)
);

// Get unread count
router.get(
  '/unread-count',
  messagesController.getUnreadCount.bind(messagesController)
);

// Get single message
router.get(
  '/:id',
  validateParams(messageIdParamSchema),
  messagesController.getMessageById.bind(messagesController)
);

// Mark messages as read
router.post(
  '/read',
  validateBody(markReadBodySchema),
  messagesController.markAsRead.bind(messagesController)
);

// Mark all as read
router.post(
  '/read-all',
  messagesController.markAllAsRead.bind(messagesController)
);

// Dismiss a message
router.post(
  '/dismiss',
  validateBody(dismissBodySchema),
  messagesController.dismissMessage.bind(messagesController)
);

export { router as messagesRoutes };
