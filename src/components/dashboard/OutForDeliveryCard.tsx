import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { TruckIcon } from '../DashboardIcons';

type Props = {
  orderId: string;
  pickup: string;
  drop: string;
  onViewOrder?: () => void;
};

const OutForDeliveryCard: React.FC<Props> = ({
  orderId,
  pickup,
  drop,
  onViewOrder,
}) => (
  <View
    style={{
      backgroundColor: '#FFFFFF',
      borderWidth: 1.162,
      borderColor: '#FFE403',
      borderRadius: 12,
      padding: 12,
      gap: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.14,
      shadowRadius: 5,
      elevation: 3,
    }}>
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      <View
        style={{
          width: 39.985,
          height: 39.985,
          borderRadius: 19.992,
          backgroundColor: '#FFE403',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <TruckIcon size={23.994} color="#404040" />
      </View>
      <View style={{ flex: 1 }}>
        <Text
          className="font-poppins-regular"
          style={{ color: '#757575', fontSize: 14, lineHeight: 20 }}>
          Order #{orderId}
        </Text>
        <Text
          className="font-poppins-semibold"
          style={{ color: '#404040', fontSize: 18, lineHeight: 26 }}>
          Out for Delivery
        </Text>
      </View>
    </View>

    <View style={{ gap: 3.993 }}>
      <Text
        className="font-poppins-regular"
        style={{ color: '#757575', fontSize: 14, lineHeight: 20 }}>
        Pickup → Drop
      </Text>
      <Text
        className="font-poppins-medium"
        style={{ color: '#404040', fontSize: 16, lineHeight: 24 }}>
        {pickup} → {drop}
      </Text>
    </View>

    <Pressable
      onPress={onViewOrder}
      style={{
        backgroundColor: '#FFE403',
        borderRadius: 12,
        height: 52,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 3,
      }}>
      <Text
        className="font-poppins-semibold"
        style={{ color: '#404040', fontSize: 16, lineHeight: 28 }}>
        View Order
      </Text>
    </Pressable>
  </View>
);

export default OutForDeliveryCard;
