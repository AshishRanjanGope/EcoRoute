export type RepeatKind = 'once' | 'daily' | 'weekdays' | 'weekends' | 'weekly' | 'monthly';

/** How long a recurring trip keeps repeating, counted from its start date. */
export type RangeKey = 'month' | '3m' | '6m' | 'year' | 'forever' | 'custom';

/**
 * One planned commute. A recurring trip is ONE record (a rule), not one record per day,
 * so "Mon–Fri for 6 months" is stored once and expanded by `occursOn()` when rendering.
 *
 * Dates are local calendar strings ('YYYY-MM-DD'); times are 24h 'HH:mm'.
 * This shape is intentionally JSON-friendly so the backend can store it as-is later.
 */
export interface Trip {
  id: string;
  from: string;
  to: string;
  /** Departure time, 24h 'HH:mm'. */
  time: string;
  /** Optional return leg time, 24h 'HH:mm'. */
  returnTime: string | null;
  repeat: RepeatKind;
  /** 0 = Sunday … 6 = Saturday. Used by daily / weekdays / weekends / weekly. */
  weekdays: number[];
  /** 1–31. Used by monthly. Months shorter than the value use their last day. */
  monthDays: number[];
  /** First date the trip can occur (for 'once' it is the trip's date). */
  startDate: string;
  /** Last date (inclusive) or null for no end. */
  endDate: string | null;
  /** Individual dates the user opted out of ("skip this day"). */
  skipped: string[];
  /** Optional icon identifier (home, work, college, briefcase). */
  icon?: 'home' | 'work' | 'college' | 'briefcase' | string;
}
