import { Request, Response } from 'express';
import { z } from 'zod';
import { Coordinate, RouteOption, RouteLeg } from '../types/index.js';
import { routingService } from '../services/routing/index.js';
import { fareEngine } from '../services/fares/index.js';
import { transitService } from '../services/transit/index.js';
import { emissionsEngine } from '../services/emissions/index.js';
import { geohashCache } from '../services/cache/index.js';
import { indianRailwaysService } from '../services/trains/index.js';

const coordinateSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  name: z.string().optional(),
});

const compareRoutesSchema = z.object({
  origin: coordinateSchema,
  destination: coordinateSchema,
  sortBy: z.enum(['efficiency', 'cost', 'time']).default('efficiency'),
});

export class RoutesController {
  async compare(req: Request, res: Response): Promise<void> {
    try {
      const parsed = compareRoutesSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          success: false,
          error: 'Invalid input coordinates',
          details: parsed.error.format(),
        });
        return;
      }

      const { origin, destination, sortBy } = parsed.data;

      // 1. Check Geohash spatial cache
      const cacheKey = geohashCache.generateRouteKey(origin, destination, sortBy);
      const cached = geohashCache.get<RouteOption[]>(cacheKey);
      if (cached) {
        res.json({
          success: true,
          origin,
          destination,
          routes: cached,
          meta: {
            cached: true,
            timestamp: new Date().toISOString(),
          },
        });
        return;
      }

      // 2. Fetch routing metrics (Driving, Walking, Cycling)
      const drivingMetrics = await routingService.getDrivingMetrics(origin, destination);
      const walkingMetrics = routingService.getWalkingMetrics(origin, destination);
      const cyclingMetrics = routingService.getCyclingMetrics(origin, destination);

      const distanceKm = drivingMetrics.distanceKm;
      const durationMins = drivingMetrics.durationMins;

      const generatedRoutes: RouteOption[] = [];

      // Check if distance is intercity (> 40 km) or urban
      const isIntercity = distanceKm > 40;

      if (isIntercity) {
        // === INTERCITY MODES ===

        // A. Indian Railways Trains
        const trainMatches = indianRailwaysService.getTrainsBetweenStations(
          origin.name || '',
          destination.name || ''
        );

        if (trainMatches.length > 0) {
          for (const t of trainMatches.slice(0, 3)) {
            const trainFare = t.fares.sleeper || Math.round(120 + distanceKm * 0.38);
            generatedRoutes.push({
              id: `route-train-${t.trainNumber}`,
              mode: 'train',
              name: `Train: ${t.trainNumber} ${t.trainName}`,
              provider: 'Indian Railways',
              distanceKm: t.distanceKm || distanceKm,
              durationMins: t.durationMins,
              costINR: trainFare,
              occupancy: 1,
              emissionKgCO2: t.carbonKg,
              carbonBadge: 'Low Carbon',
              startTime: t.departureTime,
              endTime: t.arrivalTime,
              legs: [
                { mode: 'walk', label: `To ${t.fromStationName}`, durationMins: 15 },
                { mode: 'train', label: `${t.trainNumber} (${t.fromStationCode} ➔ ${t.toStationCode})`, durationMins: Math.max(10, t.durationMins - 30) },
                { mode: 'walk', label: `To ${destination.name || 'Destination'}`, durationMins: 15 },
              ],
            });
          }
        } else {
          // General Indian Railways Superfast Express route
          const railDist = Number((distanceKm * 1.02).toFixed(1));
          const railDurationMins = Math.round((railDist / 58) * 60) + 40;
          const railFare = Math.round(140 + railDist * 0.38);
          generatedRoutes.push({
            id: 'route-train-express',
            mode: 'train',
            name: 'Indian Railways Superfast Express',
            provider: 'Indian Railways',
            distanceKm: railDist,
            durationMins: railDurationMins,
            costINR: railFare,
            occupancy: 1,
            emissionKgCO2: Number((railDist * 0.026).toFixed(1)),
            carbonBadge: 'Low Carbon',
            startTime: '10:15 AM',
            endTime: '11:45 PM',
            legs: [
              { mode: 'walk', label: 'To Railway Junction', durationMins: 20 },
              { mode: 'train', label: 'Superfast Express', durationMins: railDurationMins - 40 },
              { mode: 'walk', label: 'To Destination', durationMins: 20 },
            ],
          });
        }

        // B. Intercity Carpool (EcoPool Outstation)
        const carpoolCost = Math.round(distanceKm * 2.4);
        generatedRoutes.push({
          id: 'route-intercity-carpool',
          mode: 'carpool',
          name: 'Outstation Carpool (EcoPool)',
          provider: 'EcoRoute Community',
          distanceKm,
          durationMins: Math.round(durationMins * 1.06),
          costINR: carpoolCost,
          occupancy: 4,
          emissionKgCO2: Number((distanceKm * 0.045).toFixed(1)),
          carbonBadge: 'Medium Carbon',
          legs: [
            { mode: 'carpool', label: 'Shared Highway Ride', durationMins: Math.round(durationMins * 1.06) },
          ],
        });

        // C. Intercity Bus (AC Sleeper / Volvo)
        const busCost = Math.round(distanceKm * 1.55);
        generatedRoutes.push({
          id: 'route-intercity-bus',
          mode: 'bus',
          name: 'Intercity AC Sleeper Bus',
          provider: 'RedBus / Kanker Roadways',
          distanceKm,
          durationMins: Math.round(durationMins * 1.15),
          costINR: busCost,
          occupancy: 30,
          emissionKgCO2: Number((distanceKm * 0.038).toFixed(1)),
          carbonBadge: 'Low Carbon',
          legs: [
            { mode: 'bus', label: 'AC Sleeper Bus', durationMins: Math.round(durationMins * 1.15) },
          ],
        });

        // D. Outstation Cab (Uber Intercity / Private Highway Drive)
        const cabCost = Math.round(distanceKm * 12.0);
        generatedRoutes.push({
          id: 'route-outstation-cab',
          mode: 'taxi',
          name: 'Outstation Cab (Uber / Ola)',
          provider: 'Uber Intercity',
          distanceKm,
          durationMins,
          costINR: cabCost,
          occupancy: 1,
          emissionKgCO2: Number((distanceKm * 0.15).toFixed(1)),
          carbonBadge: 'High Carbon',
          polyline: drivingMetrics.polyline,
          legs: [
            { mode: 'carpool', label: 'Private Highway Drive', durationMins },
          ],
        });

      } else {
        // === URBAN / LOCAL MODES ===

        // A. Public Transit (Metro, Mixed Transit, City Bus)
        const transitRoutes = transitService.generateTransitRoutes(origin, destination, distanceKm);
        generatedRoutes.push(...transitRoutes);

        // B. Auto-Rickshaw
        const autoFare = fareEngine.calculateAutoFare(distanceKm, origin, destination);
        generatedRoutes.push({
          id: 'route-auto-rickshaw',
          mode: 'auto-rickshaw',
          name: 'Auto-Rickshaw (Meter / App)',
          provider: 'Rapido Auto / Local Auto',
          distanceKm,
          durationMins: Math.round(durationMins * 1.08),
          costINR: autoFare.costINR,
          occupancy: 1,
          fareBreakdown: autoFare.breakdown,
          deepLinks: autoFare.deepLinks,
          polyline: drivingMetrics.polyline,
        });

        // C. Bike Taxi (Rapido / Uber Moto)
        const bikeTaxiFare = fareEngine.calculateBikeTaxiFare(distanceKm, durationMins, origin, destination);
        generatedRoutes.push({
          id: 'route-bike-taxi',
          mode: 'motorbike',
          name: 'Rapido Bike Taxi',
          provider: 'Rapido',
          distanceKm,
          durationMins: Math.max(1, Math.round(durationMins * 0.85)),
          costINR: bikeTaxiFare.costINR,
          occupancy: 1,
          fareBreakdown: bikeTaxiFare.breakdown,
          deepLinks: bikeTaxiFare.deepLinks,
        });

        // D. Solo Cab (Uber Go / Ola Mini)
        const cabFare = fareEngine.calculateCabFare(distanceKm, durationMins, origin, destination);
        generatedRoutes.push({
          id: 'route-solo-cab',
          mode: 'taxi',
          name: 'Solo Cab (Uber Go / Ola)',
          provider: 'Uber / Ola',
          distanceKm,
          durationMins,
          costINR: cabFare.costINR,
          occupancy: 1,
          fareBreakdown: cabFare.breakdown,
          deepLinks: cabFare.deepLinks,
          polyline: drivingMetrics.polyline,
        });

        // E. Carpooling (EcoPool)
        const carpoolFare = fareEngine.calculateCarpoolFare(distanceKm, 4);
        generatedRoutes.push({
          id: 'route-ecopool',
          mode: 'carpool',
          name: 'EcoPool (Shared Ride)',
          provider: 'EcoRoute Community',
          distanceKm,
          durationMins: Math.round(durationMins * 1.12),
          costINR: carpoolFare.costINR,
          occupancy: 4,
          fareBreakdown: carpoolFare.breakdown,
        });

        // F. Personal Motorbike
        const ownBikeCost = fareEngine.calculateOwnMotorbikeFare(distanceKm);
        generatedRoutes.push({
          id: 'route-own-bike',
          mode: 'motorbike',
          name: 'Personal Two-Wheeler',
          distanceKm,
          durationMins: Math.round(durationMins * 0.9),
          costINR: ownBikeCost,
          occupancy: 1,
        });

        // G. Cycling (Bicycle)
        if (cyclingMetrics.distanceKm <= 18) {
          generatedRoutes.push({
            id: 'route-bicycle',
            mode: 'bicycle',
            name: 'Bicycle / Smart Bicycle',
            distanceKm: cyclingMetrics.distanceKm,
            durationMins: cyclingMetrics.durationMins,
            costINR: 0,
            occupancy: 1,
          });
        }

        // H. Walking (for distances <= 5km)
        if (walkingMetrics.distanceKm <= 5.0) {
          generatedRoutes.push({
            id: 'route-walking',
            mode: 'walking',
            name: 'Walking (Zero Carbon)',
            distanceKm: walkingMetrics.distanceKm,
            durationMins: walkingMetrics.durationMins,
            costINR: 0,
            occupancy: 1,
          });
        }
      }

      // 3. Score emissions and rank routes
      const rankedRoutes = emissionsEngine.enrichAndRankRoutes(generatedRoutes, sortBy);

      // 4. Enrich with timestamps, carbon badges, and leg breakdown for Route Options screen
      const enrichedRoutes: RouteOption[] = rankedRoutes.map((r, idx) => {
        let carbonBadge: 'Low Carbon' | 'Medium Carbon' | 'High Carbon' = r.carbonBadge || 'Medium Carbon';
        if (!r.carbonBadge) {
          if (r.mode === 'train' || r.mode === 'bicycle' || r.mode === 'walking' || (r.emissionKgCO2 !== undefined && r.emissionKgCO2 < 0.35)) {
            carbonBadge = 'Low Carbon';
          } else if (r.emissionKgCO2 !== undefined && r.emissionKgCO2 > 0.8) {
            carbonBadge = 'High Carbon';
          }
        }

        // Use existing startTime / endTime if provided (like for trains)
        let startTime = r.startTime;
        let endTime = r.endTime;

        if (!startTime || !endTime) {
          const startOffset = [12, 10, 5, 20][idx % 4] || 15;
          const startMins = 8 * 60 + startOffset;
          const sH = Math.floor(startMins / 60);
          const sM = startMins % 60;
          const eTotal = startMins + r.durationMins;
          const eH = Math.floor(eTotal / 60);
          const eM = eTotal % 60;

          const pad = (n: number) => String(n).padStart(2, '0');
          startTime = `${sH % 12 || 12}:${pad(sM)} AM`;
          endTime = `${eH % 12 || 12}:${pad(eM)} ${eH >= 12 && eH < 24 ? 'PM' : 'AM'}`;
        }

        let legs: RouteLeg[] = r.legs || [];
        if (legs.length === 0) {
          if (r.mode === 'train') {
            legs = [
              { mode: 'train', label: r.name, durationMins: r.durationMins },
            ];
          } else if (r.mode === 'local-train' || r.name.toLowerCase().includes('bus')) {
            const busMins = Math.max(8, Math.round(r.durationMins * 0.65));
            legs = [
              { mode: 'bus', label: 'City Bus', durationMins: busMins },
              { mode: 'walk', label: 'Walk', durationMins: Math.max(3, r.durationMins - busMins) },
            ];
          } else if (r.mode === 'carpool') {
            const rideMins = Math.max(10, Math.round(r.durationMins * 0.82));
            legs = [
              { mode: 'carpool', label: 'Shared ride', durationMins: rideMins },
              { mode: 'walk', label: 'Walk', durationMins: Math.max(3, r.durationMins - rideMins) },
            ];
          } else if (r.mode === 'bicycle' || r.mode === 'motorbike') {
            const bikeMins = Math.max(10, Math.round(r.durationMins * 0.8));
            legs = [
              { mode: 'bike', label: r.mode === 'bicycle' ? 'Bike' : 'Rapido Bike', durationMins: bikeMins },
              { mode: 'walk', label: 'Walk', durationMins: Math.max(3, r.durationMins - bikeMins) },
            ];
          } else if (r.mode === 'metro') {
            legs = [
              { mode: 'metro', label: 'Metro', durationMins: Math.round(r.durationMins * 0.45) },
              { mode: 'bus', label: 'Bus', durationMins: Math.round(r.durationMins * 0.38) },
              { mode: 'walk', label: 'Walk', durationMins: Math.max(3, Math.round(r.durationMins * 0.17)) },
            ];
          } else {
            legs = [
              { mode: 'carpool', label: r.name, durationMins: r.durationMins },
            ];
          }
        }

        return {
          ...r,
          carbonBadge,
          startTime,
          endTime,
          legs,
        };
      });

      // 5. Save to Geohash Cache
      geohashCache.set(cacheKey, enrichedRoutes);

      res.json({
        success: true,
        origin,
        destination,
        distanceKm,
        durationMins,
        routes: enrichedRoutes,
        meta: {
          cached: false,
          timestamp: new Date().toISOString(),
        },
      });

    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: 'Failed to compute route comparison',
        message: error?.message || 'Internal server error',
      });
    }
  }
}

export const routesController = new RoutesController();
