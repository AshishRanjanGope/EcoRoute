import React from 'react';
import { Pressable, View } from 'react-native';
import { Typography } from '../ui/Typography';
import { pad } from '../../lib/planner/dates';
import { C } from './theme';

interface Props {
  label: string;
  value: string; // 'HH:mm' 24h
  onChange: (hhmm: string) => void;
  quickPicks?: string[];
  minuteStep?: number;
}

/**
 * Pure-JS time picker (no native module needed, so no dev-client rebuild):
 * hour and minute steppers + AM/PM toggle + optional one-tap presets.
 */
export function TimeField({ label, value, onChange, quickPicks, minuteStep = 5 }: Props) {
  const [h24, min] = value.split(':').map(Number);
  const isPM = h24 >= 12;
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;

  const set = (nextH24: number, nextMin: number) =>
    onChange(`${pad(((nextH24 % 24) + 24) % 24)}:${pad(((nextMin % 60) + 60) % 60)}`);

  const stepHour = (dir: 1 | -1) => {
    // keep AM/PM stable while wrapping 12 -> 1
    const nextH12 = ((h12 - 1 + dir + 12) % 12) + 1;
    set((nextH12 % 12) + (isPM ? 12 : 0), min);
  };
  const stepMin = (dir: 1 | -1) => {
    const next = Math.round(min / minuteStep) * minuteStep + dir * minuteStep;
    set(h24, (next + 60) % 60);
  };
  const setMeridiem = (pm: boolean) => set((h24 % 12) + (pm ? 12 : 0), min);

  return (
    <View style={{ marginBottom: 14 }}>
      <Typography variant="label" style={{ marginBottom: 6 }}>{label}</Typography>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Stepper value={pad(h12)} onUp={() => stepHour(1)} onDown={() => stepHour(-1)} name="hour" />
        <Typography style={{ fontSize: 22, fontWeight: '700', marginHorizontal: 6 }}>:</Typography>
        <Stepper value={pad(min)} onUp={() => stepMin(1)} onDown={() => stepMin(-1)} name="minute" />
        <View style={{ marginLeft: 12, borderRadius: 10, borderWidth: 1, borderColor: C.border, overflow: 'hidden' }}>
          {(['AM', 'PM'] as const).map((m) => {
            const active = (m === 'PM') === isPM;
            return (
              <Pressable
                key={m}
                onPress={() => setMeridiem(m === 'PM')}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                style={{
                  paddingHorizontal: 14,
                  height: 28,
                  justifyContent: 'center',
                  backgroundColor: active ? C.primary : C.card,
                }}
              >
                <Typography style={{ color: active ? '#fff' : C.muted, fontWeight: '700', fontSize: 12 }}>{m}</Typography>
              </Pressable>
            );
          })}
        </View>
      </View>

      {quickPicks && (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 }}>
          {quickPicks.map((q) => {
            const [qh, qm] = q.split(':').map(Number);
            const text = `${qh % 12 === 0 ? 12 : qh % 12}:${pad(qm)} ${qh >= 12 ? 'PM' : 'AM'}`;
            const active = q === value;
            return (
              <Pressable
                key={q}
                onPress={() => onChange(q)}
                style={{
                  paddingHorizontal: 10,
                  paddingVertical: 5,
                  borderRadius: 14,
                  marginRight: 6,
                  marginBottom: 6,
                  backgroundColor: active ? C.tint : C.tintSoft,
                }}
              >
                <Typography style={{ fontSize: 12, color: active ? C.primaryDark : C.muted, fontWeight: '600' }}>{text}</Typography>
              </Pressable>
            );
          })}
        </View>
      )}
    </View>
  );
}

function Stepper({ value, onUp, onDown, name }: { value: string; onUp: () => void; onDown: () => void; name: string }) {
  const btn = {
    width: 36, height: 28, alignItems: 'center', justifyContent: 'center',
  } as const;
  return (
    <View style={{ alignItems: 'center', borderRadius: 12, borderWidth: 1, borderColor: C.border, backgroundColor: C.card }}>
      <Pressable onPress={onUp} accessibilityLabel={`Increase ${name}`} hitSlop={4} style={btn}>
        <Typography style={{ color: C.primary, fontSize: 16, fontWeight: '700' }}>▲</Typography>
      </Pressable>
      <Typography style={{ fontSize: 22, fontWeight: '700', minWidth: 44, textAlign: 'center' }}>{value}</Typography>
      <Pressable onPress={onDown} accessibilityLabel={`Decrease ${name}`} hitSlop={4} style={btn}>
        <Typography style={{ color: C.primary, fontSize: 16, fontWeight: '700' }}>▼</Typography>
      </Pressable>
    </View>
  );
}
