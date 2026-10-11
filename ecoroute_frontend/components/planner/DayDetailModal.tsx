import React from 'react';
import { Modal, Pressable, ScrollView, View } from 'react-native';
import { EyeOff, Pencil, Plus, RotateCcw, Trash2, X } from 'lucide-react-native';
import { Typography } from '../ui/Typography';
import { Button } from '../ui/Button';
import { formatDayLong, formatTime } from '../../lib/planner/dates';
import { describeRepeat, type DayEntry } from '../../lib/planner/schedule';
import type { Trip } from '../../lib/planner/types';
import { C } from './theme';

interface Props {
  visible: boolean;
  dateKey: string;
  entries: DayEntry[];
  onAdd: () => void;
  onEdit: (trip: Trip) => void;
  onToggleSkip: (trip: Trip) => void;
  onDelete: (trip: Trip) => void;
  onClose: () => void;
}

export function DayDetailModal({
  visible,
  dateKey,
  entries,
  onAdd,
  onEdit,
  onToggleSkip,
  onDelete,
  onClose,
}: Props) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(24,35,29,0.45)', justifyContent: 'flex-end' }}>
        <Pressable style={{ flex: 1 }} onPress={onClose} accessibilityLabel="Close" />
        <View
          style={{
            backgroundColor: '#FFFFFF',
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            maxHeight: '80%',
            paddingBottom: 24,
          }}
        >
          {/* Header */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: 20,
              paddingBottom: 12,
              borderBottomWidth: 1,
              borderBottomColor: C.border,
            }}
          >
            <View>
              <Typography style={{ fontSize: 16, fontWeight: '700', color: C.text }}>
                {formatDayLong(dateKey)}
              </Typography>
              <Typography style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>
                {entries.length === 0
                  ? 'No trips scheduled for this day'
                  : `${entries.length} trip${entries.length > 1 ? 's' : ''} scheduled`}
              </Typography>
            </View>

            <Pressable onPress={onClose} hitSlop={10} style={{ padding: 4 }}>
              <X size={22} color={C.muted} />
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={{ padding: 20 }}>
            {entries.length === 0 ? (
              <View style={{ alignItems: 'center', paddingVertical: 20 }}>
                <Typography style={{ color: C.muted, marginBottom: 14 }}>
                  No planned commute for this date.
                </Typography>
                <Button
                  title="＋ Plan trip for this day"
                  size="sm"
                  onPress={() => {
                    onClose();
                    onAdd();
                  }}
                />
              </View>
            ) : (
              entries.map(({ trip, skipped }, i) => (
                <View
                  key={trip.id}
                  style={{
                    paddingVertical: 12,
                    borderTopWidth: i === 0 ? 0 : 1,
                    borderTopColor: C.border,
                    opacity: skipped ? 0.6 : 1,
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{ width: 84 }}>
                      <Typography style={{ fontWeight: '700', color: C.primaryDark, fontSize: 14 }}>
                        {formatTime(trip.time)}
                      </Typography>
                      {trip.returnTime && (
                        <Typography style={{ fontSize: 11, color: C.muted }}>↩ {formatTime(trip.returnTime)}</Typography>
                      )}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Typography
                        style={{
                          fontSize: 15,
                          fontWeight: '700',
                          color: C.text,
                          textDecorationLine: skipped ? 'line-through' : 'none',
                        }}
                      >
                        {trip.from} ↔ {trip.to}
                      </Typography>
                      <Typography style={{ fontSize: 11, color: C.muted }}>
                        {skipped ? 'Skipped for this day' : describeRepeat(trip)}
                      </Typography>
                    </View>
                  </View>

                  <View style={{ flexDirection: 'row', marginTop: 8, paddingLeft: 84, gap: 16 }}>
                    <Pressable
                      onPress={() => {
                        onClose();
                        onEdit(trip);
                      }}
                      style={{ flexDirection: 'row', alignItems: 'center' }}
                    >
                      <Pencil size={13} color={C.muted} style={{ marginRight: 4 }} />
                      <Typography style={{ fontSize: 12, color: C.muted, fontWeight: '600' }}>Edit</Typography>
                    </Pressable>

                    {trip.repeat !== 'once' && (
                      <Pressable
                        onPress={() => onToggleSkip(trip)}
                        style={{ flexDirection: 'row', alignItems: 'center' }}
                      >
                        {skipped ? (
                          <RotateCcw size={13} color={C.primary} style={{ marginRight: 4 }} />
                        ) : (
                          <EyeOff size={13} color={C.muted} style={{ marginRight: 4 }} />
                        )}
                        <Typography style={{ fontSize: 12, color: skipped ? C.primary : C.muted, fontWeight: '600' }}>
                          {skipped ? 'Restore' : 'Skip day'}
                        </Typography>
                      </Pressable>
                    )}

                    <Pressable
                      onPress={() => {
                        onClose();
                        onDelete(trip);
                      }}
                      style={{ flexDirection: 'row', alignItems: 'center' }}
                    >
                      <Trash2 size={13} color={C.danger} style={{ marginRight: 4 }} />
                      <Typography style={{ fontSize: 12, color: C.danger, fontWeight: '600' }}>Delete</Typography>
                    </Pressable>
                  </View>
                </View>
              ))
            )}

            {entries.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                title="＋ Add another trip on this day"
                onPress={() => {
                  onClose();
                  onAdd();
                }}
                style={{ marginTop: 14 }}
              />
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
