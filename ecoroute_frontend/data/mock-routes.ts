export type TravelMode = 'walking' | 'bicycle' | 'motorbike' | 'auto-rickshaw' | 'local-train' | 'metro' | 'taxi' | 'carpool' | 'mixed';

export interface RouteOption {
  id: string;
  mode: TravelMode;
  name: string;
  distanceKm: number;
  durationMins: number;
  costINR: number;
  occupancy: number; // For shared modes
  isCombined?: boolean;
  segments?: Array<{ mode: TravelMode; distanceKm: number; durationMins: number }>;
}

export const mockRoutes: RouteOption[] = [
  {
    id: '1',
    mode: 'metro',
    name: 'Metro (Direct)',
    distanceKm: 12,
    durationMins: 25,
    costINR: 40,
    occupancy: 1, // Emission factor already accounts for typical load
  },
  {
    id: '2',
    mode: 'mixed',
    name: 'Walk + Metro + Auto',
    distanceKm: 14,
    durationMins: 35,
    costINR: 65,
    occupancy: 1,
    isCombined: true,
    segments: [
      { mode: 'walking', distanceKm: 0.5, durationMins: 6 },
      { mode: 'metro', distanceKm: 11.5, durationMins: 20 },
      { mode: 'auto-rickshaw', distanceKm: 2, durationMins: 9 },
    ]
  },
  {
    id: '3',
    mode: 'carpool',
    name: 'EcoPool with Rohit',
    distanceKm: 13,
    durationMins: 40,
    costINR: 80,
    occupancy: 4, 
  },
  {
    id: '4',
    mode: 'auto-rickshaw',
    name: 'Direct Auto',
    distanceKm: 13,
    durationMins: 45,
    costINR: 150,
    occupancy: 1,
  },
  {
    id: '5',
    mode: 'taxi',
    name: 'Solo Cab',
    distanceKm: 13,
    durationMins: 40,
    costINR: 280,
    occupancy: 1, // Solo passenger
  },
  {
    id: '6',
    mode: 'motorbike',
    name: 'Own Bike',
    distanceKm: 13,
    durationMins: 38,
    costINR: 35,
    occupancy: 1,
  }
];
