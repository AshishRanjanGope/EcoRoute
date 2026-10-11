import React, { useEffect, useMemo, useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, Switch, View } from 'react-native';
import { ArrowUpDown, X } from 'lucide-react-native';
import { Typography } from '../ui/Typography';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Chip } from './Chip';
import { TimeField } from './TimeField';
import { C } from './theme';
import {
  daysInMonth, formatDayLong, MONTH_NAMES, parseKey, toKey, WEEKDAY_SHORT, WEEK_ORDER,
} from '../../lib/planner/dates';
import {
  ALL_DAYS, endDateFor, inferRepeat, occursOn, rangeFor, RANGE_LABELS, WEEKDAYS, WEEKENDS,
} from '../../lib/planner/schedule';
import { newId } from '../../lib/planner/storage';
import type { RangeKey, RepeatKind, Trip } from '../../lib/planner/types';

type Mode = 'once' | 'weekly' | 'monthly';
type Preset = 'once' | 'daily' | 'weekdays' | 'weekends' | 'weekly' | 'monthly';

const PRESETS: { key: Preset; label: string }[] = [
  { key: 'once', label: 'Just this day' },
  { key: 'daily', label: 'Every day' },
  { key: 'weekdays', label: 'Weekdays' },
  { key: 'weekends', label: 'Weekends' },
  { key: 'weekly', label: 'Custom days' },
  { key: 'monthly', label: 'Monthly' },
];

const RANGE_KEYS = ['month', '3m', '6m', 'year', 'forever'] as const;
const MORNING = ['07:00', '08:00', '09:00', '10:00'];
const EVENING = ['16:00', '17:00', '18:00', '19:00'];

interface Props {
  visible: boolean;
  /** Date the user was looking at; becomes the start date for new trips. */
  dateKey: string;
  /** Trip being edited, or undefined for a new one. */
  initial?: Trip;
  /** Which repeat option to pre-select for a new trip. */
  defaultPreset?: Preset;
  /** Previously used places, offered as one-tap suggestions. */
  recentPlaces: string[];
  onSave: (trip: Trip) => void;
  onClose: () => void;
}

