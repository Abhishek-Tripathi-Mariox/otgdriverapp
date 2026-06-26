import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import AppBackground from '../components/AppBackground';
import LogoBadge from '../components/LogoBadge';
import {
  useAuthStore,
  screenForStep,
  driverSessionToProfile,
} from '../store';
import { driverApi } from '../api/client';
import { extractErrorMessage } from '../api/errors';
import { useToast } from '../components/Toast';
import { hasRequestedPermissions } from '../utils/permissions';
import type { RootStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'OtpVerification'>;

const OTP_LENGTH = 6;
const RESEND_SECONDS = 28;

const OtpVerificationScreen: React.FC<Props> = ({ navigation, route }) => {
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);
  const [submitting, setSubmitting] = useState(false);
  const inputs = useRef<Array<TextInput | null>>([]);
  const scrollRef = useRef<ScrollView>(null);
  const loginSuccess = useAuthStore(s => s.loginSuccess);
  const toast = useToast();
  const mobile = route.params?.mobile;

  const otp = useMemo(() => digits.join(''), [digits]);
  const isValid = otp.length === OTP_LENGTH && digits.every(d => d !== '');

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const t = setInterval(() => setSecondsLeft(s => s - 1), 1000);
    return () => clearInterval(t);
  }, [secondsLeft]);

  const handleChange = (index: number, value: string) => {
    const clean = value.replace(/[^0-9]/g, '').slice(-1);
    const next = [...digits];
    next[index] = clean;
    setDigits(next);
    if (clean && index < OTP_LENGTH - 1) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (index: number, key: string) => {
    if (key === 'Backspace' && !digits[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    if (!isValid || submitting || !mobile) return;
    setSubmitting(true);
    try {
      const res = await driverApi.verifyOtp(mobile, otp);
      const { token, driver: serverDriver } = res.data.data;
      loginSuccess({
        token,
        driver: driverSessionToProfile(serverDriver),
      });
      const next = screenForStep(
        serverDriver.onboardingStep,
        serverDriver.approvalStatus,
      );
      const alreadyAsked = await hasRequestedPermissions();
      if (!alreadyAsked) {
        // Run the post-login permission flow first, then hand off to the
        // onboarding step / Home the driver would normally land on.
        navigation.reset({
          index: 0,
          routes: [{ name: 'Permissions', params: { next } } as any],
        });
      } else {
        navigation.reset({
          index: 0,
          routes: [{ name: next } as any],
        });
      }
    } catch (err: any) {
      toast.error(
        'Verification failed',
        extractErrorMessage(err, 'Please try again.'),
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (secondsLeft > 0 || !mobile) return;
    try {
      await driverApi.resendOtp(mobile);
      setSecondsLeft(RESEND_SECONDS);
      setDigits(Array(OTP_LENGTH).fill(''));
      inputs.current[0]?.focus();
    } catch (err: any) {
      toast.error(
        'Could not resend OTP',
        extractErrorMessage(err, 'Please try again.'),
      );
    }
  };

  return (
    <AppBackground>
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <ScrollView
            ref={scrollRef}
            style={{ flex: 1 }}
            contentContainerStyle={{
              flexGrow: 1,
              paddingTop: 16,
              paddingBottom: 16,
              paddingLeft: 23.994,
              paddingRight: 23.994,
            }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            <View style={{ alignItems: 'center', marginTop: 56 }}>
              <LogoBadge containerSize={88} logoSize={140} />
            </View>

            <Text
              className="font-poppins-bold"
              style={{
                color: '#404040',
                fontSize: 25,
                lineHeight: 26,
                textAlign: 'center',
                marginTop: 24,
              }}>
              OTP Verification
            </Text>
            <Text
              className="font-poppins-regular"
              style={{
                color: '#404040',
                fontSize: 16,
                lineHeight: 24,
                textAlign: 'center',
                marginTop: 8,
              }}>
              Enter the 6-digit OTP sent to your mobile
            </Text>

            <View
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 22,
                paddingTop: 20,
                paddingHorizontal: 20,
                paddingBottom: 20,
                marginTop: 24,
                alignItems: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.1,
                shadowRadius: 32,
                elevation: 6,
              }}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  width: '100%',
                }}>
                {digits.map((digit, i) => (
                  <TextInput
                    key={i}
                    ref={ref => {
                      inputs.current[i] = ref;
                    }}
                    value={digit}
                    onChangeText={v => handleChange(i, v)}
                    onKeyPress={({ nativeEvent }) =>
                      handleKeyPress(i, nativeEvent.key)
                    }
                    onFocus={() => {
                      // Android ScrollView does not auto-scroll to the focused
                      // input, so nudge it into view once the keyboard is up.
                      setTimeout(
                        () => scrollRef.current?.scrollToEnd({ animated: true }),
                        150,
                      );
                    }}
                    keyboardType="number-pad"
                    maxLength={1}
                    className="font-poppins-semibold"
                    style={{
                      width: 40,
                      height: 50,
                      borderWidth: 1.162,
                      borderColor: 'rgba(0,0,0,0.23)',
                      borderRadius: 12,
                      fontSize: 18,
                      color: '#404040',
                      textAlign: 'center',
                      padding: 0,
                    }}
                  />
                ))}
              </View>

              <Pressable
                onPress={handleResend}
                disabled={secondsLeft > 0}
                style={{ marginTop: 31.999 }}>
                <Text
                  className="font-poppins-regular"
                  style={{
                    color: secondsLeft > 0 ? '#757575' : '#404040',
                    fontSize: 14,
                    lineHeight: 20,
                    textAlign: 'center',
                  }}>
                  {secondsLeft > 0
                    ? `Resend OTP in ${secondsLeft}s`
                    : 'Resend OTP'}
                </Text>
              </Pressable>

              <Pressable
                onPress={handleVerify}
                disabled={!isValid}
                style={{
                  height: 55.993,
                  width: '100%',
                  borderRadius: 12,
                  marginTop: 31.999,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: isValid ? '#FFE403' : '#D9D9D9',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: isValid ? 0.2 : 0,
                  shadowRadius: 3,
                  elevation: isValid ? 3 : 0,
                }}>
                <Text
                  className="font-poppins-semibold"
                  style={{
                    fontSize: 18,
                    lineHeight: 31.5,
                    color: isValid ? '#404040' : '#757575',
                  }}>
                  {submitting ? 'Verifying...' : 'Verify & Continue'}
                </Text>
              </Pressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </AppBackground>
  );
};

export default OtpVerificationScreen;
