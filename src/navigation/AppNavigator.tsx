import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/LoginScreen';
import OtpVerificationScreen from '../screens/OtpVerificationScreen';
import HomeScreen from '../screens/HomeScreen';
import PersonalDetailsScreen from '../screens/PersonalDetailsScreen';
import VehicleDetailsScreen from '../screens/VehicleDetailsScreen';
import MyVehiclesScreen from '../screens/MyVehiclesScreen';
import OwnerDetailsScreen from '../screens/OwnerDetailsScreen';
import CompleteProfileScreen from '../screens/CompleteProfileScreen';
import PendingApprovalScreen from '../screens/PendingApprovalScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import HelpSupportScreen from '../screens/HelpSupportScreen';
import MyOrdersScreen from '../screens/MyOrdersScreen';
import OrderDetailsScreen from '../screens/OrderDetailsScreen';
import type { OrderSummary } from '../api/client';
import ProfileScreen from '../screens/ProfileScreen';
import BankDetailsScreen from '../screens/BankDetailsScreen';
import UpdateBankDetailsScreen from '../screens/UpdateBankDetailsScreen';
import EarningsScreen from '../screens/EarningsScreen';
import PermissionsScreen from '../screens/PermissionsScreen';

export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  OtpVerification: { mobile: string };
  PersonalDetails: undefined;
  VehicleDetails: { vehicleId?: string } | undefined;
  MyVehicles: undefined;
  OwnerDetails: undefined;
  CompleteProfile: undefined;
  PendingApproval: undefined;
  Home: undefined;
  Notifications: undefined;
  HelpSupport: undefined;
  MyOrders: undefined;
  OrderDetails: {
    orderId: string;
    variant: 'delivered' | 'rejected' | 'active';
    order?: OrderSummary;
  };
  Profile: { toast?: string } | undefined;
  BankDetails: { showOtp?: boolean } | undefined;
  UpdateBankDetails: undefined;
  Earnings: undefined;
  Permissions: { next?: keyof RootStackParamList } | undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{ headerShown: false, animation: 'fade' }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen
          name="OtpVerification"
          component={OtpVerificationScreen}
        />
        <Stack.Screen name="PersonalDetails" component={PersonalDetailsScreen} />
        <Stack.Screen name="VehicleDetails" component={VehicleDetailsScreen} />
        <Stack.Screen name="MyVehicles" component={MyVehiclesScreen} />
        <Stack.Screen name="OwnerDetails" component={OwnerDetailsScreen} />
        <Stack.Screen name="CompleteProfile" component={CompleteProfileScreen} />
        <Stack.Screen name="PendingApproval" component={PendingApprovalScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} />
        <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />
        <Stack.Screen name="MyOrders" component={MyOrdersScreen} />
        <Stack.Screen name="OrderDetails" component={OrderDetailsScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="BankDetails" component={BankDetailsScreen} />
        <Stack.Screen name="UpdateBankDetails" component={UpdateBankDetailsScreen} />
        <Stack.Screen name="Earnings" component={EarningsScreen} />
        <Stack.Screen name="Permissions" component={PermissionsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
