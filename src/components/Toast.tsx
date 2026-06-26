import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { View, Text, Animated, Pressable, Easing } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Circle } from 'react-native-svg';

type ToastVariant = 'error' | 'success' | 'info';

type Toast = {
  id: number;
  variant: ToastVariant;
  title: string;
  message?: string;
  durationMs: number;
};

type ToastContextValue = {
  show: (
    variant: ToastVariant,
    title: string,
    message?: string,
    durationMs?: number,
  ) => void;
  error: (title: string, message?: string) => void;
  success: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export const useToast = (): ToastContextValue => {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used inside <ToastProvider>');
  }
  return ctx;
};

const PALETTE: Record<
  ToastVariant,
  { bg: string; border: string; iconBg: string; title: string; body: string }
> = {
  error: {
    bg: '#FEF2F2',
    border: '#FCA5A5',
    iconBg: '#DC2626',
    title: '#991B1B',
    body: '#7F1D1D',
  },
  success: {
    bg: '#F0FDF4',
    border: '#86EFAC',
    iconBg: '#16A34A',
    title: '#166534',
    body: '#14532D',
  },
  info: {
    bg: '#EFF6FF',
    border: '#93C5FD',
    iconBg: '#2563EB',
    title: '#1E3A8A',
    body: '#1E3A8A',
  },
};

const Icon: React.FC<{ variant: ToastVariant; color: string }> = ({
  variant,
  color,
}) => {
  if (variant === 'error') {
    return (
      <Svg width={18} height={18} viewBox="0 0 18 18" fill="none">
        <Circle cx={9} cy={9} r={8.25} stroke={color} strokeWidth={1.5} />
        <Path
          d="M9 5v5"
          stroke={color}
          strokeWidth={1.8}
          strokeLinecap="round"
        />
        <Circle cx={9} cy={12.5} r={0.9} fill={color} />
      </Svg>
    );
  }
  if (variant === 'success') {
    return (
      <Svg width={18} height={18} viewBox="0 0 18 18" fill="none">
        <Circle cx={9} cy={9} r={8.25} stroke={color} strokeWidth={1.5} />
        <Path
          d="M5.5 9.2 8 11.5l4.5-5"
          stroke={color}
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    );
  }
  return (
    <Svg width={18} height={18} viewBox="0 0 18 18" fill="none">
      <Circle cx={9} cy={9} r={8.25} stroke={color} strokeWidth={1.5} />
      <Path
        d="M9 8v4"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
      <Circle cx={9} cy={5.5} r={0.9} fill={color} />
    </Svg>
  );
};

const ToastCard: React.FC<{ toast: Toast; onClose: (id: number) => void }> = ({
  toast,
  onClose,
}) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translate = useRef(new Animated.Value(-12)).current;
  const palette = PALETTE[toast.variant];

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(translate, {
        toValue: 0,
        duration: 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    const t = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(translate, {
          toValue: -12,
          duration: 220,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start(() => onClose(toast.id));
    }, toast.durationMs);

    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toast.id]);

  return (
    <Animated.View
      style={{
        opacity,
        transform: [{ translateY: translate }],
        marginHorizontal: 16,
        marginTop: 8,
        backgroundColor: palette.bg,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: palette.border,
        padding: 12,
        flexDirection: 'row',
        gap: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
        elevation: 6,
      }}>
      <View
        style={{
          width: 28,
          height: 28,
          borderRadius: 14,
          backgroundColor: '#FFFFFF',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Icon variant={toast.variant} color={palette.iconBg} />
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text
          className="font-poppins-semibold"
          style={{ color: palette.title, fontSize: 14, lineHeight: 18 }}>
          {toast.title}
        </Text>
        {toast.message ? (
          <Text
            className="font-poppins-regular"
            style={{ color: palette.body, fontSize: 13, lineHeight: 18 }}>
            {toast.message}
          </Text>
        ) : null}
      </View>
      <Pressable
        hitSlop={8}
        onPress={() => onClose(toast.id)}
        style={{ paddingHorizontal: 4, paddingVertical: 2 }}>
        <Text
          style={{
            color: palette.title,
            fontSize: 16,
            lineHeight: 18,
          }}>
          ×
        </Text>
      </Pressable>
    </Animated.View>
  );
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idRef = useRef(0);

  const close = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const show = useCallback<ToastContextValue['show']>(
    (variant, title, message, durationMs) => {
      const id = ++idRef.current;
      setToasts(prev => [
        ...prev,
        {
          id,
          variant,
          title,
          message,
          durationMs: durationMs ?? (variant === 'error' ? 4500 : 3000),
        },
      ]);
    },
    [],
  );

  const value: ToastContextValue = {
    show,
    error: (title, message) => show('error', title, message),
    success: (title, message) => show('success', title, message),
    info: (title, message) => show('info', title, message),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <SafeAreaView
        pointerEvents="box-none"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
        }}>
        <View pointerEvents="box-none">
          {toasts.map(t => (
            <ToastCard key={t.id} toast={t} onClose={close} />
          ))}
        </View>
      </SafeAreaView>
    </ToastContext.Provider>
  );
};
