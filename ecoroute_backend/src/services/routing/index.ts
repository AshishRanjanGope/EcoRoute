import axios from 'axios';
import { Coordinate } from '../../types/index.js';
import { env } from '../../config/env.js';

export interface RouteMatrixResult {
  distanceKm: number;
  durationMins: number;
  polyline?: string;
  source: 'osrm' | 'geodesic_fallback';
}

/**
 * Calculate Great-Circle distance using Haversine formula
 */
export function calculateHaversineDistanceKm(c1: Coordinate, c2: Coordinate): number {
  const R = 6371; // Earth radius in kilometers
  const dLat = ((c2.lat - c1.lat) * Math.PI) / 180;
  const dLng = ((c2.lng - c1.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((c1.lat * Math.PI) / 180) *
      Math.cos((c2.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export class RoutingService {
  private osrmBaseUrl: string;

  constructor() {
    this.osrmBaseUrl = env.OSRM_BASE_URL;
  }

  /**
   * Fetch driving route metrics between two coordinates
   */
  async getDrivingMetrics(origin: Coordinate, destination: Coordinate): Promise<RouteMatrixResult> {
    try {
      // OSRM coordinates format: {lng},{lat};{lng},{lat}
      const url = `${this.osrmBaseUrl}/route/v1/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=simplified&geometries=polyline`;
      const response = await axios.get(url, { timeout: 3500 });

      if (response.data && response.data.routes && response.data.routes.length > 0) {
        const route = response.data.routes[0];
        const distanceKm = Number((route.distance / 1000).toFixed(2));
        const durationMins = Math.max(1, Math.round(route.duration / 60));
        return {
          distanceKm,
          durationMins,
          polyline: route.geometry,
          source: 'osrm',
        };
      }
    } catch (error) {
      // Graceful fallback to geodesic calculation with urban circuity factor
    }

    return this.getFallbackDrivingMetrics(origin, destination);
  }

  /**
   * Calculate walking metrics (~4.8 km/h speed)
   */
  getWalkingMetrics(origin: Coordinate, destination: Coordinate): RouteMatrixResult {
    const rawKm = calculateHaversineDistanceKm(origin, destination);
    // Urban pedestrian circuity factor ~1.22
    const distanceKm = Number((rawKm * 1.22).toFixed(2));
    const walkingSpeedKmh = 4.8;
    const durationMins = Math.max(1, Math.round((distanceKm / walkingSpeedKmh) * 60));
    return {
      distanceKm,
      durationMins,
      source: 'geodesic_fallback',
    };
  }

  /**
   * Calculate cycling metrics (~14.5 km/h speed)
   */
  getCyclingMetrics(origin: Coordinate, destination: Coordinate): RouteMatrixResult {
    const rawKm = calculateHaversineDistanceKm(origin, destination);
    const distanceKm = Number((rawKm * 1.25).toFixed(2));
    const cyclingSpeedKmh = 14.5;
    const durationMins = Math.max(1, Math.round((distanceKm / cyclingSpeedKmh) * 60));
    return {
      distanceKm,
      durationMins,
      source: 'geodesic_fallback',
    };
  }

  /**
   * Fallback for driving if OSRM service is unreachable
   * Uses urban road circuity factor (~1.28) and average urban speed (22 km/h)
   */
  private getFallbackDrivingMetrics(origin: Coordinate, destination: Coordinate): RouteMatrixResult {
    const haversineKm = calculateHaversineDistanceKm(origin, destination);
    const distanceKm = Number((haversineKm * 1.28).toFixed(2));
    // Average urban driving speed 22 km/h
    const averageSpeedKmh = 22;
    const durationMins = Math.max(2, Math.round((distanceKm / averageSpeedKmh) * 60));

    return {
      distanceKm,
      durationMins,
      source: 'geodesic_fallback',
    };
  }
}

export const routingService = new RoutingService();
