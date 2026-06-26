import React from 'react';
import { View, Text, Pressable } from 'react-native';

export type OrdersTab = 'Active' | 'Completed' | 'Rejected';

const TABS: OrdersTab[] = ['Active', 'Completed', 'Rejected'];

type Props = {
  active: OrdersTab;
  onChange: (tab: OrdersTab) => void;
};

const OrdersTabBar: React.FC<Props> = ({ active, onChange }) => (
  <View
    style={{
      flexDirection: 'row',
      backgroundColor: '#FFFFFF',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 2,
    }}>
    {TABS.map(tab => {
      const isActive = tab === active;
      return (
        <Pressable
          key={tab}
          onPress={() => onChange(tab)}
          style={{
            flex: 1,
            height: 47.995,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Text
            className={isActive ? 'font-poppins-semibold' : 'font-poppins-medium'}
            style={{
              color: isActive ? '#404040' : '#757575',
              fontSize: 14,
              lineHeight: 22.4,
            }}>
            {tab}
          </Text>
          {isActive && (
            <View
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: 3.993,
                backgroundColor: '#FFE403',
              }}
            />
          )}
        </Pressable>
      );
    })}
  </View>
);

export default OrdersTabBar;
