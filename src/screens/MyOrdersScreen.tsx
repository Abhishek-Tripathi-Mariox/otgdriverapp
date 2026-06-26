import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import ScreenHeader from '../components/ScreenHeader';
import OrdersTabBar, { OrdersTab } from '../components/orders/OrdersTabBar';
import OrderCard, { OrderCardData } from '../components/orders/OrderCard';
import BottomNavBar, { NavTab } from '../components/BottomNavBar';
import { ClipboardIcon } from '../components/DashboardIcons';
import { driverApi, OrderSummary } from '../api/client';
import { extractErrorMessage } from '../api/errors';
import { useToast } from '../components/Toast';
import type { RootStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'MyOrders'>;

const TAB_TO_GROUP: Record<OrdersTab, 'active' | 'completed' | 'rejected'> = {
  Active: 'active',
  Completed: 'completed',
  Rejected: 'rejected',
};

const formatRupees = (n: number) =>
  Number.isFinite(n) ? `₹${Math.round(n).toLocaleString('en-IN')}` : '₹0';

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const formatOrderDate = (iso: string): string => {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const time = d.toLocaleTimeString('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
  });
  if (isSameDay(d, now)) return `Today, ${time}`;
  if (isSameDay(d, yesterday)) return `Yesterday, ${time}`;
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const toCardData = (order: OrderSummary): OrderCardData => ({
  id: order.id,
  status: order.status,
  pickup: order.pickup,
  drop: order.drop,
  date: formatOrderDate(order.date),
  earnings: formatRupees(order.earnings),
});

const EmptyState: React.FC<{ tab: OrdersTab }> = ({ tab }) => {
  const copy = {
    Active: {
      title: 'No Active Orders',
      body: 'Turn on your Online status to start\nreceiving new delivery requests',
    },
    Completed: {
      title: 'No Completed Orders',
      body: 'Your completed deliveries will\nappear here',
    },
    Rejected: {
      title: 'No Rejected Orders',
      body: 'Cancelled or rejected orders will\nappear here',
    },
  }[tab];

  return (
    <View
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 79.987,
        gap: 12,
      }}>
      <View
        style={{
          width: 119.98,
          height: 119.98,
          borderRadius: 59.99,
          backgroundColor: '#FFFFFF',
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 3,
        }}>
        <ClipboardIcon size={59.986} color="#E48714" />
      </View>
      <Text
        className="font-poppins-bold"
        style={{ color: '#404040', fontSize: 18, lineHeight: 26 }}>
        {copy.title}
      </Text>
      <Text
        className="font-poppins-regular"
        style={{
          color: '#757575',
          fontSize: 14,
          lineHeight: 20,
          textAlign: 'center',
        }}>
        {copy.body}
      </Text>
    </View>
  );
};

// The driver receives an order once a vendor dispatches it. Before the driver
// has picked it up, the next action is "Start Pickup" (start → in_transit);
// once in transit, the next action is "Mark Delivered" (complete → delivered).
const IN_TRANSIT_STATES = ['in_transit', 'in transit', 'picked_up', 'picked up', 'started'];

const nextActiveAction = (rawStatus?: string): 'start' | 'complete' => {
  const s = (rawStatus || '').toLowerCase();
  return IN_TRANSIT_STATES.includes(s) ? 'complete' : 'start';
};

const MyOrdersScreen: React.FC<Props> = ({ navigation }) => {
  const [tab, setTab] = useState<OrdersTab>('Active');
  const [navTab, setNavTab] = useState<NavTab>('Orders');
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actingId, setActingId] = useState<string | null>(null);
  const toast = useToast();

  const fetchOrders = useCallback(
    async (which: OrdersTab) => {
      try {
        const res = await driverApi.myOrders(TAB_TO_GROUP[which]);
        setOrders(res.data.data);
      } catch (err: any) {
        toast.error(
          'Could not load orders',
          extractErrorMessage(err, 'Pull down to retry.'),
        );
        setOrders([]);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [toast],
  );

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchOrders(tab);
    }, [fetchOrders, tab]),
  );

  const handleNav = (next: NavTab) => {
    setNavTab(next);
    if (next === 'Home') navigation.navigate('Home');
    if (next === 'Earnings') navigation.navigate('Earnings');
    if (next === 'Profile') navigation.navigate('Profile');
  };

  const handleOrderPress = (order: OrderSummary) => {
    navigation.navigate('OrderDetails', {
      orderId: order.id,
      variant:
        order.status === 'delivered'
          ? 'delivered'
          : order.status === 'in_progress'
          ? 'active'
          : 'rejected',
      order,
    });
  };

  const handleAction = async (
    order: OrderSummary,
    action: 'start' | 'complete' | 'reject',
  ) => {
    if (actingId) return;
    setActingId(order.id);
    try {
      await driverApi.orderStatus(order.id, action);
      toast.success(
        action === 'start'
          ? 'Pickup started'
          : action === 'complete'
          ? 'Order marked delivered'
          : 'Order rejected',
      );
      await fetchOrders(tab);
    } catch (err: any) {
      toast.error(
        'Action failed',
        extractErrorMessage(err, 'Please try again.'),
      );
    } finally {
      setActingId(null);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders(tab);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F5F5F5' }}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: '#FFE403' }}>
        <ScreenHeader title="My Orders" onBack={() => navigation.goBack()} />
      </SafeAreaView>

      <OrdersTabBar
        active={tab}
        onChange={next => {
          setTab(next);
        }}
      />

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 13,
          paddingTop: 12,
          paddingBottom: 24,
          gap: 12,
          flexGrow: 1,
        }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={{ paddingTop: 80, alignItems: 'center' }}>
            <ActivityIndicator color="#E48714" />
          </View>
        ) : orders.length === 0 ? (
          <EmptyState tab={tab} />
        ) : (
          orders.map(order => {
            const isActive = order.status === 'in_progress';
            const primaryAction = nextActiveAction(order.rawStatus);
            const busy = actingId === order.id;
            return (
              <View key={order.id} style={{ gap: 9 }}>
                <OrderCard
                  {...toCardData(order)}
                  onPress={() => handleOrderPress(order)}
                />
                {isActive && (
                  <View style={{ flexDirection: 'row', gap: 9 }}>
                    <Pressable
                      onPress={() => handleAction(order, 'reject')}
                      disabled={busy}
                      style={{
                        flex: 1,
                        height: 47.995,
                        borderRadius: 8,
                        borderWidth: 1.5,
                        borderColor: '#F44336',
                        opacity: busy ? 0.6 : 1,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                      <Text
                        className="font-poppins-semibold"
                        style={{ color: '#F44336', fontSize: 14, lineHeight: 20 }}>
                        Reject
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={() => handleAction(order, primaryAction)}
                      disabled={busy}
                      style={{
                        flex: 1.6,
                        height: 47.995,
                        borderRadius: 8,
                        backgroundColor: '#FFE403',
                        opacity: busy ? 0.6 : 1,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                      {busy ? (
                        <ActivityIndicator color="#404040" />
                      ) : (
                        <Text
                          className="font-poppins-bold"
                          style={{ color: '#404040', fontSize: 14, lineHeight: 20 }}>
                          {primaryAction === 'start' ? 'Start Pickup' : 'Mark Delivered'}
                        </Text>
                      )}
                    </Pressable>
                  </View>
                )}
              </View>
            );
          })
        )}
      </ScrollView>

      <SafeAreaView edges={['bottom']} style={{ backgroundColor: '#FFFFFF' }}>
        <BottomNavBar active={navTab} onChange={handleNav} />
      </SafeAreaView>
    </View>
  );
};

export default MyOrdersScreen;
