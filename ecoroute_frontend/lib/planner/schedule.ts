import {
  dayOfWeek, daysInMonth, endOfMonthKey, endOfYearKey, formatDayLong, ordinal, parseKey,
  toKey, WEEKDAY_SHORT, WEEK_ORDER, MONTH_SHORT,
} from './dates';
import type { RangeKey, RepeatKind, Trip } from './types';

export const ALL_DAYS = [0, 1, 2, 3, 4, 5, 6];
export const WEEKDAYS = [1, 2, 3, 4, 5];
export const WEEKENDS = [6, 0];

const sameSet = (a: number[], b: number[]) =>
  a.length === b.length && a.every((x) => b.includes(x));

/** Which preset a set of weekdays corresponds to (drives the highlighted chip). */
export function inferRepeat(weekdays: number[]): Exclude<RepeatKind, 'once' | 'monthly'> {
  if (sameSet(weekdays, ALL_DAYS)) return 'daily';
  if (sameSet(weekdays, WEEKDAYS)) return 'weekdays';
  if (sameSet(weekdays, WEEKENDS)) return 'weekends';
  return 'weekly';
}

/** Does this trip happen on the given date? (ignores per-day skips) */
export function occursOn(trip: Trip, key: string): boolean {
  if (key < trip.startDate) return false;
  if (trip.endDate && key > trip.endDate) return false;
  const { y, m, d } = parseKey(key);
  switch (trip.repeat) {
    case 'once':
      return key === trip.startDate;
    case 'monthly': {
      const dim = daysInMonth(y, m);
      return trip.monthDays.some((md) => Math.min(md, dim) === d);
    }
    default:
      return trip.weekdays.includes(dayOfWeek(y, m, d));
  }
}

export const isSkipped = (trip: Trip, key: string) => trip.skipped.includes(key);

export interface DayEntry {
  trip: Trip;
  skipped: boolean;
}

export function tripsForDay(trips: Trip[], key: string): DayEntry[] {
  return trips
    .filter((t) => occursOn(t, key))
    .map((trip) => ({ trip, skipped: isSkipped(trip, key) }))
    .sort((a, b) => a.trip.time.localeCompare(b.trip.time));
}

/** date key -> number of active (non-skipped) trips, for every day in the month. */
export function monthCounts(trips: Trip[], y: number, m: number): Record<string, number> {
  const out: Record<string, number> = {};
  const dim = daysInMonth(y, m);
  for (let d = 1; d <= dim; d++) {
    const key = toKey(y, m, d);
    const n = trips.filter((t) => occursOn(t, key) && !isSkipped(t, key)).length;
    if (n > 0) out[key] = n;
  }
  return out;
}

/** Number of active one-way legs in a month (a trip with a return counts twice). */
export function monthLegs(trips: Trip[], y: number, m: number): number {
  let legs = 0;
  const dim = daysInMonth(y, m);
  for (let d = 1; d <= dim; d++) {
    const key = toKey(y, m, d);
    for (const t of trips) {
      if (occursOn(t, key) && !isSkipped(t, key)) legs += t.returnTime ? 2 : 1;
    }
  }
  return legs;
}

/* ---------- ranges ---------- */

export function endDateFor(range: Exclude<RangeKey, 'custom'>, start: string): string | null {
  switch (range) {
    case 'month': return endOfMonthKey(start, 0);
    case '3m': return endOfMonthKey(start, 2);
    case '6m': return endOfMonthKey(start, 5);
    case 'year': return endOfYearKey(start);
    case 'forever': return null;
  }
}

export function rangeFor(trip: Pick<Trip, 'startDate' | 'endDate'>): RangeKey {
  if (trip.endDate === null) return 'forever';
  const options: Exclude<RangeKey, 'custom' | 'forever'>[] = ['month', '3m', '6m', 'year'];
  return options.find((r) => endDateFor(r, trip.startDate) === trip.endDate) ?? 'custom';
}

export const RANGE_LABELS: Record<Exclude<RangeKey, 'custom'>, string> = {
  month: 'This month',
  '3m': '3 months',
  '6m': '6 months',
  year: 'Rest of year',
  forever: 'No end',
};

/* ---------- labels ---------- */

export function describeRepeat(trip: Trip): string {
  switch (trip.repeat) {
    case 'once': return 'One-off';
    case 'daily': return 'Every day';
    case 'weekdays': return 'Weekdays (Mon–Fri)';
    case 'weekends': return 'Weekends (Sat–Sun)';
    case 'weekly': {
      const ordered = WEEK_ORDER.filter((d) => trip.weekdays.includes(d));
      return ordered.map((d) => WEEKDAY_SHORT[d]).join(', ') || 'No days selected';
    }
    case 'monthly': {
      const days = [...trip.monthDays].sort((a, b) => a - b).map(ordinal);
      return `Monthly on the ${days.join(', ')}`;
    }
  }
}

export function describeRange(trip: Trip): string {
  if (trip.repeat === 'once') return formatDayLong(trip.startDate);
  const { d, m, y } = parseKey(trip.startDate);
  const start = `${d} ${MONTH_SHORT[m]} ${y}`;
  if (!trip.endDate) return `From ${start}, no end`;
  const e = parseKey(trip.endDate);
  return `${start} → ${e.d} ${MONTH_SHORT[e.m]} ${e.y}`;
}

export function formatTripDays(trip: Trip): string {
  if (trip.repeat === 'once') return formatDayLong(trip.startDate);
  if (trip.repeat === 'daily') return 'Every day';
  if (trip.repeat === 'weekends') return 'Sat, Sun';
  if (trip.weekdays && trip.weekdays.length > 0) {
    const ordered = WEEK_ORDER.filter((d) => trip.weekdays.includes(d));
    return ordered.map((d) => WEEKDAY_SHORT[d]).join(', ');
  }
  if (trip.repeat === 'weekdays') return 'Mon, Tue, Wed, Thu, Fri';
  return describeRepeat(trip);
}

export function formatPatternSummary(days: number[]): string {
  const allDays = [1, 2, 3, 4, 5, 6, 0];
  const workdays = allDays.filter((d) => days.includes(d));
  const weekends = allDays.filter((d) => !days.includes(d));

  const formatList = (list: number[]) => {
    if (list.length === 0) return 'None';
    if (list.length === 7) return 'All days';
    if (list.length === 5 && list.every((d) => [1, 2, 3, 4, 5].includes(d))) return 'Mon – Fri';
    if (list.length === 6 && list.every((d) => [1, 2, 3, 4, 5, 6].includes(d))) return 'Mon – Sat';
    if (list.length === 2 && list.includes(6) && list.includes(0)) return 'Sat, Sun';
    if (list.length === 1 && list.includes(0)) return 'Sun';
    if (list.length === 1 && list.includes(6)) return 'Sat';
    return list.map((d) => WEEKDAY_SHORT[d]).join(', ');
  };

  return `Workdays: ${formatList(workdays)}  |  Weekends: ${formatList(weekends)}`;
}

