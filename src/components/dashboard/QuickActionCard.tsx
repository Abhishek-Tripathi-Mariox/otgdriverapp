import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { ChevronRightIcon } from '../DashboardIcons';

type Props = {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  subtitle?: string;
  onPress?: () => void;
};

const QuickActionCard: React.FC<Props> = ({
  icon,
  iconBg,
  title,
  subtitle,
  onPress,
}) => (
  <Pressable
    onPress={onPress}
    style={{
      backgroundColor: '#FFFFFF',
      borderRadius: 12,
      height: subtitle ? 88.01 : 79.969,
      paddingHorizontal: 13,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.14,
      shadowRadius: 5,
      elevation: 2,
    }}>
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
      <View
        style={{
          width: 39.985,
          height: 39.985,
          borderRadius: 19.992,
          backgroundColor: iconBg,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        {icon}
      </View>
      <View style={{ flex: 1 }}>
        <Text
          className="font-poppins-semibold"
          style={{ color: '#404040', fontSize: 16, lineHeight: 24 }}>
          {title}
        </Text>
        {subtitle && (
          <Text
            className="font-poppins-regular"
            style={{ color: '#757575', fontSize: 12, lineHeight: 20, marginTop: 3 }}>
            {subtitle}
          </Text>
        )}
      </View>
    </View>
    <ChevronRightIcon size={23.994} color="#757575" />
  </Pressable>
);

export default QuickActionCard;
