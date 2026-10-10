import { RouteOption } from '../data/mock-routes';
import { calculateImpact } from './emissions';

export type EfficiencyStatus = 'green' | 'amber' | 'red';

export interface RouteWithMetrics extends RouteOption {
  emission: number;
  co2Prevented: number;
  treesEquivalent: number;
  efficiencyScore: number;
  status: EfficiencyStatus;
}

export function evaluateRoutes(routes: RouteOption[]): RouteWithMetrics[] {
  if (routes.length === 0) return [];
  
  // Find max values for normalization to keep scores 0-100
  const maxCost = Math.max(...routes.map(r => r.costINR));
  const maxTime = Math.max(...routes.map(r => r.durationMins));
  
  // calculate emissions and max emission for normalization
  const impacts = routes.map(r => ({ ...r, ...calculateImpact(r) }));
  const maxEmission = Math.max(...impacts.map(i => i.emission));
  
  return impacts.map(route => {
    // Lower is better. Normalize to 0-1 scale.
    // E.g., if route.emission == 0, score component is 1 (100% efficient)
    const energyScore = maxEmission > 0 ? (1 - (route.emission / maxEmission)) : 1;
    const costScore = maxCost > 0 ? (1 - (route.costINR / maxCost)) : 1;
    const timeScore = maxTime > 0 ? (1 - (route.durationMins / maxTime)) : 1;
    
    // Weights: Energy 60%, Cost 20%, Time 20%
    const efficiencyScore = Math.round((energyScore * 0.6 + costScore * 0.2 + timeScore * 0.2) * 100);
    
    let status: EfficiencyStatus = 'green';
    if (efficiencyScore < 50) status = 'red';
    else if (efficiencyScore < 75) status = 'amber';
    
    return {
      ...route,
      efficiencyScore,
      status
    };
  }).sort((a, b) => b.efficiencyScore - a.efficiencyScore);
}
