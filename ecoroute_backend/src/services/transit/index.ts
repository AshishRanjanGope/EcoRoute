import { Coordinate, TransitStation, TransitLine, TransitDeparture, TransitSegment, RouteOption } from '../../types/index.js';
import { calculateHaversineDistanceKm } from '../routing/index.js';
import { fareEngine } from '../fares/index.js';

export class TransitService {
  private stations: TransitStation[] = [
    // Pune Metro Line 1 (Purple Line)
    { id: 'M1-1', name: 'PCMC', type: 'metro', coordinate: { lat: 18.6298, lng: 73.8131 }, lineIds: ['L1'] },
    { id: 'M1-2', name: 'Bhosari', type: 'metro', coordinate: { lat: 18.6186, lng: 73.8214 }, lineIds: ['L1'] },
    { id: 'M1-3', name: 'Kasarwadi', type: 'metro', coordinate: { lat: 18.6015, lng: 73.8282 }, lineIds: ['L1'] },
    { id: 'M1-4', name: 'Dapodi', type: 'metro', coordinate: { lat: 18.5828, lng: 73.8341 }, lineIds: ['L1'] },
    { id: 'M1-5', name: 'Khadki', type: 'metro', coordinate: { lat: 18.5647, lng: 73.8386 }, lineIds: ['L1'] },
    { id: 'M1-6', name: 'Range Hill', type: 'metro', coordinate: { lat: 18.5484, lng: 73.8442 }, lineIds: ['L1'] },
    { id: 'M1-7', name: 'Shivajinagar Metro', type: 'metro', coordinate: { lat: 18.5314, lng: 73.8446 }, lineIds: ['L1'] },
    { id: 'M1-8', name: 'Civil Court (Interchange)', type: 'metro', coordinate: { lat: 18.5265, lng: 73.8567 }, lineIds: ['L1', 'L2'] },
    { id: 'M1-9', name: 'Kasba Peth', type: 'metro', coordinate: { lat: 18.5173, lng: 73.8584 }, lineIds: ['L1'] },
    { id: 'M1-10', name: 'Mandai', type: 'metro', coordinate: { lat: 18.5112, lng: 73.8569 }, lineIds: ['L1'] },
    { id: 'M1-11', name: 'Swargate', type: 'metro', coordinate: { lat: 18.5018, lng: 73.8587 }, lineIds: ['L1'] },

    // Pune Metro Line 2 (Aqua Line)
    { id: 'M2-1', name: 'Vanaz', type: 'metro', coordinate: { lat: 18.5074, lng: 73.8058 }, lineIds: ['L2'] },
    { id: 'M2-2', name: 'Anand Nagar', type: 'metro', coordinate: { lat: 18.5085, lng: 73.8164 }, lineIds: ['L2'] },
    { id: 'M2-3', name: 'Ideal Colony', type: 'metro', coordinate: { lat: 18.5101, lng: 73.8242 }, lineIds: ['L2'] },
    { id: 'M2-4', name: 'Nal Stop', type: 'metro', coordinate: { lat: 18.5119, lng: 73.8327 }, lineIds: ['L2'] },
    { id: 'M2-5', name: 'Garware College', type: 'metro', coordinate: { lat: 18.5152, lng: 73.8398 }, lineIds: ['L2'] },
    { id: 'M2-6', name: 'Deccan Gymkhana', type: 'metro', coordinate: { lat: 18.5186, lng: 73.8445 }, lineIds: ['L2'] },
    { id: 'M2-7', name: 'PMC', type: 'metro', coordinate: { lat: 18.5228, lng: 73.8519 }, lineIds: ['L2'] },
    { id: 'M2-8', name: 'Mangalwar Peth', type: 'metro', coordinate: { lat: 18.5251, lng: 73.8648 }, lineIds: ['L2'] },
    { id: 'M2-9', name: 'Pune Railway Station', type: 'metro', coordinate: { lat: 18.5284, lng: 73.8743 }, lineIds: ['L2'] },
    { id: 'M2-10', name: 'Ruby Hall Clinic', type: 'metro', coordinate: { lat: 18.5332, lng: 73.8821 }, lineIds: ['L2'] },
    { id: 'M2-11', name: 'Bund Garden', type: 'metro', coordinate: { lat: 18.5398, lng: 73.8897 }, lineIds: ['L2'] },
    { id: 'M2-12', name: 'Yerawada', type: 'metro', coordinate: { lat: 18.5512, lng: 73.8962 }, lineIds: ['L2'] },
    { id: 'M2-13', name: 'Kalyani Nagar Metro', type: 'metro', coordinate: { lat: 18.5488, lng: 73.9038 }, lineIds: ['L2'] },
    { id: 'M2-14', name: 'Ramwadi', type: 'metro', coordinate: { lat: 18.5529, lng: 73.9145 }, lineIds: ['L2'] },

    // PMPML Bus Stops
    { id: 'B-1', name: 'Shivajinagar Bus Stand', type: 'bus', coordinate: { lat: 18.5322, lng: 73.8455 }, lineIds: ['B-148', 'B-165'] },
    { id: 'B-2', name: 'Swargate Bus Terminal', type: 'bus', coordinate: { lat: 18.5025, lng: 73.8592 }, lineIds: ['B-148', 'B-204'] },
    { id: 'B-3', name: 'Pune Station Bus Stand', type: 'bus', coordinate: { lat: 18.5290, lng: 73.8752 }, lineIds: ['B-102'] },
    { id: 'B-4', name: 'Kalyani Nagar Bus Stop', type: 'bus', coordinate: { lat: 18.5472, lng: 73.9025 }, lineIds: ['B-148'] },
    { id: 'B-5', name: 'Hinjawadi Phase 3 Bus Terminal', type: 'bus', coordinate: { lat: 18.5912, lng: 73.6984 }, lineIds: ['B-102'] },
    { id: 'B-6', name: 'Hadapsar Gadital', type: 'bus', coordinate: { lat: 18.4982, lng: 73.9312 }, lineIds: ['B-165'] },
  ];

