import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import NotificationCard from '../components/NotificationCard';
import {
  ArrowLeftIcon,
  ClipboardIcon,
  CheckSmallIcon,
  InfoIcon,
} from '../components/DashboardIcons';
import { driverApi, DriverNotification } from '../api/client';
import { extractErrorMessage } from '../api/errors';
import { useToast } from '../components/Toast';
import { useNotifications } from '../components/NotificationsProvider';
import type { RootStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Notifications'>;

const formatRelativeTime = (iso: string): string => {
  const then = new Date(iso).getTime();
  if (!then || Number.isNaN(then)) return '';
  const diffSec = Math.max(1, Math.floor((Date.now() - then) / 1000));
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay}d ago`;
};

const iconForNotification = (item: DriverNotification) => {
  if (item.targetType === 'specific') {
    return {
      icon: <ClipboardIcon size={23.994} color="#E48714" />,
      iconBg: '#FFE403',
    };
  }
  return {
    icon: <InfoIcon size={23.994} color="#2B7FFF" />,
    iconBg: '#E3F2FD',
  };
};

const NotificationsScreen: React.FC<Props> = ({ navigation }) => {
  const toast = useToast();
  const { refresh: refreshUnread } = useNotifications();
  const [items, setItems] = useState<DriverNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await driverApi.listNotifications();
      setItems(res.data.data ?? []);
    } catch (err: any) {
      toast.error(
        'Could not load notifications',
        extractErrorMessage(err, 'Pull down to retry.'),
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = () => {
    setRefreshing(true);
    load();
    refreshUnread();
  };

  const unreadCount = items.filter(n => n.unread).length;

  const handleCardPress = async (item: DriverNotification) => {
    if (!item.unread) return;
    const snapshot = items;
    setItems(prev =>
      prev.map(n => (n._id === item._id ? { ...n, unread: false } : n)),
    );
    try {
      await driverApi.markNotificationRead(item._id);
      refreshUnread();
    } catch {
      setItems(snapshot);
    }
  };

  const handleDelete = async (id: string) => {
    const snapshot = items;
    setItems(prev => prev.filter(n => n._id !== id));
    try {
      await driverApi.deleteNotification(id);
      refreshUnread();
    } catch (err: any) {
      setItems(snapshot);
      toast.error(
        'Could not remove',
        extractErrorMessage(err, 'Please try again.'),
      );
    }
  };

  const handleMarkAllRead = async () => {
    if (unreadCount === 0) return;
    const snapshot = items;
    setItems(prev => prev.map(n => ({ ...n, unread: false })));
    try {
      await driverApi.markAllNotificationsRead();
      refreshUnread();
    } catch (err: any) {
      setItems(snapshot);
      toast.error(
        'Could not mark all read',
        extractErrorMessage(err, 'Please try again.'),
      );
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F5F5F5' }}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: '#FFE403' }}>
        <View
          style={{
            backgroundColor: '#FFE403',
            height: 71.947,
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 13,
          }}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={{
              width: 39.966,
              height: 39.966,
              borderRadius: 19.983,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <ArrowLeftIcon size={23.994} color="#404040" />
          </Pressable>
          <Text
            className="font-poppins-bold"
            style={{
              color: '#404040',
              fontSize: 18,
              lineHeight: 26,
              marginLeft: 15.99,
              flex: 1,
            }}>
            Notifications
          </Text>
          {unreadCount > 0 && (
            <View
              style={{
                backgroundColor: '#F44336',
                borderRadius: 16,
                height: 23.994,
                paddingHorizontal: 8,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Text
                className="font-poppins-semibold"
                style={{ color: '#FFFFFF', fontSize: 13, lineHeight: 19.5 }}>
                {unreadCount > 99 ? '99+' : unreadCount} new
              </Text>
            </View>
          )}
        </View>
      </SafeAreaView>

      {unreadCount > 0 && (
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'flex-end',
            paddingHorizontal: 13,
            paddingTop: 11.99,
          }}>
          <Pressable
            onPress={handleMarkAllRead}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <CheckSmallIcon size={18} color="#E48714" />
            <Text
              className="font-poppins-medium"
              style={{ color: '#E48714', fontSize: 14, lineHeight: 20 }}>
              Mark all read
            </Text>
          </Pressable>
        </View>
      )}

      {loading ? (
        <View
          style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color="#404040" />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 13,
            paddingTop: 12,
            paddingBottom: 24,
            gap: 12,
          }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#404040"
            />
          }
          showsVerticalScrollIndicator={false}>
          {items.length === 0 ? (
            <View
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                paddingTop: 80,
              }}>
              <Text
                className="font-poppins-regular"
                style={{ color: '#757575', fontSize: 14, lineHeight: 20 }}>
                You're all caught up.
              </Text>
            </View>
          ) : (
            items.map(item => {
              const { icon, iconBg } = iconForNotification(item);
              return (
                <NotificationCard
                  key={item._id}
                  isNew={item.unread}
                  iconBg={iconBg}
                  icon={icon}
                  title={item.title}
                  message={item.message}
                  timeAgo={formatRelativeTime(item.createdAt)}
                  onPress={() => handleCardPress(item)}
                  onDelete={() => handleDelete(item._id)}
                />
              );
            })
          )}
        </ScrollView>
      )}
    </View>
  );
};

export default NotificationsScreen;