export function TripSheet({ visible, dateKey, initial, defaultPreset = 'once', recentPlaces, onSave, onClose }: Props) {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [time, setTime] = useState('09:00');
  const [hasReturn, setHasReturn] = useState(true);
  const [returnTime, setReturnTime] = useState('18:00');
  const [mode, setMode] = useState<Mode>('once');
  const [weekdays, setWeekdays] = useState<number[]>(WEEKDAYS);
  const [monthDays, setMonthDays] = useState<number[]>([1]);
  const [range, setRange] = useState<RangeKey>('month');
  const [fromMonthStart, setFromMonthStart] = useState(false);
  const [error, setError] = useState('');

  // (Re)initialise the form every time the sheet opens.
  useEffect(() => {
    if (!visible) return;
    setError('');
    setFromMonthStart(false);
    if (initial) {
      setFrom(initial.from);
      setTo(initial.to);
      setTime(initial.time);
      setHasReturn(!!initial.returnTime);
      setReturnTime(initial.returnTime ?? '18:00');
      setMode(initial.repeat === 'once' ? 'once' : initial.repeat === 'monthly' ? 'monthly' : 'weekly');
      setWeekdays(initial.weekdays.length ? initial.weekdays : WEEKDAYS);
      setMonthDays(initial.monthDays.length ? initial.monthDays : [parseKey(initial.startDate).d]);
      setRange(initial.repeat === 'once' ? 'month' : rangeFor(initial));
    } else {
      const day = parseKey(dateKey);
      setFrom('');
      setTo('');
      setTime('09:00');
      setHasReturn(true);
      setReturnTime('18:00');
      setMonthDays([day.d]);
      setRange('month');
      applyPreset(defaultPreset);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, initial, dateKey, defaultPreset]);

  const preset: Preset = mode === 'weekly' ? inferRepeat(weekdays) : mode;

  function applyPreset(p: Preset) {
    if (p === 'once') return setMode('once');
    if (p === 'monthly') return setMode('monthly');
    setMode('weekly');
    if (p === 'daily') setWeekdays(ALL_DAYS);
    else if (p === 'weekdays') setWeekdays(WEEKDAYS);
    else if (p === 'weekends') setWeekdays(WEEKENDS);
    // 'weekly' (custom) keeps whatever is currently ticked
  }

  const toggleWeekday = (d: number) =>
    setWeekdays((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]));
  const toggleMonthDay = (d: number) =>
    setMonthDays((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]));

  const startDate = useMemo(() => {
    if (initial) return initial.startDate;
    if (mode !== 'once' && fromMonthStart) {
      const { y, m } = parseKey(dateKey);
      return toKey(y, m, 1);
    }
    return dateKey;
  }, [initial, mode, fromMonthStart, dateKey]);

  const draft: Trip = useMemo(() => {
    const repeat: RepeatKind = mode === 'weekly' ? inferRepeat(weekdays) : mode;
    let endDate: string | null;
    if (mode === 'once') endDate = startDate;
    else if (range === 'custom') endDate = initial?.endDate ?? null;
    else endDate = endDateFor(range, startDate);
    return {
      id: initial?.id ?? newId(),
      from: from.trim(),
      to: to.trim(),
      time,
      returnTime: hasReturn ? returnTime : null,
      repeat,
      weekdays: mode === 'weekly' ? weekdays : [],
      monthDays: mode === 'monthly' ? monthDays : [],
      startDate,
      endDate,
      skipped: initial?.skipped ?? [],
    };
  }, [initial, mode, weekdays, monthDays, range, startDate, from, to, time, hasReturn, returnTime]);

  // Live answer to "how many days a month is this?" for the month being viewed.
  const previewCount = useMemo(() => {
    const { y, m } = parseKey(dateKey);
    let n = 0;
    for (let d = 1; d <= daysInMonth(y, m); d++) if (occursOn(draft, toKey(y, m, d))) n++;
    return n;
  }, [draft, dateKey]);
  const previewMonth = `${MONTH_NAMES[parseKey(dateKey).m]} ${parseKey(dateKey).y}`;

  function save() {
    if (!draft.from || !draft.to) return setError('Enter both a starting point and a destination.');
    if (draft.from.toLowerCase() === draft.to.toLowerCase()) return setError('Start and destination must be different.');
    if (mode === 'weekly' && weekdays.length === 0) return setError('Pick at least one day of the week.');
    if (mode === 'monthly' && monthDays.length === 0) return setError('Pick at least one date of the month.');
    if (hasReturn && returnTime <= time) return setError('Return time must be later than the departure time.');
    onSave(draft);
  }

  const suggestions = recentPlaces.slice(0, 4);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(24,35,29,0.45)' }}>
          <Pressable style={{ flex: 1 }} onPress={onClose} accessibilityLabel="Close" />
          <View style={{ backgroundColor: C.bg, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '92%' }}>
            {/* header */}
            <View style={{ flexDirection: 'row', alignItems: 'center', padding: 18, paddingBottom: 6 }}>
              <View style={{ flex: 1 }}>
                <Typography variant="h3">{initial ? 'Edit trip' : 'Plan a trip'}</Typography>
                <Typography variant="caption">{formatDayLong(startDate)}</Typography>
              </View>
              <Pressable onPress={onClose} hitSlop={10} accessibilityLabel="Close" style={{ padding: 6 }}>
                <X size={22} color={C.muted} />
              </Pressable>
            </View>

            <ScrollView
              style={{ flexGrow: 0 }}
              contentContainerStyle={{ padding: 18, paddingTop: 10 }}
              keyboardShouldPersistTaps="handled"
            >
              {/* route */}
              <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                <View style={{ flex: 1 }}>
                  <Input label="From" placeholder="Home, Kothrud…" value={from} onChangeText={setFrom} />
                  <Input label="To" placeholder="Hinjewadi Phase 1, College…" value={to} onChangeText={setTo} />
                </View>
                <Pressable
                  onPress={() => { setFrom(to); setTo(from); }}
                  accessibilityLabel="Swap start and destination"
                  hitSlop={8}
                  style={{ marginLeft: 8, marginTop: 38, width: 40, height: 40, borderRadius: 20, backgroundColor: C.tint, alignItems: 'center', justifyContent: 'center' }}
                >
                  <ArrowUpDown size={18} color={C.primaryDark} />
                </Pressable>
              </View>
              {suggestions.length > 0 && (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: -6, marginBottom: 12 }}>
                  {suggestions.map((p) => (
                    <Pressable
                      key={p}
                      onPress={() => (!from ? setFrom(p) : setTo(p))}
                      style={{ paddingHorizontal: 10, paddingVertical: 5, borderRadius: 14, backgroundColor: C.tintSoft, marginRight: 6, marginBottom: 6 }}
                    >
                      <Typography style={{ fontSize: 12, color: C.muted, fontWeight: '600' }}>{p}</Typography>
                    </Pressable>
                  ))}
                </View>
              )}

              {/* times */}
              <TimeField label="Departure time" value={time} onChange={setTime} quickPicks={MORNING} />
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <Typography variant="h4">Return trip</Typography>
                <Switch
                  value={hasReturn}
                  onValueChange={setHasReturn}
                  trackColor={{ true: C.primary, false: C.border }}
                  accessibilityLabel="Include a return trip"
                />
              </View>
              {hasReturn && <TimeField label="Return time" value={returnTime} onChange={setReturnTime} quickPicks={EVENING} />}

              {/* repeat */}
              <Typography variant="h4" style={{ marginTop: 6, marginBottom: 8 }}>Repeat</Typography>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {PRESETS.map((p) => (
                  <Chip key={p.key} label={p.label} selected={preset === p.key} onPress={() => applyPreset(p.key)} />
                ))}
              </View>

              {mode === 'weekly' && (
                <View style={{ marginTop: 14 }}>
                  <Typography variant="label" style={{ marginBottom: 8 }}>
                    On these days ({weekdays.length} per week)
                  </Typography>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                    {WEEK_ORDER.map((d) => (
                      <Chip key={d} label={WEEKDAY_SHORT[d]} selected={weekdays.includes(d)} onPress={() => toggleWeekday(d)} />
                    ))}
                  </View>
                </View>
              )}

              {mode === 'monthly' && (
                <View style={{ marginTop: 14 }}>
                  <Typography variant="label" style={{ marginBottom: 8 }}>On these dates of every month</Typography>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => {
                      const on = monthDays.includes(d);
                      return (
                        <View key={d} style={{ width: `${100 / 7}%`, padding: 2 }}>
                          <Pressable
                            onPress={() => toggleMonthDay(d)}
                            accessibilityRole="checkbox"
                            accessibilityState={{ checked: on }}
                            style={{
                              height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center',
                              backgroundColor: on ? C.primary : C.card, borderWidth: 1, borderColor: on ? C.primary : C.border,
                            }}
                          >
                            <Typography style={{ color: on ? '#fff' : C.text, fontWeight: on ? '700' : '500', fontSize: 13 }}>{d}</Typography>
                          </Pressable>
                        </View>
                      );
                    })}
                  </View>
                  <Typography variant="caption" style={{ marginTop: 6 }}>
                    Shorter months use their last day (e.g. the 31st → 30th April).
                  </Typography>
                </View>
              )}

              {mode !== 'once' && (
                <>
                  <Typography variant="h4" style={{ marginTop: 18, marginBottom: 8 }}>Keep repeating for</Typography>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                    {RANGE_KEYS.map((r) => (
                      <Chip key={r} label={RANGE_LABELS[r]} selected={range === r} onPress={() => setRange(r)} />
                    ))}
                    {range === 'custom' && <Chip label="Custom end date" selected onPress={() => {}} />}
                  </View>

                  {!initial && parseKey(dateKey).d !== 1 && (
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
                      <Chip label={`Start ${parseKey(dateKey).d} ${MONTH_NAMES[parseKey(dateKey).m].slice(0, 3)}`} selected={!fromMonthStart} onPress={() => setFromMonthStart(false)} />
                      <Chip label="Start of month" selected={fromMonthStart} onPress={() => setFromMonthStart(true)} />
                    </View>
                  )}
                </>
              )}

              {/* live preview */}
              <View style={{ marginTop: 18, padding: 12, borderRadius: 14, backgroundColor: C.tintSoft, borderWidth: 1, borderColor: C.tint }}>
                <Typography style={{ color: C.primaryDark, fontWeight: '700' }}>
                  {previewCount} trip day{previewCount === 1 ? '' : 's'} in {previewMonth}
                  {hasReturn && previewCount > 0 ? ` · ${previewCount * 2} one-way legs` : ''}
                </Typography>
              </View>

              {!!error && (
                <Typography style={{ color: C.danger, marginTop: 12, fontWeight: '600' }} accessibilityLiveRegion="polite">
                  {error}
                </Typography>
              )}
            </ScrollView>

            <View style={{ flexDirection: 'row', gap: 10, padding: 18, paddingTop: 8, borderTopWidth: 1, borderTopColor: C.border }}>
              <Button variant="outline" title="Cancel" onPress={onClose} style={{ flex: 1 }} />
              <Button title={initial ? 'Save changes' : 'Add to calendar'} onPress={save} style={{ flex: 2 }} />
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
