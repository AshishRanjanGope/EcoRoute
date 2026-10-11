import ngeohash from 'ngeohash';
import { Coordinate } from '../../types/index.js';
import { env } from '../../config/env.js';

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

export class GeohashCacheService {
  private cache = new Map<string, CacheEntry<unknown>>();
  private enabled: boolean;
  private defaultTtlMs: number;

  constructor() {
    this.enabled = env.ENABLE_GEOHASH_CACHE;
    this.defaultTtlMs = env.CACHE_TTL_SECONDS * 1000;

    // Background garbage collection every 60 seconds
    setInterval(() => {
      this.evictExpired();
    }, 60000).unref();
  }

  /**
   * Generates a spatial cache key by encoding coordinates into Geohashes (precision 6 ≈ 1.2km)
   */
  generateRouteKey(origin: Coordinate, destination: Coordinate, sortBy = 'efficiency'): string {
    const originHash = ngeohash.encode(origin.lat, origin.lng, 6);
    const destHash = ngeohash.encode(destination.lat, destination.lng, 6);
    return `route:${originHash}:${destHash}:${sortBy}`;
  }

  get<T>(key: string): T | null {
    if (!this.enabled) return null;

    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.value as T;
  }

  set<T>(key: string, value: T, ttlSeconds?: number): void {
    if (!this.enabled) return;

    const ttlMs = ttlSeconds ? ttlSeconds * 1000 : this.defaultTtlMs;
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + ttlMs,
    });
  }

  evictExpired(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  getStats(): { size: number; enabled: boolean } {
    return {
      size: this.cache.size,
      enabled: this.enabled,
    };
  }
}

export const geohashCache = new GeohashCacheService();
