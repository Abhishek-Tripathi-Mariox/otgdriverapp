import React, { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import RegistrationHeader from '../components/RegistrationHeader';
import { FormInput, PrimaryButton } from '../components/FormField';
import { DocumentUploadField } from '../components/DocumentUpload';
import AddressSearchField from '../components/AddressSearchField';
import { DatePickerField } from '../components/DatePickerField';
import { driverApi } from '../api/client';
import { extractErrorMessage } from '../api/errors';
import { useToast } from '../components/Toast';
import { useAuthStore, driverSessionToProfile } from '../store';
import type { RootStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'PersonalDetails'>;

const PersonalDetailsScreen: React.FC<Props> = ({ navigation }) => {
  const driver = useAuthStore(s => s.driver);
  const setDriver = useAuthStore(s => s.setDriver);
  const toast = useToast();

  const [fullName, setFullName] = useState(driver?.name ?? '');
  const [email, setEmail] = useState(driver?.email ?? '');
  const [dob, setDob] = useState('');
  const [address, setAddress] = useState('');
  const [license, setLicense] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ fullName?: string }>({});

  const validate = (): boolean => {
    const next: typeof errors = {};
    if (!fullName.trim()) next.fullName = 'Full name is required';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleBack = () => {
    // PersonalDetails is the root of the stack after the post-OTP reset, so
    // there is nothing to pop. Fall back to Login so the back arrow still works.
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
    }
  };

  const handleNext = async () => {
    if (submitting) return;
    if (!validate()) return;
    setSubmitting(true);
    try {
      // Driving license is a per-driver document; save it alongside personal info
      // when the driver provides one.
      if (license) {
        await driverApi.saveDrivingLicense(license);
      }
      const res = await driverApi.savePersonal({
        name: fullName.trim(),
        email: email.trim() || undefined,
        dateOfBirth: dob || undefined,
        address: address || undefined,
      });
      // Persist the saved driver (incl. address) so later steps — e.g. Owner
      // Details — can auto-fill from it.
      setDriver(driverSessionToProfile(res.data.data.driver));
      navigation.navigate('VehicleDetails', {});
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
      <RegistrationHeader step={1} onBack={handleBack} />
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
            Driver Details
          </Text>

          <FormInput
            label="Full Name"
            value={fullName}
            onChangeText={text => {
              setFullName(text);
              if (errors.fullName) setErrors({ ...errors, fullName: undefined });
            }}
            placeholder="Enter full name"
            error={errors.fullName}
          />
          <FormInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="email@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <DatePickerField
            label="Date of Birth"
            value={dob}
            onChange={setDob}
            placeholder="Select date of birth"
            // 18+ years old
            maxDate={
              new Date(
                new Date().getFullYear() - 18,
                new Date().getMonth(),
                new Date().getDate(),
              )
            }
            minDate={new Date(1940, 0, 1)}
          />
          <AddressSearchField
            label="Address"
            value={address}
            onChangeText={setAddress}
            placeholder="Search your address"
          />
          <DocumentUploadField
            label="Driving License"
            value={license}
            placeholder="Upload Driving License"
            onChange={setLicense}
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

export default PersonalDetailsScreen;
