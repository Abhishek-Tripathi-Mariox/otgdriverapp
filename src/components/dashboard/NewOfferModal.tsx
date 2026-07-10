import React from 'react';
import { Modal, View, Text, Pressable, ActivityIndicator } from 'react-native';
import type { OrderSummary } from '../../api/client';

type Props = {
  visible: boolean;
  offer: OrderSummary | null;
  accepting?: boolean;
  onAccept: () => void;
  onDismiss: () => void;
};

const formatRupees = (n: number) => `₹${Math.round(n || 0).toLocaleString('en-IN')}`;

const NewOfferModal: React.FC<Props> = ({ visible, offer, accepting, onAccept, onDismiss }) => {
  if (!offer) return null;

  const title =
    offer.stage === 'early' ? 'New Delivery Near You' : 'New Delivery Request';

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDismiss}>
      <Pressable
        onPress={onDismiss}
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.5)',
          justifyContent: 'center',
          paddingHorizontal: 24,
        }}>
        <Pressable
          onPress={() => {}}
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 16,
            padding: 20,
            gap: 12,
          }}>
          <Text className="font-poppins-bold" style={{ color: '#1E293B', fontSize: 18, lineHeight: 24 }}>
            🔔 {title}
          </Text>

          <View style={{ gap: 6 }}>
            <Text className="font-poppins-regular" style={{ color: '#475569', fontSize: 13 }}>
              Pickup
            </Text>
            <Text className="font-poppins-semibold" style={{ color: '#1E293B', fontSize: 14 }}>
              {offer.pickup}
            </Text>
            <Text className="font-poppins-regular" style={{ color: '#475569', fontSize: 13, marginTop: 6 }}>
              Drop
            </Text>
            <Text className="font-poppins-semibold" style={{ color: '#1E293B', fontSize: 14 }}>
              {offer.drop}
            </Text>
            {offer.material ? (
              <Text className="font-poppins-regular" style={{ color: '#475569', fontSize: 13, marginTop: 6 }}>
                {offer.material}
                {offer.quantity ? ` · ${offer.quantity} ${offer.unit || ''}` : ''}
              </Text>
            ) : null}
            {offer.earnings ? (
              <Text className="font-poppins-semibold" style={{ color: '#16A34A', fontSize: 14, marginTop: 6 }}>
                Earn {formatRupees(offer.earnings)}
              </Text>
            ) : null}
          </View>

          <View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
            <Pressable
              onPress={onDismiss}
              disabled={accepting}
              style={{
                flex: 1,
                height: 44,
                borderRadius: 10,
                borderWidth: 1.2,
                borderColor: '#E2E8F0',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Text className="font-poppins-semibold" style={{ color: '#475569', fontSize: 14 }}>
                Not Now
              </Text>
            </Pressable>
            <Pressable
              onPress={onAccept}
              disabled={accepting}
              style={{
                flex: 1,
                height: 44,
                borderRadius: 10,
                backgroundColor: '#4caf50',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: accepting ? 0.7 : 1,
              }}>
              {accepting ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text className="font-poppins-semibold" style={{ color: '#FFFFFF', fontSize: 14 }}>
                  Accept
                </Text>
              )}
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default NewOfferModal;
