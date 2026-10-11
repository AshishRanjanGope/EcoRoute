import React, { useEffect, useState } from 'react';
import { Modal, Pressable, View } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { Typography } from '../ui/Typography';
import { Button } from '../ui/Button';
import { MONTH_SHORT } from '../../lib/planner/dates';
import { C } from './theme';

interface Props {
  visible: boolean;
  year: number;
  month: number;
  onPick: (year: number, month: number) => void;
  onClose: () => void;
}

/** Jump to any month of any year without tapping the arrows dozens of times. */
export function MonthYearPicker({ visible, year, month, onPick, onClose }: Props) {
  const [y, setY] = useState(year);
  useEffect(() => {
    if (visible) setY(year);
  }, [visible, year]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        onPress={onClose}
        style={{ flex: 1, backgroundColor: 'rgba(24,35,29,0.45)', justifyContent: 'center', padding: 24 }}
      >
        <Pressable
          onPress={() => {}}
          style={{ backgroundColor: C.card, borderRadius: 20, padding: 18 }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <Pressable onPress={() => setY(y - 1)} hitSlop={10} accessibilityLabel="Previous year" style={{ padding: 6 }}>
              <ChevronLeft size={24} color={C.text} />
            </Pressable>
            <Typography variant="h3">{y}</Typography>
            <Pressable onPress={() => setY(y + 1)} hitSlop={10} accessibilityLabel="Next year" style={{ padding: 6 }}>
              <ChevronRight size={24} color={C.text} />
            </Pressable>
          </View>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {MONTH_SHORT.map((label, i) => {
              const active = y === year && i === month;
              return (
                <View key={label} style={{ width: '25%', padding: 4 }}>
                  <Pressable
                    onPress={() => onPick(y, i)}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                    style={{
                      height: 44,
                      borderRadius: 12,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: active ? C.primary : C.tintSoft,
                    }}
                  >
                    <Typography style={{ color: active ? '#fff' : C.text, fontWeight: '600' }}>{label}</Typography>
                  </Pressable>
                </View>
              );
            })}
          </View>

          <Button variant="ghost" title="Cancel" onPress={onClose} style={{ marginTop: 8 }} />
        </Pressable>
      </Pressable>
    </Modal>
  );
}
