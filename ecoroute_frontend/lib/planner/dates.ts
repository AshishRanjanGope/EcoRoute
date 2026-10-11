export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
export const MONTH_SHORT = MONTH_NAMES.map((m) => m.slice(0, 3));

/** Calendar columns are Monday-first. Values are JS getDay() numbers (0 = Sunday). */
export const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0];
export const WEEKDAY_SHORT: Record<number, string> = {
  0: 'Sun', 1: 'Mon', 2: 'Tue', 3: 'Wed', 4: 'Thu', 5: 'Fri', 6: 'Sat',
};

export const pad = (n: number) => String(n).padStart(2, '0');

/** month is 0-based, like JS Date. */
export const toKey = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;

export function parseKey(key: string) {
  const [y, m, d] = key.split('-').map(Number);
  return { y, m: m - 1, d };
}

export const daysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
export const dayOfWeek = (y: number, m: number, d: number) => new Date(y, m, d).getDay();

export function todayKey() {
  const t = new Date();
  return toKey(t.getFullYear(), t.getMonth(), t.getDate());
}

/** Last day of the month that is `offset` months after the month of `key`. */
export function endOfMonthKey(key: string, offset = 0) {
  const { y, m } = parseKey(key);
  const end = new Date(y, m + offset + 1, 0);
  return toKey(end.getFullYear(), end.getMonth(), end.getDate());
}

export function endOfYearKey(key: string) {
  return toKey(parseKey(key).y, 11, 31);
}

/** Shift a (year, month) pair by n months, wrapping years correctly. */
export function shiftMonth(y: number, m: number, n: number) {
  const d = new Date(y, m + n, 1);
  return { y: d.getFullYear(), m: d.getMonth() };
}

export interface GridCell {
  key: string;
  d: number;
  inMonth: boolean;
}

/** Monday-first weeks for a month, padded with the neighbouring months' days. */
export function monthGrid(y: number, m: number): GridCell[][] {
  const first = new Date(y, m, 1);
  const lead = (first.getDay() + 6) % 7; // Mon = 0
  const start = new Date(y, m, 1 - lead);
  const total = Math.ceil((lead + daysInMonth(y, m)) / 7) * 7;
  const cells: GridCell[] = [];
  for (let i = 0; i < total; i++) {
    const dt = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
    cells.push({
      key: toKey(dt.getFullYear(), dt.getMonth(), dt.getDate()),
      d: dt.getDate(),
      inMonth: dt.getMonth() === m && dt.getFullYear() === y,
    });
  }
  const weeks: GridCell[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

/** '08:30' -> '8:30 AM' */
export function formatTime(hhmm: string) {
  const [h, mi] = hhmm.split(':').map(Number);
  const suffix = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${pad(mi)} ${suffix}`;
}

/** '2026-10-14' -> 'Wed, 14 Oct 2026' */
export function formatDayLong(key: string) {
  const { y, m, d } = parseKey(key);
  return `${WEEKDAY_SHORT[dayOfWeek(y, m, d)]}, ${d} ${MONTH_SHORT[m]} ${y}`;
}

export function ordinal(n: number) {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return `${n}${s[(v - 20) % 10] || s[v] || s[0]}`;
}
