import React, { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import RegistrationHeader from '../components/RegistrationHeader';
import { FormInput, PrimaryButton } from '../components/FormField';
import AddressSearchField from '../components/AddressSearchField';
import { driverApi } from '../api/client';
import { extractErrorMessage } from '../api/errors';
import { useToast } from '../components/Toast';
import { useAuthStore } from '../store';
import type { RootStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'OwnerDetails'>;

const OwnerDetailsScreen: React.FC<Props> = ({ navigation }) => {
  const driver = useAuthStore(s => s.driver);
  const setOnboardingStep = useAuthStore(s => s.setOnboardingStep);
  const toast = useToast();

  const [ownerName, setOwnerName] = useState(driver?.owner?.name ?? '');
  // Default the contact number to the mobile the driver logged in with —
  // they can still edit it if the vehicle's owner is a different person.
  const [contact, setContact] = useState(
    driver?.owner?.contact ?? driver?.mobile ?? '',
  );
  // Auto-fill from the address entered at step 1 (driver's personal address);
  // a previously saved owner address takes precedence. Editable either way.
  const [address, setAddress] = useState(
    driver?.owner?.address ?? driver?.address?.full ?? '',
  );
  const [submitting, setSubmitting] = useState(false);

  const handleNext = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const res = await driverApi.saveOwner({
        name: ownerName,
        contact,
        address,
      });
      setOnboardingStep(res.data.data.onboardingStep);
      navigation.navigate('CompleteProfile');
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
      <RegistrationHeader step={2} onBack={() => navigation.goBack()} />
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
            Owner Details
          </Text>

          <FormInput
            label="Owner Name"
            value={ownerName}
            onChangeText={setOwnerName}
            placeholder="Full name"
          />
          <FormInput
            label="Contact Number"
            value={contact}
            onChangeText={setContact}
            placeholder="10 digit mobile"
            keyboardType="number-pad"
            maxLength={10}
          />
          <AddressSearchField
            label="Address"
            value={address}
            onChangeText={setAddress}
            placeholder="Search your address"
          />

          <PrimaryButton
            label={submitting ? 'Saving...' : 'Next'}
            onPress={handleNext}
          />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default OwnerDetailsScreen;
