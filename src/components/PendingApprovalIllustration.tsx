import React from 'react';
import Svg, {
  Circle,
  Rect,
  Path,
  Line,
  G,
  Defs,
  LinearGradient,
  Stop,
} from 'react-native-svg';

const PendingApprovalIllustration: React.FC<{ size?: number }> = ({
  size = 220,
}) => (
  <Svg width={size} height={size} viewBox="0 0 240 240" fill="none">
    <Defs>
      <LinearGradient id="shield" x1="0" y1="0" x2="0" y2="1">
        <Stop offset="0" stopColor="#B8EDE0" />
        <Stop offset="1" stopColor="#5FBFAE" />
      </LinearGradient>
    </Defs>
    <Circle
      cx={120}
      cy={120}
      r={105}
      stroke="#C9D3E8"
      strokeWidth={1.5}
      strokeDasharray="3 5"
      fill="none"
    />
    <Circle cx={40} cy={50} r={3} fill="#FFD84D" />
    <Circle cx={200} cy={60} r={2.5} fill="#FFD84D" />
    <Circle cx={50} cy={190} r={2.5} fill="#5EC0D8" />
    <Circle cx={200} cy={180} r={3} fill="#FFD84D" />
    <Path d="M195 40 L199 44 M199 40 L195 44" stroke="#FFD84D" strokeWidth={1.5} strokeLinecap="round" />
    <Path d="M45 100 L49 104 M49 100 L45 104" stroke="#5EC0D8" strokeWidth={1.5} strokeLinecap="round" />

    <Rect x={75} y={55} width={110} height={140} rx={8} fill="#FFFFFF" stroke="#1E5A7A" strokeWidth={3} />
    <Rect x={100} y={45} width={60} height={22} rx={4} fill="#2B7EA8" />
    <Rect x={110} y={52} width={40} height={8} rx={2} fill="#FFFFFF" />

    <Path d="M90 95 L98 103 L112 88" stroke="#2B7EA8" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
    <Line x1={120} y1={95} x2={170} y2={95} stroke="#C9D3E8" strokeWidth={3} strokeLinecap="round" />

    <Path d="M90 125 L98 133 L112 118" stroke="#2B7EA8" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
    <Line x1={120} y1={125} x2={170} y2={125} stroke="#C9D3E8" strokeWidth={3} strokeLinecap="round" />

    <Line x1={90} y1={155} x2={140} y2={155} stroke="#C9D3E8" strokeWidth={3} strokeLinecap="round" />
    <Line x1={90} y1={175} x2={130} y2={175} stroke="#C9D3E8" strokeWidth={3} strokeLinecap="round" />

    <G>
      <Circle cx={70} cy={150} r={22} fill="#FFFFFF" stroke="#2B7EA8" strokeWidth={3} />
      <Circle cx={70} cy={150} r={15} fill="none" stroke="#5EC0D8" strokeWidth={2} />
      <Line x1={86} y1={166} x2={100} y2={180} stroke="#2B7EA8" strokeWidth={5} strokeLinecap="round" />
    </G>

    <G>
      <Path
        d="M155 120 L190 115 L190 150 Q190 170 172 185 Q155 170 155 150 Z"
        fill="url(#shield)"
        stroke="#1E5A7A"
        strokeWidth={3}
        strokeLinejoin="round"
      />
      <Circle cx={172} cy={148} r={14} fill="#FFF6C4" stroke="#1E5A7A" strokeWidth={2.5} />
      <Line x1={172} y1={148} x2={172} y2={140} stroke="#1E5A7A" strokeWidth={2.5} strokeLinecap="round" />
      <Line x1={172} y1={148} x2={178} y2={152} stroke="#1E5A7A" strokeWidth={2.5} strokeLinecap="round" />
    </G>
  </Svg>
);

export default PendingApprovalIllustration;
