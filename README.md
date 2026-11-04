# 🌿 EcoRoute

**Multi-modal trip planning that ranks routes by carbon, cost, and time, not just speed.**

EcoRoute is a mobile-first app for commuters in Pune, India. It compares public transit, ride-hailing, carpooling, and personal vehicles for the same trip. It shows the CO₂ each option emits and how much it saves versus driving alone.

The repo is a monorepo with two apps:

| Folder | What it is | Stack |
|---|---|---|
| [`ecoroute_frontend/`](./ecoroute_frontend) | Cross-platform mobile/web app (iOS, Android, web) | Expo, React Native, Expo Router, NativeWind |
| [`ecoroute_backend/`](./ecoroute_backend) | REST + real-time API for route comparison, transit data, and carbon accounting | Node.js, Express, TypeScript |

---

## ✨ Features

- **Route comparison across 8 modes:** Pune Metro, PMPML bus, auto-rickshaw, Rapido bike taxi, cab (Uber/Ola), carpool, personal two-wheeler, and cycling/walking.
- **Eco-efficiency ranking:** weighted score of 40% emissions, 30% cost, 30% travel time.
- **Carbon accounting:** direct emissions, CO₂ prevented vs. a solo car baseline, and tree-equivalent offset.
- **Trip planner:** monthly calendar, recurring trips, and projected impact of a plan.
- **Carpool tab:** colleague carpooling with a Karma points system.
- **Impact dashboard:** weekly CO₂ savings and eco stats.
- **Transit data:** station, line, and schedule lookups for Pune Metro (Purple & Aqua lines) and PMPML buses.
- **Live vehicle tracking:** Server-Sent Events and WebSocket streams.
- **Indian Railways endpoints:** train search, schedules, trains between stations, and live status.
- **Place search and geocoding** with a fallback chain (Photon → Nominatim, plus Google Geocoding when a key is set).
- **Geohash route cache** (5-minute TTL) for repeated queries.

---

## 🏗️ Architecture

```
┌──────────────────────────┐         HTTP / SSE / WebSocket        ┌─────────────────────────────┐
│   ecoroute_frontend      │ ────────────────────────────────────▶ │   ecoroute_backend          │
│   Expo + React Native    │                                       │   Express + TypeScript      │
│   (iOS / Android / Web)  │ ◀──────────────────────────────────── │                             │
└──────────────────────────┘                                       │  routing  ─ OSRM            │
                                                                   │  emissions ─ factor engine  │
                                                                   │  fares / transit / trains   │
                                                                   │  cache ─ geohash (in-mem)   │
                                                                   │  streaming ─ SSE + WS       │
                                                                   └─────────────────────────────┘
```

### Emission factors (kg CO₂ per passenger-km)

| Mode | Factor |
|---|---|
| Walking / cycling | 0 |
| Train (electric) | 0.026 |
| Metro / local train | 0.03 |
| Bus | 0.038 |
| Carpool (4 riders) | 0.045 |
| Motorbike | 0.065 |
| Auto-rickshaw (CNG) | 0.07 |
| Taxi | 0.12 |
| **Baseline: solo private car** | **0.17** |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20+ (the backend README targets v24+)
- npm
- Expo Go app or an Android/iOS emulator (for mobile)
- *Optional:* a Google Maps API key

### 1. Clone

```bash
git clone https://github.com/AshishRanjanGope/EcoRoute.git
cd EcoRoute
```

### 2. Start the backend

```bash
cd ecoroute_backend
npm install
cp .env.example .env
npm run dev
```

The server runs on `http://localhost:5000`. Check it with:

```bash
curl http://localhost:5000/api/v1/health
```

**Environment variables** (`ecoroute_backend/.env`):

| Variable | Default | Description |
|---|---|---|
| `PORT` | `5000` | Server port |
| `NODE_ENV` | `development` | `development`, `production`, or `test` |
| `OSRM_BASE_URL` | `https://router.project-osrm.org` | Routing engine |
| `ENABLE_GEOHASH_CACHE` | `true` | Toggle route caching |
| `CACHE_TTL_SECONDS` | `300` | Cache lifetime |
| `DEFAULT_CITY` | `pune` | Default city for transit data |
| `GOOGLE_MAPS_API_KEY` | *(empty)* | Optional, used for reverse geocoding |

### 3. Start the frontend

```bash
cd ecoroute_frontend
npm install
npx expo start
```

Then press `a` (Android), `i` (iOS), or `w` (web), or scan the QR code with Expo Go.

**Frontend environment variables** (`ecoroute_frontend/.env`):

