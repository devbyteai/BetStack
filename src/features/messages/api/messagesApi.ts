import { baseApi } from '@/store/api/baseApi';
import type {
  Message,
  MessagesListResponse,
  MessagesListQuery,
  MarkReadRequest,
  DismissRequest,
} from '../types';

export const messagesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all messages for user
    getMessages: builder.query<MessagesListResponse, MessagesListQuery | void>({
      query: (params) => ({
        url: '/messages',
        params: params || {},
      }),
      providesTags: ['Messages'],
    }),

    // Get single message
    getMessageById: builder.query<Message, string>({
      query: (id) => `/messages/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Messages', id }],
    }),

    // Get unread count
    getUnreadCount: builder.query<{ unreadCount: number }, void>({
      query: () => '/messages/unread-count',
      providesTags: ['Messages'],
    }),

    // Mark messages as read
    markAsRead: builder.mutation<{ markedCount: number }, MarkReadRequest>({
      query: (body) => ({
        url: '/messages/read',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Messages'],
    }),

    // Mark all as read
    markAllAsRead: builder.mutation<{ markedCount: number }, void>({
      query: () => ({
        url: '/messages/read-all',
        method: 'POST',
      }),
      invalidatesTags: ['Messages'],
    }),

    // Dismiss a message
    dismissMessage: builder.mutation<void, DismissRequest>({
      query: (body) => ({
        url: '/messages/dismiss',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Messages'],
    }),
  }),
});

export const {
  useGetMessagesQuery,
  useGetMessageByIdQuery,
  useGetUnreadCountQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
  useDismissMessageMutation,
} = messagesApi;
