import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import AppBackground from '../components/AppBackground';
import LogoBadge from '../components/LogoBadge';
import CircularLoader from '../components/CircularLoader';
import {
  useAuthStore,
  screenForStep,
  driverSessionToProfile,
} from '../store';
import { driverApi } from '../api/client';
import type { RootStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

const SplashScreen: React.FC<Props> = ({ navigation }) => {
  const token = useAuthStore(s => s.token);
  const hydrated = useAuthStore(s => s.hydrated);
  const setDriver = useAuthStore(s => s.setDriver);
  const logout = useAuthStore(s => s.logout);

  useEffect(() => {
    if (!hydrated) return;

    const decide = async () => {
      if (!token) {
        navigation.replace('Login');
        return;
      }

      try {
        const res = await driverApi.me();
        const d = res.data.data;
        setDriver(driverSessionToProfile(d));
        const next = screenForStep(d.onboardingStep, d.approvalStatus);
        navigation.reset({
          index: 0,
          routes: [{ name: next } as any],
        });
      } catch {
        // Token invalid or network failure — drop the session and go to login.
        logout();
        navigation.replace('Login');
      }
    };

    const t = setTimeout(decide, 1200);
    return () => clearTimeout(t);
  }, [hydrated, token, navigation, setDriver, logout]);

  return (
    <AppBackground>
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          paddingTop: 7.28,
        }}>
        <LogoBadge containerSize={119.99} logoSize={64} />

        <Text
          className="font-poppins-bold"
          style={{
            color: '#404040',
            fontSize: 48,
            lineHeight: 56,
            letterSpacing: 1,
            marginTop: 23.994,
          }}>
          OTG
        </Text>

        <Text
          className="font-poppins-medium"
          style={{
            color: '#404040',
            fontSize: 18,
            lineHeight: 26,
            marginTop: 23.994,
          }}>
          Driver Login
        </Text>

        <View style={{ marginTop: 23.994 }}>
          <CircularLoader size={54.545} />
        </View>
      </View>
    </AppBackground>
  );
};

export default SplashScreen;
