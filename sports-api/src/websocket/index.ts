import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { redis } from '../config/redis.js';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

let io: Server;

// Types for WebSocket events
interface SubscriptionData {
  type: 'sport' | 'game' | 'live' | 'user';
  id: number | string;
}

interface OddsUpdateData {
  eventId: string;
  marketId: string;
  gameId: string;
  price: number;
  previousPrice: number;
  direction: 'up' | 'down' | 'same';
}

interface GameStatusData {
  gameId: string;
  isLive: boolean;
  info: {
    score1?: number;
    score2?: number;
    currentPeriod?: string;
    currentTime?: string;
    stats?: Record<string, unknown>;
  };
}

interface MarketSuspendData {
  marketId: string;
  gameId: string;
  isSuspended: boolean;
}

interface BetUpdateData {
  betId: string;
  status: 'pending' | 'won' | 'lost' | 'cashout' | 'cancelled' | 'returned';
  payout?: number;
}

interface BalanceUpdateData {
  balance: number;
  bonusBalance: number;
}

// WebSocket authentication middleware
const authenticateSocket = async (socket: Socket, next: (err?: Error) => void) => {
  const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    // Allow unauthenticated connections for public data (sports, games, odds)
    socket.data.userId = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as { id: string; mobileNumber: string };
    socket.data.userId = decoded.id;
    socket.data.isAuthenticated = true;

    // Join user's private room for personalized updates
    socket.join(`user:${decoded.id}`);

    next();
  } catch (error) {
    // Token provided but invalid - allow connection but mark as auth failed
    // Client can still receive public data (sports, games, odds)
    socket.data.userId = null;
    socket.data.isAuthenticated = false;
    socket.data.authError = error instanceof jwt.TokenExpiredError ? 'token_expired' : 'invalid_token';

    // Log auth failures for security monitoring
    console.warn(`WebSocket auth failed for ${socket.id}: ${socket.data.authError}`);

    // Allow connection but notify client of auth failure after connect
    next();
  }
};

// Get WebSocket CORS origin - same logic as REST API
const getWsCorsOrigin = (): string | string[] | boolean => {
  // In production, CORS_ORIGIN is required (validated in app.ts)
  if (env.NODE_ENV === 'production') {
    if (!env.CORS_ORIGIN) {
      console.error('FATAL: CORS_ORIGIN environment variable is required in production for WebSocket');
      process.exit(1);
    }
    return env.CORS_ORIGIN.split(',').map(origin => origin.trim());
  }
  // In development/test, allow all origins if not specified
  return env.CORS_ORIGIN ? env.CORS_ORIGIN.split(',').map(origin => origin.trim()) : true;
};

