import React from 'react';
import { TextInput, TextInputProps, View, TextStyle } from 'react-native';
import { cn } from '../../lib/utils';
import { Typography } from './Typography';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export function Input({ className, style, label, error, ...props }: InputProps) {
  return (
    <View style={{ marginBottom: 16 }}>
      {label && <Typography variant="label" style={{ marginBottom: 6 }}>{label}</Typography>}
      <TextInput 
        style={[
          {
            height: 48,
            paddingHorizontal: 16,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: error ? '#C94C4C' : '#E4EAE5',
            backgroundColor: '#FFFFFF',
            color: '#18231D',
            fontSize: 15,
          },
          style as TextStyle
        ]}
        className={cn(
          "h-12 px-4 rounded-xl border bg-card text-foreground font-nunito text-base",
          error ? "border-destructive focus:border-destructive" : "border-input focus:border-primary",
          className
        )}
        placeholderTextColor="#69766E"
        {...props}
      />
      {error && <Typography variant="caption" style={{ color: '#C94C4C', marginTop: 4 }}>{error}</Typography>}
    </View>
  );
}
