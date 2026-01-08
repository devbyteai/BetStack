import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { DrawerContentScrollView, DrawerContentComponentProps } from '@react-navigation/drawer';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { logout as logoutAction } from '@/features/auth/store';
import { useLogoutMutation } from '@/features/auth/api/authApi';
import { COLORS, SPACING, FONT_SIZES } from '@/shared/constants';
import type { DrawerParamList } from './types';

type DrawerRouteName = keyof DrawerParamList;

interface MenuItem {
  label: string;
  icon: string;
  route: DrawerRouteName;
}

const menuItems: MenuItem[] = [
  { label: 'Bet History', icon: '📜', route: 'BetHistory' },
  { label: 'Results', icon: '🏆', route: 'Results' },
  { label: 'Wallet', icon: '💰', route: 'Wallet' },
  { label: 'Transactions', icon: '💳', route: 'Transactions' },
  { label: 'Balance History', icon: '📊', route: 'BalanceHistory' },
  { label: 'Bonuses', icon: '🎁', route: 'Bonuses' },
  { label: 'Favorites', icon: '⭐', route: 'Favorites' },
  { label: 'Messages', icon: '📬', route: 'Messages' },
  { label: 'News', icon: '📰', route: 'News' },
  { label: 'Jobs', icon: '💼', route: 'Jobs' },
  { label: 'Franchise', icon: '🤝', route: 'Franchise' },
  { label: 'Help', icon: '❓', route: 'Help' },
];

export const DrawerContent: React.FC<DrawerContentComponentProps> = (props) => {
  const { user, wallet } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const [logout] = useLogoutMutation();
  const route = useRoute();

  const handleNavigation = (routeName: DrawerRouteName) => {
    props.navigation.navigate(routeName);
  };

  const handleDeposit = () => {
    props.navigation.navigate('Deposit');
  };

  const handleWithdraw = () => {
    props.navigation.navigate('Withdraw');
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout().unwrap();
            } catch {
              // Logout from local state even if server fails
              dispatch(logoutAction());
            }
          },
        },
      ]
    );
  };

  const isActiveRoute = (routeName: string) => {
    return route.name === routeName;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <DrawerContentScrollView {...props} contentContainerStyle={styles.scrollContent}>
        {/* User Header */}
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.firstName?.[0]?.toUpperCase() || user?.mobileNumber?.[0] || 'U'}
            </Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>
              {user?.firstName && user?.lastName
                ? `${user.firstName} ${user.lastName}`
                : user?.mobileNumber || 'User'}
            </Text>
            {wallet && (
              <Text style={styles.balance}>
                {wallet.currency} {wallet.balance.toFixed(2)}
              </Text>
            )}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.quickAction}
            onPress={handleDeposit}
            activeOpacity={0.7}
          >
            <Text style={styles.quickActionText}>Deposit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.quickAction, styles.quickActionOutline]}
            onPress={handleWithdraw}
            activeOpacity={0.7}
          >
            <Text style={styles.quickActionTextOutline}>Withdraw</Text>
          </TouchableOpacity>
        </View>

        {/* Menu Items */}
        <View style={styles.menu}>
          {menuItems.map((item) => {
            const isActive = isActiveRoute(item.route);
            return (
              <TouchableOpacity
                key={item.route}
                style={[styles.menuItem, isActive && styles.menuItemActive]}
                onPress={() => handleNavigation(item.route)}
                activeOpacity={0.7}
              >
                <Text style={styles.menuIcon}>{item.icon}</Text>
                <Text style={[styles.menuLabel, isActive && styles.menuLabelActive]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Logout Button */}
        <View style={styles.logoutSection}>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <Text style={styles.logoutIcon}>🚪</Text>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </DrawerContentScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.version}>Version 1.0.0</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingTop: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  userInfo: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  userName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  balance: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.success,
    marginTop: 2,
  },
  quickActions: {
    flexDirection: 'row',
    padding: SPACING.lg,
    gap: SPACING.sm,
  },
  quickAction: {
    flex: 1,
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
    alignItems: 'center',
  },
  quickActionOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  quickActionText: {
    color: COLORS.text,
    fontWeight: '600',
    fontSize: FONT_SIZES.sm,
  },
  quickActionTextOutline: {
    color: COLORS.primary,
    fontWeight: '600',
    fontSize: FONT_SIZES.sm,
  },
  menu: {
    paddingHorizontal: SPACING.md,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    borderRadius: 8,
  },
  menuItemActive: {
    backgroundColor: COLORS.primaryAlpha10,
  },
  menuIcon: {
    fontSize: 20,
    marginRight: SPACING.md,
  },
  menuLabel: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
  },
  menuLabelActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  logoutSection: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.lg,
    marginTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    borderRadius: 8,
  },
  logoutIcon: {
    fontSize: 20,
    marginRight: SPACING.md,
  },
  logoutText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.error,
    fontWeight: '500',
  },
  footer: {
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
  },
  version: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
});
