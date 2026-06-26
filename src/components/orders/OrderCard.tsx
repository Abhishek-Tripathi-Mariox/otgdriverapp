import React from 'react';
import { View, Text, Pressable } from 'react-native';
import OrderStatusChip, { OrderStatus } from './OrderStatusChip';

export type OrderCardData = {
  id: string;
  status: OrderStatus;
  pickup: string;
  drop: string;
  date: string;
  earnings: string;
};

type Props = OrderCardData & { onPress?: () => void };

const OrderCard: React.FC<Props> = ({ id, status, pickup, drop, date, earnings, onPress }) => {
  const earningsColor =
    status === 'delivered' ? '#4CAF50' : status === 'rejected' ? '#F44336' : '#E48714';
  return (
    <Pressable
      onPress={onPress}
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 12,
        gap: 9,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.14,
        shadowRadius: 5,
        elevation: 2,
      }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text
          className="font-poppins-bold"
          style={{ color: '#404040', fontSize: 18, lineHeight: 26 }}>
          #{id}
        </Text>
        <OrderStatusChip status={status} />
      </View>

      <View style={{ gap: 7.99 }}>
        <View style={{ flexDirection: 'row', gap: 7.99 }}>
          <View
            style={{
              width: 11.98,
              height: 11.98,
              borderRadius: 5.99,
              backgroundColor: '#2196F3',
              marginTop: 6,
            }}
          />
          <View style={{ flex: 1, gap: 1.997 }}>
            <Text
              className="font-poppins-regular"
              style={{ color: '#757575', fontSize: 12, lineHeight: 19.92 }}>
              Pickup
            </Text>
            <Text
              className="font-poppins-semibold"
              style={{ color: '#404040', fontSize: 14, lineHeight: 22.4 }}>
              {pickup}
            </Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', gap: 7.99 }}>
          <View
            style={{
              width: 11.98,
              height: 11.98,
              borderRadius: 5.99,
              backgroundColor: '#E48714',
              marginTop: 6,
            }}
          />
          <View style={{ flex: 1, gap: 1.997 }}>
            <Text
              className="font-poppins-regular"
              style={{ color: '#757575', fontSize: 12, lineHeight: 19.92 }}>
              Drop
            </Text>
            <Text
              className="font-poppins-semibold"
              style={{ color: '#404040', fontSize: 14, lineHeight: 22.4 }}>
              {drop}
            </Text>
          </View>
        </View>
      </View>

      <View style={{ height: 1, backgroundColor: '#EEEEEE' }} />

      <View
        style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text
          className="font-poppins-regular"
          style={{ color: '#757575', fontSize: 12, lineHeight: 19.92 }}>
          {date}
        </Text>
        <Text
          className="font-poppins-bold"
          style={{ color: earningsColor, fontSize: 18, lineHeight: 26 }}>
          {earnings}
        </Text>
      </View>
    </Pressable>
  );
};

export default OrderCard;
