import { io, Socket } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WS_URL, STORAGE_KEYS } from '../constants';

class WebSocketClient {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  async connect(): Promise<Socket> {
    if (this.socket?.connected) {
      return this.socket;
    }

    const token = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);

    this.socket = io(WS_URL, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      this.reconnectAttempts++;
    });

    return this.socket;
  }

  disconnect(): void {
    this.socket?.disconnect();
    this.socket = null;
  }

  subscribe(type: 'sport' | 'game' | 'live', id: number | string): void {
    this.socket?.emit('subscribe', { type, id });
  }

  unsubscribe(type: 'sport' | 'game' | 'live', id: number | string): void {
    this.socket?.emit('unsubscribe', { type, id });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  on<T = any>(event: string, callback: (data: T) => void): void {
    this.socket?.on(event, callback as any);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  off<T = any>(event: string, callback?: (data: T) => void): void {
    this.socket?.off(event, callback as any);
  }

  emit(event: string, data: unknown): void {
    this.socket?.emit(event, data);
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }
}

export const wsClient = new WebSocketClient();
export default wsClient;
