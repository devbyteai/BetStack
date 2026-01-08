import { db } from '../../config/database.js';
import { NotFoundError } from '../../shared/errors/AppError.js';
import type {
  Message,
  UserMessage,
  MessagesListQuery,
  MessagesListResponse,
  MessageType,
  MessagePriority,
} from './messages.types.js';

interface DbMessage {
  id: string;
  title: string;
  content: string;
  type: MessageType;
  priority: MessagePriority;
  image_url: string | null;
  action_url: string | null;
  action_label: string | null;
  starts_at: Date;
  expires_at: Date | null;
  is_active: boolean;
  is_global: boolean;
  created_at: Date;
  updated_at: Date;
}

interface DbUserMessage {
  id: string;
  user_id: string;
  message_id: string;
  is_read: boolean;
  read_at: Date | null;
  is_dismissed: boolean;
  dismissed_at: Date | null;
  created_at: Date;
}

interface DbMessageWithStatus extends DbMessage {
  is_read: boolean | null;
  is_dismissed: boolean | null;
}

export class MessagesService {
  private mapDbMessageToMessage(dbMessage: DbMessage): Message {
    return {
      id: dbMessage.id,
      title: dbMessage.title,
      content: dbMessage.content,
      type: dbMessage.type,
      priority: dbMessage.priority,
      imageUrl: dbMessage.image_url,
      actionUrl: dbMessage.action_url,
      actionLabel: dbMessage.action_label,
      startsAt: dbMessage.starts_at,
      expiresAt: dbMessage.expires_at,
      isActive: dbMessage.is_active,
      isGlobal: dbMessage.is_global,
      createdAt: dbMessage.created_at,
      updatedAt: dbMessage.updated_at,
    };
  }

  async getMessages(userId: string, query: MessagesListQuery): Promise<MessagesListResponse> {
    const { type, includeRead = true, limit = 20, offset = 0 } = query;
    const now = new Date();

    // Base query for active, non-expired messages
    let baseQuery = db<DbMessage>('messages')
      .where('is_active', true)
      .where('starts_at', '<=', now)
      .where(function () {
        this.whereNull('expires_at').orWhere('expires_at', '>', now);
      });

    if (type) {
      baseQuery = baseQuery.where('type', type);
    }

    // Get messages with user read status
    let messagesQuery = db
      .select(
        'messages.*',
        'user_messages.is_read',
        'user_messages.is_dismissed'
      )
      .from('messages')
      .leftJoin('user_messages', function () {
        this.on('messages.id', '=', 'user_messages.message_id')
          .andOn('user_messages.user_id', '=', db.raw('?', [userId]));
      })
      .where('messages.is_active', true)
      .where('messages.starts_at', '<=', now)
      .where(function () {
        this.whereNull('messages.expires_at').orWhere('messages.expires_at', '>', now);
      })
      .where(function () {
        // Exclude dismissed messages
        this.whereNull('user_messages.is_dismissed').orWhere('user_messages.is_dismissed', false);
      });

    if (type) {
      messagesQuery = messagesQuery.where('messages.type', type);
    }

    if (!includeRead) {
      messagesQuery = messagesQuery.where(function () {
        this.whereNull('user_messages.is_read').orWhere('user_messages.is_read', false);
      });
    }

    // Count total matching messages
    const countQuery = messagesQuery.clone();
    const [countResult] = await db.count('* as count').from(countQuery.as('filtered'));
    const total = parseInt(String(countResult?.count || '0'), 10);

    // Count unread messages
    const unreadQuery = db
      .select('messages.id')
      .from('messages')
      .leftJoin('user_messages', function () {
        this.on('messages.id', '=', 'user_messages.message_id')
          .andOn('user_messages.user_id', '=', db.raw('?', [userId]));
      })
      .where('messages.is_active', true)
      .where('messages.starts_at', '<=', now)
      .where(function () {
        this.whereNull('messages.expires_at').orWhere('messages.expires_at', '>', now);
      })
      .where(function () {
        this.whereNull('user_messages.is_read').orWhere('user_messages.is_read', false);
      })
      .where(function () {
        this.whereNull('user_messages.is_dismissed').orWhere('user_messages.is_dismissed', false);
      });

    const [unreadResult] = await db.count('* as count').from(unreadQuery.as('unread'));
    const unreadCount = parseInt(String(unreadResult?.count || '0'), 10);

    // Fetch paginated messages
    const messages = (await messagesQuery
      .orderBy([
        { column: 'messages.priority', order: 'desc' },
        { column: 'messages.created_at', order: 'desc' },
      ])
      .limit(limit)
      .offset(offset)) as DbMessageWithStatus[];

    return {
      messages: messages.map((m) => ({
        ...this.mapDbMessageToMessage(m),
        isRead: m.is_read || false,
        isDismissed: m.is_dismissed || false,
      })),
      total,
      unreadCount,
      limit,
      offset,
    };
  }

