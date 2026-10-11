import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('5000').transform(Number),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  OSRM_BASE_URL: z.string().url().default('https://router.project-osrm.org'),
  ENABLE_GEOHASH_CACHE: z.string().default('true').transform((val) => val === 'true'),
  CACHE_TTL_SECONDS: z.string().default('300').transform(Number),
  DEFAULT_CITY: z.string().default('pune'),
  GOOGLE_MAPS_API_KEY: z.string().optional().default(''),
});


export const env = envSchema.parse(process.env);
