import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import ScreenHeader from '../components/ScreenHeader';
import { ShieldIcon, InfoIcon } from '../components/DashboardIcons';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { driverApi } from '../api/client';
import { extractErrorMessage } from '../api/errors';
import { useToast } from '../components/Toast';

type Props = NativeStackScreenProps<RootStackParamList, 'UpdateBankDetails'>;

type FieldKey = 'holder' | 'account' | 'confirm' | 'ifsc' | 'bank' | 'branch';

const FIELDS: { key: FieldKey; label: string; placeholder: string; keyboard?: 'default' | 'number-pad' }[] = [
  { key: 'holder', label: 'Account Holder Name', placeholder: 'Enter full name' },
  { key: 'account', label: 'Account Number', placeholder: 'Enter account number', keyboard: 'number-pad' },
  { key: 'confirm', label: 'Confirm Account Number', placeholder: 'Re-enter account number', keyboard: 'number-pad' },
  { key: 'ifsc', label: 'IFSC Code', placeholder: 'Enter IFSC code' },
  { key: 'bank', label: 'Bank Name', placeholder: 'Enter bank name' },
  { key: 'branch', label: 'Branch', placeholder: 'Enter branch' },
];

const UpdateBankDetailsScreen: React.FC<Props> = ({ navigation }) => {
  const [values, setValues] = useState<Record<FieldKey, string>>({
    holder: '',
    account: '',
    confirm: '',
    ifsc: '',
    bank: '',
    branch: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();

  const setField = (key: FieldKey, v: string) =>
    setValues(s => ({ ...s, [key]: v }));

  const handleProceed = async () => {
    if (submitting) return;
    const holder = values.holder.trim();
    const account = values.account.trim();
    const confirm = values.confirm.trim();
    const ifsc = values.ifsc.trim();
    const bank = values.bank.trim();
    const branch = values.branch.trim();

    if (!holder || !account || !ifsc || !bank) {
      toast.error('Missing details', 'Please fill in all required bank fields.');
      return;
    }
    if (account !== confirm) {
      toast.error('Account number mismatch', 'The account numbers do not match.');
      return;
    }

    // Matches the DriverBank shape that BankDetailsScreen reads back via me().
    const payload = {
      accountHolder: holder,
      accountNumber: account,
      ifsc,
      bankName: bank,
      branch,
    };

    setSubmitting(true);
    try {
      await driverApi.saveBank(payload);
      // Hand the freshly-saved values to BankDetails so the OTP flow runs on
      // persisted data (BankDetails also re-fetches via me()).
      navigation.navigate('BankDetails', { showOtp: true });
    } catch (err: any) {
      toast.error(
        'Could not save bank details',
        extractErrorMessage(err, 'Please try again.'),
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F5F5F5' }}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: '#FFE403' }}>
        <ScreenHeader title="Update Bank Details" onBack={() => navigation.goBack()} />
      </SafeAreaView>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 13,
          paddingTop: 16,
          paddingBottom: 32,
          gap: 16,
        }}
        showsVerticalScrollIndicator={false}>
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
          <ShieldIcon size={23.994} color="#2B7FFF" />
          <View style={{ flex: 1, gap: 3.993 }}>
            <Text
              className="font-poppins-bold"
              style={{ color: '#2B7FFF', fontSize: 14, lineHeight: 22.4 }}>
              Security Notice
            </Text>
            <Text
              className="font-poppins-regular"
              style={{ color: '#404040', fontSize: 12, lineHeight: 19.92 }}>
              Your bank details are encrypted and securely stored. Changes require OTP verification.
            </Text>
          </View>
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
          {FIELDS.map(f => (
            <View key={f.key} style={{ gap: 7.99 }}>
              <Text
                className="font-poppins-semibold"
                style={{ color: '#404040', fontSize: 14, lineHeight: 20 }}>
                {f.label}
              </Text>
              <TextInput
                value={values[f.key]}
                onChangeText={v => setField(f.key, v)}
                placeholder={f.placeholder}
                placeholderTextColor="#BDBDBD"
                keyboardType={f.keyboard ?? 'default'}
                editable={!submitting}
                className="font-poppins-regular"
                style={{
                  height: 47.995,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: '#00000023',
                  paddingHorizontal: 13,
                  color: '#404040',
                  fontSize: 14,
                }}
              />
            </View>
          ))}
        </View>

        <View
          style={{
            backgroundColor: '#FEFCE8',
            borderRadius: 12,
            padding: 12,
            flexDirection: 'row',
            gap: 9,
            borderWidth: 1,
            borderColor: '#FFF085',
          }}>
          <InfoIcon size={23.994} color="#E48714" />
          <View style={{ flex: 1, gap: 3.993 }}>
            <Text
              className="font-poppins-bold"
              style={{ color: '#E48714', fontSize: 14, lineHeight: 22.4 }}>
              Verification Process
            </Text>
            <Text
              className="font-poppins-regular"
              style={{ color: '#404040', fontSize: 12, lineHeight: 19.92 }}>
              An OTP will be sent to your registered mobile number to confirm these changes.
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: 9 }}>
          <Pressable
            onPress={() => navigation.goBack()}
            disabled={submitting}
            style={{
              flex: 1,
              height: 55.994,
              borderRadius: 8,
              borderWidth: 1.5,
              borderColor: '#E0E0E0',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Text
              className="font-poppins-semibold"
              style={{ color: '#757575', fontSize: 16, lineHeight: 24 }}>
              Cancel
            </Text>
          </Pressable>
          <Pressable
            onPress={handleProceed}
            disabled={submitting}
            style={{
              flex: 1.6,
              height: 55.994,
              borderRadius: 8,
              backgroundColor: '#FFE403',
              opacity: submitting ? 0.6 : 1,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            {submitting ? (
              <ActivityIndicator color="#404040" />
            ) : (
              <Text
                className="font-poppins-bold"
                style={{ color: '#404040', fontSize: 14, lineHeight: 20, textAlign: 'center' }}>
                Proceed to OTP Verification
              </Text>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
};

export default UpdateBankDetailsScreen;
