import React from 'react';
import { View, Text } from 'react-native';

export type OrderStatus = 'in_progress' | 'delivered' | 'rejected';

const STYLES: Record<OrderStatus, { bg: string; fg: string; label: string }> = {
  in_progress: { bg: '#FFF3E0', fg: '#E48714', label: 'In Progress' },
  delivered: { bg: '#E8F5E9', fg: '#4CAF50', label: 'Delivered' },
  rejected: { bg: '#FFEBEE', fg: '#F44336', label: 'Rejected' },
};

const OrderStatusChip: React.FC<{ status: OrderStatus }> = ({ status }) => {
  const s = STYLES[status];
  return (
    <View
      style={{
        backgroundColor: s.bg,
        borderRadius: 999,
        paddingHorizontal: 11.98,
        paddingVertical: 3.993,
      }}>
      <Text
        className="font-poppins-semibold"
        style={{ color: s.fg, fontSize: 12, lineHeight: 19.92 }}>
        {s.label}
      </Text>
    </View>
  );
};

export default OrderStatusChip;
