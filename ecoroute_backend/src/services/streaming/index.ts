import { Response } from 'express';
import { WebSocket } from 'ws';
import { LiveVehiclePosition, Coordinate } from '../../types/index.js';
import { transitService } from '../transit/index.js';

export class LiveTrackingService {
  private activeVehicles: LiveVehiclePosition[] = [];
  private sseClients: Set<Response> = new Set();
  private wsClients: Set<WebSocket> = new Set();
  private updateInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.initializeVehicles();
    this.startSimulationLoop();
  }

  /**
   * Seed active vehicles on Pune Metro and PMPML bus routes
   */
  private initializeVehicles(): void {
    const stations = transitService.getAllStations();
    const metroStations = stations.filter((s) => s.type === 'metro');
    const busStops = stations.filter((s) => s.type === 'bus');

    // 4 Metro trains (2 on Purple Line, 2 on Aqua Line)
    this.activeVehicles = [
      {
        vehicleId: 'METRO-L1-01',
        lineId: 'L1',
        routeNumber: 'Purple-1',
        vehicleType: 'metro',
        currentCoordinate: { lat: 18.5314, lng: 73.8446 }, // near Shivajinagar
        speedKmh: 34,
        bearing: 145,
        nextStationId: 'M1-8',
        nextStationName: 'Civil Court (Interchange)',
        estimatedArrivalMins: 2,
        crowdingLevel: 'medium',
        updatedAt: new Date().toISOString(),
      },
      {
        vehicleId: 'METRO-L2-01',
        lineId: 'L2',
        routeNumber: 'Aqua-1',
        vehicleType: 'metro',
        currentCoordinate: { lat: 18.5488, lng: 73.9038 }, // near Kalyani Nagar
        speedKmh: 31,
        bearing: 78,
        nextStationId: 'M2-14',
        nextStationName: 'Ramwadi',
        estimatedArrivalMins: 3,
        crowdingLevel: 'low',
        updatedAt: new Date().toISOString(),
      },
      // 3 PMPML Buses
      {
        vehicleId: 'BUS-PMPML-148A',
        lineId: 'B-148',
        routeNumber: '148',
        vehicleType: 'bus',
        currentCoordinate: { lat: 18.5375, lng: 73.8682 }, // between Shivajinagar and Kalyani Nagar
        speedKmh: 24,
        bearing: 65,
        nextStationId: 'B-4',
        nextStationName: 'Kalyani Nagar Bus Stop',
        estimatedArrivalMins: 5,
        crowdingLevel: 'high',
        updatedAt: new Date().toISOString(),
      },
      {
        vehicleId: 'BUS-PMPML-102B',
        lineId: 'B-102',
        routeNumber: '102',
        vehicleType: 'bus',
        currentCoordinate: { lat: 18.5601, lng: 73.7422 }, // heading towards Hinjawadi
        speedKmh: 28,
        bearing: 290,
        nextStationId: 'B-5',
        nextStationName: 'Hinjawadi Phase 3 Bus Terminal',
        estimatedArrivalMins: 8,
        crowdingLevel: 'medium',
        updatedAt: new Date().toISOString(),
      },
    ];
  }

  /**
   * Continuous simulation loop: smoothly moves vehicle GPS coordinates every 4 seconds
   */
  private startSimulationLoop(): void {
    this.updateInterval = setInterval(() => {
      this.activeVehicles = this.activeVehicles.map((vehicle) => {
        // Micro-jitter to simulate smooth real-time GPS movement
        const latDelta = (Math.random() - 0.48) * 0.0006;
        const lngDelta = (Math.random() - 0.48) * 0.0006;

        const updatedCoord: Coordinate = {
          lat: Number((vehicle.currentCoordinate.lat + latDelta).toFixed(6)),
          lng: Number((vehicle.currentCoordinate.lng + lngDelta).toFixed(6)),
        };

        const waitMins = Math.max(1, vehicle.estimatedArrivalMins - (Math.random() > 0.8 ? 1 : 0));

        return {
          ...vehicle,
          currentCoordinate: updatedCoord,
          speedKmh: Math.max(15, Math.min(45, Math.round(vehicle.speedKmh + (Math.random() - 0.5) * 4))),
          estimatedArrivalMins: waitMins,
          updatedAt: new Date().toISOString(),
        };
      });

      this.broadcastToClients();
    }, 4000);

    this.updateInterval.unref();
  }

  /**
   * Return snapshot of all or filtered vehicles
   */
  getLiveVehicles(lineId?: string, vehicleType?: 'metro' | 'bus'): LiveVehiclePosition[] {
    let filtered = this.activeVehicles;
    if (lineId) {
      filtered = filtered.filter((v) => v.lineId === lineId || v.routeNumber === lineId);
    }
    if (vehicleType) {
      filtered = filtered.filter((v) => v.vehicleType === vehicleType);
    }
    return filtered;
  }

  /**
   * Subscribe Server-Sent Events (SSE) Client
   */
  addSseClient(res: Response): void {
    this.sseClients.add(res);

    // Send immediate initial state
    res.write(`data: ${JSON.stringify({ type: 'INIT', vehicles: this.activeVehicles })}\n\n`);

    res.on('close', () => {
      this.sseClients.delete(res);
    });
  }

  /**
   * Register WebSocket Client
   */
  addWsClient(ws: WebSocket): void {
    this.wsClients.add(ws);
    ws.send(JSON.stringify({ type: 'INIT', vehicles: this.activeVehicles }));

    ws.on('close', () => {
      this.wsClients.delete(ws);
    });
  }

  /**
   * Broadcast current vehicle positions to all connected SSE and WebSocket clients
   */
  private broadcastToClients(): void {
    const payload = JSON.stringify({
      type: 'VEHICLE_UPDATES',
      timestamp: new Date().toISOString(),
      vehicles: this.activeVehicles,
    });

    // 1. SSE broadcast
    for (const client of this.sseClients) {
      client.write(`data: ${payload}\n\n`);
    }

    // 2. WebSocket broadcast
    for (const ws of this.wsClients) {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(payload);
      }
    }
  }

  destroy(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
  }
}

export const liveTrackingService = new LiveTrackingService();
