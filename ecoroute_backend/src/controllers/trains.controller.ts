import { Request, Response } from 'express';
import { indianRailwaysService } from '../services/trains/index.js';

export class TrainsController {
  /**
   * Search trains by number, name, or station
   * GET /api/v1/trains/search?q=17005
   */
  async search(req: Request, res: Response): Promise<void> {
    try {
      const q = String(req.query.q || '');
      const trains = indianRailwaysService.searchTrains(q);
      res.json({
        success: true,
        count: trains.length,
        trains,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: 'Failed to search trains',
        message: err.message,
      });
    }
  }

  /**
   * Get full timetable schedule of any train across India
   * GET /api/v1/trains/schedule/:trainNumber
   */
  async getSchedule(req: Request, res: Response): Promise<void> {
    try {
      const trainNumber = req.params.trainNumber;
      if (!trainNumber) {
        res.status(400).json({ success: false, error: 'Train number is required' });
        return;
      }

      const schedule = indianRailwaysService.getSchedule(trainNumber);
      if (!schedule) {
        res.status(404).json({ success: false, error: `Train schedule for ${trainNumber} not found` });
        return;
      }

      res.json({
        success: true,
        trainNumber,
        schedule,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch train schedule',
        message: err.message,
      });
    }
  }

  /**
   * Find trains running between two stations / cities across India
   * GET /api/v1/trains/between?from=R&to=BKSC
   */
  async betweenStations(req: Request, res: Response): Promise<void> {
    try {
      const from = String(req.query.from || '');
      const to = String(req.query.to || '');

      if (!from || !to) {
        res.status(400).json({ success: false, error: 'Both from and to parameters are required' });
        return;
      }

      const trains = indianRailwaysService.getTrainsBetweenStations(from, to);
      res.json({
        success: true,
        from,
        to,
        count: trains.length,
        trains,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: 'Failed to find trains between stations',
        message: err.message,
      });
    }
  }

  /**
   * Search Indian railway stations
   * GET /api/v1/trains/stations?q=Raipur
   */
  async searchStations(req: Request, res: Response): Promise<void> {
    try {
      const q = String(req.query.q || '');
      const stations = indianRailwaysService.searchStations(q);
      res.json({
        success: true,
        count: stations.length,
        stations,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: 'Failed to search stations',
        message: err.message,
      });
    }
  }

  /**
   * Get live running status / next station for a train
   * GET /api/v1/trains/live/:trainNumber
   */
  async liveStatus(req: Request, res: Response): Promise<void> {
    try {
      const trainNumber = req.params.trainNumber;
      const schedule = indianRailwaysService.getSchedule(trainNumber);

      if (!schedule) {
        res.status(404).json({ success: false, error: 'Train not found' });
        return;
      }

      // Compute simulated live status on route
      const currentHalt = schedule.stops[Math.floor(schedule.stops.length / 2)] || schedule.stops[0];
      const nextHalt = schedule.stops[Math.floor(schedule.stops.length / 2) + 1] || schedule.stops[schedule.stops.length - 1];

      res.json({
        success: true,
        trainNumber,
        trainName: schedule.trainName,
        status: 'On Time (Running)',
        currentStation: currentHalt.stationName,
        nextStation: nextHalt.stationName,
        expectedDeparture: currentHalt.departureTime,
        expectedArrivalNext: nextHalt.arrivalTime,
        delayMins: 0,
        lastUpdated: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch live train status',
        message: err.message,
      });
    }
  }
}

export const trainsController = new TrainsController();
