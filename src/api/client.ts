import axios from 'axios';
import { useAuthStore } from '../store/authStore';

// Dev: LAN IP of the machine running the backend on the same Wi-Fi as the device.
// Prod: production backend host. __DEV__ is set to true by Metro in dev builds
// (`react-native run-android`, `start`) and false in release builds (assembleRelease/bundleRelease).
//
// Emulator dev alternatives (only relevant if NOT running on a physical device):
//   Android emulator: http://10.0.2.2:5011
//   iOS simulator:    http://localhost:5011
// export const API_BASE_URL = __DEV__
//   ? 'http://10.235.182.192:5011/api'
//   : 'https://otgtrading.in/api/';
export const API_BASE_URL = 'https://otgtrading.in/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000,
});

api.interceptors.request.use(config => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers = config.headers || {};
    (config.headers as any).Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(err);
  },
);

export type DocStatus = 'pending' | 'approved' | 'rejected';

export type DocFile = {
  url?: string;
  status?: DocStatus;
  rejectionReason?: string;
  uploadedAt?: string;
};

export type Vehicle = {
  _id: string;
  brand?: string;
  model?: string;
  type?: string;
  color?: string;
  year?: string;
  liftingCapacity?: string;
  registrationNo?: string;
  insuranceNo?: string;
  insuranceExpiry?: string;
  documents?: {
    rcBook?: DocFile;
    insurance?: DocFile;
    pollutionCertificate?: DocFile;
  };
};

export type DriverAddress = {
  street?: string;
  city?: string;
  state?: string;
  pincode?: string;
  full?: string;
};

export type DriverBank = {
  accountHolder?: string;
  bankName?: string;
  accountNumber?: string;
  ifsc?: string;
  branch?: string;
  passbookUrl?: string;
};

export type DriverSession = {
  _id: string;
  name?: string;
  mobile: string;
  email?: string;
  profileImage?: string;
  dateOfBirth?: string;
  status: 'active' | 'inactive' | 'blocked';
  isVerified: boolean;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  onboardingStep:
    | 'personal'
    | 'vehicle'
    | 'owner'
    | 'bank'
    | 'completed';
  vehicles?: Vehicle[];
  documents?: {
    drivingLicense?: DocFile;
  };
  owner?: {
    name?: string;
    contact?: string;
    address?: string;
  };
  bank?: DriverBank;
  address?: DriverAddress;
};

export type VehicleDocsPayload = {
  rcBook?: string;
  insurance?: string;
  pollutionCertificate?: string;
};

export type VehiclePayload = Omit<Vehicle, '_id' | 'documents'> & {
  documents?: VehicleDocsPayload;
};

export type OrderUiStatus = 'in_progress' | 'delivered' | 'rejected';

export type OrderSummary = {
  id: string;
  _id: string;
  status: OrderUiStatus;
  rawStatus: string;
  pickup: string;
  drop: string;
  date: string;
  earnings: number;
  material?: string;
  quantity?: number;
  unit?: string;
};

export type DriverNotification = {
  _id: string;
  title: string;
  message: string;
  targetType: 'all' | 'drivers' | 'specific';
  createdAt: string;
  sentAt: string | null;
  unread: boolean;
};

export type NotificationsResponse = {
  items: DriverNotification[];
  unreadCount: number;
  total: number;
};

export type EarningsPeriod = { trips: number; amount: number };

export type DriverDashboard = {
  completedTodayCount: number;
  totalCompletedCount: number;
  activeCount: number;
  todayEarnings: number;
  totalEarnings: number;
  pendingPayout: number;
  earnings?: {
    daily: EarningsPeriod;
    weekly: EarningsPeriod;
    monthly: EarningsPeriod;
  };
  newOffer: OrderSummary | null;
  activeOrder: OrderSummary | null;
  isOnline?: boolean;
};

export type HelpSettings = {
  address: string | null;
  mobile: string | null;
  email: string | null;
  whatsappNumber: string | null;
};

export type SupportTicketPayload = {
  name: string;
  mobile: string;
  email?: string;
  message: string;
};

