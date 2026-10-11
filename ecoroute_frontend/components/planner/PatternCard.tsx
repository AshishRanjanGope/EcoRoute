import React from 'react';
import { Pressable, View } from 'react-native';
import { CalendarDays, ChevronRight } from 'lucide-react-native';
import { Typography } from '../ui/Typography';
import { WEEKDAY_SHORT, WEEK_ORDER } from '../../lib/planner/dates';
import { formatPatternSummary } from '../../lib/planner/schedule';
import { C, cardStyle } from './theme';

interface Props {
  patternDays: number[];
  onToggleDay: (day: number) => void;
  onOpenPresets?: () => void;
}

export function PatternCard({ patternDays, onToggleDay, onOpenPresets }: Props) {
  return (
    <View style={cardStyle}>
      {/* Header with Calendar icon and title */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}>
        <CalendarDays size={18} color={C.text} style={{ marginRight: 8 }} />
        <Typography style={{ fontSize: 15, fontWeight: '700', color: C.text }}>
          Weekday / Weekend Pattern
        </Typography>
      </View>

      {/* 7 Day Pills (Mon .. Sun) */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 6, marginBottom: 14 }}>
        {WEEK_ORDER.map((d) => {
          const isSelected = patternDays.includes(d);
          return (
            <Pressable
              key={d}
              onPress={() => onToggleDay(d)}
              accessibilityRole="button"
              accessibilityLabel={`Toggle ${WEEKDAY_SHORT[d]}`}
              accessibilityState={{ selected: isSelected }}
              style={{
                flex: 1,
                height: 38,
                borderRadius: 10,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: isSelected ? C.pillActive : '#FFFFFF',
                borderWidth: isSelected ? 0 : 1,
                borderColor: '#E2E8E4',
              }}
            >
              <Typography
                style={{
                  fontSize: 13,
                  fontWeight: isSelected ? '700' : '500',
                  color: isSelected ? C.pillActiveText : C.muted,
                }}
              >
                {WEEKDAY_SHORT[d]}
              </Typography>
            </Pressable>
          );
        })}
      </View>

      {/* Summary Footer */}
      <Pressable
        onPress={onOpenPresets}
        accessibilityRole="button"
        accessibilityLabel="Change pattern presets"
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: 2,
        }}
      >
        <Typography style={{ fontSize: 12, color: '#6B7E73', fontWeight: '500' }}>
          {formatPatternSummary(patternDays)}
        </Typography>
        <ChevronRight size={16} color={C.subtle} />
      </Pressable>
    </View>
  );
}