| Variable | Description |
|---|---|
| `EXPO_PUBLIC_API_URL` | Backend base URL, e.g. `http://localhost:5000/api/v1` |
| `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` | Google Maps key for the map view |

The app resolves the backend URL automatically:

| Environment | Base URL |
|---|---|
| Web / iOS simulator | `http://localhost:5000/api/v1` |
| Android emulator | `http://10.0.2.2:5000/api/v1` |
| Physical device (Expo Go) | `http://<your-LAN-IP>:5000/api/v1` |

> If the backend is unreachable, the frontend falls back to locally generated routes.

---

## 📡 API Reference

Base URL: `/api/v1`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Health check |
| `POST` | `/routes/compare` | Compare all travel modes for an origin/destination |
| `POST` | `/impact/calculate` | Carbon impact for a distance and mode |
| `GET` | `/places/search` | Place autocomplete |
| `GET` | `/places/geocode` | Reverse geocoding |
| `GET` | `/transit/stations` | List stations (`?type=metro` or `?type=bus`) |
| `GET` | `/transit/lines` | Lines and frequencies |
| `GET` | `/transit/schedule?stationId=` | Next departures |
| `GET` | `/transit/live` | Live vehicle snapshot |
| `GET` | `/transit/live/stream` | SSE live stream |
| `WS` | `/ws/transit/live` | WebSocket live stream |
| `GET` | `/trains/search` | Search trains |
| `GET` | `/trains/schedule/:trainNumber` | Train schedule |
| `GET` | `/trains/between` | Trains between two stations |
| `GET` | `/trains/stations` | Search railway stations |
| `GET` | `/trains/live/:trainNumber` | Live train status |

### Example: compare routes

```bash
curl -X POST http://localhost:5000/api/v1/routes/compare \
  -H "Content-Type: application/json" \
  -d '{
    "origin":      { "lat": 18.5314, "lng": 73.8446, "name": "Shivajinagar" },
    "destination": { "lat": 18.5488, "lng": 73.9038, "name": "Kalyani Nagar" },
    "sortBy": "efficiency"
  }'
```

### Example: carbon impact

```bash
curl -X POST http://localhost:5000/api/v1/impact/calculate \
  -H "Content-Type: application/json" \
  -d '{ "distanceKm": 12, "mode": "metro" }'
```

---

## 📁 Project Structure

```
EcoRoute/
├── ecoroute_backend/
│   ├── src/
│   │   ├── config/        # Zod-validated env config
│   │   ├── controllers/   # routes, transit, trains, places, impact, health
│   │   ├── routes/        # API route definitions
│   │   ├── services/      # routing, emissions, fares, transit, trains,
│   │   │                  # google (places), cache, streaming
│   │   ├── types/
│   │   ├── app.ts
│   │   └── index.ts       # HTTP + WebSocket server
│   └── scripts/test-compare.ts
└── ecoroute_frontend/
    ├── app/               # Expo Router screens
    │   ├── (auth)/        # welcome, login, signup
    │   ├── (tabs)/        # home, planner, carpool, impact, profile
    │   └── routes/        # route options and details
    ├── components/        # ui, planner, map, home
    ├── lib/               # API client, config, planner logic
    ├── utils/             # efficiency + emissions helpers
    └── data/              # mock routes
```

---

## 🧪 Testing

```bash
cd ecoroute_backend
npm run test:compare   # smoke test for the route comparison engine
```

---

## ⚠️ Current Limitations

- **Live tracking is simulated.** Vehicle positions are generated by a server-side simulation loop, not a real GTFS-RT feed.
- **Fares are estimated** from tariff formulas. Cab and bike-taxi prices are not pulled from Uber, Ola, or Rapido.
- **Railway data is static** and not fetched from an external API.
- **Auth, the carpool tab, and the impact dashboard** use placeholder data in the UI.
- **Pune only** for now.
- The route cache is in-memory and is lost on restart.

---

## 🛣️ Roadmap

- [ ] Real transit feeds (GTFS / GTFS-RT) for Pune Metro and PMPML
- [ ] Persistent backend (database for users, trips, carpool matching)
- [ ] Real authentication
- [ ] Live fare integrations
- [ ] More cities
- [ ] Automated tests and CI

---

## 🤝 Contributing

1. Fork the repo
2. Create a branch: `git checkout -b feature/your-feature`
3. Commit your changes and open a pull request

---

## 📄 License

MIT. See [`ecoroute_frontend/LICENSE`](./ecoroute_frontend/LICENSE).