export const driverApi = {
  sendOtp: (mobile: string) =>
    api.post('/mobile/driver/auth/send-otp', { mobile }),
  verifyOtp: (mobile: string, otp: string) =>
    api.post<{
      success: boolean;
      data: { token: string; driver: DriverSession };
    }>('/mobile/driver/auth/verify-otp', { mobile, otp }),
  resendOtp: (mobile: string) =>
    api.post('/mobile/driver/auth/resend-otp', { mobile }),
  me: () =>
    api.get<{ success: boolean; data: DriverSession }>(
      '/mobile/driver/auth/me',
    ),

  // Vehicles
  addVehicle: (data: VehiclePayload) => api.post('/mobile/driver/vehicles', data),
  updateVehicle: (vehicleId: string, data: VehiclePayload) =>
    api.put(`/mobile/driver/vehicles/${vehicleId}`, data),
  deleteVehicle: (vehicleId: string) =>
    api.delete(`/mobile/driver/vehicles/${vehicleId}`),

  saveOwner: (data: any) => api.post('/mobile/driver/onboarding/owner', data),
  savePersonal: (data: any) =>
    api.post('/mobile/driver/onboarding/personal', data),
  saveBank: (data: any) => api.post('/mobile/driver/onboarding/bank', data),

  // Generic document upload (image or PDF) as a base64 data URI. Returns the S3
  // URL, which the caller then stores via the relevant save endpoint.
  // `file` is a data URI: `data:<mime>;base64,<payload>`.
  uploadDocument: (file: string) =>
    api.post<{ success: boolean; data: { url: string } }>(
      '/mobile/driver/documents/upload',
      { file },
      // base64 PDFs are larger than JSON API calls; allow more time on slow links.
      { timeout: 60000 },
    ),

  // Driving license — driver-owned document
  saveDrivingLicense: (url: string) =>
    api.post('/mobile/driver/documents/driving-license', { url }),
  reuploadDrivingLicense: (url: string) =>
    api.post('/mobile/driver/documents/driving-license/reupload', { url }),

  // Vehicle-owned document re-upload (RC / insurance / pollution)
  reuploadVehicleDocument: (vehicleId: string, docType: string, url: string) =>
    api.post(
      `/mobile/driver/vehicles/${vehicleId}/documents/${docType}/reupload`,
      { url },
    ),

  // Profile image — uploads a local file (camera/gallery) as multipart.
  // The server saves it to S3 and returns the updated DriverSession.
  // Sends the image as base64 JSON. We do NOT use multipart/FormData because
  // multipart PUTs from React Native's bridge fail unpredictably on Android
  // (the request body is built but OkHttp rejects it at send time with
  // net::ERR_FAILED before reaching the server). JSON+base64 uses the same
  // code path as every other API call, which we know is reliable.
  //
  // `base64` is the raw base64 payload from react-native-image-picker
  // (asset.base64). `mime` is asset.type ("image/jpeg" by default).
  uploadProfileImage: (asset: { base64: string; type?: string }) =>
    api.put<{ success: boolean; data: DriverSession }>(
      '/mobile/driver/profile-image',
      { image: `data:${asset.type || 'image/jpeg'};base64,${asset.base64}` },
    ),

  // Orders + dashboard
  dashboard: () =>
    api.get<{ success: boolean; data: DriverDashboard }>(
      '/mobile/driver/dashboard',
    ),
  myOrders: (statusGroup: 'active' | 'completed' | 'rejected') =>
    api.get<{ success: boolean; data: OrderSummary[] }>(
      '/mobile/driver/orders',
      { params: { status: statusGroup } },
    ),
  getOrder: (bookingId: string) =>
    api.get<{ success: boolean; data: OrderSummary }>(
      `/mobile/driver/orders/${bookingId}`,
    ),
  orderStatus: (
    bookingId: string,
    action: 'accept' | 'start' | 'complete' | 'reject',
  ) =>
    api.patch<{ success: boolean; data: OrderSummary }>(
      `/mobile/driver/orders/${bookingId}/status`,
      { action },
    ),
  setOnline: (isOnline: boolean) =>
    api.patch<{ success: boolean; data: { isOnline: boolean } }>(
      '/mobile/driver/online',
      { isOnline },
    ),

  // Notifications
  listNotifications: () =>
    api.get<{
      success: boolean;
      data: DriverNotification[];
      meta: { unreadCount: number; total: number };
    }>('/mobile/driver/notifications'),
  unreadNotificationCount: () =>
    api.get<{ success: boolean; data: { unreadCount: number } }>(
      '/mobile/driver/notifications/unread-count',
    ),
  markNotificationRead: (id: string) =>
    api.patch<{ success: boolean }>(`/mobile/driver/notifications/${id}/read`),
  markAllNotificationsRead: () =>
    api.patch<{ success: boolean }>('/mobile/driver/notifications/read-all'),
  deleteNotification: (id: string) =>
    api.delete<{ success: boolean }>(`/mobile/driver/notifications/${id}`),

  // Help & support
  helpSettings: () =>
    api.get<{ success: boolean; data: HelpSettings }>('/help/public/settings'),
  submitSupportTicket: (payload: SupportTicketPayload) =>
    api.post<{
      success: boolean;
      message: string;
      data: { ticketCode?: string };
    }>('/help/public/tickets', payload),
};
