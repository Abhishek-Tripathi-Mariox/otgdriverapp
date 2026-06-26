import { Platform, PermissionsAndroid, Linking, Alert, AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Persist a flag once the post-login permission flow has run, so we don't
// re-prompt every time the driver opens the app.
const STORAGE_KEY = 'driver.permissionsRequested.v1';

export const hasRequestedPermissions = async (): Promise<boolean> => {
  try {
    const v = await AsyncStorage.getItem(STORAGE_KEY);
    return v === '1';
  } catch {
    return false;
  }
};

export const markPermissionsRequested = async (): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, '1');
  } catch {
    // ignore
  }
};

export type PermissionKey =
  | 'notifications'
  | 'locationForeground'
  | 'locationBackground'
  | 'camera'
  | 'gallery';

export type PermissionResult = 'granted' | 'denied' | 'never_ask_again' | 'unavailable';

export type PermissionOutcome = Record<PermissionKey, PermissionResult>;

const toResult = (status: string): PermissionResult => {
  switch (status) {
    case PermissionsAndroid.RESULTS.GRANTED:
      return 'granted';
    case PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN:
      return 'never_ask_again';
    default:
      return 'denied';
  }
};

const sdkInt = (): number => {
  if (Platform.OS !== 'android') return 0;
  return typeof Platform.Version === 'number'
    ? Platform.Version
    : parseInt(String(Platform.Version), 10) || 0;
};

// Request a single Android permission, swallowing missing-permission errors
// (e.g. POST_NOTIFICATIONS on SDK < 33).
const requestOne = async (
  perm: any,
  rationale?: any,
): Promise<PermissionResult> => {
  try {
    const status = await PermissionsAndroid.request(perm, rationale);
    return toResult(status);
  } catch {
    return 'unavailable';
  }
};

// On Android 11+ background location can ONLY be granted from settings — the
// in-app prompt always returns "denied". After foreground is granted, we
// surface an explainer + open app settings so the user can pick "Allow all
// the time".
const requestBackgroundLocation = async (
  hasForeground: boolean,
): Promise<PermissionResult> => {
  if (!hasForeground) return 'denied';
  if (sdkInt() < 29) return 'granted';

  if (sdkInt() < 30) {
    return requestOne(PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION, {
      title: 'Allow background location',
      message:
        'OTG Driver needs background location so trip updates keep flowing when the app is minimised.',
      buttonPositive: 'Allow',
    } as any);
  }

  return new Promise<PermissionResult>(resolve => {
    Alert.alert(
      'Allow location all the time',
      'For live trip tracking we need "Allow all the time". On the next screen, pick "Allow all the time" under Location.',
      [
        {
          text: 'Not now',
          style: 'cancel',
          onPress: () => resolve('denied'),
        },
        {
          text: 'Open settings',
          onPress: async () => {
            // Re-check the grant once the user returns from Settings: when the
            // app comes back to the foreground, read the actual permission
            // status instead of assuming it was denied.
            const sub = AppState.addEventListener('change', async state => {
              if (state !== 'active') return;
              sub.remove();
              let granted = false;
              try {
                granted = await PermissionsAndroid.check(
                  PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION,
                );
              } catch {
                granted = false;
              }
              resolve(granted ? 'granted' : 'denied');
            });
            try {
              await Linking.openSettings();
            } catch {
              sub.remove();
              resolve('denied');
            }
          },
        },
      ],
      { cancelable: false },
    );
  });
};

// Lightweight check (no prompts) of every permission the post-login flow
// asks for. Returns the list of keys that are NOT currently granted.
// On iOS this can't actually inspect grants without a native module, so it
// returns an empty `missing` array and lets the per-feature libraries (when
// added) drive the prompts.
export const checkMissingDriverPermissions = async (): Promise<PermissionKey[]> => {
  if (Platform.OS !== 'android') return [];

  const P = PermissionsAndroid.PERMISSIONS;
  const sdk = sdkInt();
  const missing: PermissionKey[] = [];

  const safeCheck = async (perm: any): Promise<boolean> => {
    if (!perm) return true;
    try {
      return await PermissionsAndroid.check(perm);
    } catch {
      return true;
    }
  };

  if (sdk >= 33) {
    if (!(await safeCheck((P as any).POST_NOTIFICATIONS))) {
      missing.push('notifications');
    }
  }

  if (!(await safeCheck(P.ACCESS_FINE_LOCATION))) {
    missing.push('locationForeground');
  }
  if (sdk >= 29) {
    if (!(await safeCheck((P as any).ACCESS_BACKGROUND_LOCATION))) {
      missing.push('locationBackground');
    }
  }

  if (!(await safeCheck(P.CAMERA))) {
    missing.push('camera');
  }

  if (sdk >= 33) {
    if (!(await safeCheck((P as any).READ_MEDIA_IMAGES))) {
      missing.push('gallery');
    }
  } else {
    if (!(await safeCheck(P.READ_EXTERNAL_STORAGE))) {
      missing.push('gallery');
    }
  }

  return missing;
};

