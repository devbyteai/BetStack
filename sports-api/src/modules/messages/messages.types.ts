export type MessageType = 'system' | 'promotion' | 'announcement' | 'alert';
export type MessagePriority = 'low' | 'normal' | 'high' | 'urgent';

export interface Message {
  id: string;
  title: string;
  content: string;
  type: MessageType;
  priority: MessagePriority;
  imageUrl: string | null;
  actionUrl: string | null;
  actionLabel: string | null;
  startsAt: Date;
  expiresAt: Date | null;
  isActive: boolean;
  isGlobal: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserMessage {
  id: string;
  userId: string;
  messageId: string;
  isRead: boolean;
  readAt: Date | null;
  isDismissed: boolean;
  dismissedAt: Date | null;
  createdAt: Date;
  message?: Message;
}

export interface MessagesListQuery {
  type?: MessageType;
  includeRead?: boolean;
  limit?: number;
  offset?: number;
}

export interface MessagesListResponse {
  messages: (Message & { isRead: boolean; isDismissed: boolean })[];
  total: number;
  unreadCount: number;
  limit: number;
  offset: number;
}

export interface MarkMessageReadRequest {
  messageId: string;
}

export interface DismissMessageRequest {
  messageId: string;
}
