import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { MainTabNavigator } from './MainTabNavigator';
import { DrawerContent } from './DrawerContent';
import { BonusesScreen } from '@/features/bonuses';
import { NewsScreen, NewsDetailScreen, HelpScreen, FranchiseScreen } from '@/features/content';
import { WalletScreen, DepositScreen, WithdrawScreen, TransactionsScreen, BalanceHistoryScreen } from '@/features/wallet';
import { BetHistoryScreen } from '@/features/history';
import { FavoritesScreen } from '@/features/favorites';
import { ResultsScreen } from '@/features/results/screens';
import { JobsScreen } from '@/features/jobs';
import { MessagesScreen } from '@/features/messages';
import { COLORS } from '@/shared/constants';
import type { DrawerParamList } from './types';

const Drawer = createDrawerNavigator<DrawerParamList>();

export const DrawerNavigator: React.FC = () => {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <DrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          backgroundColor: COLORS.background,
          width: 280,
        },
        drawerType: 'front',
        overlayColor: 'rgba(0,0,0,0.5)',
      }}
    >
      <Drawer.Screen name="MainTabs" component={MainTabNavigator} />
      <Drawer.Screen name="BetHistory" component={BetHistoryScreen} />
      <Drawer.Screen name="Results" component={ResultsScreen} />
      <Drawer.Screen name="Wallet" component={WalletScreen} />
      <Drawer.Screen name="Deposit" component={DepositScreen} />
      <Drawer.Screen name="Withdraw" component={WithdrawScreen} />
      <Drawer.Screen name="Transactions" component={TransactionsScreen} />
      <Drawer.Screen name="BalanceHistory" component={BalanceHistoryScreen} />
      <Drawer.Screen name="Bonuses" component={BonusesScreen} />
      <Drawer.Screen name="Favorites" component={FavoritesScreen} />
      <Drawer.Screen name="Messages" component={MessagesScreen} />
      <Drawer.Screen name="News" component={NewsScreen} />
      <Drawer.Screen name="NewsDetail" component={NewsDetailScreen} />
      <Drawer.Screen name="Jobs" component={JobsScreen} />
      <Drawer.Screen name="Franchise" component={FranchiseScreen} />
      <Drawer.Screen name="Help" component={HelpScreen} />
    </Drawer.Navigator>
  );
};
