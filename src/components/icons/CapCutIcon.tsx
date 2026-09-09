import React from 'react';
import Svg, { Path, Rect, G } from 'react-native-svg';

interface CapCutIconProps {
  size?: number;
  color?: string;
}

/**
 * High-precision vector icon for the CapCut Video Editor logo
 */
export const CapCutIcon: React.FC<CapCutIconProps> = ({
  size = 18,
  color = '#FFFFFF',
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Top trapezoid cut */}
      <Path
        d="M3 5.5L10 9.5V14.5L3 10.5V5.5Z"
        fill={color}
      />
      {/* Bottom intersecting trapezoid cut */}
      <Path
        d="M21 18.5L14 14.5V9.5L21 13.5V18.5Z"
        fill={color}
      />
      {/* Central horizontal crossing bars */}
      <Path
        d="M10 9.5L21 5.5V10.5L14 14.5L10 9.5Z"
        fill={color}
        fillOpacity={0.85}
      />
      <Path
        d="M14 14.5L3 18.5V13.5L10 9.5L14 14.5Z"
        fill={color}
        fillOpacity={0.85}
      />
    </Svg>
  );
};
