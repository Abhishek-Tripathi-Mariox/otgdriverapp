import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus, Platform } from 'react-native';
import { useAuthStore } from '../store';
import {
  checkMissingDriverPermissions,
  requestAllDriverPermissions,
} from '../utils/permissions';

// Re-checking on every foreground event is fine, but firing the request
// flow back-to-back inside one session is annoying. We throttle to once
// per this many milliseconds.
const MIN_INTERVAL_MS = 30_000;

// Sits at the top of the tree and, whenever the app launches or returns
// to the foreground, makes sure all the driver-side runtime permissions
// are granted. If anything is missing it silently re-runs the OS prompts
// (the dedicated PermissionsScreen still handles first-time onboarding
// with full UI explanation; this is a safety net for users who denied a
// permission earlier or revoked one from system settings).
const PermissionWatchdog: React.FC = () => {
  const token = useAuthStore(s => s.token);
  const lastRunRef = useRef<number>(0);
  const runningRef = useRef<boolean>(false);

  useEffect(() => {
    // PermissionsAndroid is a no-op on iOS; on iOS prompts come from the
    // specific feature libraries when each capability is exercised.
    if (Platform.OS !== 'android') return;

    let cancelled = false;

    const maybeRequest = async () => {
      if (runningRef.current) return;
      if (!useAuthStore.getState().token) return; // only enforce post-login
      const now = Date.now();
      if (now - lastRunRef.current < MIN_INTERVAL_MS) return;

      runningRef.current = true;
      try {
        const missing = await checkMissingDriverPermissions();
        if (cancelled) return;
        if (missing.length === 0) {
          lastRunRef.current = now;
          return;
        }
        lastRunRef.current = now;
        await requestAllDriverPermissions();
      } finally {
        runningRef.current = false;
      }
    };

    // Run once on mount (covers cold-launch and hot-reload).
    maybeRequest();

    const sub = AppState.addEventListener(
      'change',
      (state: AppStateStatus) => {
        if (state === 'active') {
          maybeRequest();
        }
      },
    );

    return () => {
      cancelled = true;
      sub.remove();
    };
    // Re-run when the token flips from null to a value (i.e. right after
    // login) so we don't have to wait for the next AppState change.
  }, [token]);

  return null;
};

export default PermissionWatchdog;
