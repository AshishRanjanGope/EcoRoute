# EcoRoute Backend 🌿🚊

Multi-modal transit aggregator and fare comparison backend engine for the **EcoRoute** application.

## 🚀 Features

1. **Multi-Modal Route & Fare Comparison**:
   - Compares **8 travel modes**: Pune Metro, PMPML City Bus, Auto-Rickshaw (RTO regulated tariff), Rapido Bike Taxi, Cabs (Uber Go / Ola Mini), Carpool (EcoPool), Personal Two-Wheeler, and Cycling/Walking.
   - Dynamic fare breakdowns and direct booking deep-links (`uber://`, `rapido://`, `ola://`).
2. **Transit Schedules & Timetables**:
   - Station-to-station schedule lookups for Pune Metro (Purple & Aqua Lines) and PMPML buses.
   - Operating hours, frequencies, and next scheduled departures.
3. **Real-Time Live Location Tracking**:
   - Live GPS tracking for buses and metro trains.
   - Dual streaming interfaces: **Server-Sent Events (SSE)** and **WebSockets** (`/ws/transit/live`).
4. **Carbon Accounting & Eco-Scoring**:
   - Calculates direct emissions, prevented emissions compared to private cars, and tree-equivalent absorption.
   - Weighted efficiency ranking (40% Eco, 30% Cost, 30% Travel Time).
5. **Spatial Geohash Caching**:
   - Caches repeated route queries using Geohashing with a 5-minute TTL for fast sub-5ms responses.

---

## 🛠️ Tech Stack

- **Runtime**: Node.js v24+
- **Language**: TypeScript 5.7
- **Framework**: Express 4.x
- **Routing Engine**: OSRM (Open Source Routing Machine) with resilient geodesic fallback
- **Real-Time Streaming**: WebSockets (`ws`) & Server-Sent Events (SSE)
- **Validation**: Zod
- **Caching**: In-Memory Geohash Spatial Cache

---

## 📦 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Copy `.env.example` to `.env`:
```bash
PORT=5000
NODE_ENV=development
OSRM_BASE_URL=https://router.project-osrm.org
ENABLE_GEOHASH_CACHE=true
CACHE_TTL_SECONDS=300
DEFAULT_CITY=pune
```

### 3. Start Development Server
```bash
npm run dev
```

### 4. Run Smoke Tests
```bash
npm run test:compare
```

---

## 📡 API Endpoints

### 1. Compare Routes
- **Endpoint**: `POST /api/v1/routes/compare`
- **Request Body**:
```json
{
  "origin": { "lat": 18.5314, "lng": 73.8446, "name": "Shivajinagar" },
  "destination": { "lat": 18.5488, "lng": 73.9038, "name": "Kalyani Nagar" },
  "sortBy": "efficiency"
}
```

### 2. Transit Stations & Schedules
- `GET /api/v1/transit/stations` - List all stations (filter with `?type=metro` or `?type=bus`).
- `GET /api/v1/transit/lines` - List transit lines and operating frequencies.
- `GET /api/v1/transit/schedule?stationId=M1-7` - Next upcoming departures and wait times.

### 3. Real-Time Vehicle Tracking
- `GET /api/v1/transit/live` - Current live vehicle locations snapshot.
- `GET /api/v1/transit/live/stream` - SSE continuous live stream.
- `ws://localhost:5000/ws/transit/live` - WebSocket bi-directional live stream.

### 4. Eco-Impact Calculation
- `POST /api/v1/impact/calculate`
```json
{
  "distanceKm": 12,
  "mode": "metro"
}
```

---

## 🔗 Connecting with Expo Frontend

In your Expo app (`ecoroute_frontend`), point your API service base URL to:
- Android Emulator: `http://10.0.2.2:5000/api/v1`
- iOS Simulator / Web: `http://localhost:5000/api/v1`
- Physical Device (Expo Go): `http://<YOUR_LOCAL_IP>:5000/api/v1`
