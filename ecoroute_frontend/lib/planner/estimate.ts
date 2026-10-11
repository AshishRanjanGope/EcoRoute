import { mockRoutes, type TravelMode } from '../../data/mock-routes';
import { evaluateRoutes } from '../../utils/efficiency';
import { calculateBaselineEmission } from '../../utils/emissions';
import type { Trip } from './types';
import { monthLegs } from './schedule';

/**
 * FRONTEND-ONLY SIMULATION.
 * Until the backend exists we price every leg using the same mock routes the Home screen uses.
 * The mode mix is the top-3 most efficient routes split 60/25/15 (the split the old static card showed).
 * Replace `simulatePlan` with an API call later; the returned shape is what the UI depends on.
 */
export interface PlanResult {
  legs: number;
  cost: number;
  baselineCost: number;
  co2Prevented: number;
  trees: number;
  timeSaved: number;
  mix: { mode: TravelMode; label: string; pct: number }[];
}

const MIX_WEIGHTS = [60, 25, 15];
const MODE_LABEL: Partial<Record<TravelMode, string>> = {
  metro: 'Metro', carpool: 'Pool', walking: 'Walk', bicycle: 'Cycle', mixed: 'Multi-modal',
  'auto-rickshaw': 'Auto', 'local-train': 'Train', motorbike: 'Bike', taxi: 'Taxi',
};

export function simulatePlan(trips: Trip[], y: number, m: number): PlanResult {
  const legs = monthLegs(trips, y, m);
  const ranked = evaluateRoutes(mockRoutes).slice(0, MIX_WEIGHTS.length);
  const weightSum = MIX_WEIGHTS.slice(0, ranked.length).reduce((a, b) => a + b, 0);

  // If legs is 0, return zeroed stats
  if (legs === 0) {
    return {
      legs: 0,
      cost: 0,
      baselineCost: 0,
      co2Prevented: 0,
      trees: 0,
      timeSaved: 0,
      mix: ranked.map((r, i) => ({
        mode: r.mode,
        label: MODE_LABEL[r.mode] ?? r.name,
        pct: Math.round((MIX_WEIGHTS[i] / weightSum) * 100),
      })),
    };
  }

  // Baseline calibration: 40 legs (20 days) = ₹2,480 cost, 48 kg CO2, 24 hrs saved, 6 trees
  const cost = Math.round(legs * 62);
  const baselineCost = Math.round(legs * 145);
  const co2Prevented = Math.round(legs * 1.2 * 10) / 10;
  const timeSaved = Math.round(legs * 0.6);
  const trees = Math.max(1, Math.round(co2Prevented / 8));

  return {
    legs,
    cost,
    baselineCost,
    co2Prevented,
    trees,
    timeSaved,
    mix: ranked.map((r, i) => ({
      mode: r.mode,
      label: MODE_LABEL[r.mode] ?? r.name,
      pct: Math.round((MIX_WEIGHTS[i] / weightSum) * 100),
    })),
  };
}


// re-exported so callers don't need a second import for the baseline helper
export { calculateBaselineEmission };
