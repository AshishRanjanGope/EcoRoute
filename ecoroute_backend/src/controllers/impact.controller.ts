import { Request, Response } from 'express';
import { z } from 'zod';
import { emissionsEngine } from '../services/emissions/index.js';
import { TravelMode } from '../types/index.js';

const impactSchema = z.object({
  distanceKm: z.number().positive(),
  mode: z.enum([
    'walking',
    'bicycle',
    'motorbike',
    'auto-rickshaw',
    'local-train',
    'metro',
    'taxi',
    'carpool',
    'mixed',
  ]),
});

export class ImpactController {
  calculate(req: Request, res: Response): void {
    const parsed = impactSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        error: 'Invalid input parameters',
        details: parsed.error.format(),
      });
      return;
    }

    const { distanceKm, mode } = parsed.data;
    const impact = emissionsEngine.calculateImpact(mode as TravelMode, distanceKm);
    const baseline = emissionsEngine.calculateBaselineEmission(distanceKm);

    res.json({
      success: true,
      distanceKm,
      mode,
      baselineEmissionKgCO2: baseline,
      ...impact,
    });
  }
}

export const impactController = new ImpactController();
