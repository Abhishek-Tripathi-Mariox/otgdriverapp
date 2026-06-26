import React, { useRef, useState } from 'react';
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
import PhoneIcon from '../components/PhoneIcon';
import { useAuthStore } from '../store';
import { driverApi } from '../api/client';
import { extractErrorMessage } from '../api/errors';
import { useToast } from '../components/Toast';
import type { RootStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const [mobile, setMobile] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const setPendingMobile = useAuthStore(s => s.setPendingMobile);
  const toast = useToast();
  const isValid = mobile.length === 10;

  const handleSendOtp = async () => {
    if (!isValid || submitting) return;
    setSubmitting(true);
    try {
      await driverApi.sendOtp(mobile);
      setPendingMobile(mobile);
      navigation.navigate('OtpVerification', { mobile });
    } catch (err: any) {
      toast.error(
        'Could not send OTP',
        extractErrorMessage(err, 'Please try again.'),
      );
    } finally {
      setSubmitting(false);
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
              Welcome to OTG
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
              Driver Login
            </Text>

            <View
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 22,
                paddingTop: 20,
                paddingHorizontal: 20,
                paddingBottom: 20,
                marginTop: 24,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.1,
                shadowRadius: 32,
                elevation: 6,
              }}>
              <Text
                className="font-poppins-semibold"
                style={{ color: '#404040', fontSize: 18, lineHeight: 26 }}>
                Enter Mobile Number
              </Text>

              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  height: 59.986,
                  borderRadius: 12,
                  borderWidth: 1.162,
                  borderColor: 'rgba(0,0,0,0.23)',
                  paddingHorizontal: 13.99,
                  marginTop: 23.994,
                }}>
                <PhoneIcon size={23.994} />
                <TextInput
                  value={mobile}
                  onChangeText={text =>
                    setMobile(text.replace(/[^0-9]/g, '').slice(0, 10))
                  }
                  placeholder="Enter 10 digit mobile number"
                  placeholderTextColor="#757575"
                  keyboardType="number-pad"
                  onFocus={() => {
                    // Android ScrollView does not auto-scroll to the focused
                    // input, so nudge it into view once the keyboard is up.
                    setTimeout(
                      () => scrollRef.current?.scrollToEnd({ animated: true }),
                      150,
                    );
                  }}
                  maxLength={10}
                  className="font-poppins-regular"
                  style={{
                    flex: 1,
                    marginLeft: 8,
                    color: '#404040',
                    fontSize: 14,
                    padding: 0,
                  }}
                />
              </View>

              <Pressable
                onPress={handleSendOtp}
                disabled={!isValid || submitting}
                style={{
                  height: 55.993,
                  borderRadius: 12,
                  marginTop: 23.994,
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
                  {submitting ? 'Sending...' : 'Send OTP'}
                </Text>
              </Pressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </AppBackground>
  );
};

export default LoginScreen;
