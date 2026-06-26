import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type OnboardingStep =
  | 'personal'
  | 'vehicle'
  | 'owner'
  | 'bank'
  | 'completed';

export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export type DriverVehicleDoc = {
  url?: string;
  status?: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
};

export type DriverVehicle = {
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
    rcBook?: DriverVehicleDoc;
    insurance?: DriverVehicleDoc;
    pollutionCertificate?: DriverVehicleDoc;
  };
};

export type DriverDocument = {
  url?: string;
  status?: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
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

export type DriverProfile = {
  id: string;
  name?: string;
  mobile: string;
  email?: string;
  profileImage?: string;
  dateOfBirth?: string;
  approvalStatus: ApprovalStatus;
  onboardingStep: OnboardingStep;
  rejectionReason?: string;
  vehicles?: DriverVehicle[];
  documents?: {
    drivingLicense?: DriverDocument;
  };
  owner?: {
    name?: string;
    contact?: string;
    address?: string;
  };
  bank?: DriverBank;
  address?: DriverAddress;
};

type AuthState = {
  token: string | null;
  driver: DriverProfile | null;
  pendingMobile: string | null;
  hydrated: boolean;

  setPendingMobile: (mobile: string) => void;
  loginSuccess: (payload: { token: string; driver: DriverProfile }) => void;
  setDriver: (driver: DriverProfile) => void;
  setOnboardingStep: (step: OnboardingStep) => void;
  setApprovalStatus: (status: ApprovalStatus, reason?: string) => void;
  setVehicles: (vehicles: DriverVehicle[]) => void;
  logout: () => void;
  setHydrated: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    set => ({
      token: null,
      driver: null,
      pendingMobile: null,
      hydrated: false,

      setPendingMobile: mobile => set({ pendingMobile: mobile }),
      loginSuccess: ({ token, driver }) =>
        set({ token, driver, pendingMobile: null }),
      setDriver: driver => set({ driver }),
      setOnboardingStep: step =>
        set(s => ({
          driver: s.driver ? { ...s.driver, onboardingStep: step } : s.driver,
        })),
      setApprovalStatus: (status, reason) =>
        set(s => ({
          driver: s.driver
            ? {
                ...s.driver,
                approvalStatus: status,
                rejectionReason: reason ?? s.driver.rejectionReason,
              }
            : s.driver,
        })),
      setVehicles: vehicles =>
        set(s => ({
          driver: s.driver ? { ...s.driver, vehicles } : s.driver,
        })),
      logout: () => set({ token: null, driver: null, pendingMobile: null }),
      setHydrated: () => set({ hydrated: true }),
    }),
    {
      name: 'otg-driver-auth',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: state => ({ token: state.token, driver: state.driver }),
      onRehydrateStorage: () => state => {
        state?.setHydrated();
      },
    },
  ),
);

// Normalize a server DriverSession (or anything that looks like one) into the
// store's DriverProfile shape. Centralized so login, splash, profile refresh,
// and pending-approval polling all stay in sync as the schema grows.
export const driverSessionToProfile = (d: any): DriverProfile => ({
  id: d._id,
  name: d.name,
  mobile: d.mobile,
  email: d.email,
  profileImage: d.profileImage,
  dateOfBirth: d.dateOfBirth,
  approvalStatus: d.approvalStatus,
  onboardingStep: d.onboardingStep,
  rejectionReason: d.rejectionReason,
  vehicles: (d.vehicles || []).map((v: any) => ({
    ...v,
    _id: String(v._id),
  })),
  documents: d.documents,
  owner: d.owner,
  bank: d.bank,
  address: d.address,
});

// Map an onboarding step (and approval status, when completed) to the next screen.
export const screenForStep = (
  step: OnboardingStep,
  approval: ApprovalStatus,
):
  | 'PersonalDetails'
  | 'VehicleDetails'
  | 'OwnerDetails'
  | 'CompleteProfile'
  | 'PendingApproval'
  | 'Home' => {
  if (step === 'personal') return 'PersonalDetails';
  if (step === 'vehicle') return 'VehicleDetails';
  if (step === 'owner') return 'OwnerDetails';
  // Bank is the only tab left in CompleteProfile
  if (step === 'bank') return 'CompleteProfile';
  // completed
  return approval === 'approved' ? 'Home' : 'PendingApproval';
};
