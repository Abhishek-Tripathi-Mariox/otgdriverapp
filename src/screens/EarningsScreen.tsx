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
import BottomNavBar, { NavTab } from '../components/BottomNavBar';
import { WalletIcon } from '../components/DashboardIcons';
import {
  driverApi,
  DriverDashboard,
  OrderSummary,
} from '../api/client';
import { extractErrorMessage } from '../api/errors';
import { useToast } from '../components/Toast';
import type { RootStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Earnings'>;

type PeriodKey = 'today' | 'week' | 'month';

const PERIODS: { key: PeriodKey; label: string }[] = [
  { key: 'today', label: 'Today' },
  { key: 'week', label: 'This Week' },
  { key: 'month', label: 'This Month' },
];

const formatRupees = (n: number) =>
  Number.isFinite(n) ? `₹${Math.round(n).toLocaleString('en-IN')}` : '₹0';

const startOfDay = (d = new Date()) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate());

// Monday is treated as the start of the week.
const startOfWeek = (d = new Date()) => {
  const s = startOfDay(d);
  const day = s.getDay(); // 0=Sun..6=Sat
  const diff = day === 0 ? 6 : day - 1;
  s.setDate(s.getDate() - diff);
  return s;
};

const startOfMonth = (d = new Date()) =>
  new Date(d.getFullYear(), d.getMonth(), 1);

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const formatDateLabel = (iso: string): string => {
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

const sumEarningsSince = (orders: OrderSummary[], since: Date) =>
  orders.reduce((acc, o) => {
    const t = new Date(o.date).getTime();
    return t >= since.getTime() ? acc + (o.earnings || 0) : acc;
  }, 0);

const SummaryStat: React.FC<{ label: string; value: string; valueColor?: string }> = ({
  label,
  value,
  valueColor = '#404040',
}) => (
  <View
    style={{
      flex: 1,
      backgroundColor: '#FFFFFF',
      borderRadius: 12,
      paddingVertical: 12,
      paddingHorizontal: 11.98,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.14,
      shadowRadius: 2,
      elevation: 2,
    }}>
    <Text
      className="font-poppins-bold"
      style={{
        color: valueColor,
        fontSize: 18,
        lineHeight: 28,
        textAlign: 'center',
      }}>
      {value}
    </Text>
    <Text
      className="font-poppins-regular"
      style={{
        color: '#757575',
        fontSize: 12,
        lineHeight: 18,
        textAlign: 'center',
        marginTop: 3.993,
      }}>
      {label}
    </Text>
  </View>
);

const EarningRow: React.FC<{ order: OrderSummary }> = ({ order }) => (
  <View
    style={{
      backgroundColor: '#FFFFFF',
      borderRadius: 12,
      padding: 12,
      gap: 7.99,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    }}>
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
      <Text
        className="font-poppins-bold"
        style={{ color: '#404040', fontSize: 16, lineHeight: 24 }}>
        #{order.id}
      </Text>
      <Text
        className="font-poppins-bold"
        style={{ color: '#4CAF50', fontSize: 18, lineHeight: 28 }}>
        {formatRupees(order.earnings)}
      </Text>
    </View>
    <Text
      className="font-poppins-regular"
      numberOfLines={1}
      style={{ color: '#404040', fontSize: 13, lineHeight: 20 }}>
      {order.pickup}
    </Text>
    <Text
      className="font-poppins-regular"
      numberOfLines={1}
      style={{ color: '#404040', fontSize: 13, lineHeight: 20 }}>
      → {order.drop}
    </Text>
    <Text
      className="font-poppins-regular"
      style={{ color: '#757575', fontSize: 12, lineHeight: 18 }}>
      {formatDateLabel(order.date)}
    </Text>
  </View>
);

const EmptyState: React.FC<{ period: PeriodKey }> = ({ period }) => {
  const label =
    period === 'today'
      ? 'today'
      : period === 'week'
      ? 'this week'
      : 'this month';
  return (
    <View
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 47.99,
        gap: 9,
      }}>
      <View
        style={{
          width: 88,
          height: 88,
          borderRadius: 44,
          backgroundColor: '#FFFFFF',
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 6,
          elevation: 2,
        }}>
        <WalletIcon size={44} color="#E48714" />
      </View>
      <Text
        className="font-poppins-bold"
        style={{ color: '#404040', fontSize: 18, lineHeight: 28 }}>
        No earnings yet
      </Text>
      <Text
        className="font-poppins-regular"
        style={{
          color: '#757575',
          fontSize: 13,
          lineHeight: 20,
          textAlign: 'center',
        }}>
        {`Completed deliveries from ${label} will\nshow up here.`}
      </Text>
    </View>
  );
};

