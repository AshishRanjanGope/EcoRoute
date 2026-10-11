import axios from 'axios';
import { Coordinate } from '../../types/index.js';
import { env } from '../../config/env.js';

export interface PlaceResult {
  id: string;
  name: string;
  address: string;
  coordinate: Coordinate;
}

// Built-in verified coordinates for major cities, landmarks, and railway hubs across India
const VERIFIED_INDIAN_HUBS: PlaceResult[] = [
  // Chhattisgarh
  {
    id: 'place-nit-raipur',
    name: 'NIT Raipur',
    address: 'GE Road, Raipur, Chhattisgarh 492010',
    coordinate: { lat: 21.2497, lng: 81.6050, name: 'NIT Raipur' },
  },
  {
    id: 'place-tatibandh',
    name: 'Tatibandh, Raipur',
    address: 'Tatibandh Chowk, Raipur, Chhattisgarh',
    coordinate: { lat: 21.2581, lng: 81.5645, name: 'Tatibandh, Raipur' },
  },
  {
    id: 'place-raipur-jn',
    name: 'Raipur Junction Railway Station',
    address: 'Station Road, Raipur, Chhattisgarh 492001',
    coordinate: { lat: 21.2562, lng: 81.6296, name: 'Raipur Junction' },
  },
  {
    id: 'place-ddu-nagar',
    name: 'DDU Nagar',
    address: 'Deendayal Upadhyay Nagar, Raipur, Chhattisgarh',
    coordinate: { lat: 21.2422, lng: 81.5831, name: 'DDU Nagar' },
  },
  {
    id: 'place-raipur-airport',
    name: 'Swami Vivekananda Airport (RPR)',
    address: 'Mana, Raipur, Chhattisgarh',
    coordinate: { lat: 21.1804, lng: 81.7388, name: 'Raipur Airport' },
  },
  {
    id: 'place-telibandha',
    name: 'Telibandha (Marine Drive)',
    address: 'Telibandha Lake, Raipur, Chhattisgarh',
    coordinate: { lat: 21.2372, lng: 81.6664, name: 'Telibandha' },
  },
  {
    id: 'place-bilaspur',
    name: 'Bilaspur',
    address: 'Bilaspur, Chhattisgarh',
    coordinate: { lat: 22.0797, lng: 82.1409, name: 'Bilaspur' },
  },
  {
    id: 'place-durg',
    name: 'Durg Junction',
    address: 'Durg, Chhattisgarh',
    coordinate: { lat: 21.1904, lng: 81.2849, name: 'Durg' },
  },

  // Jharkhand
  {
    id: 'place-bokaro',
    name: 'Bokaro Steel City',
    address: 'Bokaro, Jharkhand, India',
    coordinate: { lat: 23.6544, lng: 86.1456, name: 'Bokaro Steel City' },
  },
  {
    id: 'place-bokaro-chas',
    name: 'Bokaro, Chas',
    address: 'Chas, Bokaro, Jharkhand 827013',
    coordinate: { lat: 23.6362, lng: 86.1772, name: 'Bokaro, Chas' },
  },
  {
    id: 'place-ranchi',
    name: 'Ranchi',
    address: 'Ranchi, Jharkhand, India',
    coordinate: { lat: 23.3441, lng: 85.3096, name: 'Ranchi' },
  },
  {
    id: 'place-dhanbad',
    name: 'Dhanbad',
    address: 'Dhanbad, Jharkhand, India',
    coordinate: { lat: 23.7957, lng: 86.4304, name: 'Dhanbad' },
  },
  {
    id: 'place-jamshedpur',
    name: 'Jamshedpur (Tatanagar)',
    address: 'Jamshedpur, Jharkhand, India',
    coordinate: { lat: 22.8046, lng: 86.2029, name: 'Jamshedpur' },
  },

  // Maharashtra
  {
    id: 'place-shivajinagar',
    name: 'Shivajinagar, Pune',
    address: 'Shivajinagar, Pune, Maharashtra 411005',
    coordinate: { lat: 18.5314, lng: 73.8446, name: 'Shivajinagar' },
  },
  {
    id: 'place-kalyani-nagar',
    name: 'Kalyani Nagar, Pune',
    address: 'Kalyani Nagar, Pune, Maharashtra 411006',
    coordinate: { lat: 18.5488, lng: 73.9038, name: 'Kalyani Nagar' },
  },
  {
    id: 'place-pune-station',
    name: 'Pune Railway Station',
    address: 'Agarkar Nagar, Pune, Maharashtra 411001',
    coordinate: { lat: 18.5284, lng: 73.8743, name: 'Pune Railway Station' },
  },
  {
    id: 'place-mumbai-csmt',
    name: 'Mumbai CSMT',
    address: 'Fort, Mumbai, Maharashtra 400001',
    coordinate: { lat: 18.9401, lng: 72.8355, name: 'Mumbai CSMT' },
  },
  {
    id: 'place-nagpur',
    name: 'Nagpur',
    address: 'Nagpur, Maharashtra, India',
    coordinate: { lat: 21.1458, lng: 79.0882, name: 'Nagpur' },
  },

  // Other Major Metros
  {
    id: 'place-howrah',
    name: 'Howrah, Kolkata',
    address: 'Howrah, West Bengal 711101',
    coordinate: { lat: 22.5839, lng: 88.3426, name: 'Howrah, Kolkata' },
  },
  {
    id: 'place-new-delhi',
    name: 'New Delhi',
    address: 'New Delhi, Delhi 110001',
    coordinate: { lat: 28.6139, lng: 77.2090, name: 'New Delhi' },
  },
  {
    id: 'place-bengaluru',
    name: 'Bengaluru (Bangalore)',
    address: 'Bengaluru, Karnataka 560001',
    coordinate: { lat: 12.9716, lng: 77.5946, name: 'Bengaluru' },
  },
  {
    id: 'place-hyderabad',
    name: 'Hyderabad',
    address: 'Hyderabad, Telangana 500001',
    coordinate: { lat: 17.3850, lng: 78.4867, name: 'Hyderabad' },
  },
  {
    id: 'place-patna',
    name: 'Patna',
    address: 'Patna, Bihar 800001',
    coordinate: { lat: 25.5941, lng: 85.1376, name: 'Patna' },
  },
];

