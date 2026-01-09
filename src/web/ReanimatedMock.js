import React from 'react';
import { View, Animated as RNAnimated } from 'react-native';

export const useSharedValue = (initialValue) => {
  const ref = React.useRef({ value: initialValue });
  return ref.current;
};

export const useAnimatedStyle = (callback) => {
  return callback();
};

export const withTiming = (toValue, config, callback) => {
  callback && callback(true);
  return toValue;
};

export const withSpring = (toValue, config, callback) => {
  callback && callback(true);
  return toValue;
};

export const withDelay = (delay, animation) => animation;
export const withSequence = (...animations) => animations[animations.length - 1];
export const withRepeat = (animation, numberOfReps, reverse) => animation;

export const runOnJS = (fn) => fn;
export const runOnUI = (fn) => fn;

export const Easing = {
  linear: (x) => x,
  ease: (x) => x,
  bezier: () => (x) => x,
  in: (fn) => fn,
  out: (fn) => fn,
  inOut: (fn) => fn,
};

export const Animated = {
  View: RNAnimated.View,
  Text: RNAnimated.Text,
  Image: RNAnimated.Image,
  ScrollView: RNAnimated.ScrollView,
  FlatList: RNAnimated.FlatList,
};

export const interpolate = (value, inputRange, outputRange) => {
  return outputRange[0];
};

export const Extrapolate = {
  EXTEND: 'extend',
  CLAMP: 'clamp',
  IDENTITY: 'identity',
};

export default {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  withSequence,
  withRepeat,
  runOnJS,
  runOnUI,
  Easing,
  Animated,
  interpolate,
  Extrapolate,
};
