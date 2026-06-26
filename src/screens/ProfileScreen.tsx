import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import {
  launchCamera,
  launchImageLibrary,
  type Asset,
  type ImagePickerResponse,
} from 'react-native-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import BottomNavBar, { NavTab } from '../components/BottomNavBar';
import {
  ArrowLeftIcon,
  UserIcon,
  TruckOutlineIcon,
  DocumentIcon,
  BankIcon,
  LogoutIcon,
  ChevronRightIcon,
  CheckSmallIcon,
  HelpIcon,
  MapPinIcon,
  InfoIcon,
  EditIcon,
} from '../components/DashboardIcons';
import {
  useAuthStore,
  driverSessionToProfile,
  screenForStep,
} from '../store';
import type { DriverAddress, DriverBank } from '../store';
import { driverApi } from '../api/client';
import { extractErrorMessage } from '../api/errors';
import { useToast } from '../components/Toast';
import { useDocumentUpload } from '../components/DocumentUpload';
import type { RootStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Profile'>;
type DocStatus = 'pending' | 'approved' | 'rejected' | 'not_uploaded';

// Pull a usable asset out of an image-picker response. Returns null when the
// user cancelled or denied permission so the caller can stay quiet.
const assetFromResponse = (r: ImagePickerResponse): Asset | null => {
  if (r.didCancel) return null;
  if (r.errorCode) {
    // 'permission' / 'camera_unavailable' / 'others' — surface as a toast in
    // the caller so we don't open an Alert mid-flow.
    return null;
  }
  const a = r.assets?.[0];
  if (!a?.uri) return null;
  return a;
};

const STATUS_PALETTE: Record<
  DocStatus,
  { bg: string; fg: string; label: string }
> = {
  approved: { bg: '#E8F5E9', fg: '#4CAF50', label: 'Approved' },
  pending: { bg: '#FFF8E1', fg: '#E48714', label: 'Pending Review' },
  rejected: { bg: '#FFEBEE', fg: '#F44336', label: 'Rejected' },
  not_uploaded: { bg: '#ECECF0', fg: '#757575', label: 'Not uploaded' },
};

const StatusChip: React.FC<{ status: DocStatus }> = ({ status }) => {
  const palette = STATUS_PALETTE[status];
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3.993,
        backgroundColor: palette.bg,
        borderRadius: 999,
        paddingHorizontal: 7.99,
        paddingVertical: 3.993,
      }}>
      {status === 'approved' && (
        <CheckSmallIcon size={11.98} color={palette.fg} />
      )}
      <Text
        className="font-poppins-semibold"
        style={{ color: palette.fg, fontSize: 11, lineHeight: 16 }}>
        {palette.label}
      </Text>
    </View>
  );
};

const ApprovalChip: React.FC<{
  status: 'pending' | 'approved' | 'rejected';
}> = ({ status }) => {
  const palette = {
    approved: {
      bg: '#E8F5E9',
      dot: '#4CAF50',
      fg: '#4CAF50',
      label: 'Active Driver',
    },
    pending: {
      bg: '#FFF8E1',
      dot: '#E48714',
      fg: '#E48714',
      label: 'Awaiting Approval',
    },
    rejected: {
      bg: '#FFEBEE',
      dot: '#F44336',
      fg: '#F44336',
      label: 'Rejected',
    },
  }[status];
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3.993,
        backgroundColor: palette.bg,
        borderRadius: 999,
        paddingHorizontal: 11.98,
        paddingVertical: 3.993,
      }}>
      <View
        style={{
          width: 7.99,
          height: 7.99,
          borderRadius: 3.993,
          backgroundColor: palette.dot,
        }}
      />
      <Text
        className="font-poppins-semibold"
        style={{ color: palette.fg, fontSize: 12, lineHeight: 19.92 }}>
        {palette.label}
      </Text>
    </View>
  );
};

