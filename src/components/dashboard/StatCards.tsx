import React from 'react';
import { View, Text } from 'react-native';
import {
  CheckCircleIcon,
  TruckIcon,
  WalletIcon,
} from '../DashboardIcons';

type StatProps = {
  icon: React.ReactNode;
  value: string;
  label: string;
};

const cardStyle = {
  flex: 1,
  height: 139.973,
  backgroundColor: '#FFFFFF',
  borderRadius: 12,
  paddingTop: 12,
  alignItems: 'center' as const,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.14,
  shadowRadius: 2,
  elevation: 2,
};

const StatCard: React.FC<StatProps> = ({ icon, value, label }) => (
  <View style={cardStyle}>
    <View style={{ width: 31.999, height: 31.999, alignItems: 'center', justifyContent: 'center' }}>
      {icon}
    </View>
    <Text
      className="font-poppins-bold"
      style={{
        color: '#404040',
        fontSize: 18,
        lineHeight: 26,
        textAlign: 'center',
        marginTop: 7.98,
      }}>
      {value}
    </Text>
    <Text
      className="font-poppins-regular"
      style={{
        color: '#757575',
        fontSize: 12,
        lineHeight: 20,
        textAlign: 'center',
        marginTop: 7.48,
      }}>
      {label}
    </Text>
  </View>
);

type Props = {
  completed: number;
  active: number;
  today: string;
};

const StatCards: React.FC<Props> = ({ completed, active, today }) => (
  <View style={{ flexDirection: 'row', gap: 12 }}>
    <StatCard
      icon={<CheckCircleIcon size={31.999} />}
      value={String(completed)}
      label="Completed"
    />
    <StatCard
      icon={<TruckIcon size={31.999} color="#E48714" />}
      value={String(active)}
      label="Active"
    />
    <StatCard
      icon={<WalletIcon size={31.999} color="#FFE403" />}
      value={today}
      label="Today"
    />
  </View>
);

export default StatCards;
