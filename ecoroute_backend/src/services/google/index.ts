import axios from 'axios';
import { Coordinate } from '../../types/index.js';
import { env } from '../../config/env.js';

export interface PlaceResult {
  id: string;
  name: string;
  address: string;
  coordinate: Coordinate;
}

// Built-in verified coordinates for Raipur (as in user's design) & Pune
const PRESET_PLACES: PlaceResult[] = [
  {
    id: 'place-nit-raipur',
    name: 'NIT Raipur',
    address: 'GE Road, Raipur, Chhattisgarh',
    coordinate: { lat: 21.2497, lng: 81.6050, name: 'NIT Raipur' },
  },
  {
    id: 'place-tatibandh',
    name: 'Tatibandh, Raipur',
    address: 'Tatibandh Chowk, Raipur, Chhattisgarh',
    coordinate: { lat: 21.2581, lng: 81.5645, name: 'Tatibandh, Raipur' },
  },
  {
    id: 'place-ddu-nagar',
    name: 'DDU Nagar',
    address: 'Deendayal Upadhyay Nagar, Raipur, Chhattisgarh',
    coordinate: { lat: 21.2422, lng: 81.5831, name: 'DDU Nagar' },
  },
  {
    id: 'place-raipur-jn',
    name: 'Raipur Junction Railway Station',
    address: 'Station Road, Raipur, Chhattisgarh',
    coordinate: { lat: 21.2562, lng: 81.6296, name: 'Raipur Junction' },
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
    id: 'place-shivajinagar',
    name: 'Shivajinagar',
    address: 'Shivajinagar, Pune, Maharashtra',
    coordinate: { lat: 18.5314, lng: 73.8446, name: 'Shivajinagar' },
  },
  {
    id: 'place-kalyani-nagar',
    name: 'Kalyani Nagar',
    address: 'Kalyani Nagar, Pune, Maharashtra',
    coordinate: { lat: 18.5488, lng: 73.9038, name: 'Kalyani Nagar' },
  },
];

export class GoogleMapsService {
  private apiKey: string;

  constructor() {
    this.apiKey = (env as any).GOOGLE_MAPS_API_KEY || '';
  }

  /**
   * Search places using Google Places API (or preset fallback)
   */
  async searchPlaces(query: string): Promise<PlaceResult[]> {
    const q = query.trim().toLowerCase();
    if (!q) return PRESET_PLACES.slice(0, 4);

    // If Google API key is configured, call official Places Autocomplete
    if (this.apiKey) {
      try {
        const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(query)}&key=${this.apiKey}&components=country:in`;
        const res = await axios.get(url, { timeout: 3000 });
        if (res.data?.status === 'OK' && res.data.predictions) {
          const places: PlaceResult[] = [];
          for (const p of res.data.predictions.slice(0, 5)) {
            places.push({
              id: p.place_id,
              name: p.structured_formatting?.main_text || p.description,
              address: p.description,
              coordinate: { lat: 21.2497, lng: 81.6050, name: p.description }, // Details fetched on selection
            });
          }
          if (places.length > 0) return places;
        }
      } catch (e) {
        // Fallback to local database
      }
    }

    // Fast local search matching Raipur & Pune landmarks
    const matches = PRESET_PLACES.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.address.toLowerCase().includes(q)
    );

    if (matches.length > 0) return matches;

    // Generic geocode result for any custom entered text
    return [
      {
        id: `custom-${Date.now()}`,
        name: query,
        address: `${query}, Chhattisgarh / Maharashtra`,
        coordinate: { lat: 21.2581, lng: 81.5645, name: query },
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
    let closest = PRESET_PLACES[0];
    let minDist = 999999;
    for (const p of PRESET_PLACES) {
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
