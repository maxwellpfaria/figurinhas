import React from 'react';
import { Image } from 'react-native';

export default function AppLogo({ size = 110 }: { size?: number }) {
  return (
    <Image
      source={require('../../assets/adaptative-icon_v2.png')}
      style={{ width: size, height: size, borderRadius: size * 0.22 }}
      resizeMode="contain"
    />
  );
}
