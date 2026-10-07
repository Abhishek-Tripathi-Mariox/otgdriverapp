import './src/styles/global.css';

import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { ToastProvider } from './src/components/Toast';
import { NotificationsProvider } from './src/components/NotificationsProvider';
import PermissionWatchdog from './src/components/PermissionWatchdog';
import { setupNotificationTapHandling } from './src/services/pushNotifications';

function App() {
  useEffect(() => {
    setupNotificationTapHandling();
  }, []);

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
