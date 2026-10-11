import { Router } from 'express';
import { routesController } from '../controllers/routes.controller.js';
import { transitController } from '../controllers/transit.controller.js';
import { impactController } from '../controllers/impact.controller.js';
import { healthController } from '../controllers/health.controller.js';
import { placesController } from '../controllers/places.controller.js';
import { trainsController } from '../controllers/trains.controller.js';

const router = Router();

// Google Places & Geocoding
router.get('/places/search', (req, res) => placesController.search(req, res));
router.get('/places/geocode', (req, res) => placesController.geocode(req, res));

// Route Comparison Engine
router.post('/routes/compare', (req, res) => routesController.compare(req, res));

// Indian Railways Trains & Schedules API
router.get('/trains/search', (req, res) => trainsController.search(req, res));
router.get('/trains/schedule/:trainNumber', (req, res) => trainsController.getSchedule(req, res));
router.get('/trains/between', (req, res) => trainsController.betweenStations(req, res));
router.get('/trains/stations', (req, res) => trainsController.searchStations(req, res));
router.get('/trains/live/:trainNumber', (req, res) => trainsController.liveStatus(req, res));

// Public Transit (Metro & Bus)
router.get('/transit/stations', (req, res) => transitController.getStations(req, res));
router.get('/transit/lines', (req, res) => transitController.getLines(req, res));
router.get('/transit/schedule', (req, res) => transitController.getSchedule(req, res));
router.get('/transit/live', (req, res) => transitController.getLiveVehicles(req, res));
router.get('/transit/live/stream', (req, res) => transitController.streamLive(req, res));

// Carbon Impact Calculations
router.post('/impact/calculate', (req, res) => impactController.calculate(req, res));

// System Health
router.get('/health', (req, res) => healthController.check(req, res));

export default router;