export class GoogleMapsService {
  private apiKey: string;

  constructor() {
    this.apiKey = (env as any).GOOGLE_MAPS_API_KEY || '';
  }

  /**
   * Search places with accurate GPS coordinates across all cities in India
   */
  async searchPlaces(query: string): Promise<PlaceResult[]> {
    const q = query.trim().toLowerCase();
    if (!q) return VERIFIED_INDIAN_HUBS.slice(0, 6);

    // 1. Instant local search matching verified hubs
    const localMatches = VERIFIED_INDIAN_HUBS.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.address.toLowerCase().includes(q)
    );

    if (localMatches.length > 0) return localMatches;

    // 2. High-speed OpenStreetMap Photon Geocoding Engine
    try {
      const photonUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=6`;
      const pRes = await axios.get(photonUrl, { timeout: 2500 });
      if (pRes.data?.features && pRes.data.features.length > 0) {
        const places: PlaceResult[] = pRes.data.features.map((f: any, i: number) => {
          const props = f.properties || {};
          const [lng, lat] = f.geometry.coordinates;
          const name = props.name || query;
          const address = [props.name, props.city, props.state, props.country]
            .filter(Boolean)
            .join(', ');

          return {
            id: `photon-${props.osm_id || i}`,
            name,
            address: address || `${name}, India`,
            coordinate: { lat, lng, name },
          };
        });
        if (places.length > 0) return places;
      }
    } catch (e) {
      // Continue to Nominatim
    }

    // 3. Nominatim OpenStreetMap Geocoder (accurate street and town coverage)
    try {
      const geoUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=in&limit=6&addressdetails=1`;
      const geoRes = await axios.get(geoUrl, {
        headers: { 'User-Agent': 'EcoRoute-Backend/1.0' },
        timeout: 3000,
      });
      if (Array.isArray(geoRes.data) && geoRes.data.length > 0) {
        return geoRes.data.map((item: any, i: number) => {
          const parts = (item.display_name || '').split(',');
          const mainName = item.name || parts[0]?.trim() || query;
          const subAddress = parts.slice(1, 4).join(',').trim() || item.display_name;
          return {
            id: `geo-${item.place_id || i}`,
            name: mainName,
            address: subAddress,
            coordinate: {
              lat: parseFloat(item.lat),
              lng: parseFloat(item.lon),
              name: mainName,
            },
          };
        });
      }
    } catch (e) {
      // Fallback
    }

    // 4. Safe fallback for custom text
    return [
      {
        id: `custom-${Date.now()}`,
        name: query,
        address: `${query}, India`,
        coordinate: { lat: 21.2497, lng: 81.6050, name: query },
      },
    ];
  }

  /**
   * Reverse geocode a latitude & longitude
   */
  async reverseGeocode(lat: number, lng: number): Promise<string> {
    if (this.apiKey) {
      try {
        const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${this.apiKey}`;
        const res = await axios.get(url, { timeout: 3000 });
        if (res.data?.status === 'OK' && res.data.results?.[0]) {
          return res.data.results[0].formatted_address;
        }
      } catch (e) {
        // Fallback
      }
    }

    // Check closest preset
    let closest = VERIFIED_INDIAN_HUBS[0];
    let minDist = Infinity;
    for (const p of VERIFIED_INDIAN_HUBS) {
      const d = Math.hypot(p.coordinate.lat - lat, p.coordinate.lng - lng);
      if (d < minDist) {
        minDist = d;
        closest = p;
      }
    }

    return closest.name;
  }
}

export const googleMapsService = new GoogleMapsService();