// Ensure CAMERA is granted right before opening the camera. react-native-image-
// picker won't prompt on its own when CAMERA is declared in the manifest — it
// just fails with a "permission" error — so we request it here so the OS dialog
// actually shows. iOS handles its own prompt via the picker + Info.plist.
export const ensureCameraPermission = async (): Promise<boolean> => {
  if (Platform.OS !== 'android') return true;
  const res = await requestOne(PermissionsAndroid.PERMISSIONS.CAMERA, {
    title: 'Use your camera',
    message: 'Capture KYC documents, vehicle photos, and your profile picture.',
    buttonPositive: 'Allow',
  } as any);
  return res === 'granted';
};

// Ensure gallery/photo read access before opening the image library.
// react-native-image-picker still needs a read grant on Android: READ_MEDIA_IMAGES
// on Android 13+ and READ_EXTERNAL_STORAGE on older versions.
export const ensureGalleryPermission = async (): Promise<boolean> => {
  if (Platform.OS !== 'android') return true;
  const P = PermissionsAndroid.PERMISSIONS as any;
  const perm =
    sdkInt() >= 33 && P.READ_MEDIA_IMAGES
      ? P.READ_MEDIA_IMAGES
      : P.READ_EXTERNAL_STORAGE;
  const res = await requestOne(perm, {
    title: 'Access your photos',
    message: 'Pick KYC documents and vehicle photos from your gallery.',
    buttonPositive: 'Allow',
  } as any);
  return res === 'granted';
};

export const requestAllDriverPermissions = async (): Promise<PermissionOutcome> => {
  const outcome: PermissionOutcome = {
    notifications: 'unavailable',
    locationForeground: 'unavailable',
    locationBackground: 'unavailable',
    camera: 'unavailable',
    gallery: 'unavailable',
  };

  // iOS: PermissionsAndroid is a no-op. Camera/photo/location/notification
  // prompts on iOS fire when the corresponding feature library invokes them;
  // the Info.plist usage strings make sure the prompt copy is right. So on
  // iOS we mark everything as "unavailable" through this helper and move on.
  if (Platform.OS !== 'android') {
    return outcome;
  }

  const P = PermissionsAndroid.PERMISSIONS;
  const sdk = sdkInt();

  // 1. Notifications (Android 13+)
  if (sdk >= 33 && (P as any).POST_NOTIFICATIONS) {
    outcome.notifications = await requestOne((P as any).POST_NOTIFICATIONS, {
      title: 'Get delivery alerts',
      message:
        'Allow notifications so you never miss a new delivery offer or trip update.',
      buttonPositive: 'Allow',
    } as any);
  } else {
    // Pre-13 grants by default.
    outcome.notifications = 'granted';
  }

  // Phone/SMS permissions intentionally NOT requested:
  //   - READ_PHONE_STATE / CALL_PHONE: restricted on Play; tel: URIs work
  //     fine via Linking.openURL without any permission.
  //   - READ_SMS / RECEIVE_SMS: Play rejects unless app is default SMS
  //     handler. Use the SMS Retriever API for OTP autofill instead.

  // 2. Location — fine first, then background
  const fineLoc = await requestOne(P.ACCESS_FINE_LOCATION, {
    title: 'Use your location',
    message:
      'Used to match you with nearby pickups and share live trip updates with the customer.',
    buttonPositive: 'Allow',
  } as any);
  outcome.locationForeground = fineLoc;
  outcome.locationBackground = await requestBackgroundLocation(
    fineLoc === 'granted',
  );

  // 3. Camera
  outcome.camera = await requestOne(P.CAMERA, {
    title: 'Use your camera',
    message:
      'Capture KYC documents, vehicle photos, and your profile picture.',
    buttonPositive: 'Allow',
  } as any);

  // 4. Gallery — READ_MEDIA_IMAGES (Android 13+) / READ_EXTERNAL_STORAGE (older)
  if (sdk >= 33 && (P as any).READ_MEDIA_IMAGES) {
    outcome.gallery = await requestOne((P as any).READ_MEDIA_IMAGES, {
      title: 'Access your photos',
      message: 'Upload KYC documents and vehicle photos from your gallery.',
      buttonPositive: 'Allow',
    } as any);
  } else {
    outcome.gallery = await requestOne(P.READ_EXTERNAL_STORAGE, {
      title: 'Access your photos',
      message: 'Upload KYC documents and vehicle photos from your gallery.',
      buttonPositive: 'Allow',
    } as any);
  }

  return outcome;
};