  private lines: TransitLine[] = [
    {
      id: 'L1',
      name: 'Purple Line (PCMC - Swargate)',
      type: 'metro',
      stations: ['M1-1', 'M1-2', 'M1-3', 'M1-4', 'M1-5', 'M1-6', 'M1-7', 'M1-8', 'M1-9', 'M1-10', 'M1-11'],
      frequencyMins: 8,
      operatingHours: { start: '06:00', end: '22:30' },
    },
    {
      id: 'L2',
      name: 'Aqua Line (Vanaz - Ramwadi)',
      type: 'metro',
      stations: ['M2-1', 'M2-2', 'M2-3', 'M2-4', 'M2-5', 'M2-6', 'M2-7', 'M1-8', 'M2-8', 'M2-9', 'M2-10', 'M2-11', 'M2-12', 'M2-13', 'M2-14'],
      frequencyMins: 7,
      operatingHours: { start: '06:00', end: '22:45' },
    },
    {
      id: 'B-148',
      name: 'PMPML Route 148',
      routeNumber: '148',
      type: 'bus',
      stations: ['B-2', 'B-1', 'B-4'],
      frequencyMins: 15,
      operatingHours: { start: '05:30', end: '23:00' },
    },
    {
      id: 'B-102',
      name: 'PMPML Route 102',
      routeNumber: '102',
      type: 'bus',
      stations: ['B-3', 'B-1', 'B-5'],
      frequencyMins: 12,
      operatingHours: { start: '05:45', end: '23:15' },
    },
  ];

  /**
   * Find stations nearest to a given coordinate within search radius
   */
  findNearestStations(coord: Coordinate, type?: 'metro' | 'bus', maxKm = 6.0): { station: TransitStation; distanceKm: number }[] {
    const list = type ? this.stations.filter((s) => s.type === type) : this.stations;
    return list
      .map((station) => ({
        station,
        distanceKm: Number(calculateHaversineDistanceKm(coord, station.coordinate).toFixed(2)),
      }))
      .filter((item) => item.distanceKm <= maxKm)
      .sort((a, b) => a.distanceKm - b.distanceKm);
  }

  /**
   * Get all stations
   */
  getAllStations(): TransitStation[] {
    return this.stations;
  }

  /**
   * Get all lines
   */
  getAllLines(): TransitLine[] {
    return this.lines;
  }

  /**
   * Get upcoming schedule departures for a specific station
   */
  getStationDepartures(stationId: string): TransitDeparture[] {
    const station = this.stations.find((s) => s.id === stationId);
    if (!station) return [];

    const now = new Date();
    const currentMins = now.getMinutes();

    return station.lineIds.map((lineId) => {
      const line = this.lines.find((l) => l.id === lineId);
      const isMetro = station.type === 'metro';
      const freq = line ? line.frequencyMins : isMetro ? 8 : 15;
      const waitMins = freq - (currentMins % freq);

      const depDate = new Date(now.getTime() + waitMins * 60000);
      const timeStr = depDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

      return {
        lineId: line?.id || lineId,
        lineName: line?.name || 'Local Transit',
        destination: isMetro ? (lineId === 'L1' ? 'Swargate / PCMC' : 'Ramwadi / Vanaz') : 'City Center',
        scheduledTime: timeStr,
        estimatedWaitMins: waitMins,
        fareINR: isMetro ? 20 : 15,
        vehicleType: station.type,
      };
    });
  }

