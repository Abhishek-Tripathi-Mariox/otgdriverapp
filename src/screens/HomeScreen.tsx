import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView, RefreshControl, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import DashboardHeader from '../components/DashboardHeader';
import BottomNavBar, { NavTab } from '../components/BottomNavBar';
import StatCards from '../components/dashboard/StatCards';
import EarningsSnapshotCard from '../components/dashboard/EarningsSnapshotCard';
import QuickActionCard from '../components/dashboard/QuickActionCard';
import NewDeliveryBanner from '../components/dashboard/NewDeliveryBanner';
import OutForDeliveryCard from '../components/dashboard/OutForDeliveryCard';
import { HelpIcon, ShareIcon } from '../components/DashboardIcons';
import { useAuthStore } from '../store';
import { driverApi, DriverDashboard } from '../api/client';
import { extractErrorMessage } from '../api/errors';
import { useToast } from '../components/Toast';
import { useNotifications } from '../components/NotificationsProvider';
import type { RootStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  return 'Good Evening';
};

const formatRupees = (n: number) => {
  if (!Number.isFinite(n)) return '₹0';
  return `₹${Math.round(n).toLocaleString('en-IN')}`;
};

const driverDisplayName = (name?: string, mobile?: string) => {
  if (name && name.trim()) return name.trim().split(' ')[0];
  if (mobile) return mobile;
  return 'Driver';
};

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const driver = useAuthStore(s => s.driver);
  const toast = useToast();
  const { unreadCount: notifUnread, refresh: refreshNotifications } =
    useNotifications();
  const [isOnline, setIsOnline] = useState(false);
  const [activeTab, setActiveTab] = useState<NavTab>('Home');
  const [dashboard, setDashboard] = useState<DriverDashboard | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [, setLoading] = useState(true);

  const fetchDashboard = useCallback(async () => {
    try {
      const res = await driverApi.dashboard();
      setDashboard(res.data.data);
      // Sync the toggle with the server-persisted duty state.
      if (typeof res.data.data.isOnline === 'boolean') {
        setIsOnline(res.data.data.isOnline);
      }
    } catch (err: any) {
      toast.error(
        'Could not load dashboard',
        extractErrorMessage(err, 'Pull down to retry.'),
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [toast]);

  // Persist the online/offline toggle to the backend so the server can block
  // delivery actions while the driver is offline. Reverts on failure.
  const handleToggleOnline = useCallback(
    async (next: boolean) => {
      setIsOnline(next);
      try {
        await driverApi.setOnline(next);
      } catch (err: any) {
        setIsOnline(!next);
        toast.error(
          'Could not update status',
          extractErrorMessage(err, 'Please try again.'),
        );
      }
    },
    [toast],
  );

  // Refresh when the screen first mounts and every time it regains focus
  // (e.g. coming back from MyOrders after accepting/completing).
  useFocusEffect(
    useCallback(() => {
      fetchDashboard();
      refreshNotifications();
    }, [fetchDashboard, refreshNotifications]),
  );

  useEffect(() => {
    if (!isOnline) return;
    // Poll every 20s while online so a newly-assigned booking shows up quickly.
    const id = setInterval(fetchDashboard, 20000);
    return () => clearInterval(id);
  }, [isOnline, fetchDashboard]);

  const handleAcceptDelivery = async () => {
    if (!dashboard?.newOffer) return;
    try {
      await driverApi.orderStatus(dashboard.newOffer.id, 'accept');
      toast.success('Order accepted');
      await fetchDashboard();
    } catch (err: any) {
      toast.error(
        'Could not accept',
        extractErrorMessage(err, 'Please try again.'),
      );
    }
  };

  const handleShareApp = async () => {
    const driverFirstName = driverDisplayName(driver?.name, driver?.mobile);
    const shareUrl = 'https://play.google.com/store/apps/details?id=com.otgdriverapp';
    const message =
      `Hi! I'm ${driverFirstName}. I'm earning daily as a delivery partner with OTG. ` +
      `Sign up as a driver and start earning too — download the OTG Driver app here: ${shareUrl}`;
    try {
      await Share.share({
        title: 'OTG Driver — Refer & Earn',
        message,
        url: shareUrl,
      });
    } catch (err: any) {
      toast.error('Could not share', extractErrorMessage(err, 'Please try again.'));
    }
  };

  const handleNav = (next: NavTab) => {
    setActiveTab(next);
    if (next === 'Orders') navigation.navigate('MyOrders');
    if (next === 'Earnings') navigation.navigate('Earnings');
    if (next === 'Profile') navigation.navigate('Profile');
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboard();
  };

  const completedToday = dashboard?.completedTodayCount ?? 0;
  const activeCount = dashboard?.activeCount ?? 0;
  const todayEarnings = dashboard?.todayEarnings ?? 0;
  const totalCompleted = dashboard?.totalCompletedCount ?? 0;
  const totalEarnings = dashboard?.totalEarnings ?? 0;
  const pendingPayout = dashboard?.pendingPayout ?? 0;

  // Per-period earnings for the Daily/Weekly/Monthly tabs. Fall back to
  // today/all-time values if the backend hasn't sent the breakdown yet.
  const earnings = dashboard?.earnings;
  const earningsPeriods = {
    daily: {
      trips: earnings?.daily.trips ?? completedToday,
      earnings: formatRupees(earnings?.daily.amount ?? todayEarnings),
    },
    weekly: {
      trips: earnings?.weekly.trips ?? totalCompleted,
      earnings: formatRupees(earnings?.weekly.amount ?? totalEarnings),
    },
    monthly: {
      trips: earnings?.monthly.trips ?? totalCompleted,
      earnings: formatRupees(earnings?.monthly.amount ?? totalEarnings),
    },
  };
  const newOffer = dashboard?.newOffer ?? null;
  const activeOrder = dashboard?.activeOrder ?? null;

  return (
    <View style={{ flex: 1, backgroundColor: '#FFE403' }}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: '#FFE403' }}>
        <DashboardHeader
          greeting={getGreeting()}
          name={driverDisplayName(driver?.name, driver?.mobile)}
          isOnline={isOnline}
          onToggleOnline={handleToggleOnline}
          notificationCount={notifUnread}
          onPressNotifications={() => navigation.navigate('Notifications')}
        />
      </SafeAreaView>

      <View style={{ flex: 1, backgroundColor: '#F5F5F5' }}>
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 13,
            paddingTop: 12,
            paddingBottom: 24,
            gap: 23.99,
          }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}>
          <StatCards
            completed={completedToday}
            active={activeCount}
            today={formatRupees(todayEarnings)}
          />

          {isOnline && newOffer && (
            <NewDeliveryBanner onPress={handleAcceptDelivery} />
          )}

          <EarningsSnapshotCard
            periods={earningsPeriods}
            pendingPayout={formatRupees(pendingPayout)}
          />

          {activeOrder && (
            <OutForDeliveryCard
              orderId={activeOrder.id}
              pickup={activeOrder.pickup}
              drop={activeOrder.drop}
              onViewOrder={() => navigation.navigate('MyOrders')}
            />
          )}

          <Text
            className="font-poppins-bold"
            style={{ color: '#404040', fontSize: 18, lineHeight: 26 }}>
            Quick Actions
          </Text>

          <View style={{ gap: 12, marginTop: -7.99 }}>
            <QuickActionCard
              icon={<HelpIcon size={23.994} color="#FFFFFF" />}
              iconBg="#E48714"
              title="Help & Support"
              onPress={() => navigation.navigate('HelpSupport')}
            />
            <QuickActionCard
              icon={<ShareIcon size={23.994} color="#404040" />}
              iconBg="#FFE403"
              title="Share App (Refer & Earn)"
              onPress={handleShareApp}
            />
          </View>
        </ScrollView>
      </View>

      <SafeAreaView edges={['bottom']} style={{ backgroundColor: '#FFFFFF' }}>
        <BottomNavBar active={activeTab} onChange={handleNav} />
      </SafeAreaView>
    </View>
  );
};

export default HomeScreen;
