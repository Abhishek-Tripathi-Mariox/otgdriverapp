import React from 'react';
import Svg, { Circle, Path, Line } from 'react-native-svg';

type Props = {
  size?: number;
};

const Logo: React.FC<Props> = ({ size = 52 }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <Circle
        cx="32"
        cy="32"
        r="22"
        stroke="#404040"
        strokeWidth="3"
        fill="none"
      />
      <Path d="M10 32 A22 22 0 0 1 54 32 Z" fill="#FDE200" />
      <Line
        x1="32"
        y1="10"
        x2="32"
        y2="32"
        stroke="#404040"
        strokeWidth="3"
      />
      <Path
        d="M14 42 L10 32 L18 34"
        stroke="#404040"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
};

export default Logo;
