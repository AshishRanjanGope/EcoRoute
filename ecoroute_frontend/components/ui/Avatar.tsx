import React from 'react';
import { View, Image, StyleSheet, ViewStyle } from 'react-native';
import { User } from 'lucide-react-native';

export interface AvatarProps {
  uri?: string | null;
  size?: number;
  style?: ViewStyle;
}

/**
 * Account / Profile picture component.
 * Displays user's profile image if present; otherwise renders a stylish default
 * circular badge with a soft-green background and green user silhouette for guest/empty profiles.
 */
export function Avatar({ uri, size = 40, style }: AvatarProps) {
  if (uri) {
    return (
      <View
        style={[
          styles.outerCircle,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            overflow: 'hidden',
          },
          style,
        ]}
      >
        <Image
          source={{ uri }}
          style={{ width: size, height: size, borderRadius: size / 2 }}
          resizeMode="cover"
        />
      </View>
    );
  }

  const innerSize = Math.round(size * 0.72);
  const iconSize = Math.round(size * 0.44);

  return (
    <View
      style={[
        styles.outerCircle,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
        style,
      ]}
    >
      <View
        style={[
          styles.innerCircle,
          {
            width: innerSize,
            height: innerSize,
            borderRadius: innerSize / 2,
          },
        ]}
      >
        <User size={iconSize} color="#0D4822" fill="#0D4822" strokeWidth={1} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerCircle: {
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E8EFEA',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  innerCircle: {
    backgroundColor: '#E8F5ED',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
