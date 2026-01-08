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
  startsAt: string;
  expiresAt: string | null;
  isActive: boolean;
  isGlobal: boolean;
  createdAt: string;
  updatedAt: string;
  isRead: boolean;
  isDismissed: boolean;
}

export interface MessagesListQuery {
  type?: MessageType;
  includeRead?: boolean;
  limit?: number;
  offset?: number;
}

export interface MessagesListResponse {
  messages: Message[];
  total: number;
  unreadCount: number;
  limit: number;
  offset: number;
}

export interface MarkReadRequest {
  messageIds: string[];
}

export interface DismissRequest {
  messageId: string;
}
