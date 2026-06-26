import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import PendingApprovalIllustration from '../components/PendingApprovalIllustration';
import { useAuthStore, driverSessionToProfile } from '../store';
import { driverApi } from '../api/client';
import type { RootStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'PendingApproval'>;

const ClockIcon = () => (
  <Svg width={16} height={16} viewBox="0 0 15 15" fill="none">
    <Path
      d="M7.5 0C3.36 0 0 3.36 0 7.5S3.36 15 7.5 15 15 11.64 15 7.5 11.64 0 7.5 0zm0 13.64A6.14 6.14 0 0 1 1.36 7.5 6.14 6.14 0 0 1 7.5 1.36 6.14 6.14 0 0 1 13.64 7.5 6.14 6.14 0 0 1 7.5 13.64z"
      fill="#464646"
    />
    <Path
      d="M8.18 7.22V4.77a.68.68 0 0 0-1.36 0v2.73l.01.003c0 .18.07.35.2.48l1.92 1.92a.68.68 0 1 0 .97-.97L8.18 7.22z"
      fill="#464646"
    />
  </Svg>
);

const CheckCircleBig = () => (
  <Svg width={96} height={96} viewBox="0 0 96 96" fill="none">
    <Circle cx={48} cy={48} r={44} fill="#FFE403" stroke="#1E293B" strokeWidth={5} />
    <Path
      d="M30 50 L44 62 L68 36"
      stroke="#1E293B"
      strokeWidth={6}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </Svg>
);

const ActivatedModal: React.FC<{ visible: boolean; onGo: () => void }> = ({
  visible,
  onGo,
}) => (
  <Modal visible={visible} transparent animationType="slide">
    <View
      style={{
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'flex-end',
      }}>
      <View
        style={{
          backgroundColor: '#FFFFFF',
          borderTopLeftRadius: 26,
          borderTopRightRadius: 26,
          padding: 24,
          paddingBottom: 32,
          alignItems: 'center',
          gap: 32,
        }}>
        <View
          style={{
            width: 143.984,
            height: 143.984,
            borderRadius: 9999,
            backgroundColor: '#FFE403',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <CheckCircleBig />
        </View>

        <View style={{ gap: 11.997, alignItems: 'center', width: '100%' }}>
          <Text
            className="font-poppins-semibold"
            style={{
              color: '#1E293B',
              fontSize: 18,
              lineHeight: 28,
              textAlign: 'center',
            }}>
            Account Activated! 🎉
          </Text>
          <Text
            className="font-poppins-regular"
            style={{
              color: '#6A7282',
              fontSize: 18,
              lineHeight: 28,
              textAlign: 'center',
            }}>
            Your account has been successfully activated.
          </Text>
          <Text
            className="font-poppins-regular"
            style={{
              color: '#6A7282',
              fontSize: 16,
              lineHeight: 24,
              textAlign: 'center',
            }}>
            You can now start accepting rides and earning.
          </Text>
        </View>

        <Pressable
          onPress={onGo}
          style={{
            width: '100%',
            height: 55.993,
            borderRadius: 14,
            backgroundColor: '#FFE403',
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.1,
            shadowRadius: 10,
            elevation: 4,
          }}>
          <Text
            className="font-poppins-medium"
            style={{ color: '#1E293B', fontSize: 18, lineHeight: 28 }}>
            Go to Dashboard
          </Text>
        </Pressable>
      </View>
    </View>
  </Modal>
);

const PendingApprovalScreen: React.FC<Props> = ({ navigation }) => {
  const [showActivated, setShowActivated] = useState(false);
  const setApprovalStatus = useAuthStore(s => s.setApprovalStatus);
  const setDriver = useAuthStore(s => s.setDriver);
  const driver = useAuthStore(s => s.driver);

  // Poll /me every 15s while sitting on this screen so the driver flips
  // automatically when the admin approves.
  useEffect(() => {
    let cancelled = false;
    const tick = async () => {
      try {
        const res = await driverApi.me();
        const d = res.data.data;
        if (cancelled) return;
        setDriver(driverSessionToProfile(d));
        if (d.approvalStatus === 'approved') {
          setShowActivated(true);
        }
      } catch {
        // ignore transient failures
      }
    };
    tick();
    const id = setInterval(tick, 15000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [setDriver]);

  const handleGoToDashboard = () => {
    setApprovalStatus('approved');
    navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
  };

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: '#FFE403' }}>
      <View
        style={{
          backgroundColor: '#FFE403',
          height: 100,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <Text
          className="font-poppins-semibold"
          style={{
            color: '#404040',
            fontSize: 18,
            lineHeight: 28,
            textAlign: 'center',
          }}>
          Registration Pending Approval
        </Text>
      </View>

      <View style={{ flex: 1, backgroundColor: '#F5F3F8', paddingHorizontal: 24 }}>
        <Text
          className="font-poppins-semibold"
          style={{
            color: '#353535',
            fontSize: 18,
            lineHeight: 28,
            textAlign: 'center',
            marginTop: 57,
          }}>
          {driver?.name?.trim()
            ? `Thank You, ${driver.name.trim().split(' ')[0]}`
            : 'Thank You'}
        </Text>

        <View style={{ alignItems: 'center', marginTop: 24 }}>
          <PendingApprovalIllustration size={220} />
        </View>

        <Text
          className="font-poppins-regular"
          style={{
            color: '#797878',
            fontSize: 14,
            lineHeight: 24,
            textAlign: 'center',
            marginTop: 16,
          }}>
          Your{' '}
          <Text className="font-poppins-semibold" style={{ color: '#4B4B4B' }}>
            documents
          </Text>{' '}
          have been successfully submitted.{'\n'}Our verification team is
          reviewing your details.{'\n'}You will be notified once your account is
          approved.
        </Text>

        <View
          style={{
            marginTop: 24,
            backgroundColor: '#FFFDE3',
            borderRadius: 10,
            paddingVertical: 12,
            paddingHorizontal: 16,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
            <ClockIcon />
            <View>
              <Text
                className="font-poppins-regular"
                style={{ color: '#464646', fontSize: 14, lineHeight: 20 }}>
                Estimated verification time:
              </Text>
              <Text
                className="font-poppins-regular"
                style={{ color: '#464646', fontSize: 14, lineHeight: 20 }}>
                Within 24 hours
              </Text>
            </View>
          </View>
          <View
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 10,
              paddingHorizontal: 10,
              paddingVertical: 6,
            }}>
            <Text
              className="font-poppins-regular"
              style={{ color: '#4B4B4B', fontSize: 12, lineHeight: 16 }}>
              UNDER REVIEW
            </Text>
          </View>
        </View>

        <Pressable
          disabled
          style={{
            marginTop: 24,
            height: 47.989,
            borderRadius: 14,
            backgroundColor: '#FFE403',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Text
            className="font-poppins-medium"
            style={{ color: '#1E293B', fontSize: 14, lineHeight: 20 }}>
            Waiting for Approval
          </Text>
        </Pressable>
        <Text
          className="font-poppins-regular"
          style={{
            color: '#797878',
            fontSize: 14,
            lineHeight: 28,
            textAlign: 'center',
            marginTop: 8,
          }}>
          Once approved, you'll receive a notification and
        </Text>
      </View>

      <ActivatedModal visible={showActivated} onGo={handleGoToDashboard} />
    </SafeAreaView>
  );
};

export default PendingApprovalScreen;
