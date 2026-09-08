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
  const [pincode, setPincode] = useState('');
  const [license, setLicense] = useState(driver?.documents?.drivingLicense?.url ?? '');
  const [securityPhoto, setSecurityPhoto] = useState(
    driver?.documents?.securityPhoto?.url ?? '',
  );
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<{
    fullName?: string;
    license?: string;
    securityPhoto?: string;
  }>({});

  const validate = (): boolean => {
    const next: typeof errors = {};
    if (!fullName.trim()) next.fullName = 'Full name is required';
    if (!license) next.license = 'Driving license is required';
    if (!securityPhoto) next.securityPhoto = 'Your photo is required for security verification';
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
      // Driving license + security photo are per-driver documents; save them
      // alongside personal info before advancing the onboarding step.
      await driverApi.saveDrivingLicense(license);
      await driverApi.saveSecurityPhoto(securityPhoto);
      const res = await driverApi.savePersonal({
        name: fullName.trim(),
        email: email.trim() || undefined,
        dateOfBirth: dob || undefined,
        address: address || undefined,
        pincode: pincode || undefined,
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
          <FormInput
            label="Pincode"
            value={pincode}
            onChangeText={t => setPincode(t.replace(/[^0-9]/g, '').slice(0, 6))}
            placeholder="6-digit pincode"
            keyboardType="number-pad"
            maxLength={6}
          />
          <DocumentUploadField
            label="Driving License *"
            value={license}
            placeholder="Upload Driving License"
            onChange={text => {
              setLicense(text);
              if (errors.license) setErrors({ ...errors, license: undefined });
            }}
            error={errors.license}
          />
          <DocumentUploadField
            label="Your Photo (Security Verification) *"
            value={securityPhoto}
            placeholder="Take a selfie"
            onChange={text => {
              setSecurityPhoto(text);
              if (errors.securityPhoto)
                setErrors({ ...errors, securityPhoto: undefined });
            }}
            error={errors.securityPhoto}
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
