import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { ArrowLeftIcon } from './DashboardIcons';

type Props = {
  title: string;
  onBack: () => void;
  right?: React.ReactNode;
};

const ScreenHeader: React.FC<Props> = ({ title, onBack, right }) => (
  <View
    style={{
      backgroundColor: '#FFE403',
      height: 71.947,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 13,
    }}>
    <Pressable
      onPress={onBack}
      style={{
        width: 39.966,
        height: 39.966,
        borderRadius: 19.983,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <ArrowLeftIcon size={23.994} color="#404040" />
    </Pressable>
    <Text
      className="font-poppins-bold"
      style={{
        color: '#404040',
        fontSize: 18,
        lineHeight: 26,
        marginLeft: 15.99,
        flex: 1,
      }}>
      {title}
    </Text>
    {right}
  </View>
);

export default ScreenHeader;
