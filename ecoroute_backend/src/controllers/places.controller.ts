import { Request, Response } from 'express';
import { googleMapsService } from '../services/google/index.js';

export class PlacesController {
  async search(req: Request, res: Response): Promise<void> {
    try {
      const q = String(req.query.q || '');
      const places = await googleMapsService.searchPlaces(q);
      res.json({
        success: true,
        count: places.length,
        places,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: 'Place search failed',
        message: err.message,
      });
    }
  }

  async geocode(req: Request, res: Response): Promise<void> {
    try {
      const lat = Number(req.query.lat);
      const lng = Number(req.query.lng);

      if (isNaN(lat) || isNaN(lng)) {
        res.status(400).json({ success: false, error: 'Valid lat and lng required' });
        return;
      }

      const address = await googleMapsService.reverseGeocode(lat, lng);
      res.json({
        success: true,
        coordinate: { lat, lng },
        address,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: 'Geocoding failed',
        message: err.message,
      });
    }
  }
}

export const placesController = new PlacesController();
