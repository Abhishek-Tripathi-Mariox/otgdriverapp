import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import RegistrationHeader from '../components/RegistrationHeader';
import {
  FormInput,
  FormSelect,
  PrimaryButton,
} from '../components/FormField';
import { DocumentUploadField } from '../components/DocumentUpload';
import { DatePickerField, YearPickerField } from '../components/DatePickerField';
import { driverApi } from '../api/client';
import { extractErrorMessage } from '../api/errors';
import { useToast } from '../components/Toast';
import { useAuthStore } from '../store';
import type { RootStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'VehicleDetails'>;

const VEHICLE_TYPE_OPTIONS = [
  { label: '3 Wheeler', value: '3' },
  { label: '4 Wheeler', value: '4' },
  { label: '6 Wheeler', value: '6' },
  { label: '8 Wheeler', value: '8' },
  { label: '10 Wheeler', value: '10' },
  { label: '12 Wheeler', value: '12' },
  { label: '16 Wheeler', value: '16' },
];

const INDIAN_REG_REGEX = /^[A-Z]{2}\d{1,2}[A-Z]{1,3}\d{1,4}$/;

const normalizeReg = (raw: string) => raw.toUpperCase().replace(/[\s-]/g, '');
const formatRegForDisplay = (raw: string) =>
  raw.toUpperCase().replace(/\s+/g, '').slice(0, 14);

const VehicleDetailsScreen: React.FC<Props> = ({ navigation, route }) => {
  const editingId = route.params?.vehicleId;
  const driver = useAuthStore(s => s.driver);
  const setOnboardingStep = useAuthStore(s => s.setOnboardingStep);
  const setVehicles = useAuthStore(s => s.setVehicles);
  const toast = useToast();

  const editingVehicle = useMemo(
    () => driver?.vehicles?.find(v => v._id === editingId),
    [driver?.vehicles, editingId],
  );
  const isEditing = !!editingVehicle;

  const [brand, setBrand] = useState(editingVehicle?.brand ?? '');
  const [model, setModel] = useState(editingVehicle?.model ?? '');
  const [vehicleType, setVehicleType] = useState(editingVehicle?.type ?? '');
  const [color, setColor] = useState(editingVehicle?.color ?? '');
  const [year, setYear] = useState(editingVehicle?.year ?? '');
  const [liftingCapacity, setLiftingCapacity] = useState(
    editingVehicle?.liftingCapacity ?? '',
  );
  const [regNo, setRegNo] = useState(editingVehicle?.registrationNo ?? '');
  const [insuranceNo, setInsuranceNo] = useState(
    editingVehicle?.insuranceNo ?? '',
  );
  const [insuranceExpiry, setInsuranceExpiry] = useState(
    editingVehicle?.insuranceExpiry
      ? String(editingVehicle.insuranceExpiry).slice(0, 10)
      : '',
  );
  // Per-vehicle docs. DocumentUploadField uploads the picked file to S3 and
  // calls onChange with the resulting URL, which we store here and send on save.
  const [rcBook, setRcBook] = useState(
    editingVehicle?.documents?.rcBook?.url ?? '',
  );
  const [insuranceDoc, setInsuranceDoc] = useState(
    editingVehicle?.documents?.insurance?.url ?? '',
  );
  const [pollution, setPollution] = useState(
    editingVehicle?.documents?.pollutionCertificate?.url ?? '',
  );
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<{
    vehicleType?: string;
    regNo?: string;
  }>({});

  const validate = (): boolean => {
    const next: typeof errors = {};
    if (!vehicleType) next.vehicleType = 'Select vehicle type';
    const normalized = normalizeReg(regNo);
    if (!normalized) {
      next.regNo = 'Registration number is required';
    } else if (!INDIAN_REG_REGEX.test(normalized)) {
      next.regNo = 'Invalid format. Example: KA01AB1234';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async () => {
    if (submitting) return;
    if (!validate()) return;
    setSubmitting(true);
    try {
      // Only send docs that are new or changed — backend reuses the existing
      // entry when a key is omitted, so we don't overwrite an approved doc by
      // accident.
      const docs: Record<string, string> = {};
      if (rcBook && rcBook !== editingVehicle?.documents?.rcBook?.url) {
        docs.rcBook = rcBook;
      }
      if (
        insuranceDoc &&
        insuranceDoc !== editingVehicle?.documents?.insurance?.url
      ) {
        docs.insurance = insuranceDoc;
      }
      if (
        pollution &&
        pollution !== editingVehicle?.documents?.pollutionCertificate?.url
      ) {
        docs.pollutionCertificate = pollution;
      }

      const payload = {
        brand,
        model,
        type: vehicleType,
        color,
        year,
        liftingCapacity,
        registrationNo: normalizeReg(regNo),
        insuranceNo,
        insuranceExpiry: insuranceExpiry || undefined,
        ...(Object.keys(docs).length ? { documents: docs } : {}),
      };

      if (isEditing && editingId) {
        const res = await driverApi.updateVehicle(editingId, payload);
        const updated = res.data.data.driver;
        setVehicles(
          (updated.vehicles || []).map((v: any) => ({
            ...v,
            _id: String(v._id),
          })),
        );
        navigation.goBack();
      } else {
        const res = await driverApi.addVehicle(payload);
        const updated = res.data.data.driver;
        setVehicles(
          (updated.vehicles || []).map((v: any) => ({
            ...v,
            _id: String(v._id),
          })),
        );
        setOnboardingStep(res.data.data.onboardingStep);
        // First-time onboarding flow continues to OwnerDetails;
        // when the user is adding a second/third vehicle from MyVehicles, go back instead.
        if (
          driver?.onboardingStep === 'vehicle' ||
          (updated.vehicles?.length ?? 0) === 1
        ) {
          navigation.navigate('OwnerDetails');
        } else {
          navigation.goBack();
        }
      }
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
      <RegistrationHeader step={1} onBack={() => navigation.goBack()} />
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
            {isEditing ? 'Edit Vehicle' : 'Vehicle Details'}
          </Text>

          <FormInput
            label="Brand"
            value={brand}
            onChangeText={setBrand}
            placeholder="e.g., Mahindra"
          />
          <FormInput
            label="Model"
            value={model}
            onChangeText={setModel}
            placeholder="e.g., Innova Crysta"
          />
          <FormSelect
            label="Vehicle type"
            value={vehicleType}
            placeholder="Select wheeler type"
            options={VEHICLE_TYPE_OPTIONS}
            onSelect={value => {
              setVehicleType(value);
              if (errors.vehicleType)
                setErrors({ ...errors, vehicleType: undefined });
            }}
            error={errors.vehicleType}
          />
          <FormInput
            label="Color of vehicle"
            value={color}
            onChangeText={setColor}
            placeholder="e.g., Red"
          />

          <View style={{ flexDirection: 'row', gap: 12 }}>
            <YearPickerField
              label="Year"
              value={year}
              onChange={setYear}
              minYear={1980}
              maxYear={new Date().getFullYear() + 1}
              placeholder="Year"
              containerStyle={{ flex: 1 }}
            />
            <FormInput
              label="Lifting capacity"
              value={liftingCapacity}
              onChangeText={setLiftingCapacity}
              placeholder="1500 kg"
              containerStyle={{ flex: 1 }}
            />
          </View>

          <FormInput
            label="Registration No"
            value={regNo}
            onChangeText={text => {
              setRegNo(formatRegForDisplay(text));
              if (errors.regNo) setErrors({ ...errors, regNo: undefined });
            }}
            placeholder="KA01AB1234"
            autoCapitalize="characters"
            autoCorrect={false}
            maxLength={14}
            error={errors.regNo}
            editable={!isEditing}
          />
          <FormInput
            label="Insurance No"
            value={insuranceNo}
            onChangeText={setInsuranceNo}
            placeholder="Enter insurance number"
          />
          <DatePickerField
            label="Insurance Expiry Date"
            value={insuranceExpiry}
            onChange={setInsuranceExpiry}
            placeholder="Select expiry date"
            minDate={new Date()}
            maxDate={
              new Date(
                new Date().getFullYear() + 5,
                new Date().getMonth(),
                new Date().getDate(),
              )
            }
          />

          <Text
            className="font-poppins-semibold"
            style={{
              color: '#1E293B',
              fontSize: 16,
              lineHeight: 22,
              marginTop: 8,
            }}>
            Vehicle Documents
          </Text>

          <DocumentUploadField
            label="RC Book"
            value={rcBook}
            placeholder="Upload RC Book"
            onChange={setRcBook}
          />
          <DocumentUploadField
            label="Insurance"
            value={insuranceDoc}
            placeholder="Upload Insurance"
            onChange={setInsuranceDoc}
          />
          <DocumentUploadField
            label="Pollution Certificate"
            value={pollution}
            placeholder="Upload Pollution Certificate"
            onChange={setPollution}
          />

          <PrimaryButton
            label={
              submitting
                ? 'Saving...'
                : isEditing
                  ? 'Save Changes'
                  : 'Next'
            }
            onPress={handleSubmit}
          />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default VehicleDetailsScreen;
