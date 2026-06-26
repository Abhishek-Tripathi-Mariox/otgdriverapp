import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import ScreenHeader from '../components/ScreenHeader';
import { PrimaryButton } from '../components/FormField';
import { useDocumentUpload } from '../components/DocumentUpload';
import ConfirmDialog from '../components/ConfirmDialog';
import { driverApi } from '../api/client';
import { extractErrorMessage } from '../api/errors';
import { useAuthStore } from '../store';
import { useToast } from '../components/Toast';
import type { RootStackParamList } from '../navigation/AppNavigator';
import type { DriverVehicle, DriverVehicleDoc } from '../store';

type Props = NativeStackScreenProps<RootStackParamList, 'MyVehicles'>;
type DocStatus = 'pending' | 'approved' | 'rejected' | 'not_uploaded';

const STATUS_PALETTE: Record<
  DocStatus,
  { bg: string; fg: string; label: string }
> = {
  approved: { bg: '#E8F5E9', fg: '#2E7D32', label: 'Approved' },
  pending: { bg: '#FFF8E1', fg: '#B26A00', label: 'Pending Review' },
  rejected: { bg: '#FFEBEE', fg: '#C62828', label: 'Rejected' },
  not_uploaded: { bg: '#ECECF0', fg: '#6B7280', label: 'Not uploaded' },
};

const VEHICLE_DOC_FIELDS: {
  key: 'rcBook' | 'insurance' | 'pollutionCertificate';
  label: string;
}[] = [
  { key: 'rcBook', label: 'RC Book' },
  { key: 'insurance', label: 'Insurance' },
  { key: 'pollutionCertificate', label: 'Pollution Certificate' },
];

const docStatusOf = (doc?: DriverVehicleDoc): DocStatus => {
  if (!doc?.url) return 'not_uploaded';
  return doc.status || 'pending';
};

const StatusChip: React.FC<{ status: DocStatus }> = ({ status }) => {
  const palette = STATUS_PALETTE[status];
  return (
    <View
      style={{
        backgroundColor: palette.bg,
        borderRadius: 999,
        paddingHorizontal: 8,
        paddingVertical: 3,
      }}>
      <Text
        className="font-poppins-semibold"
        style={{ color: palette.fg, fontSize: 11, lineHeight: 14 }}>
        {palette.label}
      </Text>
    </View>
  );
};

