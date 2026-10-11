import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { Trip } from './types';

const KEY = 'ecoroute.planner.trips.v1';

export const DEFAULT_TRIPS: Trip[] = [
  {
    id: 'trip-college',
    from: 'Home',
    to: 'College',
    time: '08:30',
    returnTime: '16:30',
    repeat: 'weekdays',
    weekdays: [1, 2, 3, 4, 5],
    monthDays: [],
    startDate: '2025-10-06',
    endDate: null,
    skipped: [],
    icon: 'home',
  },
  {
    id: 'trip-work',
    from: 'Home',
    to: 'Work',
    time: '09:00',
    returnTime: '18:00',
    repeat: 'weekdays',
    weekdays: [1, 2, 3, 4, 5],
    monthDays: [],
    startDate: '2025-10-06',
    endDate: null,
    skipped: [],
    icon: 'briefcase',
  },
];

export const DEFAULT_PATTERN = [1, 2, 3, 4, 5];
const KEY_PATTERN = 'ecoroute.planner.pattern.v1';

export async function loadTrips(): Promise<Trip[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return DEFAULT_TRIPS;
    const parsed = JSON.parse(raw) as Trip[];
    return parsed.length > 0 ? parsed : DEFAULT_TRIPS;
  } catch {
    return DEFAULT_TRIPS;
  }
}

export async function saveTrips(trips: Trip[]) {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(trips));
  } catch {
    // Storage failure should never crash the planner; the in-memory state still works.
  }
}

export async function loadPattern(): Promise<number[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY_PATTERN);
    return raw ? (JSON.parse(raw) as number[]) : DEFAULT_PATTERN;
  } catch {
    return DEFAULT_PATTERN;
  }
}

export async function savePattern(pattern: number[]) {
  try {
    await AsyncStorage.setItem(KEY_PATTERN, JSON.stringify(pattern));
  } catch {
    // ignore
  }
}

export const newId = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;

/** All planner trip state + persistence in one hook. Swap the storage calls for API calls later. */
export function usePlannerTrips() {
  const [trips, setTrips] = useState<Trip[]>(DEFAULT_TRIPS);
  const [patternDays, setPatternDaysState] = useState<number[]>(DEFAULT_PATTERN);
  const [loaded, setLoaded] = useState(false);
  const hydrated = useRef(false);

  useEffect(() => {
    Promise.all([loadTrips(), loadPattern()]).then(([t, p]) => {
      setTrips(t);
      setPatternDaysState(p);
      hydrated.current = true;
      setLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (hydrated.current) {
      saveTrips(trips);
      savePattern(patternDays);
    }
  }, [trips, patternDays]);

  const upsertTrip = useCallback((trip: Trip) => {
    setTrips((prev) =>
      prev.some((t) => t.id === trip.id) ? prev.map((t) => (t.id === trip.id ? trip : t)) : [...prev, trip],
    );
  }, []);

  const deleteTrip = useCallback((id: string) => {
    setTrips((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toggleSkip = useCallback((id: string, dateKey: string) => {
    setTrips((prev) =>
      prev.map((t) =>
        t.id !== id
          ? t
          : {
              ...t,
              skipped: t.skipped.includes(dateKey)
                ? t.skipped.filter((k) => k !== dateKey)
                : [...t.skipped, dateKey],
            },
      ),
    );
  }, []);

  const setPatternDays = useCallback((days: number[]) => {
    setPatternDaysState(days);
    // Also update recurring trips that use weekdays to sync with the pattern
    setTrips((prev) =>
      prev.map((t) => {
        if (t.repeat === 'weekdays' || t.repeat === 'weekly') {
          return { ...t, weekdays: days };
        }
        return t;
      }),
    );
  }, []);

  const togglePatternDay = useCallback((day: number) => {
    setPatternDaysState((prev) => {
      const next = prev.includes(day)
        ? prev.filter((d) => d !== day)
        : [...prev, day].sort();
      // Keep recurring trips in sync with pattern
      setTrips((curr) =>
        curr.map((t) => {
          if (t.repeat === 'weekdays' || t.repeat === 'weekly') {
            return { ...t, weekdays: next };
          }
          return t;
        }),
      );
      return next;
    });
  }, []);

  const resetToDefaults = useCallback(() => {
    setTrips(DEFAULT_TRIPS);
    setPatternDaysState(DEFAULT_PATTERN);
  }, []);

  return {
    trips,
    loaded,
    patternDays,
    setPatternDays,
    togglePatternDay,
    upsertTrip,
    deleteTrip,
    toggleSkip,
    resetToDefaults,
  };
}

