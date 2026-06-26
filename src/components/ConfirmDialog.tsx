import React from 'react';
import { Modal, View, Text, Pressable } from 'react-native';

type Props = {
  visible: boolean;
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

const ConfirmDialog: React.FC<Props> = ({
  visible,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive,
  onConfirm,
  onCancel,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}>
      <Pressable
        onPress={onCancel}
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
          <Text
            className="font-poppins-bold"
            style={{ color: '#1E293B', fontSize: 18, lineHeight: 24 }}>
            {title}
          </Text>
          {message ? (
            <Text
              className="font-poppins-regular"
              style={{ color: '#475569', fontSize: 14, lineHeight: 20 }}>
              {message}
            </Text>
          ) : null}
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
            <Pressable
              onPress={onCancel}
              style={{
                flex: 1,
                height: 44,
                borderRadius: 10,
                borderWidth: 1.2,
                borderColor: '#E2E8F0',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Text
                className="font-poppins-semibold"
                style={{ color: '#475569', fontSize: 14 }}>
                {cancelLabel}
              </Text>
            </Pressable>
            <Pressable
              onPress={onConfirm}
              style={{
                flex: 1,
                height: 44,
                borderRadius: 10,
                backgroundColor: destructive ? '#DC2626' : '#FFE403',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Text
                className="font-poppins-semibold"
                style={{
                  color: destructive ? '#FFFFFF' : '#1E293B',
                  fontSize: 14,
                }}>
                {confirmLabel}
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default ConfirmDialog;
