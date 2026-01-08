import http from 'http';
import app from './app.js';
import { env } from './config/env.js';
import { setupWebSocket } from './websocket/index.js';
import { db } from './config/database.js';
import { redis } from './config/redis.js';

const server = http.createServer(app);

// Setup WebSocket
setupWebSocket(server);

const start = async () => {
  try {
    // Test database connection
    await db.raw('SELECT 1');
    console.log('Database connected');

    // Test Redis connection
    await redis.ping();
    console.log('Redis connected');

    server.listen(env.PORT, () => {
      console.log(`Server running on port ${env.PORT}`);
      console.log(`WebSocket ready`);
      console.log(`Environment: ${env.NODE_ENV}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('HTTP server closed');
    db.destroy();
    redis.disconnect();
    process.exit(0);
  });
});

start();
