import React from 'react';
import { View, Text, Pressable } from 'react-native';
import Svg, { Path } from 'react-native-svg';

type Props = {
  step: number;
  total?: number;
  onBack?: () => void;
};

const BackArrow = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path
      d="M19 12H5"
      stroke="#404040"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M12 19L5 12L12 5"
      stroke="#404040"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const RegistrationHeader: React.FC<Props> = ({ step, total = 6, onBack }) => {
  const progress = Math.min(Math.max(step / total, 0), 1);
  return (
    <View
      style={{
        backgroundColor: '#FFE403',
        paddingTop: 12,
        paddingBottom: 12,
        paddingHorizontal: 16,
      }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          height: 47.971,
        }}>
        <Pressable
          onPress={onBack}
          hitSlop={8}
          style={{ width: 23.994, height: 23.994, alignItems: 'center', justifyContent: 'center' }}>
          <BackArrow />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text
            className="font-poppins-semibold"
            style={{ color: '#404040', fontSize: 18, lineHeight: 28 }}>
            Driver Registration
          </Text>
          <Text
            className="font-poppins-regular"
            style={{ color: '#404040', fontSize: 14, lineHeight: 20 }}>
            Step {step} of {total}
          </Text>
        </View>
      </View>
      <View
        style={{
          marginTop: 11.997,
          height: 7.986,
          borderRadius: 9999,
          backgroundColor: 'rgba(255,255,255,0.3)',
          overflow: 'hidden',
        }}>
        <View
          style={{
            width: `${progress * 100}%`,
            height: '100%',
            backgroundColor: '#404040',
          }}
        />
      </View>
    </View>
  );
};

export default RegistrationHeader;
