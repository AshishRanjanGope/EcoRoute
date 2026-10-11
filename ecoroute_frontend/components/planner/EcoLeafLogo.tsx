import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface Props {
  size?: number;
  color?: string;
}

export function EcoLeafLogo({ size = 30, color = '#218653' }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      {/* Left Leaf */}
      <Path
        d="M15 17C15 10 9 6 3 8C3 15 8 20 14 19L15 17Z"
        fill={color}
      />
      {/* Right Leaf */}
      <Path
        d="M17 15C17 7 24 3 30 5C30 13 25 18 18 17L17 15Z"
        fill={color}
      />
      {/* Stem */}
      <Path
        d="M14 20C15 25 17 29 19 30"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </Svg>
  );
}
