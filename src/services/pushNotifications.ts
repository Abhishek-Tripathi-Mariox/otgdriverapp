import { Platform } from 'react-native';
import {
  getMessaging,
  getToken,
  requestPermission,
  onTokenRefresh,
  onMessage,
  onNotificationOpenedApp,
  getInitialNotification,
  setBackgroundMessageHandler,
  AuthorizationStatus,
  type RemoteMessage,
} from '@react-native-firebase/messaging';
import { driverApi } from '../api/client';
import { navigationRef } from '../navigation/AppNavigator';
import { showAppToast } from '../components/Toast';

let refreshUnsubscribe: (() => void) | null = null;
let tapListenersRegistered = false;

// Routes a notification's `data` payload to the specific order it's about —
// matches the backend's sendPush() call sites (booking.controller.ts /
// vendorOrders.controller.ts's dispatch pushes both send `bookingId`).
// 'active' is the correct variant for every push the driver currently
// receives (both are "new delivery assigned", i.e. an in-progress order).
const navigateForData = (data?: {[key: string]: string | object}) => {
  if (!data || !navigationRef.isReady()) return;
  const bookingId = data.bookingId as string | undefined;
  if (bookingId) {
    navigationRef.navigate('OrderDetails', {
      orderId: bookingId,
      variant: 'active',
    });
  }
};

/**
 * Wires up foreground/background/killed-state tap handling so a push
 * notification actually opens the relevant order instead of just the app's
 * home screen. Call once at app root. Never throws — mirrors
 * registerPushToken()'s tolerance for Firebase not being fully configured.
 */
export const setupNotificationTapHandling = (): void => {
  if (tapListenersRegistered) return;
  try {
    const messaging = getMessaging();
    tapListenersRegistered = true;

    getInitialNotification(messaging)
      .then(message => {
        if (message) navigateForData(message.data);
      })
      .catch(() => {});

    onNotificationOpenedApp(messaging, message => {
      navigateForData(message.data);
    });

    setBackgroundMessageHandler(messaging, async () => {});

    onMessage(messaging, (message: RemoteMessage) => {
      showAppToast(
        'info',
        message.notification?.title || 'New update',
        message.notification?.body,
      );
    });
  } catch (err) {
    console.warn(
      '[pushNotifications] setupNotificationTapHandling failed (Firebase not fully configured yet?):',
      err,
    );
  }
};

// Sends whatever FCM token we currently have to the backend, swallowing
// failures — this must never block or crash the login/splash flow it's
// called from. Safe to call repeatedly (e.g. on every login).
const sendToken = async (token: string): Promise<void> => {
  try {
    await driverApi.updateFcmToken(token);
  } catch {
    // Backend unreachable or driver not authenticated yet — the next
    // registerPushToken() call (next login/app open) will retry.
  }
};

/**
 * Requests notification permission (iOS; Android's POST_NOTIFICATIONS is
 * already requested separately in utils/permissions.ts), fetches the
 * current FCM token, and sends it to the backend. Also subscribes to
 * onTokenRefresh so a later token rotation gets resent without requiring
 * another login. Call once after a successful login/session restore.
 *
 * Never throws — until android/app/google-services.json is added (see
 * android/build.gradle's comment), the native Firebase module isn't fully
 * usable and every call here resolves to a no-op rather than crashing.
 */
export const registerPushToken = async (): Promise<void> => {
  try {
    const messaging = getMessaging();

    if (Platform.OS === 'ios') {
      const authStatus = await requestPermission(messaging);
      const enabled =
        authStatus === AuthorizationStatus.AUTHORIZED ||
        authStatus === AuthorizationStatus.PROVISIONAL;
      if (!enabled) return;
    }

    const token = await getToken(messaging);
    if (token) await sendToken(token);

    if (!refreshUnsubscribe) {
      refreshUnsubscribe = onTokenRefresh(messaging, sendToken);
    }
  } catch (err) {
    console.warn('[pushNotifications] registerPushToken failed (Firebase not fully configured yet?):', err);
  }
};
