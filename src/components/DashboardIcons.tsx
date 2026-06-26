import React from 'react';
import Svg, { Circle, Path, Rect, Line, Polyline } from 'react-native-svg';

type Props = { size?: number; color?: string };

export const BellIcon: React.FC<Props> = ({ size = 24, color = '#404040' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 22a2.5 2.5 0 0 0 2.5-2.5h-5A2.5 2.5 0 0 0 12 22zm7-6v-5a7 7 0 0 0-5-6.71V4a2 2 0 1 0-4 0v.29A7 7 0 0 0 5 11v5l-2 2v1h18v-1l-2-2z"
      fill={color}
    />
  </Svg>
);

export const CheckCircleIcon: React.FC<Props> = ({ size = 32 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx={12} cy={12} r={11} fill="#4caf50" />
    <Path
      d="M7 12.5 L10.5 16 L17 9"
      stroke="#FFFFFF"
      strokeWidth={2.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </Svg>
);

export const TruckIcon: React.FC<Props> = ({ size = 32, color = '#E48714' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M20 8h-3V6a2 2 0 0 0-2-2H3a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h1a3 3 0 0 0 6 0h4a3 3 0 0 0 6 0h3v-5l-3-4zM7 17.5A1.5 1.5 0 1 1 7 14.5a1.5 1.5 0 0 1 0 3zm10 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm0-5.5h-2V9h3l2 2v1h-3z"
      fill={color}
    />
  </Svg>
);

export const WalletIcon: React.FC<Props> = ({ size = 32, color = '#FFE403' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M21 7.5V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-1.5h-9a2.5 2.5 0 0 1 0-5H21zm-9 2a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h9v-4h-9z"
      fill={color}
    />
    <Circle cx={16} cy={13} r={1.2} fill="#404040" />
  </Svg>
);

export const HelpIcon: React.FC<Props> = ({ size = 24, color = '#FFFFFF' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx={12} cy={12} r={10} stroke={color} strokeWidth={2} fill="none" />
    <Path
      d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.8.4-1 .9-1 1.7"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      fill="none"
    />
    <Circle cx={12} cy={17} r={1} fill={color} />
  </Svg>
);

export const ShareIcon: React.FC<Props> = ({ size = 24, color = '#404040' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx={18} cy={5} r={3} fill={color} />
    <Circle cx={6} cy={12} r={3} fill={color} />
    <Circle cx={18} cy={19} r={3} fill={color} />
    <Line x1={8.5} y1={10.5} x2={15.5} y2={6.5} stroke={color} strokeWidth={2} />
    <Line x1={8.5} y1={13.5} x2={15.5} y2={17.5} stroke={color} strokeWidth={2} />
  </Svg>
);

export const ChevronRightIcon: React.FC<Props> = ({ size = 24, color = '#757575' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M9 6l6 6-6 6"
      stroke={color}
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </Svg>
);

export const HomeTabIcon: React.FC<Props> = ({ size = 28, color = '#757575' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M3 11 L12 3 L21 11 V20 A1 1 0 0 1 20 21 H14 V14 H10 V21 H4 A1 1 0 0 1 3 20 Z" fill={color} />
  </Svg>
);

export const OrdersTabIcon: React.FC<Props> = ({ size = 28, color = '#757575' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x={5} y={4} width={14} height={18} rx={2} stroke={color} strokeWidth={2} fill="none" />
    <Rect x={9} y={2} width={6} height={3} rx={1} fill={color} />
    <Line x1={8} y1={10} x2={16} y2={10} stroke={color} strokeWidth={2} strokeLinecap="round" />
    <Line x1={8} y1={14} x2={16} y2={14} stroke={color} strokeWidth={2} strokeLinecap="round" />
    <Line x1={8} y1={18} x2={13} y2={18} stroke={color} strokeWidth={2} strokeLinecap="round" />
  </Svg>
);

export const EarningsTabIcon: React.FC<Props> = ({ size = 28, color = '#757575' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x={2} y={6} width={20} height={14} rx={2} stroke={color} strokeWidth={2} fill="none" />
    <Path d="M2 10 H22" stroke={color} strokeWidth={2} />
    <Circle cx={17} cy={15} r={1.5} fill={color} />
  </Svg>
);

export const ProfileTabIcon: React.FC<Props> = ({ size = 28, color = '#757575' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx={12} cy={8} r={4} stroke={color} strokeWidth={2} fill="none" />
    <Path d="M4 21 C 4 16, 8 14, 12 14 S 20 16, 20 21" stroke={color} strokeWidth={2} strokeLinecap="round" fill="none" />
  </Svg>
);

export const ArrowLeftIcon: React.FC<Props> = ({ size = 24, color = '#404040' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M20 12H4 M10 6l-6 6 6 6"
      stroke={color}
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </Svg>
);

export const ClipboardIcon: React.FC<Props> = ({ size = 24, color = '#E48714' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x={5} y={4} width={14} height={18} rx={2} stroke={color} strokeWidth={2} fill="none" />
    <Rect x={9} y={2} width={6} height={3} rx={1} fill={color} />
    <Line x1={8} y1={10} x2={16} y2={10} stroke={color} strokeWidth={2} strokeLinecap="round" />
    <Line x1={8} y1={14} x2={16} y2={14} stroke={color} strokeWidth={2} strokeLinecap="round" />
    <Line x1={8} y1={18} x2={13} y2={18} stroke={color} strokeWidth={2} strokeLinecap="round" />
  </Svg>
);

export const PhoneFilledIcon: React.FC<Props> = ({ size = 32, color = '#FFFFFF' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M20 15.5c-1.25 0-2.45-.2-3.57-.57-.35-.12-.75-.03-1.02.24l-2.2 2.2a15.15 15.15 0 0 1-6.59-6.58l2.2-2.21c.27-.27.36-.67.24-1.02A11.36 11.36 0 0 1 8.5 4c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1 0 9.39 7.61 17 17 17 .55 0 1-.45 1-1v-3.5c0-.55-.45-1-1-1z"
      fill={color}
    />
  </Svg>
);

export const WhatsappIcon: React.FC<Props> = ({ size = 32, color = '#FFFFFF' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.4-1.48-.88-.78-1.48-1.75-1.65-2.05-.17-.3-.02-.46.13-.6.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51l-.57-.01c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.88 1.22 3.08.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.19 1.87.12.57-.09 1.76-.72 2-1.41.25-.7.25-1.29.17-1.41-.07-.12-.27-.2-.57-.35zM12.04 21.5h-.01c-1.75 0-3.46-.47-4.96-1.36l-.36-.21-3.7.97.99-3.61-.23-.37a9.9 9.9 0 0 1-1.52-5.29c0-5.47 4.45-9.92 9.92-9.92 2.65 0 5.14 1.03 7.01 2.9a9.85 9.85 0 0 1 2.91 7.02c0 5.47-4.45 9.92-9.92 9.92z"
      fill={color}
    />
  </Svg>
);

export const ChevronDownIcon: React.FC<Props> = ({ size = 24, color = '#757575' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M6 9l6 6 6-6"
      stroke={color}
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </Svg>
);

export const DocumentIcon: React.FC<Props> = ({ size = 24, color = '#2196F3' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M6 2h8l5 5v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z"
      stroke={color}
      strokeWidth={2}
      strokeLinejoin="round"
      fill="none"
    />
    <Path d="M14 2v5h5" stroke={color} strokeWidth={2} strokeLinejoin="round" fill="none" />
    <Line x1={8} y1={13} x2={15} y2={13} stroke={color} strokeWidth={2} strokeLinecap="round" />
    <Line x1={8} y1={17} x2={13} y2={17} stroke={color} strokeWidth={2} strokeLinecap="round" />
  </Svg>
);

export const MapPinIcon: React.FC<Props> = ({ size = 24, color = '#2196F3' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7z"
      fill={color}
    />
    <Circle cx={12} cy={9} r={2.5} fill="#FFFFFF" />
  </Svg>
);

export const BoxIcon: React.FC<Props> = ({ size = 24, color = '#E48714' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2 3 7v10l9 5 9-5V7l-9-5z"
      stroke={color}
      strokeWidth={2}
      strokeLinejoin="round"
      fill="none"
    />
    <Path d="M3 7l9 5 9-5" stroke={color} strokeWidth={2} strokeLinejoin="round" fill="none" />
    <Line x1={12} y1={12} x2={12} y2={22} stroke={color} strokeWidth={2} />
  </Svg>
);

export const ClockIcon: React.FC<Props> = ({ size = 24, color = '#E48714' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx={12} cy={12} r={10} stroke={color} strokeWidth={2} fill="none" />
    <Path d="M12 6v6l4 2" stroke={color} strokeWidth={2} strokeLinecap="round" fill="none" />
  </Svg>
);

export const XCircleIcon: React.FC<Props> = ({ size = 24, color = '#F44336' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx={12} cy={12} r={10} fill={color} />
    <Path d="M8 8l8 8M16 8l-8 8" stroke="#FFFFFF" strokeWidth={2.4} strokeLinecap="round" />
  </Svg>
);

export const CheckSmallIcon: React.FC<Props> = ({ size = 16, color = '#4CAF50' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M5 12l5 5L20 7" stroke={color} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </Svg>
);

export const XMarkIcon: React.FC<Props> = ({ size = 24, color = '#404040' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M6 6l12 12M18 6L6 18" stroke={color} strokeWidth={2.5} strokeLinecap="round" />
  </Svg>
);

export const EditIcon: React.FC<Props> = ({ size = 24, color = '#404040' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"
      fill={color}
    />
  </Svg>
);

export const LockIcon: React.FC<Props> = ({ size = 24, color = '#E48714' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x={4} y={10} width={16} height={11} rx={2} fill={color} />
    <Path
      d="M8 10V7a4 4 0 0 1 8 0v3"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      fill="none"
    />
    <Circle cx={12} cy={15} r={1.5} fill="#FFFFFF" />
  </Svg>
);

export const EyeIcon: React.FC<Props> = ({ size = 24, color = '#757575' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 5c-7 0-10 7-10 7s3 7 10 7 10-7 10-7-3-7-10-7z"
      stroke={color}
      strokeWidth={2}
      fill="none"
    />
    <Circle cx={12} cy={12} r={3} stroke={color} strokeWidth={2} fill="none" />
  </Svg>
);

export const EyeOffIcon: React.FC<Props> = ({ size = 24, color = '#757575' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 3l18 18"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
    />
    <Path
      d="M10.58 10.58a2 2 0 0 0 2.83 2.83"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      fill="none"
    />
    <Path
      d="M9.88 5.09A10.94 10.94 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68M6.61 6.61C3.9 8.33 2 12 2 12s3 7 10 7a10.94 10.94 0 0 0 5.39-1.41"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      fill="none"
    />
  </Svg>
);

export const ShieldIcon: React.FC<Props> = ({ size = 24, color = '#2B7FFF' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2 4 5v7c0 5 3.5 8.5 8 10 4.5-1.5 8-5 8-10V5l-8-3z"
      fill={color}
    />
    <Path
      d="M9 12l2 2 4-4"
      stroke="#FFFFFF"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </Svg>
);

export const InfoIcon: React.FC<Props> = ({ size = 24, color = '#2B7FFF' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx={12} cy={12} r={10} fill={color} />
    <Path d="M12 10v7" stroke="#FFFFFF" strokeWidth={2.4} strokeLinecap="round" />
    <Circle cx={12} cy={7.5} r={1.2} fill="#FFFFFF" />
  </Svg>
);

export const BankIcon: React.FC<Props> = ({ size = 32, color = '#FFFFFF' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 2 2 7v2h20V7L12 2z" fill={color} />
    <Rect x={4} y={10} width={2.5} height={8} fill={color} />
    <Rect x={9} y={10} width={2.5} height={8} fill={color} />
    <Rect x={12.5} y={10} width={2.5} height={8} fill={color} />
    <Rect x={17.5} y={10} width={2.5} height={8} fill={color} />
    <Rect x={2} y={19} width={20} height={2.5} rx={0.5} fill={color} />
  </Svg>
);

export const KeyIcon: React.FC<Props> = ({ size = 24, color = '#404040' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx={7} cy={15} r={4} stroke={color} strokeWidth={2} fill="none" />
    <Path d="M10 12l10-10M16 6l3 3M14 8l3 3" stroke={color} strokeWidth={2} strokeLinecap="round" />
  </Svg>
);

export const LogoutIcon: React.FC<Props> = ({ size = 24, color = '#F44336' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M10 17l-5-5 5-5M5 12h13M14 3h5a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-5"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </Svg>
);

export const TruckOutlineIcon: React.FC<Props> = ({ size = 24, color = '#E48714' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x={1} y={5} width={14} height={11} rx={1} stroke={color} strokeWidth={2} fill="none" />
    <Path d="M15 9h4l3 3v4h-7" stroke={color} strokeWidth={2} strokeLinejoin="round" fill="none" />
    <Circle cx={6} cy={18} r={2} stroke={color} strokeWidth={2} fill="none" />
    <Circle cx={18} cy={18} r={2} stroke={color} strokeWidth={2} fill="none" />
  </Svg>
);

export const UserIcon: React.FC<Props> = ({ size = 40, color = '#FFFFFF' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx={12} cy={8} r={4} fill={color} />
    <Path d="M4 21c0-5 4-7 8-7s8 2 8 7" fill={color} />
  </Svg>
);
