import { Request, Response } from 'express';
import { geohashCache } from '../services/cache/index.js';
import { liveTrackingService } from '../services/streaming/index.js';

export class HealthController {
  check(req: Request, res: Response): void {
    const cacheStats = geohashCache.getStats();
    const liveVehicles = liveTrackingService.getLiveVehicles();

    res.json({
      status: 'healthy',
      service: 'ecoroute-backend',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      features: {
        geohashCache: cacheStats,
        liveTrackingActive: liveVehicles.length > 0,
        activeVehiclesTracked: liveVehicles.length,
      },
    });
  }
}

export const healthController = new HealthController();