  async getMessageById(messageId: string, userId: string): Promise<Message & { isRead: boolean; isDismissed: boolean }> {
    const now = new Date();

    const result = (await db
      .select(
        'messages.*',
        'user_messages.is_read',
        'user_messages.is_dismissed'
      )
      .from('messages')
      .leftJoin('user_messages', function () {
        this.on('messages.id', '=', 'user_messages.message_id')
          .andOn('user_messages.user_id', '=', db.raw('?', [userId]));
      })
      .where('messages.id', messageId)
      .where('messages.is_active', true)
      .where('messages.starts_at', '<=', now)
      .where(function () {
        this.whereNull('messages.expires_at').orWhere('messages.expires_at', '>', now);
      })
      .first()) as DbMessageWithStatus | undefined;

    if (!result) {
      throw new NotFoundError('Message not found');
    }

    return {
      ...this.mapDbMessageToMessage(result),
      isRead: result.is_read || false,
      isDismissed: result.is_dismissed || false,
    };
  }

  async markMessagesAsRead(userId: string, messageIds: string[]): Promise<{ markedCount: number }> {
    const now = new Date();
    let markedCount = 0;

    for (const messageId of messageIds) {
      // Check if user_message record exists
      const existing = await db<DbUserMessage>('user_messages')
        .where('user_id', userId)
        .where('message_id', messageId)
        .first();

      if (existing) {
        if (!existing.is_read) {
          await db('user_messages')
            .where('id', existing.id)
            .update({
              is_read: true,
              read_at: now,
            });
          markedCount++;
        }
      } else {
        // Create new user_message record
        await db('user_messages').insert({
          user_id: userId,
          message_id: messageId,
          is_read: true,
          read_at: now,
        });
        markedCount++;
      }
    }

    return { markedCount };
  }

  async dismissMessage(userId: string, messageId: string): Promise<void> {
    const now = new Date();

    // Check if message exists
    const message = await db<DbMessage>('messages')
      .where('id', messageId)
      .first();

    if (!message) {
      throw new NotFoundError('Message not found');
    }

    // Check if user_message record exists
    const existing = await db<DbUserMessage>('user_messages')
      .where('user_id', userId)
      .where('message_id', messageId)
      .first();

    if (existing) {
      await db('user_messages')
        .where('id', existing.id)
        .update({
          is_dismissed: true,
          dismissed_at: now,
        });
    } else {
      // Create new user_message record as dismissed
      await db('user_messages').insert({
        user_id: userId,
        message_id: messageId,
        is_dismissed: true,
        dismissed_at: now,
      });
    }
  }

  async getUnreadCount(userId: string): Promise<number> {
    const now = new Date();

    const result = await db
      .count('messages.id as count')
      .from('messages')
      .leftJoin('user_messages', function () {
        this.on('messages.id', '=', 'user_messages.message_id')
          .andOn('user_messages.user_id', '=', db.raw('?', [userId]));
      })
      .where('messages.is_active', true)
      .where('messages.starts_at', '<=', now)
      .where(function () {
        this.whereNull('messages.expires_at').orWhere('messages.expires_at', '>', now);
      })
      .where(function () {
        this.whereNull('user_messages.is_read').orWhere('user_messages.is_read', false);
      })
      .where(function () {
        this.whereNull('user_messages.is_dismissed').orWhere('user_messages.is_dismissed', false);
      })
      .first();

    return parseInt(String(result?.count || '0'), 10);
  }

  async markAllAsRead(userId: string): Promise<{ markedCount: number }> {
    const now = new Date();

    // Get all unread message IDs
    const unreadMessages = await db
      .select('messages.id')
      .from('messages')
      .leftJoin('user_messages', function () {
        this.on('messages.id', '=', 'user_messages.message_id')
          .andOn('user_messages.user_id', '=', db.raw('?', [userId]));
      })
      .where('messages.is_active', true)
      .where('messages.starts_at', '<=', now)
      .where(function () {
        this.whereNull('messages.expires_at').orWhere('messages.expires_at', '>', now);
      })
      .where(function () {
        this.whereNull('user_messages.is_read').orWhere('user_messages.is_read', false);
      });

    const messageIds = unreadMessages.map((m: { id: string }) => m.id);

    if (messageIds.length === 0) {
      return { markedCount: 0 };
    }

    return this.markMessagesAsRead(userId, messageIds);
  }
}

export const messagesService = new MessagesService();
