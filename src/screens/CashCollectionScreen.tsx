import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Pressable,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import ScreenHeader from '../components/ScreenHeader';
import { FormInput } from '../components/FormField';
import { WalletIcon } from '../components/DashboardIcons';
import { driverApi, CashSummary, CashDeposit } from '../api/client';
import { extractErrorMessage } from '../api/errors';
import { useToast } from '../components/Toast';
import type { RootStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'CashCollection'>;

const formatRupees = (n: number) =>
  Number.isFinite(n) ? `₹${Math.round(n).toLocaleString('en-IN')}` : '₹0';

const formatDayLabel = (dateKey: string): string => {
  const d = new Date(`${dateKey}T00:00:00`);
  if (isNaN(d.getTime())) return dateKey;
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
  if (isSameDay(d, now)) return 'Today';
  if (isSameDay(d, yesterday)) return 'Yesterday';
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const formatDateTime = (iso: string): string => {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  });
};

const StatTile: React.FC<{ label: string; value: string; valueColor?: string }> = ({
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
      paddingHorizontal: 11,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.14,
      shadowRadius: 2,
      elevation: 2,
    }}>
    <Text
      className="font-poppins-bold"
      style={{ color: valueColor, fontSize: 17, lineHeight: 26, textAlign: 'center' }}>
      {value}
    </Text>
    <Text
      className="font-poppins-regular"
      style={{ color: '#757575', fontSize: 12, lineHeight: 18, textAlign: 'center', marginTop: 4 }}>
      {label}
    </Text>
  </View>
);

const DayRow: React.FC<{ date: string; collected: number; deposited: number; deliveries: number }> = ({
  date,
  collected,
  deposited,
  deliveries,
}) => (
  <View
    style={{
      backgroundColor: '#FFFFFF',
      borderRadius: 12,
      padding: 12,
      gap: 6,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    }}>
    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
      <Text className="font-poppins-bold" style={{ color: '#404040', fontSize: 15, lineHeight: 22 }}>
        {formatDayLabel(date)}
      </Text>
      {deliveries > 0 && (
        <Text className="font-poppins-regular" style={{ color: '#757575', fontSize: 12, lineHeight: 20 }}>
          {deliveries} COD {deliveries === 1 ? 'delivery' : 'deliveries'}
        </Text>
      )}
    </View>
    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
      <Text className="font-poppins-regular" style={{ color: '#757575', fontSize: 13 }}>
        Collected
      </Text>
      <Text className="font-poppins-semibold" style={{ color: '#4CAF50', fontSize: 14 }}>
        + {formatRupees(collected)}
      </Text>
    </View>
    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
      <Text className="font-poppins-regular" style={{ color: '#757575', fontSize: 13 }}>
        Deposited to Admin
      </Text>
      <Text className="font-poppins-semibold" style={{ color: '#E48714', fontSize: 14 }}>
        {deposited > 0 ? `- ${formatRupees(deposited)}` : formatRupees(0)}
      </Text>
    </View>
  </View>
);

