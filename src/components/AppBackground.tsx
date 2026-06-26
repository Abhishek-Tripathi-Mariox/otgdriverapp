import React from 'react';
import { View, StatusBar, ViewStyle, StyleProp } from 'react-native';

type Props = {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  center?: boolean;
};

const AppBackground: React.FC<Props> = ({ children, style, center = false }) => {
  return (
    <View
      style={[
        {
          flex: 1,
          backgroundColor: '#FFFFFF',
        },
        center && { alignItems: 'center', justifyContent: 'center' },
        style,
      ]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      {children}
    </View>
  );
};

export default AppBackground;
