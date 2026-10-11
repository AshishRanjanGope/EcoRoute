import http from 'http';
import { WebSocketServer } from 'ws';
import { createApp } from './app.js';
import { env } from './config/env.js';
import { liveTrackingService } from './services/streaming/index.js';

const app = createApp();
const server = http.createServer(app);

// Attach WebSocket server for real-time live vehicle streaming
const wss = new WebSocketServer({ server, path: '/ws/transit/live' });

wss.on('connection', (ws) => {
  console.log('[WebSocket] Client connected to live transit stream');
  liveTrackingService.addWsClient(ws);

  ws.on('close', () => {
    console.log('[WebSocket] Client disconnected');
  });

  ws.on('error', (err) => {
    console.error('[WebSocket] Error:', err);
  });
});

const PORT = env.PORT;

server.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(` EcoRoute Backend Server running on port ${PORT}`);
  console.log(` HTTP API:   http://localhost:${PORT}/api/v1`);
  console.log(` WebSocket:  ws://localhost:${PORT}/ws/transit/live`);
  console.log(` SSE Stream: http://localhost:${PORT}/api/v1/transit/live/stream`);
  console.log(` Health:     http://localhost:${PORT}/api/v1/health`);
  console.log(`====================================================`);
});
