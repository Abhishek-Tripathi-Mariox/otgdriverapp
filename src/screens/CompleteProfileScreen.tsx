import React, { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import RegistrationHeader from '../components/RegistrationHeader';
import { FormInput, PrimaryButton } from '../components/FormField';
import { DocumentUploadField } from '../components/DocumentUpload';
import { driverApi } from '../api/client';
import { extractErrorMessage } from '../api/errors';
import { useToast } from '../components/Toast';
import { useAuthStore } from '../store';
import type { RootStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'CompleteProfile'>;

// Final onboarding step — bank/payout details. Personal info, vehicle (with its
// docs) and owner all live on dedicated screens earlier in the flow.
const CompleteProfileScreen: React.FC<Props> = ({ navigation }) => {
  const setOnboardingStep = useAuthStore(s => s.setOnboardingStep);
  const toast = useToast();
  const [submitting, setSubmitting] = useState(false);

  const [holder, setHolder] = useState('');
  const [bank, setBank] = useState('');
  const [account, setAccount] = useState('');
  const [ifsc, setIfsc] = useState('');
  const [passbook, setPassbook] = useState('');

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const res = await driverApi.saveBank({
        accountHolder: holder,
        bankName: bank,
        accountNumber: account,
        ifsc,
        passbookUrl: passbook || undefined,
      });
      setOnboardingStep(res.data.data.onboardingStep);
      navigation.reset({
        index: 0,
        routes: [{ name: 'PendingApproval' }],
      });
    } catch (err: any) {
      toast.error(
        'Could not save',
        extractErrorMessage(err, 'Please try again.'),
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: '#FFE403' }}>
      <RegistrationHeader step={4} onBack={() => navigation.goBack()} />
      <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 16,
            paddingBottom: 40,
            gap: 12,
          }}
          showsVerticalScrollIndicator={false}>
          <Text
            className="font-poppins-semibold"
            style={{ color: '#1E293B', fontSize: 18, lineHeight: 28 }}>
            Bank Details
          </Text>

          <FormInput
            label="Account Holder Name"
            value={holder}
            onChangeText={setHolder}
            placeholder="As per bank records"
          />
          <FormInput
            label="Bank Name"
            value={bank}
            onChangeText={setBank}
            placeholder="Bank name"
          />
          <FormInput
            label="Account Number"
            value={account}
            onChangeText={setAccount}
            placeholder="Account number"
            keyboardType="number-pad"
          />
          <FormInput
            label="IFSC Code"
            value={ifsc}
            onChangeText={setIfsc}
            placeholder="IFSC code"
            autoCapitalize="characters"
          />
          <DocumentUploadField
            label="Upload Passbook/Cheque"
            value={passbook}
            placeholder="Upload document"
            onChange={setPassbook}
          />

          <PrimaryButton
            label={submitting ? 'Saving...' : 'Save & Submit'}
            onPress={handleSubmit}
          />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default CompleteProfileScreen;
