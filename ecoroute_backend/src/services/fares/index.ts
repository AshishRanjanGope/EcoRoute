import { Coordinate, DeepLinkInfo, FareBreakdown } from '../../types/index.js';

export interface FareCalculationResult {
  costINR: number;
  breakdown: FareBreakdown;
  deepLinks?: DeepLinkInfo[];
}

export class FareEngine {
  /**
   * Check if current local time is within peak commuting hours
   */
  private isPeakHour(date = new Date()): boolean {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const timeVal = hours + minutes / 60;
    // Morning peak 8:30 - 10:30, Evening peak 17:30 - 20:30
    return (timeVal >= 8.5 && timeVal <= 10.5) || (timeVal >= 17.5 && timeVal <= 20.5);
  }

  /**
   * Check if night tariff applies (23:00 to 05:00)
   */
  private isNightHours(date = new Date()): boolean {
    const hour = date.getHours();
    return hour >= 23 || hour < 5;
  }

  /**
   * Auto-rickshaw (RTO Pune Regulated Tariff)
   */
  calculateAutoFare(distanceKm: number, origin: Coordinate, destination: Coordinate): FareCalculationResult {
    const baseKm = 1.5;
    const baseFare = 25;
    const perKmRate = 17;

    let total = baseFare;
    let distanceFare = 0;

    if (distanceKm > baseKm) {
      distanceFare = Math.round((distanceKm - baseKm) * perKmRate);
      total += distanceFare;
    }

    if (this.isNightHours()) {
      total = Math.round(total * 1.25); // 25% night surcharge
    }

    return {
      costINR: total,
      breakdown: {
        baseFare,
        distanceFare,
        total,
      },
      deepLinks: [
        {
          provider: 'rapido',
          url: `rapido://ride?pickup_lat=${origin.lat}&pickup_lng=${origin.lng}&drop_lat=${destination.lat}&drop_lng=${destination.lng}`,
          label: 'Book Auto on Rapido',
        },
        {
          provider: 'uber',
          url: `https://m.uber.com/ul/?action=setPickup&pickup[latitude]=${origin.lat}&pickup[longitude]=${origin.lng}&dropoff[latitude]=${destination.lat}&dropoff[longitude]=${destination.lng}&product_id=auto`,
          label: 'Book Auto on Uber',
        },
      ],
    };
  }

  /**
   * Bike Taxi (Rapido / Uber Moto)
   */
  calculateBikeTaxiFare(
    distanceKm: number,
    durationMins: number,
    origin: Coordinate,
    destination: Coordinate
  ): FareCalculationResult {
    const baseFare = 20;
    const perKm = 7.5;
    const perMin = 1.0;
    const surge = this.isPeakHour() ? 1.15 : 1.0;

    const distanceFare = Math.round(distanceKm * perKm);
    const timeFare = Math.round(durationMins * perMin);
    const total = Math.round((baseFare + distanceFare + timeFare) * surge);

    return {
      costINR: total,
      breakdown: {
        baseFare,
        distanceFare,
        timeFare,
        total,
      },
      deepLinks: [
        {
          provider: 'rapido',
          url: `rapido://ride?pickup_lat=${origin.lat}&pickup_lng=${origin.lng}&drop_lat=${destination.lat}&drop_lng=${destination.lng}&vehicle=bike`,
          label: 'Book Rapido Bike',
        },
        {
          provider: 'uber',
          url: `https://m.uber.com/ul/?action=setPickup&pickup[latitude]=${origin.lat}&pickup[longitude]=${origin.lng}&dropoff[latitude]=${destination.lat}&dropoff[longitude]=${destination.lng}&product_id=moto`,
          label: 'Book Uber Moto',
        },
      ],
    };
  }

  /**
   * Solo Cab (Uber Go / Ola Mini)
   */
  calculateCabFare(
    distanceKm: number,
    durationMins: number,
    origin: Coordinate,
    destination: Coordinate
  ): FareCalculationResult {
    const baseFare = 55;
    const perKm = 15.5;
    const perMin = 1.5;
    const surge = this.isPeakHour() ? 1.25 : 1.0;

    const distanceFare = Math.round(distanceKm * perKm);
    const timeFare = Math.round(durationMins * perMin);
    const total = Math.round((baseFare + distanceFare + timeFare) * surge);

    return {
      costINR: total,
      breakdown: {
        baseFare,
        distanceFare,
        timeFare,
        total,
      },
      deepLinks: [
        {
          provider: 'uber',
          url: `https://m.uber.com/ul/?action=setPickup&pickup[latitude]=${origin.lat}&pickup[longitude]=${origin.lng}&dropoff[latitude]=${destination.lat}&dropoff[longitude]=${destination.lng}`,
          label: 'Book Uber Go',
        },
        {
          provider: 'ola',
          url: `ola://book?lat=${origin.lat}&lng=${origin.lng}&drop_lat=${destination.lat}&drop_lng=${destination.lng}`,
          label: 'Book Ola Cab',
        },
      ],
    };
  }

  /**
   * Carpooling (EcoPool - Split Fuel Cost among riders)
   */
  calculateCarpoolFare(distanceKm: number, occupancy = 4): FareCalculationResult {
    // Petrol car operating fuel cost ~₹6.8 per km
    const totalFuelCost = distanceKm * 6.8;
    const sharePerPassenger = Math.round(totalFuelCost / Math.max(1, occupancy)) + 10; // +10 platform maintenance

    return {
      costINR: sharePerPassenger,
      breakdown: {
        baseFare: 10,
        distanceFare: sharePerPassenger - 10,
        total: sharePerPassenger,
      },
    };
  }

  /**
   * Metro Fare (Pune Maha Metro Distance Slab)
   */
  calculateMetroFare(distanceKm: number): number {
    if (distanceKm <= 2) return 10;
    if (distanceKm <= 5) return 15;
    if (distanceKm <= 10) return 20;
    if (distanceKm <= 15) return 25;
    if (distanceKm <= 20) return 30;
    return 35;
  }

  /**
   * City Bus Fare (PMPML Stage-Based Slab)
   */
  calculateBusFare(distanceKm: number): number {
    if (distanceKm <= 2) return 5;
    if (distanceKm <= 7) return 10;
    if (distanceKm <= 12) return 15;
    if (distanceKm <= 18) return 20;
    return 25;
  }

  /**
   * Own Motorbike Fuel Estimate
   */
  calculateOwnMotorbikeFare(distanceKm: number): number {
    // 45 km/l mileage @ ₹105/liter = ~₹2.33 / km
    return Math.max(10, Math.round(distanceKm * 2.35));
  }
}

export const fareEngine = new FareEngine();
