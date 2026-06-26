import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import ScreenHeader from '../components/ScreenHeader';
import { BankIcon, EditIcon, InfoIcon } from '../components/DashboardIcons';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { driverApi, type DriverBank } from '../api/client';

type Props = NativeStackScreenProps<RootStackParamList, 'BankDetails'>;

// Show only the last 4 digits of the account number.
const maskAccount = (acc?: string): string => {
  const digits = (acc || '').replace(/\s/g, '');
  if (!digits) return '—';
  if (digits.length <= 4) return digits;
  return `••••••${digits.slice(-4)}`;
};

const OTP_LENGTH = 6;

const OtpModal: React.FC<{
  visible: boolean;
  onCancel: () => void;
  onVerify: () => void;
}> = ({ visible, onCancel, onVerify }) => {
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));

  const handleChange = (idx: number, v: string) => {
    const next = [...otp];
    next[idx] = v.slice(-1);
    setOtp(next);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.5)',
          justifyContent: 'center',
          paddingHorizontal: 16,
        }}>
        <View
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 16,
            padding: 16,
            gap: 12,
          }}>
          <Text
            className="font-poppins-bold"
            style={{ color: '#404040', fontSize: 18, lineHeight: 26, textAlign: 'center' }}>
            Update Bank Details
          </Text>
          <Text
            className="font-poppins-regular"
            style={{ color: '#757575', fontSize: 14, lineHeight: 20, textAlign: 'center' }}>
            Enter the 6-digit OTP sent to your{'\n'}registered mobile number
          </Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 7.99 }}>
            {otp.map((v, i) => (
              <TextInput
                key={i}
                value={v}
                onChangeText={t => handleChange(i, t)}
                keyboardType="number-pad"
                maxLength={1}
                className="font-poppins-bold"
                style={{
                  flex: 1,
                  height: 50.295,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: '#00000023',
                  textAlign: 'center',
                  fontSize: 18,
                  color: '#404040',
                }}
              />
            ))}
          </View>
          <View style={{ flexDirection: 'row', gap: 9, marginTop: 7.99 }}>
            <Pressable
              onPress={onCancel}
              style={{
                flex: 1,
                height: 47.995,
                borderRadius: 8,
                borderWidth: 1.5,
                borderColor: '#E0E0E0',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Text
                className="font-poppins-semibold"
                style={{ color: '#757575', fontSize: 14, lineHeight: 20 }}>
                Cancel
              </Text>
            </Pressable>
            <Pressable
              onPress={onVerify}
              style={{
                flex: 1,
                height: 47.995,
                borderRadius: 8,
                backgroundColor: '#FFE403',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Text
                className="font-poppins-bold"
                style={{ color: '#404040', fontSize: 14, lineHeight: 20 }}>
                Verify & Continue
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const BankDetailsScreen: React.FC<Props> = ({ navigation, route }) => {
  const [showOtp, setShowOtp] = useState(route.params?.showOtp ?? false);
  const [bank, setBank] = useState<DriverBank | null>(null);
  const [loading, setLoading] = useState(true);

  // Load the driver's real bank details from their profile.
  useEffect(() => {
    let cancelled = false;
    driverApi
      .me()
      .then(res => {
        if (!cancelled) setBank(res.data?.data?.bank ?? null);
      })
      .catch(() => {
        if (!cancelled) setBank(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const hasBank = Boolean(bank?.accountNumber);
  const rows = [
    { label: 'Account Holder', value: bank?.accountHolder || '—' },
    { label: 'Account Number', value: maskAccount(bank?.accountNumber) },
    { label: 'IFSC Code', value: bank?.ifsc || '—' },
    { label: 'Bank Name', value: bank?.bankName || '—' },
    { label: 'Branch', value: bank?.branch || '—' },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: '#F5F5F5' }}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: '#FFE403' }}>
        <ScreenHeader title="Bank Details" onBack={() => navigation.goBack()} />
      </SafeAreaView>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 13,
          paddingTop: 39.98,
          paddingBottom: 32,
          gap: 16,
        }}
        showsVerticalScrollIndicator={false}>
        <View style={{ alignItems: 'center', gap: 12 }}>
          <View
            style={{
              width: 79.987,
              height: 79.987,
              borderRadius: 39.994,
              backgroundColor: '#4CAF50',
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: '#4CAF50',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 12,
              elevation: 6,
            }}>
            <BankIcon size={39.985} color="#FFFFFF" />
          </View>
          <Text
            className="font-poppins-bold"
            style={{ color: '#404040', fontSize: 18, lineHeight: 26 }}>
            Payout Account
          </Text>
        </View>

        <View
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 12,
            padding: 16,
            gap: 12,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.14,
            shadowRadius: 5,
            elevation: 2,
          }}>
          <View
            style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text
              className="font-poppins-bold"
              style={{ color: '#404040', fontSize: 16, lineHeight: 24 }}>
              Account Information
            </Text>
            <Pressable
              onPress={() => navigation.navigate('UpdateBankDetails')}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 3.993,
                backgroundColor: '#FFE403',
                borderRadius: 8,
                paddingHorizontal: 11.98,
                paddingVertical: 7.99,
              }}>
              <EditIcon size={15.99} color="#404040" />
              <Text
                className="font-poppins-semibold"
                style={{ color: '#404040', fontSize: 12, lineHeight: 19.92 }}>
                Edit
              </Text>
            </Pressable>
          </View>
          {loading ? (
            <View style={{ paddingVertical: 16, alignItems: 'center' }}>
              <ActivityIndicator color="#4CAF50" />
            </View>
          ) : !hasBank ? (
            <Text
              className="font-poppins-regular"
              style={{ color: '#757575', fontSize: 14, lineHeight: 22 }}>
              No bank details added yet. Tap Edit to add your payout account.
            </Text>
          ) : (
            rows.map(row => (
              <View key={row.label} style={{ gap: 1.997 }}>
                <Text
                  className="font-poppins-regular"
                  style={{ color: '#757575', fontSize: 12, lineHeight: 19.92 }}>
                  {row.label}
                </Text>
                <Text
                  className="font-poppins-semibold"
                  style={{ color: '#404040', fontSize: 16, lineHeight: 24 }}>
                  {row.value}
                </Text>
              </View>
            ))
          )}
        </View>

        <View
          style={{
            backgroundColor: '#EFF6FF',
            borderRadius: 12,
            padding: 12,
            flexDirection: 'row',
            gap: 9,
            borderLeftWidth: 4,
            borderLeftColor: '#2B7FFF',
          }}>
          <InfoIcon size={23.994} color="#2B7FFF" />
          <View style={{ flex: 1, gap: 3.993 }}>
            <Text
              className="font-poppins-bold"
              style={{ color: '#2B7FFF', fontSize: 14, lineHeight: 22.4 }}>
              Important Information
            </Text>
            <Text
              className="font-poppins-regular"
              style={{ color: '#404040', fontSize: 12, lineHeight: 19.92 }}>
              Payouts are credited within 24 hours of delivery completion. Any change to your bank details requires OTP verification.
            </Text>
          </View>
        </View>
      </ScrollView>

      <OtpModal
        visible={showOtp}
        onCancel={() => setShowOtp(false)}
        onVerify={() => {
          setShowOtp(false);
          navigation.navigate('Profile', { toast: 'Bank details updated successfully' });
        }}
      />
    </View>
  );
};

export default BankDetailsScreen;
