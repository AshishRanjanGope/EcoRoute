import { TravelMode, RouteOption, TransitSegment } from '../../types/index.js';

export const EMISSION_FACTORS: Record<TravelMode, number> = {
  walking: 0,
  bicycle: 0,
  metro: 0.03, // kg CO2 per passenger-km
  'local-train': 0.03,
  carpool: 0.045, // 4 riders in a car
  'auto-rickshaw': 0.07, // CNG
  motorbike: 0.065,
  taxi: 0.12,
  mixed: 0, // dynamic
};

export const BASELINE_FACTOR = 0.17; // Solo private car baseline

export interface EcoImpactResult {
  emissionKgCO2: number;
  co2PreventedKg: number;
  treesEquivalent: number;
  efficiencyScore: number;
}

export class EmissionsEngine {
  /**
   * Calculate direct kg CO2 for a route option
   */
  calculateRouteEmission(mode: TravelMode, distanceKm: number, segments?: TransitSegment[]): number {
    if (segments && segments.length > 0) {
      const sum = segments.reduce((total, seg) => {
        const factor = EMISSION_FACTORS[seg.mode] ?? 0.05;
        return total + seg.distanceKm * factor;
      }, 0);
      return Number(sum.toFixed(3));
    }

    const factor = EMISSION_FACTORS[mode] ?? 0.05;
    return Number((distanceKm * factor).toFixed(3));
  }

  /**
   * Calculate baseline emission (private solo petrol car)
   */
  calculateBaselineEmission(distanceKm: number): number {
    return Number((distanceKm * BASELINE_FACTOR).toFixed(3));
  }

  /**
   * Calculate ecological impact & prevented emissions
   */
  calculateImpact(mode: TravelMode, distanceKm: number, segments?: TransitSegment[]): {
    emissionKgCO2: number;
    co2PreventedKg: number;
    treesEquivalent: number;
  } {
    const emissionKgCO2 = this.calculateRouteEmission(mode, distanceKm, segments);
    const baseline = this.calculateBaselineEmission(distanceKm);
    const co2PreventedKg = Number(Math.max(0, baseline - emissionKgCO2).toFixed(3));
    const treesEquivalent = Number((co2PreventedKg / 21).toFixed(4)); // annual absorption of 1 tree ~ 21kg

    return {
      emissionKgCO2,
      co2PreventedKg,
      treesEquivalent,
    };
  }

  /**
   * Score and rank routes based on multi-criteria efficiency (Cost, Time, Eco-Impact)
   */
  enrichAndRankRoutes(routes: RouteOption[], sortBy: 'efficiency' | 'cost' | 'time' = 'efficiency'): RouteOption[] {
    if (routes.length === 0) return [];

    const maxCost = Math.max(...routes.map((r) => r.costINR), 1);
    const minCost = Math.min(...routes.map((r) => r.costINR));
    const maxTime = Math.max(...routes.map((r) => r.durationMins), 1);
    const minTime = Math.min(...routes.map((r) => r.durationMins));

    const enriched = routes.map((route) => {
      const impact = this.calculateImpact(route.mode, route.distanceKm, route.segments);

      // Normalized sub-scores from 0 to 100
      const costEff = maxCost === minCost ? 100 : Math.round(100 - ((route.costINR - minCost) / (maxCost - minCost)) * 100);
      const timeEff = maxTime === minTime ? 100 : Math.round(100 - ((route.durationMins - minTime) / (maxTime - minTime)) * 100);

      // Baseline comparison for eco-efficiency
      const baseline = this.calculateBaselineEmission(route.distanceKm);
      const ecoEff = baseline > 0 ? Math.round((impact.co2PreventedKg / baseline) * 100) : 100;

      // Weighted multi-objective efficiency score (40% Eco, 30% Cost, 30% Time)
      const efficiencyScore = Math.round(ecoEff * 0.4 + costEff * 0.3 + timeEff * 0.3);

      return {
        ...route,
        emissionKgCO2: impact.emissionKgCO2,
        co2PreventedKg: impact.co2PreventedKg,
        treesEquivalent: impact.treesEquivalent,
        efficiencyScore,
      };
    });

    if (sortBy === 'cost') {
      return [...enriched].sort((a, b) => a.costINR - b.costINR);
    } else if (sortBy === 'time') {
      return [...enriched].sort((a, b) => a.durationMins - b.durationMins);
    }
    return [...enriched].sort((a, b) => (b.efficiencyScore ?? 0) - (a.efficiencyScore ?? 0));
  }
}

export const emissionsEngine = new EmissionsEngine();
