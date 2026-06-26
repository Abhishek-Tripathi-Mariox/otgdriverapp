import React from 'react';
import { View, Text, Pressable } from 'react-native';
import {
  HomeTabIcon,
  OrdersTabIcon,
  EarningsTabIcon,
  ProfileTabIcon,
} from './DashboardIcons';

export type NavTab = 'Home' | 'Orders' | 'Earnings' | 'Profile';

type Props = {
  active: NavTab;
  onChange?: (tab: NavTab) => void;
};

const ACTIVE = '#FFE403';
const INACTIVE = '#757575';

const TABS: {
  key: NavTab;
  Icon: React.FC<{ size?: number; color?: string }>;
}[] = [
  { key: 'Home', Icon: HomeTabIcon },
  { key: 'Orders', Icon: OrdersTabIcon },
  { key: 'Earnings', Icon: EarningsTabIcon },
  { key: 'Profile', Icon: ProfileTabIcon },
];

const BottomNavBar: React.FC<Props> = ({ active, onChange }) => (
  <View
    style={{
      flexDirection: 'row',
      height: 69.987,
      backgroundColor: '#FFFFFF',
      borderTopLeftRadius: 12,
      borderTopRightRadius: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.1,
      shadowRadius: 10,
      elevation: 10,
    }}>
    {TABS.map(({ key, Icon }) => {
      const isActive = key === active;
      const color = isActive ? ACTIVE : INACTIVE;
      return (
        <Pressable
          key={key}
          onPress={() => onChange?.(key)}
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            gap: 3.993,
          }}>
          <Icon size={27.987} color={color} />
          <Text
            className="font-poppins-medium"
            style={{
              color,
              fontSize: isActive ? 14 : 12,
              lineHeight: isActive ? 21 : 18,
              textAlign: 'center',
            }}>
            {key}
          </Text>
        </Pressable>
      );
    })}
  </View>
);

export default BottomNavBar;
