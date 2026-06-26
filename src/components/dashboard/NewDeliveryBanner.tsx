import React from 'react';
import { View, Text, Pressable } from 'react-native';

type Props = {
  onPress?: () => void;
};

const NewDeliveryBanner: React.FC<Props> = ({ onPress }) => (
  <Pressable
    onPress={onPress}
    style={{
      backgroundColor: '#4caf50',
      borderRadius: 12,
      height: 55.993,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
      elevation: 3,
    }}>
    <Text
      className="font-poppins-semibold"
      style={{
        color: '#FFFFFF',
        fontSize: 18,
        lineHeight: 24,
        textAlign: 'center',
      }}>
      🔔 New Delivery Request Available
    </Text>
  </Pressable>
);

export default NewDeliveryBanner;
