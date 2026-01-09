import React from 'react';
import { View } from 'react-native';

export const SafeAreaProvider = ({ children }) => children;
export const SafeAreaView = ({ children, style, ...props }) => (
  <View style={[{ paddingTop: 44, paddingBottom: 34 }, style]} {...props}>
    {children}
  </View>
);
export const useSafeAreaInsets = () => ({
  top: 44,
  bottom: 34,
  left: 0,
  right: 0,
});
export const useSafeAreaFrame = () => ({
  x: 0,
  y: 0,
  width: window.innerWidth,
  height: window.innerHeight,
});
export const initialWindowMetrics = {
  insets: { top: 44, bottom: 34, left: 0, right: 0 },
  frame: { x: 0, y: 0, width: 375, height: 812 },
};
export default { SafeAreaProvider, SafeAreaView, useSafeAreaInsets };
