import React from 'react';
import { Text, TextProps } from 'react-native';
import { cn } from '../../lib/utils';

export function Typography({ className, style, variant = 'body', ...props }: TextProps & { variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'label' | 'caption' }) {
  const variants = {
    h1: 'text-3xl font-nunito-bold text-foreground',
    h2: 'text-2xl font-nunito-bold text-foreground',
    h3: 'text-xl font-nunito-semibold text-foreground',
    h4: 'text-base font-nunito-semibold text-foreground',
    body: 'text-sm font-nunito text-foreground',
    label: 'text-xs font-nunito-medium text-secondary',
    caption: 'text-xs font-nunito text-muted'
  };

  const defaultStyles = {
    h1: { fontSize: 30, fontWeight: '700' as const, color: '#18231D' },
    h2: { fontSize: 24, fontWeight: '700' as const, color: '#18231D' },
    h3: { fontSize: 20, fontWeight: '600' as const, color: '#18231D' },
    h4: { fontSize: 16, fontWeight: '600' as const, color: '#18231D' },
    body: { fontSize: 14, fontWeight: '400' as const, color: '#18231D' },
    label: { fontSize: 12, fontWeight: '500' as const, color: '#69766E' },
    caption: { fontSize: 11, fontWeight: '400' as const, color: '#69766E' }
  };

  return <Text style={[defaultStyles[variant], style]} className={cn(variants[variant], className)} {...props} />;
}
