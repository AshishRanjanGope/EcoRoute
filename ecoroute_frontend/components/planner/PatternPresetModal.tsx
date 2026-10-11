import React from 'react';
import { Modal, Pressable, View } from 'react-native';
import { Check, X } from 'lucide-react-native';
import { Typography } from '../ui/Typography';
import { C } from './theme';

interface Props {
  visible: boolean;
  activeDays: number[];
  onSelectPreset: (days: number[]) => void;
  onClose: () => void;
}

const PRESETS = [
  { label: 'Standard Weekdays (Mon – Fri)', days: [1, 2, 3, 4, 5], desc: '5 workdays · Sat & Sun off' },
  { label: '6-Day Workweek (Mon – Sat)', days: [1, 2, 3, 4, 5, 6], desc: '6 workdays · Sun off' },
  { label: 'Every Day (Mon – Sun)', days: [1, 2, 3, 4, 5, 6, 0], desc: 'Daily commute all 7 days' },
  { label: 'Weekends Only (Sat – Sun)', days: [6, 0], desc: 'Weekend recurring commute' },
];

export function PatternPresetModal({ visible, activeDays, onSelectPreset, onClose }: Props) {
  const isMatch = (days: number[]) =>
    days.length === activeDays.length && days.every((d) => activeDays.includes(d));

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(24,35,29,0.4)', justifyContent: 'flex-end' }}>
        <Pressable style={{ flex: 1 }} onPress={onClose} accessibilityLabel="Close" />
        <View
          style={{
            backgroundColor: '#FFFFFF',
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            padding: 20,
            paddingBottom: 32,
          }}
        >
          {/* Header */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <Typography style={{ fontSize: 16, fontWeight: '700', color: C.text }}>
              Commute Pattern Presets
            </Typography>
            <Pressable onPress={onClose} hitSlop={10} style={{ padding: 4 }}>
              <X size={20} color={C.muted} />
            </Pressable>
          </View>

          {/* Preset list */}
          {PRESETS.map((p) => {
            const active = isMatch(p.days);
            return (
              <Pressable
                key={p.label}
                onPress={() => {
                  onSelectPreset(p.days);
                  onClose();
                }}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingVertical: 14,
                  borderTopWidth: 1,
                  borderTopColor: C.border,
                }}
              >
                <View style={{ flex: 1 }}>
                  <Typography style={{ fontSize: 15, fontWeight: active ? '700' : '500', color: active ? C.primary : C.text }}>
                    {p.label}
                  </Typography>
                  <Typography style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>
                    {p.desc}
                  </Typography>
                </View>
                {active && <Check size={18} color={C.primary} />}
              </Pressable>
            );
          })}
        </View>
      </View>
    </Modal>
  );
}
