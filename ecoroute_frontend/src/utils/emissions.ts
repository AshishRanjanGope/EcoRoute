import { TravelMode, RouteOption } from '../data/mock-routes';

// Indicative emission factors (kg CO2 per passenger-km) from PRD
export const EMISSION_FACTORS: Record<TravelMode, number> = {
  'walking': 0,
  'bicycle': 0,
  'metro': 0.03, // Already per pkm
  'local-train': 0.03, // Already per pkm
  'carpool': 0.045, // Assuming 4 riders in a petrol car (0.17/4 roughly)
  'auto-rickshaw': 0.07, // CNG
  'motorbike': 0.065, // Avg between 0.05-0.08
  'taxi': 0.12, // Avg between 0.10-0.15
  'mixed': 0, // Calculated dynamically
};

export const BASELINE_FACTOR = 0.17; // Solo private car baseline

export function calculateEmission(route: RouteOption): number {
  if (route.isCombined && route.segments) {
    return route.segments.reduce((total, seg) => {
      return total + (seg.distanceKm * EMISSION_FACTORS[seg.mode]);
    }, 0);
  }
  return route.distanceKm * EMISSION_FACTORS[route.mode];
}

export function calculateBaselineEmission(distanceKm: number): number {
  return distanceKm * BASELINE_FACTOR;
}

export function calculateImpact(route: RouteOption) {
  const emission = calculateEmission(route);
  const baseline = calculateBaselineEmission(route.distanceKm);
  const co2Prevented = Math.max(0, baseline - emission);
  const treesEquivalent = co2Prevented / 21; // ≈ annual CO2 absorption of one tree
  
  return {
    emission,
    co2Prevented,
    treesEquivalent,
  };
}