export const setupWebSocket = (server: HttpServer) => {
  io = new Server(server, {
    cors: {
      origin: getWsCorsOrigin(),
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // Apply authentication middleware
  io.use(authenticateSocket);

  io.on('connection', (socket: Socket) => {
    console.log(`Client connected: ${socket.id}${socket.data.userId ? ` (user: ${socket.data.userId})` : ' (anonymous)'}`);

    // Notify client of authentication failure if token was invalid
    if (socket.data.authError) {
      socket.emit('auth_error', {
        error: socket.data.authError,
        message: socket.data.authError === 'token_expired'
          ? 'Your session has expired. Please log in again.'
          : 'Authentication failed. Please log in again.',
      });
    }

    // Auto-join live room for live betting updates
    socket.join('live');

    // Valid subscription types
    const VALID_SUBSCRIPTION_TYPES = ['sport', 'game', 'live', 'user'] as const;

    // Handle subscription to specific rooms
    socket.on('subscribe', (data: SubscriptionData) => {
      // Validate subscription data
      if (!data || typeof data !== 'object') {
        socket.emit('error', { message: 'Invalid subscription data' });
        return;
      }

      // Validate subscription type
      if (!VALID_SUBSCRIPTION_TYPES.includes(data.type as typeof VALID_SUBSCRIPTION_TYPES[number])) {
        socket.emit('error', { message: `Invalid subscription type: ${data.type}` });
        return;
      }

      // Validate id format
      if (data.id === undefined || data.id === null || data.id === '') {
        socket.emit('error', { message: 'Subscription id is required' });
        return;
      }

      // Prevent subscribing to other users' rooms
      if (data.type === 'user' && data.id !== socket.data.userId) {
        socket.emit('error', { message: 'Cannot subscribe to other users' });
        return;
      }

      const room = `${data.type}:${data.id}`;
      socket.join(room);
      console.log(`${socket.id} joined room: ${room}`);

      // Acknowledge subscription
      socket.emit('subscribed', { room });
    });

    // Handle unsubscription
    socket.on('unsubscribe', (data: SubscriptionData) => {
      // Validate subscription data
      if (!data || typeof data !== 'object' || !data.type || data.id === undefined) {
        socket.emit('error', { message: 'Invalid unsubscription data' });
        return;
      }

      const room = `${data.type}:${data.id}`;
      socket.leave(room);
      console.log(`${socket.id} left room: ${room}`);

      // Acknowledge unsubscription
      socket.emit('unsubscribed', { room });
    });

    // Handle ping for connection health check
    socket.on('ping', () => {
      socket.emit('pong', { timestamp: Date.now() });
    });

    // Handle socket errors
    socket.on('error', (error) => {
      console.error(`Socket error for ${socket.id}:`, error);
    });

    // Handle disconnect
    socket.on('disconnect', (reason) => {
      console.log(`Client disconnected: ${socket.id}, reason: ${reason}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

// ============================================
// Room-based emission utilities
// ============================================

// Emit to specific room
export const emitToRoom = (room: string, event: string, data: unknown) => {
  io?.to(room).emit(event, data);
};

// Emit to all connected clients
export const emitToAll = (event: string, data: unknown) => {
  io?.emit(event, data);
};

// ============================================
// Live betting event emitters
// ============================================

// Emit odds update to game room and live room
export const emitOddsUpdate = (data: OddsUpdateData) => {
  const gameRoom = `game:${data.gameId}`;

  io?.to(gameRoom).to('live').emit('odds:update', data);

  // Cache the update in Redis for late joiners
  redis.setex(`odds:${data.eventId}`, 60, JSON.stringify(data)).catch(console.error);
};

// Emit batch odds updates (for efficiency)
export const emitOddsUpdateBatch = (updates: OddsUpdateData[]) => {
  if (updates.length === 0) return;

  // Group by game for targeted emissions
  const byGame = new Map<string, OddsUpdateData[]>();

  for (const update of updates) {
    const existing = byGame.get(update.gameId) || [];
    existing.push(update);
    byGame.set(update.gameId, existing);
  }

  // Emit to each game room
  for (const [gameId, gameUpdates] of byGame) {
    io?.to(`game:${gameId}`).emit('odds:update:batch', gameUpdates);
  }

  // Also emit all to live room
  io?.to('live').emit('odds:update:batch', updates);
};

// Emit game status update (score, time, period)
export const emitGameStatus = (data: GameStatusData) => {
  const gameRoom = `game:${data.gameId}`;

  io?.to(gameRoom).to('live').emit('game:status', data);

  // Cache in Redis
  redis.setex(`game:status:${data.gameId}`, 300, JSON.stringify(data)).catch(console.error);
};

// Emit game start event
export const emitGameStart = (gameId: string, sportId: number) => {
  io?.to('live').to(`sport:${sportId}`).emit('game:start', { gameId, sportId });
};

// Emit game end event
export const emitGameEnd = (gameId: string, sportId: number, result: { score1: number; score2: number }) => {
  io?.to(`game:${gameId}`).to('live').to(`sport:${sportId}`).emit('game:end', {
    gameId,
    sportId,
    result
  });
};

// Emit market suspension status
export const emitMarketSuspend = (data: MarketSuspendData) => {
  const gameRoom = `game:${data.gameId}`;

  io?.to(gameRoom).emit('market:suspend', data);
};

// ============================================
// User-specific event emitters
// ============================================

// Emit bet placed confirmation to user
export const emitBetPlaced = (userId: string, betData: { betId: string; bookingCode: string; status: string }) => {
  io?.to(`user:${userId}`).emit('bet:placed', betData);
};

// Emit bet settlement to user
export const emitBetSettled = (userId: string, data: BetUpdateData) => {
  io?.to(`user:${userId}`).emit('bet:settled', data);
};

// Emit cashout update to user
export const emitCashoutUpdate = (userId: string, data: { betId: string; currentValue: number }) => {
  io?.to(`user:${userId}`).emit('cashout:update', data);
};

// Emit cashout result to user
export const emitCashoutResult = (userId: string, data: { betId: string; amount: number; success: boolean }) => {
  io?.to(`user:${userId}`).emit('cashout:result', data);
};

// Emit balance update to user
export const emitBalanceUpdate = (userId: string, data: BalanceUpdateData) => {
  io?.to(`user:${userId}`).emit('balance:update', data);
};

// ============================================
// Utility functions
// ============================================

// Get count of clients in a room
export const getRoomSize = async (room: string): Promise<number> => {
  const sockets = await io?.in(room).fetchSockets();
  return sockets?.length || 0;
};

// Check if a user is connected
export const isUserConnected = async (userId: string): Promise<boolean> => {
  const sockets = await io?.in(`user:${userId}`).fetchSockets();
  return (sockets?.length || 0) > 0;
};

// Broadcast to all clients in a sport
export const emitToSport = (sportId: number, event: string, data: unknown) => {
  io?.to(`sport:${sportId}`).emit(event, data);
};

// Get all rooms a socket is in
export const getSocketRooms = (socketId: string): Set<string> | undefined => {
  return io?.sockets.sockets.get(socketId)?.rooms;
};
