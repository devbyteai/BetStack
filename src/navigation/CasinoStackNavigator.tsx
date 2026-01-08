import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  CasinoScreen,
  GameLaunchScreen,
  RouletteScreen,
  VirtualSportsScreen,
} from '@/features/casino';
import { COLORS } from '@/shared/constants';
import type { CasinoStackParamList } from './types';

const Stack = createNativeStackNavigator<CasinoStackParamList>();

export const CasinoStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: COLORS.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="CasinoScreen" component={CasinoScreen} />
      <Stack.Screen name="GameLaunch" component={GameLaunchScreen} />
      <Stack.Screen name="Roulette" component={RouletteScreen} />
      <Stack.Screen name="VirtualSports" component={VirtualSportsScreen} />
    </Stack.Navigator>
  );
};