const VehicleDocs: React.FC<{
  vehicle: DriverVehicle;
  onUpdated: (vehicles: DriverVehicle[]) => void;
}> = ({ vehicle, onUpdated }) => {
  const toast = useToast();
  const { start, uploading, sheet } = useDocumentUpload();
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [activeKey, setActiveKey] = useState<string | null>(null);

  const handleReupload = (docKey: string) => {
    if (busyKey || uploading) return;
    setActiveKey(docKey);
    start(async ({ url }) => {
      setBusyKey(docKey);
      try {
        const res = await driverApi.reuploadVehicleDocument(
          vehicle._id,
          docKey,
          url,
        );
        const updated = (res as any).data.data.driver;
        onUpdated(
          (updated.vehicles || []).map((v: any) => ({
            ...v,
            _id: String(v._id),
          })),
        );
        toast.success('Document uploaded');
      } catch (err: any) {
        toast.error(
          'Could not upload',
          extractErrorMessage(err, 'Please try again.'),
        );
      } finally {
        setBusyKey(null);
      }
    });
  };

  return (
    <View>
      {sheet}
      <View
        style={{
          gap: 8,
          marginTop: 12,
          paddingTop: 12,
          borderTopWidth: 1,
          borderTopColor: '#F0F0F0',
        }}>
      <Text
        className="font-poppins-semibold"
        style={{ color: '#404040', fontSize: 12, lineHeight: 16 }}>
        Vehicle Documents
      </Text>
      {VEHICLE_DOC_FIELDS.map(({ key, label }) => {
        const doc = vehicle.documents?.[key];
        const status = docStatusOf(doc);
        const showCta =
          status === 'not_uploaded' || status === 'rejected';
        const isBusy = busyKey === key || (uploading && activeKey === key);
        return (
          <View key={key} style={{ gap: 4 }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
              <Text
                className="font-poppins-regular"
                style={{
                  color: '#404040',
                  fontSize: 13,
                  lineHeight: 18,
                  flex: 1,
                }}>
                {label}
              </Text>
              <View
                style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <StatusChip status={status} />
                {showCta && (
                  <Pressable
                    onPress={() => handleReupload(key)}
                    disabled={isBusy}
                    hitSlop={6}>
                    <Text
                      className="font-poppins-semibold"
                      style={{ color: '#E48714', fontSize: 12, lineHeight: 16 }}>
                      {isBusy
                        ? 'Uploading...'
                        : status === 'rejected'
                          ? 'Re-upload'
                          : 'Upload'}
                    </Text>
                  </Pressable>
                )}
              </View>
            </View>
            {status === 'rejected' && doc?.rejectionReason ? (
              <Text
                className="font-poppins-regular"
                style={{ color: '#B71C1C', fontSize: 11, lineHeight: 15 }}>
                {doc.rejectionReason}
              </Text>
            ) : null}
          </View>
        );
      })}
      </View>
    </View>
  );
};

const MyVehiclesScreen: React.FC<Props> = ({ navigation }) => {
  const driver = useAuthStore(s => s.driver);
  const setVehicles = useAuthStore(s => s.setVehicles);
  const toast = useToast();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  const vehicles = driver?.vehicles ?? [];

  const requestDelete = (vehicleId: string) => {
    if (vehicles.length <= 1) {
      toast.error('Cannot delete', 'You must have at least one vehicle.');
      return;
    }
    setConfirmingId(vehicleId);
  };

  const performDelete = async () => {
    if (!confirmingId) return;
    const id = confirmingId;
    setConfirmingId(null);
    setDeletingId(id);
    try {
      const res = await driverApi.deleteVehicle(id);
      const updated = res.data.data.driver;
      setVehicles(
        (updated.vehicles || []).map((v: any) => ({
          ...v,
          _id: String(v._id),
        })),
      );
      toast.success('Vehicle removed');
    } catch (err: any) {
      toast.error(
        'Could not remove',
        extractErrorMessage(err, 'Please try again.'),
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F5F5F5' }}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: '#FFE403' }}>
        <ScreenHeader
          title="Vehicle Management"
          onBack={() => navigation.goBack()}
        />
      </SafeAreaView>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 24,
          paddingBottom: 32,
          gap: 16,
        }}
        showsVerticalScrollIndicator={false}>
        {vehicles.length === 0 ? (
          <View
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 16,
              padding: 24,
              alignItems: 'center',
            }}>
            <Text
              className="font-poppins-regular"
              style={{ color: '#6B7280', fontSize: 14, textAlign: 'center' }}>
              You have not added any vehicles yet.
            </Text>
          </View>
        ) : (
          vehicles.map(v => (
            <View
              key={v._id}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 16,
                padding: 16,
                gap: 8,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.06,
                shadowRadius: 8,
                elevation: 2,
              }}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                <Text
                  className="font-poppins-semibold"
                  style={{ color: '#1E293B', fontSize: 16, lineHeight: 22 }}>
                  {v.brand || 'Vehicle'} {v.model ? `· ${v.model}` : ''}
                </Text>
                {v.type && (
                  <View
                    style={{
                      backgroundColor: '#FFFDE3',
                      borderRadius: 999,
                      paddingHorizontal: 10,
                      paddingVertical: 3,
                    }}>
                    <Text
                      className="font-poppins-medium"
                      style={{ color: '#404040', fontSize: 12 }}>
                      {v.type} Wheeler
                    </Text>
                  </View>
                )}
              </View>

              <Text
                className="font-poppins-medium"
                style={{ color: '#404040', fontSize: 14 }}>
                {v.registrationNo || '—'}
              </Text>
              {(v.color || v.year) && (
                <Text
                  className="font-poppins-regular"
                  style={{ color: '#6B7280', fontSize: 12 }}>
                  {[v.color, v.year].filter(Boolean).join(' · ')}
                </Text>
              )}
              {v.liftingCapacity && (
                <Text
                  className="font-poppins-regular"
                  style={{ color: '#6B7280', fontSize: 12 }}>
                  Capacity: {v.liftingCapacity}
                </Text>
              )}

              <VehicleDocs vehicle={v} onUpdated={setVehicles} />

              <View
                style={{
                  flexDirection: 'row',
                  gap: 8,
                  marginTop: 12,
                }}>
                <Pressable
                  onPress={() =>
                    navigation.navigate('VehicleDetails', { vehicleId: v._id })
                  }
                  style={{
                    flex: 1,
                    height: 40,
                    borderRadius: 10,
                    backgroundColor: '#FFE403',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <Text
                    className="font-poppins-semibold"
                    style={{ color: '#1E293B', fontSize: 13 }}>
                    Edit
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => requestDelete(v._id)}
                  disabled={deletingId === v._id || vehicles.length <= 1}
                  style={{
                    flex: 1,
                    height: 40,
                    borderRadius: 10,
                    borderWidth: 1.2,
                    borderColor:
                      vehicles.length <= 1 ? '#E5E7EB' : '#FCA5A5',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <Text
                    className="font-poppins-semibold"
                    style={{
                      color: vehicles.length <= 1 ? '#9CA3AF' : '#DC2626',
                      fontSize: 13,
                    }}>
                    {deletingId === v._id ? 'Removing...' : 'Remove'}
                  </Text>
                </Pressable>
              </View>
            </View>
          ))
        )}

        <PrimaryButton
          label="Add another vehicle"
          onPress={() => navigation.navigate('VehicleDetails', {})}
        />
      </ScrollView>

      <ConfirmDialog
        visible={!!confirmingId}
        title="Remove vehicle?"
        message="This action cannot be undone."
        confirmLabel="Remove"
        cancelLabel="Cancel"
        destructive
        onCancel={() => setConfirmingId(null)}
        onConfirm={performDelete}
      />
    </View>
  );
};

export default MyVehiclesScreen;
