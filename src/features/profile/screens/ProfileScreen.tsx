import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS, SPACING, FONT_SIZES } from '@/shared/constants';
import { useAppSelector } from '@/store/hooks';
import { useLogoutMutation } from '@/features/auth/api';
import { useGetProfileQuery, useGetSettingsQuery } from '../api';
import { Button, Loader } from '@/shared/components';

type ProfileStackParamList = {
  Profile: undefined;
  EditProfile: undefined;
  ChangePassword: undefined;
  Settings: undefined;
};

type NavigationProp = NativeStackNavigationProp<ProfileStackParamList, 'Profile'>;

export const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { wallet } = useAppSelector((state) => state.auth);
  const [logout, { isLoading: isLoggingOut }] = useLogoutMutation();

  const {
    data: profile,
    isLoading: isLoadingProfile,
    isError: isProfileError,
    refetch: refetchProfile,
  } = useGetProfileQuery();

  const {
    data: settings,
    isError: isSettingsError,
    refetch: refetchSettings,
  } = useGetSettingsQuery();

  const isError = isProfileError || isSettingsError;

  const [refreshing, setRefreshing] = React.useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchProfile(), refetchSettings()]);
    setRefreshing(false);
  };

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          try {
            await logout().unwrap();
          } catch {
            // Logout anyway on error
          }
        },
      },
    ]);
  };

  if (isLoadingProfile) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Loader />
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load profile</Text>
          <Button
            title="Retry"
            variant="primary"
            onPress={handleRefresh}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.primary}
          />
        }
      >
        {profile && (
          <View style={styles.userCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {profile.firstName?.[0] || profile.mobileNumber[0]}
              </Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>
                {profile.firstName && profile.lastName
                  ? `${profile.firstName} ${profile.lastName}`
                  : profile.nickname || profile.mobileNumber}
              </Text>
              <Text style={styles.userPhone}>
                {profile.dialingCode} {profile.mobileNumber}
              </Text>
              {profile.email && (
                <Text style={styles.userEmail}>{profile.email}</Text>
              )}
            </View>
            <View style={styles.kycBadge}>
              <Text style={[
                styles.kycText,
                profile.kycStatus === 'verified' && styles.kycVerified,
                profile.kycStatus === 'rejected' && styles.kycRejected,
              ]}>
                {profile.kycStatus.toUpperCase()}
              </Text>
            </View>
          </View>
        )}

        {wallet && (
          <View style={styles.walletCard}>
            <Text style={styles.walletLabel}>Balance</Text>
            <Text style={styles.walletBalance}>
              {wallet.currency} {wallet.balance.toFixed(2)}
            </Text>
            {wallet.bonusBalance > 0 && (
              <Text style={styles.bonusBalance}>
                Bonus: {wallet.currency} {wallet.bonusBalance.toFixed(2)}
              </Text>
            )}
          </View>
        )}

        {settings && (
          <View style={styles.settingsCard}>
            <Text style={styles.sectionTitle}>Current Settings</Text>
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Odds Format</Text>
              <Text style={styles.settingValue}>{settings.oddsFormat}</Text>
            </View>
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Auto-Accept Odds</Text>
              <Text style={styles.settingValue}>{settings.autoAcceptOdds}</Text>
            </View>
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Notifications</Text>
              <Text style={styles.settingValue}>
                {settings.notificationsEnabled ? 'On' : 'Off'}
              </Text>
            </View>
          </View>
        )}

        <View style={styles.menuSection}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('EditProfile')}
          >
            <Text style={styles.menuText}>Edit Profile</Text>
            <Text style={styles.menuArrow}>{'>'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('ChangePassword')}
          >
            <Text style={styles.menuText}>Change Password</Text>
            <Text style={styles.menuArrow}>{'>'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.menuItem, styles.menuItemLast]}
            onPress={() => navigation.navigate('Settings')}
          >
            <Text style={styles.menuText}>Settings</Text>
            <Text style={styles.menuArrow}>{'>'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.logoutSection}>
          <Button
            title="Logout"
            variant="danger"
            onPress={handleLogout}
            loading={isLoggingOut}
            fullWidth
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: SPACING.lg,
    paddingTop: 0,
  },
  userCard: {
    backgroundColor: COLORS.backgroundCard,
    borderRadius: 12,
    padding: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  userInfo: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  userName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
  },
  userPhone: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  userEmail: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  kycBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 4,
    backgroundColor: COLORS.warning + '30',
  },
  kycText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.warning,
  },
  kycVerified: {
    color: COLORS.success,
  },
  kycRejected: {
    color: COLORS.error,
  },
  walletCard: {
    backgroundColor: COLORS.backgroundCard,
    borderRadius: 12,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  walletLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  walletBalance: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: SPACING.xs,
  },
  bonusBalance: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.secondary,
    marginTop: SPACING.xs,
  },
  settingsCard: {
    backgroundColor: COLORS.backgroundCard,
    borderRadius: 12,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
  },
  settingLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  settingValue: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    textTransform: 'capitalize',
  },
  menuSection: {
    backgroundColor: COLORS.backgroundCard,
    borderRadius: 12,
    marginBottom: SPACING.lg,
  },
  menuItem: {
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
  },
  menuArrow: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
  logoutSection: {
    paddingBottom: SPACING.lg,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  errorText: {
    color: COLORS.error,
    fontSize: FONT_SIZES.md,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
});
