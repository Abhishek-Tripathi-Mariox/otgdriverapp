import React from 'react';
import { View, Text, Pressable, Switch } from 'react-native';
import { BellIcon } from './DashboardIcons';

type Props = {
  greeting: string;
  name: string;
  isOnline: boolean;
  onToggleOnline: (value: boolean) => void;
  notificationCount?: number;
  onPressNotifications?: () => void;
};

const DashboardHeader: React.FC<Props> = ({
  greeting,
  name,
  isOnline,
  onToggleOnline,
  notificationCount = 0,
  onPressNotifications,
}) => (
  <View
    style={{
      backgroundColor: '#FFE403',
      height: 119.972,
      paddingTop: 16,
      paddingHorizontal: 16,
      borderBottomLeftRadius: 24,
      borderBottomRightRadius: 24,
    }}>
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        height: 55.993,
      }}>
      <View style={{ gap: 3.993 }}>
        <Text
          className="font-poppins-regular"
          style={{
            color: '#404040',
            fontSize: 14,
            lineHeight: 20,
          }}>
          {greeting},
        </Text>
        <Text
          className="font-poppins-bold"
          style={{
            color: '#404040',
            fontSize: 18,
            lineHeight: 26,
          }}>
          {name}
        </Text>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <Pressable
          onPress={onPressNotifications}
          style={{ width: 39.966, height: 39.966, alignItems: 'center', justifyContent: 'center' }}>
          <BellIcon size={23.994} color="#404040" />
          {notificationCount > 0 && (
            <View
              style={{
                position: 'absolute',
                top: 0,
                right: 0,
                minWidth: 19.983,
                height: 19.983,
                borderRadius: 10,
                backgroundColor: '#F44336',
                alignItems: 'center',
                justifyContent: 'center',
                paddingHorizontal: 6,
              }}>
              <Text
                className="font-poppins-medium"
                style={{ color: '#FFFFFF', fontSize: 12, lineHeight: 12 }}>
                {notificationCount > 99 ? '99+' : notificationCount}
              </Text>
            </View>
          )}
        </Pressable>

        <Text
          className="font-poppins-semibold"
          style={{
            color: '#404040',
            fontSize: 14,
            lineHeight: 20,
            // Fixed width so "Online"/"Offline" don't change the row width and
            // shift the bell icon when toggled.
            width: 52,
            textAlign: 'right',
          }}>
          {isOnline ? 'Online' : 'Offline'}
        </Text>
        <Switch
          value={isOnline}
          onValueChange={onToggleOnline}
          trackColor={{ false: 'rgba(0,0,0,0.38)', true: 'rgba(76,175,80,0.5)' }}
          thumbColor={isOnline ? '#4caf50' : '#FFFFFF'}
        />
      </View>
    </View>
  </View>
);

export default DashboardHeader;
