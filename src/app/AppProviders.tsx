import React, { useEffect } from 'react';
import { Provider as ReduxProvider, useDispatch } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { PersistGate } from 'redux-persist/integration/react';
import { StyleSheet, ActivityIndicator, View } from 'react-native';
import { store, persistor } from '@/store';
import { WebSocketInitializer } from './WebSocketInitializer';
// NotificationInitializer disabled - requires Firebase configuration
// import { NotificationInitializer } from './NotificationInitializer';
import { NetworkProvider, ThemeProvider, ToastProvider } from '@/shared/context';
import { ErrorBoundary } from '@/shared/components';
import { clearExpiredSelections } from '@/features/betslip/store';
import { COLORS } from '@/shared/constants';

// Component to clear expired betslip on app start
const BetslipExpiryChecker: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    // Clear expired betslip selections on app start
    dispatch(clearExpiredSelections());
  }, [dispatch]);

  return <>{children}</>;
};

const LoadingFallback = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color={COLORS.primary} />
  </View>
);

interface AppProvidersProps {
  children: React.ReactNode;
}

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <ErrorBoundary>
          <ThemeProvider>
            <NetworkProvider>
              <ReduxProvider store={store}>
                <PersistGate loading={<LoadingFallback />} persistor={persistor}>
                  <ToastProvider>
                    <BetslipExpiryChecker>
                      <WebSocketInitializer>
                        {children}
                      </WebSocketInitializer>
                    </BetslipExpiryChecker>
                  </ToastProvider>
                </PersistGate>
              </ReduxProvider>
            </NetworkProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
});