  /**
   * Build Multi-modal Transit Route Options (Metro & Mixed Transit)
   */
  generateTransitRoutes(origin: Coordinate, destination: Coordinate, roadDistanceKm: number): RouteOption[] {
    const options: RouteOption[] = [];

    const nearestOriginMetro = this.findNearestStations(origin, 'metro', 10.0)[0];
    const nearestDestMetro = this.findNearestStations(destination, 'metro', 10.0)[0];

    const nearestOriginBus = this.findNearestStations(origin, 'bus', 8.0)[0];
    const nearestDestBus = this.findNearestStations(destination, 'bus', 8.0)[0];

    // 1. Direct or Connected Metro Option
    if (nearestOriginMetro && nearestDestMetro) {
      const metroTrackDist = Number(
        (calculateHaversineDistanceKm(nearestOriginMetro.station.coordinate, nearestDestMetro.station.coordinate) * 1.15).toFixed(1)
      );
      const metroDuration = Math.max(10, Math.round(metroTrackDist * 2.2)); // avg metro speed ~27-30 km/h with halts
      const metroCost = fareEngine.calculateMetroFare(metroTrackDist);

      const firstMileWalkDist = nearestOriginMetro.distanceKm;
      const firstMileWalkMins = Math.round((firstMileWalkDist / 4.8) * 60);

      const lastMileWalkDist = nearestDestMetro.distanceKm;
      const lastMileWalkMins = Math.round((lastMileWalkDist / 4.8) * 60);

      const totalDist = Number((firstMileWalkDist + metroTrackDist + lastMileWalkDist).toFixed(1));
      const totalMins = firstMileWalkMins + metroDuration + lastMileWalkMins + 5; // +5 min boarding buffer

      options.push({
        id: 'route-metro-direct',
        mode: 'metro',
        name: `Pune Metro (${nearestOriginMetro.station.name} → ${nearestDestMetro.station.name})`,
        provider: 'Maha Metro',
        distanceKm: totalDist,
        durationMins: totalMins,
        costINR: metroCost,
        occupancy: 1,
        isCombined: false,
        segments: [
          {
            mode: 'walking',
            name: `Walk to ${nearestOriginMetro.station.name}`,
            distanceKm: firstMileWalkDist,
            durationMins: firstMileWalkMins,
          },
          {
            mode: 'metro',
            name: `Metro (${nearestOriginMetro.station.name} to ${nearestDestMetro.station.name})`,
            fromStation: nearestOriginMetro.station.name,
            toStation: nearestDestMetro.station.name,
            distanceKm: metroTrackDist,
            durationMins: metroDuration,
            costINR: metroCost,
          },
          {
            mode: 'walking',
            name: `Walk to destination`,
            distanceKm: lastMileWalkDist,
            durationMins: lastMileWalkMins,
          },
        ],
      });

      // 2. Mixed Multi-Modal (Walk + Metro + Auto / Last-mile)
      if (lastMileWalkDist > 1.2) {
        const autoLastMileCost = Math.round(25 + Math.max(0, lastMileWalkDist - 1.5) * 17);
        const autoLastMileMins = Math.max(5, Math.round((lastMileWalkDist / 20) * 60));

        options.push({
          id: 'route-mixed-multimodal',
          mode: 'mixed',
          name: `Walk + Metro + Auto`,
          provider: 'Maha Metro & Auto',
          distanceKm: Number((firstMileWalkDist + metroTrackDist + lastMileWalkDist).toFixed(1)),
          durationMins: firstMileWalkMins + metroDuration + autoLastMileMins + 4,
          costINR: metroCost + autoLastMileCost,
          occupancy: 1,
          isCombined: true,
          segments: [
            {
              mode: 'walking',
              name: `Walk to ${nearestOriginMetro.station.name}`,
              distanceKm: firstMileWalkDist,
              durationMins: firstMileWalkMins,
            },
            {
              mode: 'metro',
              name: `Metro to ${nearestDestMetro.station.name}`,
              fromStation: nearestOriginMetro.station.name,
              toStation: nearestDestMetro.station.name,
              distanceKm: metroTrackDist,
              durationMins: metroDuration,
              costINR: metroCost,
            },
            {
              mode: 'auto-rickshaw',
              name: `Last-mile Auto to destination`,
              distanceKm: lastMileWalkDist,
              durationMins: autoLastMileMins,
              costINR: autoLastMileCost,
            },
          ],
        });
      }
    }

    // 3. City Bus Option (PMPML)
    const busDist = Number((roadDistanceKm * 0.98).toFixed(1));
    const busDuration = Math.round((busDist / 16) * 60) + 10; // avg city bus speed ~16 km/h + stops
    const busCost = fareEngine.calculateBusFare(busDist);

    options.push({
      id: 'route-pmpml-bus',
      mode: 'local-train', // or bus transit
      name: `PMPML City Bus (${nearestOriginBus ? nearestOriginBus.station.name : 'Origin'} Stop)`,
      provider: 'PMPML',
      distanceKm: busDist,
      durationMins: busDuration,
      costINR: busCost,
      occupancy: 1,
      isCombined: false,
    });

    return options;
  }
}

export const transitService = new TransitService();
