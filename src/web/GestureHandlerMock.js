import React from 'react';
import { View, ScrollView as RNScrollView, TouchableOpacity, TouchableHighlight, TouchableWithoutFeedback } from 'react-native';

export const GestureHandlerRootView = ({ children, style }) => (
  <View style={[{ flex: 1 }, style]}>{children}</View>
);
export const ScrollView = RNScrollView;
export const FlatList = require('react-native').FlatList;
export const PanGestureHandler = ({ children }) => children;
export const TapGestureHandler = ({ children }) => children;
export const LongPressGestureHandler = ({ children }) => children;
export const State = {};
export const Directions = {};
export const gestureHandlerRootHOC = (Component) => Component;
export { TouchableOpacity, TouchableHighlight, TouchableWithoutFeedback };
export const RectButton = TouchableOpacity;
export const BorderlessButton = TouchableOpacity;
export const BaseButton = TouchableOpacity;
export const Swipeable = ({ children }) => children;
export const DrawerLayout = ({ children }) => children;
export default {
  GestureHandlerRootView,
  ScrollView,
  PanGestureHandler,
  TapGestureHandler,
  State,
  Directions,
};
