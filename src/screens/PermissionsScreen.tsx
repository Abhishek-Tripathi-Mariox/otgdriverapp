import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  BellIcon,
  MapPinIcon,
  DocumentIcon,
} from '../components/DashboardIcons';
import {
  requestAllDriverPermissions,
  markPermissionsRequested,
} from '../utils/permissions';
import type { RootStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Permissions'>;

type Row = {
  key: string;
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  body: string;
};

const ROWS: Row[] = [
  {
    key: 'notifications',
    icon: <BellIcon size={22} color="#FFFFFF" />,
    iconBg: '#E48714',
    title: 'Notifications',
    body: 'Get instant alerts for new delivery offers, trip updates, and payouts.',
  },
  {
    key: 'location',
    icon: <MapPinIcon size={22} color="#FFFFFF" />,
    iconBg: '#4CAF50',
    title: 'Location — all the time',
    body: 'Match with nearby pickups and share live trip updates with the customer even when the app is in the background.',
  },
  {
    key: 'camera',
    icon: (
      <Text
        className="font-poppins-bold"
        style={{ color: '#FFFFFF', fontSize: 12 }}>
        CAM
      </Text>
    ),
    iconBg: '#F44336',
    title: 'Camera',
    body: 'Capture KYC documents, vehicle photos, and your profile picture.',
  },
  {
    key: 'gallery',
    icon: <DocumentIcon size={22} color="#FFFFFF" />,
    iconBg: '#FFE403',
    title: 'Photos & files',
    body: 'Pick KYC documents and vehicle photos from your gallery.',
  },
];

const PermissionsScreen: React.FC<Props> = ({ navigation, route }) => {
  const [requesting, setRequesting] = useState(false);

  const goNext = () => {
    const next = route.params?.next ?? 'Home';
    navigation.reset({
      index: 0,
      routes: [{ name: next } as any],
    });
  };

  const handleContinue = async () => {
    if (requesting) return;
    setRequesting(true);
    try {
      const outcome = await requestAllDriverPermissions();
      // Even if some permissions were denied, mark the flow as run so we
      // don’t nag the driver on every login. Re-prompts happen on the
      // specific feature screens (e.g. live tracking, camera capture).
      await markPermissionsRequested();
      // No-op: outcome could be surfaced to telemetry later.
      void outcome;
    } finally {
      setRequesting(false);
      goNext();
    }
  };

  const handleSkip = async () => {
    if (requesting) return;
    await markPermissionsRequested();
    goNext();
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#FFE403' }}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: '#FFE403' }} />
      <ScrollView
        style={{ flex: 1, backgroundColor: '#FFE403' }}
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: 23.99,
          paddingTop: 23.99,
          paddingBottom: 23.99,
        }}
        showsVerticalScrollIndicator={false}>
        <Text
          className="font-poppins-bold"
          style={{
            color: '#404040',
            fontSize: 19,
            lineHeight: 28,
            textAlign: 'center',
            marginTop: 15.99,
          }}>
          Almost there!
        </Text>
        <Text
          className="font-poppins-regular"
          style={{
            color: '#404040',
            fontSize: 15,
            lineHeight: 22,
            textAlign: 'center',
            marginTop: 7.99,
          }}>
          OTG Driver needs a few permissions to deliver orders safely and keep
          your customers informed.
        </Text>

        <View
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 16,
            padding: 12,
            gap: 12,
            marginTop: 23.99,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.12,
            shadowRadius: 10,
            elevation: 4,
          }}>
          {ROWS.map(row => (
            <View
              key={row.key}
              style={{
                flexDirection: 'row',
                gap: 9,
                alignItems: 'flex-start',
              }}>
              <View
                style={{
                  width: 39.97,
                  height: 39.97,
                  borderRadius: 19.98,
                  backgroundColor: row.iconBg,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                {row.icon}
              </View>
              <View style={{ flex: 1, gap: 1.997 }}>
                <Text
                  className="font-poppins-semibold"
                  style={{ color: '#404040', fontSize: 15, lineHeight: 22 }}>
                  {row.title}
                </Text>
                <Text
                  className="font-poppins-regular"
                  style={{ color: '#757575', fontSize: 12, lineHeight: 19 }}>
                  {row.body}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {Platform.OS === 'ios' && (
          <Text
            className="font-poppins-regular"
            style={{
              color: '#404040',
              fontSize: 11,
              lineHeight: 16,
              textAlign: 'center',
              marginTop: 11.98,
            }}>
            On iPhone, each permission is requested the first time the feature
            is used.
          </Text>
        )}

        <View style={{ flex: 1 }} />

        <Pressable
          onPress={handleContinue}
          disabled={requesting}
          style={{
            height: 55.99,
            borderRadius: 12,
            marginTop: 23.99,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: requesting ? '#D9D9D9' : '#404040',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: requesting ? 0 : 0.2,
            shadowRadius: 3,
            elevation: requesting ? 0 : 3,
          }}>
          {requesting ? (
            <ActivityIndicator color="#FFE403" />
          ) : (
            <Text
              className="font-poppins-semibold"
              style={{ color: '#FFE403', fontSize: 16, lineHeight: 24 }}>
              Continue
            </Text>
          )}
        </Pressable>

        <Pressable
          onPress={handleSkip}
          disabled={requesting}
          style={{
            height: 47.99,
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 7.99,
          }}>
          <Text
            className="font-poppins-semibold"
            style={{ color: '#404040', fontSize: 14, lineHeight: 22 }}>
            Not now
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
};

export default PermissionsScreen;
