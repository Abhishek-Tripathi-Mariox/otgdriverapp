import './src/styles/global.css';

import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { ToastProvider } from './src/components/Toast';
import { NotificationsProvider } from './src/components/NotificationsProvider';
import PermissionWatchdog from './src/components/PermissionWatchdog';

function App() {
  return (
    <SafeAreaProvider>
      <ToastProvider>
        <NotificationsProvider>
          <PermissionWatchdog />
          <AppNavigator />
        </NotificationsProvider>
      </ToastProvider>
    </SafeAreaProvider>
  );
}

export default App;
