import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { driverApi } from '../api/client';
import { useAuthStore } from '../store';

interface NotificationsContextValue {
  unreadCount: number;
  refresh: () => Promise<void>;
  setUnreadCount: (n: number) => void;
}

const NotificationsContext = createContext<NotificationsContextValue | undefined>(
  undefined,
);

const POLL_INTERVAL_MS = 60_000;

export const NotificationsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const token = useAuthStore(s => s.token);
  const [unreadCount, setUnread] = useState(0);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const refresh = useCallback(async () => {
    if (!useAuthStore.getState().token) {
      setUnread(0);
      return;
    }
    try {
      const res = await driverApi.unreadNotificationCount();
      setUnread(res.data?.data?.unreadCount ?? 0);
    } catch {
      // Silent: keep showing the last known count if the call fails.
    }
  }, []);

  useEffect(() => {
    if (!token) {
      setUnread(0);
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
      return;
    }

    refresh();
    pollRef.current = setInterval(refresh, POLL_INTERVAL_MS);

    const onAppStateChange = (state: AppStateStatus) => {
      if (state === 'active') refresh();
    };
    const sub = AppState.addEventListener('change', onAppStateChange);

    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
      sub.remove();
    };
  }, [token, refresh]);

  const value = useMemo<NotificationsContextValue>(
    () => ({ unreadCount, refresh, setUnreadCount: setUnread }),
    [unreadCount, refresh],
  );

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = (): NotificationsContextValue => {
  const ctx = useContext(NotificationsContext);
  if (!ctx) {
    throw new Error(
      'useNotifications must be used within a NotificationsProvider',
    );
  }
  return ctx;
};
