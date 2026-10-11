import React from 'react';
import { Pressable, ViewStyle } from 'react-native';
import { Typography } from '../ui/Typography';
import { C } from './theme';

interface Props {
  label: string;
  selected: boolean;
  onPress: () => void;
  style?: ViewStyle;
  /** 'check' renders the leading ✓ so the selected state isn't colour-only. */
  check?: boolean;
}

export function Chip({ label, selected, onPress, style, check = true }: Props) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 14,
          minHeight: 38,
          borderRadius: 19,
          borderWidth: 1,
          borderColor: selected ? C.primary : C.border,
          backgroundColor: selected ? C.tint : C.card,
        },
        style,
      ]}
    >
      <Typography
        style={{ color: selected ? C.primaryDark : C.text, fontWeight: selected ? '700' : '500', fontSize: 13 }}
      >
        {check && selected ? '✓ ' : ''}
        {label}
      </Typography>
    </Pressable>
  );
}