const EarningsScreen: React.FC<Props> = ({ navigation }) => {
  const toast = useToast();
  const [navTab, setNavTab] = useState<NavTab>('Earnings');
  const [period, setPeriod] = useState<PeriodKey>('today');
  const [dashboard, setDashboard] = useState<DriverDashboard | null>(null);
  const [completed, setCompleted] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAll = useCallback(async () => {
    try {
      const [dashRes, ordersRes] = await Promise.all([
        driverApi.dashboard(),
        driverApi.myOrders('completed'),
      ]);
      setDashboard(dashRes.data.data);
      setCompleted(ordersRes.data.data);
    } catch (err: any) {
      toast.error(
        'Could not load earnings',
        extractErrorMessage(err, 'Pull down to retry.'),
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [toast]);

  useFocusEffect(
    useCallback(() => {
      fetchAll();
    }, [fetchAll]),
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchAll();
  };

  const handleNav = (next: NavTab) => {
    setNavTab(next);
    if (next === 'Home') navigation.navigate('Home');
    if (next === 'Orders') navigation.navigate('MyOrders');
    if (next === 'Profile') navigation.navigate('Profile');
  };

  const todayEarnings = dashboard?.todayEarnings ?? 0;
  const weekEarnings = sumEarningsSince(completed, startOfWeek());
  const monthEarnings = sumEarningsSince(completed, startOfMonth());
  const totalEarnings = dashboard?.totalEarnings ?? 0;
  const pendingPayout = dashboard?.pendingPayout ?? 0;
  const totalTrips = dashboard?.totalCompletedCount ?? 0;

  const since =
    period === 'today'
      ? startOfDay()
      : period === 'week'
      ? startOfWeek()
      : startOfMonth();

  const filtered = completed
    .filter(o => new Date(o.date).getTime() >= since.getTime())
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const filteredTotal = filtered.reduce((acc, o) => acc + (o.earnings || 0), 0);

  return (
    <View style={{ flex: 1, backgroundColor: '#F5F5F5' }}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: '#FFE403' }}>
        <ScreenHeader title="Earnings" onBack={() => navigation.goBack()} />
      </SafeAreaView>

      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color="#E48714" />
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
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}>
          <View style={{ flexDirection: 'row', gap: 9 }}>
            <SummaryStat
              label="Today"
              value={formatRupees(todayEarnings)}
              valueColor="#4CAF50"
            />
            <SummaryStat
              label="This Week"
              value={formatRupees(weekEarnings)}
              valueColor="#4CAF50"
            />
            <SummaryStat
              label="This Month"
              value={formatRupees(monthEarnings)}
              valueColor="#4CAF50"
            />
          </View>

          <View
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 12,
              padding: 12,
              gap: 9,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.14,
              shadowRadius: 5,
              elevation: 3,
            }}>
            <Text
              className="font-poppins-bold"
              style={{ color: '#404040', fontSize: 18, lineHeight: 28 }}>
              Lifetime Summary
            </Text>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
              }}>
              <View style={{ gap: 3.993 }}>
                <Text
                  className="font-poppins-regular"
                  style={{ color: '#757575', fontSize: 13, lineHeight: 20 }}>
                  Total Trips
                </Text>
                <Text
                  className="font-poppins-bold"
                  style={{ color: '#404040', fontSize: 19, lineHeight: 30 }}>
                  {totalTrips}
                </Text>
              </View>
              <View style={{ gap: 3.993, alignItems: 'flex-end' }}>
                <Text
                  className="font-poppins-regular"
                  style={{ color: '#757575', fontSize: 13, lineHeight: 20 }}>
                  Total Earnings
                </Text>
                <Text
                  className="font-poppins-bold"
                  style={{ color: '#4CAF50', fontSize: 19, lineHeight: 30 }}>
                  {formatRupees(totalEarnings)}
                </Text>
              </View>
            </View>
            <View
              style={{ height: 1, backgroundColor: 'rgba(0,0,0,0.08)' }}
            />
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
              <Text
                className="font-poppins-regular"
                style={{ color: '#757575', fontSize: 13, lineHeight: 20 }}>
                Pending Payout
              </Text>
              <Text
                className="font-poppins-semibold"
                style={{ color: '#E48714', fontSize: 16, lineHeight: 24 }}>
                {formatRupees(pendingPayout)}
              </Text>
            </View>
          </View>

          <View
            style={{
              flexDirection: 'row',
              backgroundColor: '#FFFFFF',
              borderRadius: 999,
              padding: 3.993,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.08,
              shadowRadius: 3,
              elevation: 1,
            }}>
            {PERIODS.map(p => {
              const isActive = p.key === period;
              return (
                <Pressable
                  key={p.key}
                  onPress={() => setPeriod(p.key)}
                  style={{
                    flex: 1,
                    paddingVertical: 7.99,
                    borderRadius: 999,
                    backgroundColor: isActive ? '#FFE403' : 'transparent',
                    alignItems: 'center',
                  }}>
                  <Text
                    className="font-poppins-semibold"
                    style={{
                      color: isActive ? '#404040' : '#757575',
                      fontSize: 13,
                      lineHeight: 20,
                    }}>
                    {p.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: -3.993,
            }}>
            <Text
              className="font-poppins-bold"
              style={{ color: '#404040', fontSize: 16, lineHeight: 24 }}>
              {filtered.length} {filtered.length === 1 ? 'delivery' : 'deliveries'}
            </Text>
            <Text
              className="font-poppins-bold"
              style={{ color: '#4CAF50', fontSize: 16, lineHeight: 24 }}>
              {formatRupees(filteredTotal)}
            </Text>
          </View>

          {filtered.length === 0 ? (
            <EmptyState period={period} />
          ) : (
            filtered.map(o => <EarningRow key={o.id} order={o} />)
          )}
        </ScrollView>
      )}

      <SafeAreaView edges={['bottom']} style={{ backgroundColor: '#FFFFFF' }}>
        <BottomNavBar active={navTab} onChange={handleNav} />
      </SafeAreaView>
    </View>
  );
};

export default EarningsScreen;
