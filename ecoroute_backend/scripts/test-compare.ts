import http from 'http';
import { createApp } from '../src/app.js';
import axios from 'axios';

async function runSmokeTests() {
  console.log('--- Starting EcoRoute Backend Smoke Tests ---');

  const app = createApp();
  const server = http.createServer(app);
  const TEST_PORT = 5055;

  await new Promise<void>((resolve) => {
    server.listen(TEST_PORT, () => {
      console.log(`Test server running on port ${TEST_PORT}`);
      resolve();
    });
  });

  const client = axios.create({
    baseURL: `http://localhost:${TEST_PORT}/api/v1`,
  });

  try {
    // 1. Health Check
    console.log('\n[1] Testing GET /health ...');
    const healthRes = await client.get('/health');
    console.log('Status:', healthRes.data.status, '| Active Vehicles:', healthRes.data.features.activeVehiclesTracked);
    if (healthRes.data.status !== 'healthy') throw new Error('Health check failed');

    // 2. Route Comparison (Shivajinagar -> Kalyani Nagar)
    console.log('\n[2] Testing POST /routes/compare (Pune commute: Shivajinagar -> Kalyani Nagar) ...');
    const compareRes = await client.post('/routes/compare', {
      origin: { lat: 18.5314, lng: 73.8446, name: 'Shivajinagar' },
      destination: { lat: 18.5488, lng: 73.9038, name: 'Kalyani Nagar' },
      sortBy: 'efficiency',
    });

    console.log(`Found ${compareRes.data.routes.length} route options:`);
    for (const r of compareRes.data.routes) {
      console.log(
        `  - [${r.mode.toUpperCase()}] ${r.name}: ₹${r.costINR} | ${r.durationMins} mins | ${r.distanceKm} km | CO2: ${r.emissionKgCO2} kg | Score: ${r.efficiencyScore}`
      );
    }

    if (compareRes.data.routes.length === 0) throw new Error('No routes returned');

    // 3. Test Cache Hit
    console.log('\n[3] Testing Geohash Cache Hit (re-running same query) ...');
    const cachedRes = await client.post('/routes/compare', {
      origin: { lat: 18.5314, lng: 73.8446 },
      destination: { lat: 18.5488, lng: 73.9038 },
      sortBy: 'efficiency',
    });
    console.log('Cached flag:', cachedRes.data.meta.cached);
    if (!cachedRes.data.meta.cached) throw new Error('Cache hit expected but missed');

    // 4. Test Transit Stations
    console.log('\n[4] Testing GET /transit/stations ...');
    const stationsRes = await client.get('/transit/stations');
    console.log(`Fetched ${stationsRes.data.count} stations (Metro & Bus)`);

    // 5. Test Transit Schedule for Shivajinagar Metro
    console.log('\n[5] Testing GET /transit/schedule for Shivajinagar Metro (M1-7) ...');
    const scheduleRes = await client.get('/transit/schedule?stationId=M1-7');
    console.log(`Departures found: ${scheduleRes.data.departures.length}`);
    for (const dep of scheduleRes.data.departures) {
      console.log(`  - Line: ${dep.lineName} | Destination: ${dep.destination} | Next: ${dep.scheduledTime} (in ${dep.estimatedWaitMins}m)`);
    }

    // 6. Test Live Vehicle Tracking Snapshot
    console.log('\n[6] Testing GET /transit/live ...');
    const liveRes = await client.get('/transit/live');
    console.log(`Live vehicles tracked: ${liveRes.data.count}`);
    for (const v of liveRes.data.vehicles) {
      console.log(
        `  - [${v.vehicleType.toUpperCase()}] ${v.vehicleId} (${v.routeNumber}): speed ${v.speedKmh} km/h | Next: ${v.nextStationName} (ETA ${v.estimatedArrivalMins}m)`
      );
    }

    // 7. Test Impact Calculation
    console.log('\n[7] Testing POST /impact/calculate ...');
    const impactRes = await client.post('/impact/calculate', {
      distanceKm: 12,
      mode: 'metro',
    });
    console.log(
      `Metro 12km -> Emission: ${impactRes.data.emissionKgCO2} kg | CO2 Prevented: ${impactRes.data.co2PreventedKg} kg | Tree Equivalent: ${impactRes.data.treesEquivalent}`
    );

    console.log('\n==========================================');
    console.log(' ALL 7 SMOKE TESTS PASSED SUCCESSFULLY! ');
    console.log('==========================================');
  } catch (err: any) {
    console.error('Test failed:', err?.response?.data || err.message);
    process.exitCode = 1;
  } finally {
    server.close();
  }
}

runSmokeTests();
