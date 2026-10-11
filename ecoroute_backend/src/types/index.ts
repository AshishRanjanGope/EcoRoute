export type TravelMode =
  | 'walking'
  | 'bicycle'
  | 'motorbike'
  | 'auto-rickshaw'
  | 'local-train'
  | 'metro'
  | 'taxi'
  | 'carpool'
  | 'mixed';

export interface Coordinate {
  lat: number;
  lng: number;
  name?: string;
}

export interface TransitSegment {
  mode: TravelMode;
  name?: string;
  distanceKm: number;
  durationMins: number;
  costINR?: number;
  fromStation?: string;
  toStation?: string;
  lineName?: string;
  polyline?: string;
}

export interface DeepLinkInfo {
  provider: 'uber' | 'rapido' | 'ola' | 'chalo' | 'google_maps';
  url: string;
  label: string;
}

export interface FareBreakdown {
  baseFare: number;
  distanceFare: number;
  timeFare?: number;
  platformFee?: number;
  discountOrSplit?: number;
  total: number;
}

export interface RouteLeg {
  mode: 'bus' | 'walk' | 'carpool' | 'bike' | 'metro';
  label: string;
  durationMins: number;
}

export interface RouteOption {
  id: string;
  mode: TravelMode;
  name: string;
  provider?: string;
  distanceKm: number;
  durationMins: number;
  costINR: number;
  occupancy: number; // For carpool / shared modes
  isCombined?: boolean;
  segments?: TransitSegment[];
  emissionKgCO2?: number;
  co2PreventedKg?: number;
  treesEquivalent?: number;
  efficiencyScore?: number;
  deepLinks?: DeepLinkInfo[];
  fareBreakdown?: FareBreakdown;
  polyline?: string;
  carbonBadge?: 'Low Carbon' | 'Medium Carbon' | 'High Carbon';
  startTime?: string;
  endTime?: string;
  legs?: RouteLeg[];
}


export interface TransitStation {
  id: string;
  name: string;
  type: 'metro' | 'bus';
  coordinate: Coordinate;
  lineIds: string[];
}

export interface TransitLine {
  id: string;
  name: string;
  type: 'metro' | 'bus';
  routeNumber?: string;
  stations: string[]; // station IDs in order
  frequencyMins: number;
  operatingHours: {
    start: string; // "06:00"
    end: string;   // "23:00"
  };
}

export interface TransitDeparture {
  lineId: string;
  lineName: string;
  destination: string;
  scheduledTime: string;
  estimatedWaitMins: number;
  fareINR: number;
  vehicleType: 'metro' | 'bus';
}

export interface LiveVehiclePosition {
  vehicleId: string;
  lineId: string;
  routeNumber: string;
  vehicleType: 'metro' | 'bus';
  currentCoordinate: Coordinate;
  speedKmh: number;
  bearing: number;
  nextStationId: string;
  nextStationName: string;
  estimatedArrivalMins: number;
  crowdingLevel: 'low' | 'medium' | 'high';
  updatedAt: string;
}

export interface CompareRoutesRequest {
  origin: Coordinate;
  destination: Coordinate;
  sortBy?: 'efficiency' | 'cost' | 'time';
  modes?: TravelMode[];
}

export interface CompareRoutesResponse {
  success: boolean;
  origin: Coordinate;
  destination: Coordinate;
  distanceKm: number;
  durationMins: number;
  routes: RouteOption[];
  meta: {
    cached: boolean;
    timestamp: string;
    city: string;
  };
}
