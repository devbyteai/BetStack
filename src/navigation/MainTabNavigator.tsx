import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HomeScreen } from '@/features/home';
import { LiveScreen } from '@/features/live';
import { PrematchScreen } from '@/features/prematch';
import { CasinoStackNavigator } from './CasinoStackNavigator';
import { ProfileStackNavigator } from './ProfileStackNavigator';
import { COLORS, FONT_SIZES } from '@/shared/constants';
import type { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

const TabIcon: React.FC<{ label: string; focused: boolean }> = ({ label, focused }) => (
  <View style={styles.tabIcon}>
    <Text style={[styles.tabEmoji, focused && styles.tabEmojiActive]}>
      {label === 'Home' && '🏠'}
      {label === 'Live' && '🔴'}
      {label === 'Prematch' && '⚽'}
      {label === 'Casino' && '🎰'}
      {label === 'Profile' && '👤'}
    </Text>
  </View>
);

export const MainTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarLabelStyle: styles.tabLabel,
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon label="Home" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Live"
        component={LiveScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon label="Live" focused={focused} />,
          tabBarBadge: undefined, // Will show live count
        }}
      />
      <Tab.Screen
        name="Prematch"
        component={PrematchScreen}
        options={{
          tabBarLabel: 'Sports',
          tabBarIcon: ({ focused }) => <TabIcon label="Prematch" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Casino"
        component={CasinoStackNavigator}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon label="Casino" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStackNavigator}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon label="Profile" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: COLORS.backgroundCard,
    borderTopColor: COLORS.border,
    borderTopWidth: 1,
    height: 60,
    paddingBottom: 8,
    paddingTop: 8,
  },
  tabLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '500',
  },
  tabIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabEmoji: {
    fontSize: 20,
    opacity: 0.6,
  },
  tabEmojiActive: {
    opacity: 1,
  },
});
