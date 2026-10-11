import React, { useMemo } from 'react';
import { Pressable, View } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { Typography } from '../ui/Typography';
import { MONTH_NAMES, monthGrid, todayKey, WEEKDAY_SHORT, WEEK_ORDER } from '../../lib/planner/dates';
import { C, cardStyle } from './theme';

interface Props {
  year: number;
  month: number; // 0-based
  selectedKey: string;
  /** date key -> number of active trips that day */
  counts: Record<string, number>;
  onSelect: (key: string) => void;
  onPrev: () => void;
  onNext: () => void;
  onTitlePress: () => void;
}

export function MonthCalendar({
  year,
  month,
  selectedKey,
  counts,
  onSelect,
  onPrev,
  onNext,
  onTitlePress,
}: Props) {
  const weeks = useMemo(() => monthGrid(year, month), [year, month]);
  const today = todayKey();

  return (
    <View style={cardStyle}>
      {/* Month & navigation header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <Pressable
          onPress={onTitlePress}
          accessibilityRole="button"
          accessibilityLabel="Choose month and year"
          hitSlop={8}
          style={{ flexDirection: 'row', alignItems: 'center' }}
        >
          <Typography style={{ fontSize: 16, fontWeight: '700', color: C.text }}>
            {MONTH_NAMES[month]} {year}
          </Typography>
        </Pressable>

        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Pressable
            onPress={onPrev}
            accessibilityLabel="Previous month"
            hitSlop={8}
            style={{ padding: 6, marginRight: 2 }}
          >
            <ChevronLeft size={20} color={C.muted} />
          </Pressable>
          <Pressable
            onPress={onNext}
            accessibilityLabel="Next month"
            hitSlop={8}
            style={{ padding: 6 }}
          >
            <ChevronRight size={20} color={C.muted} />
          </Pressable>
        </View>
      </View>

      {/* Weekday column labels (Mon .. Sun) */}
      <View style={{ flexDirection: 'row', marginBottom: 6 }}>
        {WEEK_ORDER.map((d) => (
          <View key={d} style={{ width: `${100 / 7}%`, alignItems: 'center', paddingVertical: 4 }}>
            <Typography style={{ color: C.subtle, fontSize: 13, fontWeight: '500' }}>
              {WEEKDAY_SHORT[d]}
            </Typography>
          </View>
        ))}
      </View>

      {/* Weeks grid */}
      {weeks.map((week, wi) => (
        <View key={wi} style={{ flexDirection: 'row', marginBottom: 4 }}>
          {week.map((cell) => {
            const hasCommute = cell.inMonth && (counts[cell.key] ?? 0) > 0;
            const isSelected = cell.key === selectedKey;
            const isToday = cell.key === today;

            return (
              <View key={cell.key} style={{ width: `${100 / 7}%`, alignItems: 'center', paddingVertical: 2 }}>
                <Pressable
                  onPress={() => onSelect(cell.key)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                  accessibilityLabel={`${cell.d} ${MONTH_NAMES[month]}${hasCommute ? ', commute day' : ''}`}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: hasCommute ? C.commuteCircle : 'transparent',
                    borderWidth: isSelected ? 2 : isToday && !hasCommute ? 1.5 : 0,
                    borderColor: isSelected ? C.darkGreen : isToday ? C.primary : 'transparent',
                  }}
                >
                  <Typography
                    style={{
                      fontSize: 14,
                      fontWeight: hasCommute || isSelected ? '600' : '400',
                      color: !cell.inMonth
                        ? '#B8C5BD'
                        : hasCommute
                        ? '#143825'
                        : isSelected
                        ? C.darkGreen
                        : C.text,
                    }}
                  >
                    {cell.d}
                  </Typography>
                </Pressable>
              </View>
            );
          })}
        </View>
      ))}

      {/* Legend */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12 }}>
        <View
          style={{
            width: 10,
            height: 10,
            borderRadius: 5,
            backgroundColor: '#1E7D4E',
            marginRight: 8,
          }}
        />
        <Typography style={{ color: '#3C5045', fontSize: 12, fontWeight: '500' }}>
          Commute days (recurring)
        </Typography>
      </View>
    </View>
  );
}
