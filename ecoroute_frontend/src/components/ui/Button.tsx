import React from 'react';
import { TouchableOpacity, TouchableOpacityProps, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { cn } from '../../lib/utils';
import { Typography } from './Typography';

interface ButtonProps extends TouchableOpacityProps {
  variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  loading?: boolean;
  title?: string;
  icon?: React.ReactNode;
  className?: string;
  textClassName?: string;
}

export function Button({ 
  className, 
  variant = 'default', 
  size = 'default', 
  title, 
  icon,
  loading, 
  disabled, 
  style,
  textClassName,
  children,
  ...props 
}: ButtonProps) {
  const baseClasses = 'flex-row items-center justify-center rounded-xl';
  
  const variants = {
    default: 'bg-primary',
    secondary: 'bg-secondary',
    outline: 'border border-input bg-card',
    ghost: '',
    destructive: 'bg-destructive'
  };

  const sizes = {
    default: 'h-12 px-6',
    sm: 'h-9 px-4',
    lg: 'h-14 px-8',
    icon: 'h-10 w-10 p-0'
  };

  const textColors = {
    default: 'text-white font-nunito-semibold text-base',
    secondary: 'text-white font-nunito-semibold text-base',
    outline: 'text-foreground font-nunito-medium text-base',
    ghost: 'text-foreground font-nunito-medium text-base',
    destructive: 'text-white font-nunito-semibold text-base'
  };

  const variantStyles: Record<string, ViewStyle> = {
    default: { backgroundColor: '#218653' },
    secondary: { backgroundColor: '#69766E' },
    outline: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E4EAE5' },
    ghost: { backgroundColor: 'transparent' },
    destructive: { backgroundColor: '#C94C4C' }
  };

  const sizeStyles: Record<string, ViewStyle> = {
    default: { minHeight: 48, paddingHorizontal: 20, borderRadius: 12 },
    sm: { minHeight: 36, paddingHorizontal: 12, borderRadius: 8 },
    lg: { minHeight: 56, paddingHorizontal: 28, borderRadius: 14 },
    icon: { width: 40, height: 40, paddingHorizontal: 0, borderRadius: 10 }
  };

  const textDefaultStyles: Record<string, TextStyle> = {
    default: { color: '#FFFFFF', fontWeight: '600' },
    secondary: { color: '#FFFFFF', fontWeight: '600' },
    outline: { color: '#18231D', fontWeight: '500' },
    ghost: { color: '#18231D', fontWeight: '500' },
    destructive: { color: '#FFFFFF', fontWeight: '600' }
  };

  return (
    <TouchableOpacity 
      style={[
        { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
        variantStyles[variant],
        sizeStyles[size],
        disabled ? { opacity: 0.5 } : null,
        style as ViewStyle
      ]}
      className={cn(baseClasses, variants[variant], sizes[size], disabled && 'opacity-50', className)}
      disabled={disabled || loading}
      activeOpacity={0.8}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' || variant === 'ghost' ? '#218653' : '#FFFFFF'} />
      ) : (
        <>
          {icon}
          {title ? (
            <Typography 
              style={textDefaultStyles[variant]}
              className={cn(textColors[variant], textClassName)}
            >
              {title}
            </Typography>
          ) : children}
        </>
      )}
    </TouchableOpacity>
  );
}