const QuickAction: React.FC<{
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  subtitle: string;
  titleColor?: string;
  onPress?: () => void;
}> = ({ icon, iconBg, title, subtitle, titleColor = '#404040', onPress }) => (
  <Pressable
    onPress={onPress}
    style={{
      backgroundColor: '#FFFFFF',
      borderRadius: 12,
      padding: 12,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.14,
      shadowRadius: 5,
      elevation: 2,
    }}>
    <View
      style={{
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: iconBg,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      {icon}
    </View>
    <View style={{ flex: 1, gap: 1.997 }}>
      <Text
        className="font-poppins-semibold"
        style={{ color: titleColor, fontSize: 16, lineHeight: 24 }}>
        {title}
      </Text>
      <Text
        className="font-poppins-regular"
        style={{ color: '#757575', fontSize: 12, lineHeight: 19.92 }}>
        {subtitle}
      </Text>
    </View>
    <ChevronRightIcon size={19.994} color="#757575" />
  </Pressable>
);

const formatMobile = (raw?: string) => {
  if (!raw) return '';
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 10) {
    return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
  }
  if (digits.length === 12 && digits.startsWith('91')) {
    return `+91 ${digits.slice(2, 7)} ${digits.slice(7)}`;
  }
  return raw;
};

const docStatusOf = (
  doc?: { url?: string; status?: 'pending' | 'approved' | 'rejected' },
): DocStatus => {
  if (!doc?.url) return 'not_uploaded';
  return doc.status || 'pending';
};

const formatDob = (raw?: string): string | null => {
  if (!raw) return null;
  const d = new Date(raw);
  if (isNaN(d.getTime())) return null;
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const addressOneLine = (a?: DriverAddress): string | null => {
  if (!a) return null;
  if (a.full && a.full.trim()) return a.full.trim();
  const parts = [a.street, a.city, a.state, a.pincode]
    .map(p => (p || '').trim())
    .filter(Boolean);
  return parts.length ? parts.join(', ') : null;
};

const maskAccount = (acc?: string): string | null => {
  if (!acc) return null;
  const trimmed = acc.replace(/\s+/g, '');
  if (trimmed.length <= 4) return trimmed;
  return `••••${trimmed.slice(-4)}`;
};

const bankSubtitle = (bank?: DriverBank): string => {
  const masked = maskAccount(bank?.accountNumber);
  if (!masked) return 'Add your payout account';
  return bank?.bankName ? `${masked} · ${bank.bankName}` : masked;
};

const STEP_LABEL: Record<string, string> = {
  personal: 'Add personal details',
  vehicle: 'Add vehicle details',
  owner: 'Add owner details',
  bank: 'Add bank details',
};

const CameraGlyph = () => (
  <View
    style={{
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: '#FFFFFF',
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
      elevation: 2,
    }}>
    <Text style={{ fontSize: 14 }}>✏️</Text>
  </View>
);

const ProfileScreen: React.FC<Props> = ({ navigation, route }) => {
  const driver = useAuthStore(s => s.driver);
  const setDriver = useAuthStore(s => s.setDriver);
  const logout = useAuthStore(s => s.logout);
  const toast = useToast();
  const [navTab, setNavTab] = useState<NavTab>('Profile');
  const [savingImage, setSavingImage] = useState(false);
  const [showPickerSheet, setShowPickerSheet] = useState(false);
  const [editVisible, setEditVisible] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const docUpload = useDocumentUpload();
  const [licenseBusy, setLicenseBusy] = useState(false);
  const lastToastRef = useRef<string | null>(null);

  // Show toast handed in via route params (legacy callsites use this).
  useEffect(() => {
    const passed = route.params?.toast;
    if (passed && passed !== lastToastRef.current) {
      lastToastRef.current = passed;
      toast.success(passed);
    }
  }, [route.params?.toast, toast]);

  // Refresh from server on focus so approval-status flips show up immediately.
  const refresh = useCallback(async () => {
    try {
      const res = await driverApi.me();
      setDriver(driverSessionToProfile(res.data.data));
    } catch {
      // network/transient — keep showing what we already have
    }
  }, [setDriver]);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  const handleNav = (next: NavTab) => {
    setNavTab(next);
    if (next === 'Home') navigation.navigate('Home');
    if (next === 'Orders') navigation.navigate('MyOrders');
    if (next === 'Earnings') navigation.navigate('Earnings');
  };

  const handleLogout = () => {
    logout();
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  };

  const openEditProfile = () => {
    setEditName(driver?.name || '');
    setEditEmail(driver?.email || '');
    setEditVisible(true);
  };

  const handleSaveProfile = async () => {
    if (!editName.trim()) {
      toast.error('Name required', 'Please enter your name.');
      return;
    }
    const email = editEmail.trim();
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Invalid email', 'Please enter a valid email address.');
      return;
    }
    setSavingProfile(true);
    try {
      // savePersonal updates name/email (and only advances onboarding forward,
      // so a completed driver's step is preserved).
      const res = await driverApi.savePersonal({
        name: editName.trim(),
        email: email || undefined,
      });
      setDriver(driverSessionToProfile(res.data.data.driver));
      setEditVisible(false);
      toast.success('Profile updated');
    } catch (err: any) {
      toast.error(
        'Could not update',
        extractErrorMessage(err, 'Please try again.'),
      );
    } finally {
      setSavingProfile(false);
    }
  };

  const uploadAsset = async (asset: Asset) => {
    if (!asset.base64) {
      toast.error('Could not read image', 'Please try again.');
      return;
    }
    setSavingImage(true);
    try {
      const res = await driverApi.uploadProfileImage({
        base64: asset.base64,
        type: asset.type || 'image/jpeg',
      });
      setDriver(driverSessionToProfile(res.data.data));
      toast.success('Profile photo updated');
    } catch (err: any) {
      toast.error(
        'Could not update photo',
        extractErrorMessage(err, 'Please try again.'),
      );
    } finally {
      setSavingImage(false);
    }
  };

  const handleTakePhoto = async () => {
    setShowPickerSheet(false);
    if (savingImage) return;
    try {
      const res = await launchCamera({
        mediaType: 'photo',
        quality: 0.7,
        maxWidth: 1024,
        maxHeight: 1024,
        cameraType: 'front',
        saveToPhotos: false,
        includeBase64: true,
      });
      if (res.errorCode === 'permission') {
        Alert.alert(
          'Camera permission needed',
          'Enable camera access in Settings to take a profile photo.',
        );
        return;
      }
      const asset = assetFromResponse(res);
      if (asset) await uploadAsset(asset);
    } catch (err: any) {
      toast.error(
        'Could not open camera',
        extractErrorMessage(err, 'Please try again.'),
      );
    }
  };

  const handlePickFromGallery = async () => {
    setShowPickerSheet(false);
    if (savingImage) return;
    try {
      const res = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.7,
        maxWidth: 1024,
        maxHeight: 1024,
        selectionLimit: 1,
        includeBase64: true,
      });
      if (res.errorCode === 'permission') {
        Alert.alert(
          'Gallery permission needed',
          'Enable photo access in Settings to pick a profile photo.',
        );
        return;
      }
      const asset = assetFromResponse(res);
      if (asset) await uploadAsset(asset);
    } catch (err: any) {
      toast.error(
        'Could not open gallery',
        extractErrorMessage(err, 'Please try again.'),
      );
    }
  };

  const handlePickAvatar = () => {
    if (savingImage) return;
    setShowPickerSheet(true);
  };

  const handleUploadLicense = () => {
    if (licenseBusy) return;
    docUpload.start(async ({ url }) => {
      setLicenseBusy(true);
      try {
        await driverApi.reuploadDrivingLicense(url);
        await refresh();
        toast.success('Document uploaded');
      } catch (err: any) {
        toast.error(
          'Could not upload',
          extractErrorMessage(err, 'Please try again.'),
        );
      } finally {
        setLicenseBusy(false);
      }
    });
  };

  const headerName =
    driver?.owner?.name || driver?.name || 'Driver';
  const vehicleCount = driver?.vehicles?.length ?? 0;
  const vehicleSubtitle =
    vehicleCount === 0
      ? 'Add your first vehicle'
      : `${vehicleCount} vehicle${vehicleCount > 1 ? 's' : ''} registered`;

  // Primary vehicle + document statuses for the Vehicle Details / Documents cards.
  const primaryVehicle = driver?.vehicles?.[0];
  const vehicleType = primaryVehicle
    ? [primaryVehicle.brand, primaryVehicle.model].filter(Boolean).join(' ') ||
      primaryVehicle.type ||
      '—'
    : '—';
  const vehicleNumber = primaryVehicle?.registrationNo || '—';
  const vehicleCapacity = primaryVehicle?.liftingCapacity || '—';
  const rcStatus = docStatusOf(primaryVehicle?.documents?.rcBook);
  const insuranceStatus = docStatusOf(primaryVehicle?.documents?.insurance);
  const bankStatus: DocStatus = driver?.bank?.accountNumber
    ? 'approved'
    : 'not_uploaded';

  const dob = formatDob(driver?.dateOfBirth);
  const driverAddress = addressOneLine(driver?.address);
  const ownerAddress = driver?.owner?.address?.trim() || null;
  const ownerName = driver?.owner?.name?.trim() || null;
  const ownerContact = driver?.owner?.contact?.trim() || null;
  const hasPersonalInfo = !!(driver?.email || dob || driverAddress);
  const hasOwnerInfo = !!(ownerName || ownerContact || ownerAddress);

  const onboardingStep = driver?.onboardingStep;
  const onboardingPending =
    !!onboardingStep && onboardingStep !== 'completed';
  const resumeOnboarding = () => {
    if (!driver) return;
    const target = screenForStep(
      driver.onboardingStep,
      driver.approvalStatus,
    );
    navigation.navigate(target as any);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F5F5F5' }}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: '#FFE403' }}>
        <View
          style={{
            paddingHorizontal: 13,
            paddingTop: 12,
            paddingBottom: 14,
            alignItems: 'stretch',
            gap: 10,
          }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              alignSelf: 'stretch',
            }}>
            <Pressable
              onPress={() => navigation.goBack()}
              style={{
                width: 39.966,
                height: 39.966,
                borderRadius: 19.983,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <ArrowLeftIcon size={23.994} color="#404040" />
            </Pressable>
            <Text
              className="font-poppins-bold"
              style={{
                color: '#404040',
                fontSize: 18,
                lineHeight: 26,
                marginLeft: 12,
              }}>
              My Profile
            </Text>
          </View>

          {/* Avatar (left) + name / phone / status (right) — matches design */}
          <View
            style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Pressable onPress={handlePickAvatar} disabled={savingImage}>
              <View
                style={{
                  width: 62,
                  height: 62,
                  borderRadius: 31,
                  backgroundColor: '#FFFFFF',
                  alignItems: 'center',
                  justifyContent: 'center',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.2,
                  shadowRadius: 8,
                  elevation: 4,
                  overflow: 'hidden',
                }}>
                {driver?.profileImage ? (
                  <Image
                    source={{ uri: driver.profileImage }}
                    style={{ width: 62, height: 62 }}
                    resizeMode="cover"
                  />
                ) : (
                  <UserIcon size={36} color="#E48714" />
                )}
              </View>
              <View
                style={{ position: 'absolute', right: -2, bottom: -2 }}
                pointerEvents="none">
                {savingImage ? (
                  <View
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 14,
                      backgroundColor: '#FFFFFF',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                    <ActivityIndicator size="small" color="#E48714" />
                  </View>
                ) : (
                  <CameraGlyph />
                )}
              </View>
            </Pressable>

            <View style={{ flex: 1, gap: 4 }}>
              <Text
                className="font-poppins-bold"
                style={{ color: '#404040', fontSize: 18, lineHeight: 24 }}
                numberOfLines={1}>
                {headerName}
              </Text>
              <Text
                className="font-poppins-regular"
                style={{ color: '#404040', fontSize: 13, lineHeight: 18 }}>
                {formatMobile(driver?.owner?.contact || driver?.mobile)}
              </Text>
              <View style={{ alignSelf: 'flex-start' }}>
                <ApprovalChip status={driver?.approvalStatus ?? 'pending'} />
              </View>
            </View>
            <Pressable
              onPress={openEditProfile}
              hitSlop={8}
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: 'rgba(255,255,255,0.55)',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <EditIcon size={18} color="#404040" />
            </Pressable>
          </View>
          {driver?.approvalStatus === 'rejected' &&
            driver.rejectionReason && (
              <Text
                className="font-poppins-regular"
                style={{
                  color: '#B71C1C',
                  fontSize: 12,
                  lineHeight: 18,
                  marginTop: 2,
                }}>
                {driver.rejectionReason}
              </Text>
            )}
        </View>
      </SafeAreaView>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 13,
          paddingTop: 16,
          paddingBottom: 24,
          gap: 12,
        }}
        showsVerticalScrollIndicator={false}>
        {/* Resume onboarding — only when the driver hasn't finished all steps */}
        {onboardingPending && (
          <Pressable
            onPress={resumeOnboarding}
            style={{
              backgroundColor: '#FFF8E1',
              borderRadius: 12,
              borderLeftWidth: 4,
              borderLeftColor: '#E48714',
              padding: 12,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 9,
            }}>
            <InfoIcon size={23.994} color="#E48714" />
            <View style={{ flex: 1, gap: 1.997 }}>
              <Text
                className="font-poppins-bold"
                style={{ color: '#E48714', fontSize: 14, lineHeight: 22 }}>
                Complete your profile
              </Text>
              <Text
                className="font-poppins-regular"
                style={{ color: '#404040', fontSize: 12, lineHeight: 19.92 }}>
                {STEP_LABEL[onboardingStep!] || 'Finish remaining steps'}
              </Text>
            </View>
            <ChevronRightIcon size={19.994} color="#E48714" />
          </Pressable>
        )}

        {/* Vehicle Details */}
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
            elevation: 2,
          }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 9 }}>
            <TruckOutlineIcon size={22} color="#E48714" />
            <Text
              className="font-poppins-bold"
              style={{ color: '#404040', fontSize: 16, lineHeight: 24 }}>
              Vehicle Details
            </Text>
          </View>
          {primaryVehicle ? (
            <View style={{ gap: 7.99 }}>
              <DetailLine label="Vehicle Type" value={vehicleType} />
              <DetailLine label="Vehicle Number" value={vehicleNumber} />
              <DetailLine label="Capacity" value={vehicleCapacity} />
            </View>
          ) : (
            <Pressable onPress={() => navigation.navigate('MyVehicles')}>
              <Text
                className="font-poppins-regular"
                style={{ color: '#757575', fontSize: 13, lineHeight: 20 }}>
                No vehicle added yet. Tap to add your vehicle.
              </Text>
            </Pressable>
          )}
        </View>

        {/* Documents */}
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
            elevation: 2,
          }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 9 }}>
            <DocumentIcon size={22} color="#E48714" />
            <Text
              className="font-poppins-bold"
              style={{ color: '#404040', fontSize: 16, lineHeight: 24 }}>
              Documents
            </Text>
          </View>

          <DocRow
            label="Driving License"
            status={docStatusOf(driver?.documents?.drivingLicense)}
            reason={driver?.documents?.drivingLicense?.rejectionReason}
            busy={licenseBusy || docUpload.uploading}
            onUpload={handleUploadLicense}
          />
          <View style={{ height: 1, backgroundColor: '#F0F0F0' }} />
          <DocRow label="Vehicle RC" status={rcStatus} />
          <View style={{ height: 1, backgroundColor: '#F0F0F0' }} />
          <DocRow label="Insurance" status={insuranceStatus} />
          <View style={{ height: 1, backgroundColor: '#F0F0F0' }} />
          <DocRow label="Bank Details" status={bankStatus} />

          <Pressable
            onPress={() => navigation.navigate('MyVehicles')}
            style={{
              marginTop: 4,
              height: 44,
              borderRadius: 10,
              borderWidth: 1.4,
              borderColor: '#E48714',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Text
              className="font-poppins-semibold"
              style={{ color: '#E48714', fontSize: 14, lineHeight: 20 }}>
              Update Document Request
            </Text>
          </Pressable>
        </View>

        <QuickAction
          icon={<BankIcon size={23.994} color="#FFFFFF" />}
          iconBg="#4CAF50"
          title="Bank Details"
          subtitle={bankSubtitle(driver?.bank)}
          onPress={() => navigation.navigate('BankDetails')}
        />
        <QuickAction
          icon={<HelpIcon size={23.994} color="#FFFFFF" />}
          iconBg="#2B7FFF"
          title="Help & Support"
          subtitle="Reach out to the OTG team"
          onPress={() => navigation.navigate('HelpSupport')}
        />
        <QuickAction
          icon={<LogoutIcon size={23.994} color="#FFFFFF" />}
          iconBg="#F44336"
          title="Logout"
          subtitle="Sign out of your account"
          titleColor="#F44336"
          onPress={handleLogout}
        />
      </ScrollView>

      <SafeAreaView edges={['bottom']} style={{ backgroundColor: '#FFFFFF' }}>
        <BottomNavBar active={navTab} onChange={handleNav} />
      </SafeAreaView>

      <PhotoSourceSheet
        visible={showPickerSheet}
        onCamera={handleTakePhoto}
        onGallery={handlePickFromGallery}
        onCancel={() => setShowPickerSheet(false)}
      />

      {/* Edit Profile (name / email) */}
      <Modal
        visible={editVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setEditVisible(false)}>
        <Pressable
          onPress={() => setEditVisible(false)}
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.4)',
            justifyContent: 'center',
            paddingHorizontal: 20,
          }}>
          <Pressable
            onPress={() => {}}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 16,
              padding: 16,
              gap: 12,
            }}>
            <Text
              className="font-poppins-bold"
              style={{ color: '#404040', fontSize: 18, lineHeight: 26 }}>
              Edit Profile
            </Text>

            <View style={{ gap: 4 }}>
              <Text
                className="font-poppins-regular"
                style={{ color: '#757575', fontSize: 12, lineHeight: 18 }}>
                Full Name
              </Text>
              <TextInput
                value={editName}
                onChangeText={setEditName}
                placeholder="Enter your name"
                placeholderTextColor="#9E9E9E"
                className="font-poppins-regular"
                style={{
                  borderWidth: 1,
                  borderColor: '#E0E0E0',
                  borderRadius: 10,
                  paddingHorizontal: 12,
                  height: 46,
                  color: '#404040',
                  fontSize: 14,
                }}
              />
            </View>

            <View style={{ gap: 4 }}>
              <Text
                className="font-poppins-regular"
                style={{ color: '#757575', fontSize: 12, lineHeight: 18 }}>
                Email
              </Text>
              <TextInput
                value={editEmail}
                onChangeText={setEditEmail}
                placeholder="email@example.com"
                placeholderTextColor="#9E9E9E"
                keyboardType="email-address"
                autoCapitalize="none"
                className="font-poppins-regular"
                style={{
                  borderWidth: 1,
                  borderColor: '#E0E0E0',
                  borderRadius: 10,
                  paddingHorizontal: 12,
                  height: 46,
                  color: '#404040',
                  fontSize: 14,
                }}
              />
            </View>

            <View style={{ flexDirection: 'row', gap: 12, marginTop: 4 }}>
              <Pressable
                onPress={() => setEditVisible(false)}
                disabled={savingProfile}
                style={{
                  flex: 1,
                  height: 46,
                  borderRadius: 10,
                  backgroundColor: '#F5F5F5',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Text
                  className="font-poppins-semibold"
                  style={{ color: '#757575', fontSize: 14 }}>
                  Cancel
                </Text>
              </Pressable>
              <Pressable
                onPress={handleSaveProfile}
                disabled={savingProfile}
                style={{
                  flex: 1,
                  height: 46,
                  borderRadius: 10,
                  backgroundColor: '#FFE403',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                {savingProfile ? (
                  <ActivityIndicator size="small" color="#404040" />
                ) : (
                  <Text
                    className="font-poppins-semibold"
                    style={{ color: '#404040', fontSize: 14 }}>
                    Save
                  </Text>
                )}
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
      {docUpload.sheet}
    </View>
  );
};

const PhotoSourceSheet: React.FC<{
  visible: boolean;
  onCamera: () => void;
  onGallery: () => void;
  onCancel: () => void;
}> = ({ visible, onCamera, onGallery, onCancel }) => (
  <Modal
    visible={visible}
    transparent
    animationType="fade"
    onRequestClose={onCancel}>
    <Pressable
      onPress={onCancel}
      style={{
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'flex-end',
      }}>
      <Pressable
        onPress={() => {}}
        style={{
          backgroundColor: '#FFFFFF',
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          paddingTop: 19.992,
          paddingBottom: 20,
          paddingHorizontal: 13,
          gap: 9,
        }}>
        <Text
          className="font-poppins-bold"
          style={{
            color: '#404040',
            fontSize: 16,
            lineHeight: 24,
            textAlign: 'center',
            marginBottom: 7.99,
          }}>
          Update Profile Photo
        </Text>
        <SheetButton label="Take Photo" onPress={onCamera} />
        <SheetButton label="Choose from Gallery" onPress={onGallery} />
        <SheetButton label="Cancel" onPress={onCancel} variant="cancel" />
      </Pressable>
    </Pressable>
  </Modal>
);

const SheetButton: React.FC<{
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'cancel';
}> = ({ label, onPress, variant = 'primary' }) => (
  <Pressable
    onPress={onPress}
    style={{
      height: 47.989,
      borderRadius: 12,
      backgroundColor: variant === 'cancel' ? '#F5F5F5' : '#FFE403',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
    <Text
      className="font-poppins-semibold"
      style={{
        color: variant === 'cancel' ? '#757575' : '#404040',
        fontSize: 14,
        lineHeight: 20,
      }}>
      {label}
    </Text>
  </Pressable>
);

const DetailLine: React.FC<{ label: string; value: string }> = ({
  label,
  value,
}) => (
  <View
    style={{
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 9,
    }}>
    <Text
      className="font-poppins-regular"
      style={{ color: '#757575', fontSize: 13, lineHeight: 20 }}>
      {label}
    </Text>
    <Text
      className="font-poppins-semibold"
      style={{ color: '#404040', fontSize: 13, lineHeight: 20, flexShrink: 1, textAlign: 'right' }}>
      {value}
    </Text>
  </View>
);

const InfoRow: React.FC<{ label: string; value: string }> = ({
  label,
  value,
}) => (
  <View
    style={{
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 9,
    }}>
    <Text
      className="font-poppins-regular"
      style={{
        color: '#757575',
        fontSize: 12,
        lineHeight: 19.92,
        width: 96,
      }}>
      {label}
    </Text>
    <Text
      className="font-poppins-semibold"
      style={{
        color: '#404040',
        fontSize: 13,
        lineHeight: 20,
        flex: 1,
      }}>
      {value}
    </Text>
  </View>
);

const DocRow: React.FC<{
  label: string;
  status: DocStatus;
  reason?: string;
  busy?: boolean;
  onUpload?: () => void;
}> = ({ label, status, reason, busy, onUpload }) => {
  const showCta =
    !!onUpload && (status === 'not_uploaded' || status === 'rejected');
  return (
    <View style={{ gap: 1.997 }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
        <Text
          className="font-poppins-regular"
          style={{ color: '#404040', fontSize: 14, lineHeight: 20, flex: 1 }}>
          {label}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <StatusChip status={status} />
          {showCta && (
            <Pressable onPress={onUpload} disabled={busy} hitSlop={6}>
              <Text
                className="font-poppins-semibold"
                style={{ color: '#E48714', fontSize: 12, lineHeight: 16 }}>
                {busy
                  ? 'Uploading...'
                  : status === 'rejected'
                    ? 'Re-upload'
                    : 'Upload'}
              </Text>
            </Pressable>
          )}
        </View>
      </View>
      {status === 'rejected' && reason ? (
        <Text
          className="font-poppins-regular"
          style={{ color: '#B71C1C', fontSize: 11, lineHeight: 16 }}>
          {reason}
        </Text>
      ) : null}
    </View>
  );
};

export default ProfileScreen;
