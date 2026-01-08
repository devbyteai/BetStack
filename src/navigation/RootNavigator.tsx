import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthNavigator } from './AuthNavigator';
import { DrawerNavigator } from './DrawerNavigator';
import { GameViewScreen } from '@/features/games';
import { SearchScreen } from '@/features/search';
import { JobDetailScreen } from '@/features/jobs';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { hydrateAuth } from '@/features/auth/store';
import { STORAGE_KEYS, COLORS } from '@/shared/constants';
import { Loader, OfflineBanner } from '@/shared/components';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated, isLoading } = useAppSelector((state) => state.auth);
  const [isHydrating, setIsHydrating] = useState(true);

  useEffect(() => {
    const hydrateAuthState = async () => {
      try {
        const [token, userJson] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN),
          AsyncStorage.getItem(STORAGE_KEYS.USER),
        ]);

        if (token && userJson) {
          const user = JSON.parse(userJson);
          dispatch(hydrateAuth({ user, wallet: null }));
        } else {
          dispatch(hydrateAuth(null));
        }
      } catch (error) {
        console.error('Failed to hydrate auth state:', error);
        dispatch(hydrateAuth(null));
      } finally {
        setIsHydrating(false);
      }
    };

    hydrateAuthState();
  }, [dispatch]);

  if (isHydrating || isLoading) {
    return <Loader fullScreen text="Loading..." />;
  }

  return (
    <View style={styles.container}>
      <OfflineBanner />
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: COLORS.background },
          animation: 'fade',
        }}
      >
        {isAuthenticated ? (
          <>
            <Stack.Screen name="Main" component={DrawerNavigator} />
            <Stack.Screen
              name="GameDetails"
              component={GameViewScreen}
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name="Search"
              component={SearchScreen}
              options={{
                animation: 'fade',
                presentation: 'fullScreenModal',
              }}
            />
            <Stack.Screen
              name="JobDetail"
              component={JobDetailScreen}
              options={({ route }) => ({
                headerShown: true,
                headerTitle: route.params.jobTitle,
                headerTintColor: COLORS.text,
                headerStyle: { backgroundColor: COLORS.background },
                animation: 'slide_from_right',
              })}
            />
          </>
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
});
