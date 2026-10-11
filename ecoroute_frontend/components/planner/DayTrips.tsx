import React from 'react';
import { Pressable, View } from 'react-native';
import { Pencil, Plus, RotateCcw, Trash2, EyeOff } from 'lucide-react-native';
import { Typography } from '../ui/Typography';
import { Button } from '../ui/Button';
import { C, cardStyle } from './theme';
import { formatDayLong, formatTime } from '../../lib/planner/dates';
import { describeRepeat, type DayEntry } from '../../lib/planner/schedule';
import type { Trip } from '../../lib/planner/types';

interface Props {
  dateKey: string;
  entries: DayEntry[];
  onAdd: () => void;
  onEdit: (trip: Trip) => void;
  onToggleSkip: (trip: Trip) => void;
  onDelete: (trip: Trip) => void;
}

export function DayTrips({ dateKey, entries, onAdd, onEdit, onToggleSkip, onDelete }: Props) {
  return (
    <View style={cardStyle}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <Typography variant="h4">{formatDayLong(dateKey)}</Typography>
        <Pressable onPress={onAdd} hitSlop={8} accessibilityRole="button" style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Plus size={16} color={C.primary} />
          <Typography style={{ color: C.primary, fontWeight: '700', marginLeft: 4 }}>Add trip</Typography>
        </Pressable>
      </View>

      {entries.length === 0 ? (
        <View style={{ alignItems: 'center', paddingVertical: 14 }}>
          <Typography style={{ color: C.muted, marginBottom: 10 }}>No trips planned for this day.</Typography>
          <Button variant="outline" size="sm" title="Plan a trip" onPress={onAdd} />
        </View>
      ) : (
        entries.map(({ trip, skipped }, i) => (
          <View
            key={trip.id}
            style={{
              paddingVertical: 12,
              borderTopWidth: i === 0 ? 0 : 1,
              borderTopColor: C.border,
              opacity: skipped ? 0.55 : 1,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ width: 78 }}>
                <Typography style={{ fontWeight: '700', color: C.primaryDark }}>{formatTime(trip.time)}</Typography>
                {trip.returnTime && (
                  <Typography variant="caption">↩ {formatTime(trip.returnTime)}</Typography>
                )}
              </View>
              <View style={{ flex: 1 }}>
                <Typography variant="h4" numberOfLines={1} style={{ textDecorationLine: skipped ? 'line-through' : 'none' }}>
                  {trip.from} ↔ {trip.to}
                </Typography>
                <Typography variant="caption">
                  {skipped ? 'Skipped for this day' : describeRepeat(trip)}
                </Typography>
              </View>
            </View>

            <View style={{ flexDirection: 'row', marginTop: 8, paddingLeft: 78, gap: 16 }}>
              <Action icon={<Pencil size={14} color={C.muted} />} label={trip.repeat === 'once' ? 'Edit' : 'Edit series'} onPress={() => onEdit(trip)} />
              {trip.repeat !== 'once' && (
                <Action
                  icon={skipped ? <RotateCcw size={14} color={C.muted} /> : <EyeOff size={14} color={C.muted} />}
                  label={skipped ? 'Restore' : 'Skip this day'}
                  onPress={() => onToggleSkip(trip)}
                />
              )}
              <Action icon={<Trash2 size={14} color={C.danger} />} label={trip.repeat === 'once' ? 'Delete' : 'Delete series'} color={C.danger} onPress={() => onDelete(trip)} />
            </View>
          </View>
        ))
      )}
    </View>
  );
}

function Action({ icon, label, onPress, color = C.muted }: { icon: React.ReactNode; label: string; onPress: () => void; color?: string }) {
  return (
    <Pressable onPress={onPress} hitSlop={8} accessibilityRole="button" style={{ flexDirection: 'row', alignItems: 'center' }}>
      {icon}
      <Typography style={{ color, fontSize: 12, fontWeight: '600', marginLeft: 4 }}>{label}</Typography>
    </Pressable>
  );
}
