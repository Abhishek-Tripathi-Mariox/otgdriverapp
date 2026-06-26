import React from 'react';
import { View, Text, Pressable } from 'react-native';
import Svg, { Path } from 'react-native-svg';

type Props = {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  message: string;
  timeAgo: string;
  isNew?: boolean;
  onPress?: () => void;
  onDelete?: () => void;
};

const TrashIcon: React.FC<{ size?: number; color?: string }> = ({
  size = 18,
  color = '#9E9E9E',
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"
      fill={color}
    />
  </Svg>
);

const NotificationCard: React.FC<Props> = ({
  icon,
  iconBg,
  title,
  message,
  timeAgo,
  isNew = false,
  onPress,
  onDelete,
}) => (
  <Pressable
    onPress={onPress}
    disabled={!onPress}
    style={{
      backgroundColor: isNew ? '#FFF9E6' : '#FFFFFF',
      borderRadius: 12,
      borderWidth: isNew ? 1.162 : 0,
      borderColor: '#FFE403',
      padding: isNew ? 21.145 : 19.983,
      flexDirection: 'row',
      gap: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.14,
      shadowRadius: 5,
      elevation: 2,
    }}>
    <View
      style={{
        width: 47.989,
        height: 47.989,
        borderRadius: 23.994,
        backgroundColor: iconBg,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      {icon}
    </View>
    <View style={{ flex: 1, gap: 3.993 }}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}>
        <Text
          className="font-poppins-bold"
          style={{ color: '#404040', fontSize: 16, lineHeight: 25.6, flex: 1 }}>
          {title}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          {isNew && (
            <View
              style={{
                width: 7.986,
                height: 7.986,
                borderRadius: 3.993,
                backgroundColor: '#F44336',
                marginTop: 9,
              }}
            />
          )}
          {onDelete && (
            <Pressable
              onPress={onDelete}
              hitSlop={8}
              style={{
                width: 28,
                height: 28,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <TrashIcon size={18} color="#9E9E9E" />
            </Pressable>
          )}
        </View>
      </View>
      <Text
        className="font-poppins-regular"
        style={{ color: '#757575', fontSize: 14, lineHeight: 20 }}>
        {message}
      </Text>
      <Text
        className="font-poppins-regular"
        style={{ color: '#9E9E9E', fontSize: 12, lineHeight: 20, marginTop: 8 }}>
        {timeAgo}
      </Text>
    </View>
  </Pressable>
);

export default NotificationCard;
