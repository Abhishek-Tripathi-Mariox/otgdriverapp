import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TextInputProps,
  Pressable,
  ViewStyle,
  StyleProp,
  Modal,
  ScrollView,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

type BaseProps = {
  label: string;
  containerStyle?: StyleProp<ViewStyle>;
};

type FormInputProps = BaseProps & TextInputProps & { error?: string };

export const FormInput: React.FC<FormInputProps> = ({
  label,
  containerStyle,
  style,
  placeholderTextColor = '#717182',
  error,
  onFocus,
  onBlur,
  ...rest
}) => {
  const [focused, setFocused] = useState(false);
  return (
    <View style={[{ gap: 7.986 }, containerStyle]}>
      <Text
        className="font-poppins-medium"
        style={{ color: '#1E293B', fontSize: 14, lineHeight: 14 }}>
        {label}
      </Text>
      <View
        style={{
          backgroundColor: '#F3F3F5',
          borderRadius: 14,
          borderWidth: 1.162,
          // Highlight the field on focus so the user clearly sees they're
          // typing inside it (the caret alone was barely visible).
          borderColor: error ? '#DC2626' : focused ? '#E48714' : 'transparent',
          height: 47.989,
          paddingHorizontal: 12,
          justifyContent: 'center',
        }}>
        <TextInput
          className="font-poppins-regular"
          placeholderTextColor={placeholderTextColor}
          cursorColor="#E48714"
          selectionColor="#E48714"
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          style={[
            {
              color: '#1E293B',
              fontSize: 16,
              padding: 0,
            },
            style,
          ]}
          {...rest}
        />
      </View>
      {error ? (
        <Text
          className="font-poppins-regular"
          style={{ color: '#DC2626', fontSize: 12 }}>
          {error}
        </Text>
      ) : null}
    </View>
  );
};

type FormSelectProps = BaseProps & {
  value?: string;
  placeholder?: string;
  onPress?: () => void;
  options?: { label: string; value: string }[];
  onSelect?: (value: string) => void;
  error?: string;
};

const ChevronDown = () => (
  <Svg width={14} height={7} viewBox="0 0 14 7" fill="none">
    <Path
      d="M1 1L7 6L13 1"
      stroke="#717182"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const FormSelect: React.FC<FormSelectProps> = ({
  label,
  value,
  placeholder,
  onPress,
  options,
  onSelect,
  containerStyle,
  error,
}) => {
  const [open, setOpen] = useState(false);
  const selectedLabel = options?.find(o => o.value === value)?.label;
  const displayText = selectedLabel || value || placeholder || '';
  const isPlaceholder = !value;

  const handlePress = () => {
    if (options && options.length > 0) {
      setOpen(true);
    } else {
      onPress?.();
    }
  };

  return (
    <View style={[{ gap: 7.986 }, containerStyle]}>
      <Text
        className="font-poppins-medium"
        style={{ color: '#1E293B', fontSize: 14, lineHeight: 14 }}>
        {label}
      </Text>
      <Pressable
        onPress={handlePress}
        style={{
          backgroundColor: '#F3F3F5',
          borderRadius: 14,
          borderWidth: 1.162,
          borderColor: error ? '#DC2626' : 'transparent',
          height: 47.989,
          paddingHorizontal: 12,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
        <Text
          className="font-poppins-regular"
          style={{
            color: isPlaceholder ? '#717182' : '#1E293B',
            fontSize: 16,
          }}>
          {displayText}
        </Text>
        <ChevronDown />
      </Pressable>
      {error ? (
        <Text
          className="font-poppins-regular"
          style={{ color: '#DC2626', fontSize: 12 }}>
          {error}
        </Text>
      ) : null}

      {options && (
        <Modal
          visible={open}
          transparent
          animationType="fade"
          onRequestClose={() => setOpen(false)}>
          <Pressable
            onPress={() => setOpen(false)}
            style={{
              flex: 1,
              backgroundColor: 'rgba(0,0,0,0.5)',
              justifyContent: 'center',
              paddingHorizontal: 16,
            }}>
            <Pressable
              onPress={() => {}}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 16,
                paddingVertical: 12,
                maxHeight: '70%',
              }}>
              <Text
                className="font-poppins-semibold"
                style={{
                  color: '#1E293B',
                  fontSize: 16,
                  paddingHorizontal: 20,
                  paddingVertical: 8,
                }}>
                {label}
              </Text>
              <ScrollView>
                {options.map(opt => {
                  const isSelected = opt.value === value;
                  return (
                    <Pressable
                      key={opt.value}
                      onPress={() => {
                        onSelect?.(opt.value);
                        setOpen(false);
                      }}
                      style={{
                        paddingHorizontal: 20,
                        paddingVertical: 14,
                        backgroundColor: isSelected ? '#FFFDE3' : 'transparent',
                      }}>
                      <Text
                        className={
                          isSelected
                            ? 'font-poppins-semibold'
                            : 'font-poppins-regular'
                        }
                        style={{
                          color: '#1E293B',
                          fontSize: 16,
                        }}>
                        {opt.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </Pressable>
          </Pressable>
        </Modal>
      )}
    </View>
  );
};

type FileUploadProps = BaseProps & {
  value?: string;
  placeholder?: string;
  onPress?: () => void;
};

const UploadIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
    <Path
      d="M10 13V3M10 3L6 7M10 3L14 7"
      stroke="#6A7282"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M3 13V15C3 16.1046 3.89543 17 5 17H15C16.1046 17 17 16.1046 17 15V13"
      stroke="#6A7282"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const FileUpload: React.FC<FileUploadProps> = ({
  label,
  value,
  placeholder = 'Upload document',
  onPress,
  containerStyle,
}) => {
  return (
    <View style={[{ gap: 7.986 }, containerStyle]}>
      <Text
        className="font-poppins-medium"
        style={{ color: '#1E293B', fontSize: 14, lineHeight: 14 }}>
        {label}
      </Text>
      <Pressable
        onPress={onPress}
        style={{
          borderWidth: 1.162,
          borderColor: '#D1D5DC',
          borderRadius: 14,
          height: 54.287,
          paddingHorizontal: 17.152,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
        <Text
          className="font-poppins-regular"
          style={{
            color: value ? '#1E293B' : '#6A7282',
            fontSize: 14,
            lineHeight: 20,
          }}>
          {value || placeholder}
        </Text>
        <UploadIcon />
      </Pressable>
    </View>
  );
};

type PrimaryButtonProps = {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  label,
  onPress,
  disabled,
  style,
}) => (
  <Pressable
    onPress={onPress}
    disabled={disabled}
    style={[
      {
        height: 47.989,
        borderRadius: 14,
        backgroundColor: disabled ? '#D9D9D9' : '#FFE403',
        alignItems: 'center',
        justifyContent: 'center',
      },
      style,
    ]}>
    <Text
      className="font-poppins-medium"
      style={{
        color: disabled ? '#757575' : '#1E293B',
        fontSize: 14,
        lineHeight: 20,
      }}>
      {label}
    </Text>
  </Pressable>
);
