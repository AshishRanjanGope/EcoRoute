import React from 'react';
import { StyleProp, TextStyle } from 'react-native';
import { Typography } from './Typography';

interface EcoRouteBrandProps {
  style?: StyleProp<TextStyle>;
  variant?: 'h1' | 'h2' | 'h3' | 'body';
}

/**
 * Two-tone EcoRoute Brand Text:
 * "Eco" in vibrant light green (#279A57)
 * "Route" in deep dark green (#0D4822)
 */
export function EcoRouteBrand({ style, variant = 'h2' }: EcoRouteBrandProps) {
  return (
    <Typography variant={variant} style={style}>
      <Typography variant={variant} style={{ color: '#279A57', fontWeight: '800' }}>
        Eco
      </Typography>
      <Typography variant={variant} style={{ color: '#0D4822', fontWeight: '800' }}>
        Route
      </Typography>
    </Typography>
  );
}
