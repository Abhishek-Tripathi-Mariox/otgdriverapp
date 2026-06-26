import React from 'react';
import { View, Image } from 'react-native';

type Props = {
  containerSize?: number;
  logoSize?: number;
};

const LogoBadge: React.FC<Props> = ({ containerSize = 119.99, logoSize = 64 }) => {
  return (
    <View
      style={{
        width: containerSize,
        height: containerSize,
        borderRadius: containerSize / 2,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 32,
        elevation: 8,
      }}>
      <Image
        source={require('../assets/source_OTG_White.png')}
        style={{ width: logoSize, height: logoSize }}
        resizeMode="contain"
      />
    </View>
  );
};

export default LogoBadge;
