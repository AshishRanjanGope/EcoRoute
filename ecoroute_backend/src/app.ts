import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import apiRouter from './routes/api.routes.js';

export function createApp(): Express {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());

  // Request logger
  app.use((req: Request, _res: Response, next: NextFunction) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.url}`);
    next();
  });

  // Base API routes
  app.use('/api/v1', apiRouter);

  // Fallback for root health check
  app.get('/health', (_req: Request, res: Response) => {
    res.redirect('/api/v1/health');
  });

  // 404 Handler
  app.use((req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      error: 'Not Found',
      path: req.originalUrl,
    });
  });

  // Global Error Handler
  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error('Unhandled Application Error:', err);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: err.message,
    });
  });

  return app;
}