const DepositModal: React.FC<{
  visible: boolean;
  cashInHand: number;
  submitting: boolean;
  onSubmit: (amount: number, note?: string) => void;
  onClose: () => void;
}> = ({ visible, cashInHand, submitting, onSubmit, onClose }) => {
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  const handleSubmit = () => {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) return;
    onSubmit(amt, note.trim() || undefined);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        onPress={onClose}
        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', paddingHorizontal: 24 }}>
        <Pressable onPress={() => {}} style={{ backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, gap: 14 }}>
          <Text className="font-poppins-bold" style={{ color: '#1E293B', fontSize: 18, lineHeight: 24 }}>
            Deposit to Admin
          </Text>
          <Text className="font-poppins-regular" style={{ color: '#757575', fontSize: 13 }}>
            Cash in hand: {formatRupees(cashInHand)}
          </Text>
          <FormInput
            label="Amount (₹)"
            keyboardType="decimal-pad"
            placeholder="0"
            value={amount}
            onChangeText={setAmount}
          />
          <FormInput
            label="Note (optional)"
            placeholder="e.g. Handed to office cashier"
            value={note}
            onChangeText={setNote}
          />
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 4 }}>
            <Pressable
              onPress={onClose}
              disabled={submitting}
              style={{
                flex: 1,
                height: 44,
                borderRadius: 10,
                borderWidth: 1.2,
                borderColor: '#E2E8F0',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Text className="font-poppins-semibold" style={{ color: '#475569', fontSize: 14 }}>
                Cancel
              </Text>
            </Pressable>
            <Pressable
              onPress={handleSubmit}
              disabled={submitting}
              style={{
                flex: 1,
                height: 44,
                borderRadius: 10,
                backgroundColor: '#E48714',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: submitting ? 0.7 : 1,
              }}>
              {submitting ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text className="font-poppins-semibold" style={{ color: '#FFFFFF', fontSize: 14 }}>
                  Confirm
                </Text>
              )}
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const CashCollectionScreen: React.FC<Props> = ({ navigation }) => {
  const toast = useToast();
  const [summary, setSummary] = useState<CashSummary | null>(null);
  const [deposits, setDeposits] = useState<CashDeposit[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [depositModalVisible, setDepositModalVisible] = useState(false);
  const [submittingDeposit, setSubmittingDeposit] = useState(false);

  const fetchAll = useCallback(async () => {
    try {
      const [summaryRes, depositsRes] = await Promise.all([
        driverApi.cashSummary(),
        driverApi.cashDeposits(),
      ]);
      setSummary(summaryRes.data.data);
      setDeposits(depositsRes.data.data);
    } catch (err: any) {
      toast.error('Could not load cash summary', extractErrorMessage(err, 'Pull down to retry.'));
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

  const handleDeposit = async (amount: number, note?: string) => {
    setSubmittingDeposit(true);
    try {
      await driverApi.createCashDeposit(amount, note);
      toast.success('Deposit recorded');
      setDepositModalVisible(false);
      await fetchAll();
    } catch (err: any) {
      toast.error('Could not record deposit', extractErrorMessage(err, 'Please try again.'));
    } finally {
      setSubmittingDeposit(false);
    }
  };

  const cashInHand = summary?.cashInHand ?? 0;

  return (
    <View style={{ flex: 1, backgroundColor: '#F5F5F5' }}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: '#FFE403' }}>
        <ScreenHeader title="Cash Collection" onBack={() => navigation.goBack()} />
      </SafeAreaView>

      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color="#E48714" />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 13, paddingTop: 12, paddingBottom: 24, gap: 12 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          showsVerticalScrollIndicator={false}>
          <View
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 12,
              padding: 16,
              alignItems: 'center',
              gap: 6,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.14,
              shadowRadius: 5,
              elevation: 3,
            }}>
            <WalletIcon size={36} color="#E48714" />
            <Text className="font-poppins-regular" style={{ color: '#757575', fontSize: 13 }}>
              Cash In Hand
            </Text>
            <Text className="font-poppins-bold" style={{ color: '#404040', fontSize: 30, lineHeight: 38 }}>
              {formatRupees(cashInHand)}
            </Text>
            <Pressable
              onPress={() => setDepositModalVisible(true)}
              disabled={cashInHand <= 0}
              style={{
                marginTop: 8,
                backgroundColor: cashInHand > 0 ? '#4caf50' : '#E5E7EB',
                borderRadius: 10,
                paddingVertical: 10,
                paddingHorizontal: 24,
              }}>
              <Text
                className="font-poppins-semibold"
                style={{ color: cashInHand > 0 ? '#FFFFFF' : '#9CA3AF', fontSize: 14 }}>
                Deposit to Admin
              </Text>
            </Pressable>
          </View>

          <View style={{ flexDirection: 'row', gap: 9 }}>
            <StatTile label="Collected Today" value={formatRupees(summary?.today.collected ?? 0)} valueColor="#4CAF50" />
            <StatTile label="Deposited Today" value={formatRupees(summary?.today.deposited ?? 0)} valueColor="#E48714" />
          </View>

          <View style={{ flexDirection: 'row', gap: 9 }}>
            <StatTile label="Total Collected" value={formatRupees(summary?.totalCollected ?? 0)} />
            <StatTile label="Total Deposited" value={formatRupees(summary?.totalDeposited ?? 0)} />
          </View>

          <Text className="font-poppins-bold" style={{ color: '#404040', fontSize: 16, lineHeight: 24, marginTop: 4 }}>
            Day by Day
          </Text>
          {!summary?.daily.length ? (
            <Text className="font-poppins-regular" style={{ color: '#757575', fontSize: 13 }}>
              No COD activity yet.
            </Text>
          ) : (
            summary.daily.map(row => (
              <DayRow
                key={row.date}
                date={row.date}
                collected={row.collected}
                deposited={row.deposited}
                deliveries={row.deliveries}
              />
            ))
          )}

          {deposits.length > 0 && (
            <>
              <Text className="font-poppins-bold" style={{ color: '#404040', fontSize: 16, lineHeight: 24, marginTop: 4 }}>
                Deposit History
              </Text>
              {deposits.map(dep => (
                <View
                  key={dep._id}
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: 12,
                    padding: 12,
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.08,
                    shadowRadius: 3,
                    elevation: 1,
                  }}>
                  <View>
                    <Text className="font-poppins-semibold" style={{ color: '#404040', fontSize: 14 }}>
                      {formatDateTime(dep.createdAt)}
                    </Text>
                    {dep.note ? (
                      <Text className="font-poppins-regular" style={{ color: '#757575', fontSize: 12, marginTop: 2 }}>
                        {dep.note}
                      </Text>
                    ) : null}
                  </View>
                  <Text className="font-poppins-bold" style={{ color: '#E48714', fontSize: 15 }}>
                    {formatRupees(dep.amount)}
                  </Text>
                </View>
              ))}
            </>
          )}
        </ScrollView>
      )}

      <DepositModal
        visible={depositModalVisible}
        cashInHand={cashInHand}
        submitting={submittingDeposit}
        onSubmit={handleDeposit}
        onClose={() => setDepositModalVisible(false)}
      />
    </View>
  );
};

export default CashCollectionScreen;
