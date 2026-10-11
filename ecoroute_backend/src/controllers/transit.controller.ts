import { Request, Response } from 'express';
import { transitService } from '../services/transit/index.js';
import { liveTrackingService } from '../services/streaming/index.js';

export class TransitController {
  /**
   * Get all transit stations / stops
   */
  getStations(req: Request, res: Response): void {
    const type = req.query.type as 'metro' | 'bus' | undefined;
    const stations = transitService.getAllStations();
    const filtered = type ? stations.filter((s) => s.type === type) : stations;
    res.json({
      success: true,
      count: filtered.length,
      stations: filtered,
    });
  }

  /**
   * Get transit lines (Metro Lines & Bus Routes)
   */
  getLines(req: Request, res: Response): void {
    const lines = transitService.getAllLines();
    res.json({
      success: true,
      count: lines.length,
      lines,
    });
  }

  /**
   * Get timetable / departures for a station
   */
  getSchedule(req: Request, res: Response): void {
    const stationId = req.query.stationId as string;
    if (!stationId) {
      res.status(400).json({
        success: false,
        error: 'Missing required query parameter: stationId',
      });
      return;
    }

    const departures = transitService.getStationDepartures(stationId);
    res.json({
      success: true,
      stationId,
      departures,
    });
  }

  /**
   * Get current live location snapshot of active buses and metro cars
   */
  getLiveVehicles(req: Request, res: Response): void {
    const lineId = req.query.lineId as string | undefined;
    const vehicleType = req.query.type as 'metro' | 'bus' | undefined;

    const vehicles = liveTrackingService.getLiveVehicles(lineId, vehicleType);
    res.json({
      success: true,
      count: vehicles.length,
      timestamp: new Date().toISOString(),
      vehicles,
    });
  }

  /**
   * Server-Sent Events (SSE) stream for continuous live GPS updates
   */
  streamLive(req: Request, res: Response): void {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.flushHeaders();

    liveTrackingService.addSseClient(res);
  }
}

export const transitController = new TransitController();
