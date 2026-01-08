import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, FONT_SIZES } from '@/shared/constants';
import { useGetSettingsQuery, useUpdateSettingsMutation, useDeleteAccountMutation } from '../api';
import { useLogoutMutation } from '@/features/auth/api';
import { Button, Loader } from '@/shared/components';
import { useTheme, THEME_OPTIONS } from '@/shared/context';
import { ODDS_FORMATS, AUTO_ACCEPT_OPTIONS } from '../types';
import type { OddsFormat, AutoAcceptOdds, UpdateSettingsRequest } from '../types';
import type { ThemeMode } from '@/shared/constants/themes';

export const SettingsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { themeMode, setTheme } = useTheme();
  const { data: settings, isLoading: isLoadingSettings } = useGetSettingsQuery();
  const [updateSettings, { isLoading: isUpdating }] = useUpdateSettingsMutation();
  const [deleteAccount, { isLoading: isDeleting }] = useDeleteAccountMutation();
  const [logout] = useLogoutMutation();

  const [formData, setFormData] = useState<UpdateSettingsRequest>({
    oddsFormat: 'decimal',
    autoAcceptOdds: 'none',
    notificationsEnabled: true,
    soundEnabled: true,
    animationsEnabled: true,
  });

  const [showOddsSelector, setShowOddsSelector] = useState(false);
  const [showAutoAcceptSelector, setShowAutoAcceptSelector] = useState(false);
  const [showThemeSelector, setShowThemeSelector] = useState(false);

  useEffect(() => {
    if (settings) {
      setFormData({
        oddsFormat: settings.oddsFormat,
        autoAcceptOdds: settings.autoAcceptOdds,
        notificationsEnabled: settings.notificationsEnabled,
        soundEnabled: settings.soundEnabled,
        animationsEnabled: settings.animationsEnabled,
      });
    }
  }, [settings]);

  const handleUpdate = async (updates: UpdateSettingsRequest) => {
    try {
      await updateSettings(updates).unwrap();
      setFormData((prev) => ({ ...prev, ...updates }));
    } catch (error: unknown) {
      const message = error && typeof error === 'object' && 'data' in error
        ? (error.data as { message?: string })?.message || 'Failed to update settings'
        : 'Failed to update settings';
      Alert.alert('Error', message);
    }
  };

  const handleDeleteAccount = () => {
    Alert.prompt(
      'Delete Account',
      'This action cannot be undone. Enter your password to confirm.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async (password?: string) => {
            if (!password) {
              Alert.alert('Error', 'Password is required');
              return;
            }
            try {
              await deleteAccount({ password }).unwrap();
              await logout().unwrap();
            } catch (error: unknown) {
              const message = error && typeof error === 'object' && 'data' in error
                ? (error.data as { message?: string })?.message || 'Failed to delete account'
                : 'Failed to delete account';
              Alert.alert('Error', message);
            }
          },
        },
      ],
      'secure-text'
    );
  };

  if (isLoadingSettings) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Loader />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>{'< Back'}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Betting Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Betting</Text>

          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => setShowOddsSelector(!showOddsSelector)}
          >
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Odds Format</Text>
              <Text style={styles.settingDescription}>
                How odds are displayed throughout the app
              </Text>
            </View>
            <Text style={styles.settingValue}>
              {ODDS_FORMATS.find((f) => f.id === formData.oddsFormat)?.name || formData.oddsFormat}
            </Text>
          </TouchableOpacity>

          {showOddsSelector && (
            <View style={styles.selectorContainer}>
              {ODDS_FORMATS.map((format) => (
                <TouchableOpacity
                  key={format.id}
                  style={[
                    styles.selectorOption,
                    formData.oddsFormat === format.id && styles.selectorOptionSelected,
                  ]}
                  onPress={() => {
                    handleUpdate({ oddsFormat: format.id as OddsFormat });
                    setShowOddsSelector(false);
                  }}
                >
                  <Text
                    style={[
                      styles.selectorOptionText,
                      formData.oddsFormat === format.id && styles.selectorOptionTextSelected,
                    ]}
                  >
                    {format.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => setShowAutoAcceptSelector(!showAutoAcceptSelector)}
          >
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Auto-Accept Odds Changes</Text>
              <Text style={styles.settingDescription}>
                Automatically accept odds changes when placing bets
              </Text>
            </View>
            <Text style={styles.settingValue}>
              {AUTO_ACCEPT_OPTIONS.find((o) => o.id === formData.autoAcceptOdds)?.name || formData.autoAcceptOdds}
            </Text>
          </TouchableOpacity>

          {showAutoAcceptSelector && (
            <View style={styles.selectorContainer}>
              {AUTO_ACCEPT_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.selectorOption,
                    formData.autoAcceptOdds === option.id && styles.selectorOptionSelected,
                  ]}
                  onPress={() => {
                    handleUpdate({ autoAcceptOdds: option.id as AutoAcceptOdds });
                    setShowAutoAcceptSelector(false);
                  }}
                >
                  <View>
                    <Text
                      style={[
                        styles.selectorOptionText,
                        formData.autoAcceptOdds === option.id && styles.selectorOptionTextSelected,
                      ]}
                    >
                      {option.name}
                    </Text>
                    <Text style={styles.selectorOptionDescription}>{option.description}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Appearance Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appearance</Text>

          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => setShowThemeSelector(!showThemeSelector)}
          >
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Theme</Text>
              <Text style={styles.settingDescription}>
                Choose light or dark mode
              </Text>
            </View>
            <Text style={styles.settingValue}>
              {THEME_OPTIONS.find((t) => t.id === themeMode)?.name || themeMode}
            </Text>
          </TouchableOpacity>

          {showThemeSelector && (
            <View style={styles.selectorContainer}>
              {THEME_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.selectorOption,
                    themeMode === option.id && styles.selectorOptionSelected,
                  ]}
                  onPress={() => {
                    setTheme(option.id as ThemeMode);
                    setShowThemeSelector(false);
                  }}
                >
                  <View>
                    <Text
                      style={[
                        styles.selectorOptionText,
                        themeMode === option.id && styles.selectorOptionTextSelected,
                      ]}
                    >
                      {option.name}
                    </Text>
                    <Text style={styles.selectorOptionDescription}>{option.description}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Notifications Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Push Notifications</Text>
              <Text style={styles.settingDescription}>
                Receive updates about your bets and promotions
              </Text>
            </View>
            <Switch
              value={formData.notificationsEnabled}
              onValueChange={(value) => handleUpdate({ notificationsEnabled: value })}
              trackColor={{ false: COLORS.backgroundInput, true: COLORS.primary }}
              thumbColor={COLORS.text}
              disabled={isUpdating}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Sound Effects</Text>
              <Text style={styles.settingDescription}>
                Play sounds for bet placement and wins
              </Text>
            </View>
            <Switch
              value={formData.soundEnabled}
              onValueChange={(value) => handleUpdate({ soundEnabled: value })}
              trackColor={{ false: COLORS.backgroundInput, true: COLORS.primary }}
              thumbColor={COLORS.text}
              disabled={isUpdating}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Animations</Text>
              <Text style={styles.settingDescription}>
                Show score change animations and visual effects
              </Text>
            </View>
            <Switch
              value={formData.animationsEnabled}
              onValueChange={(value) => handleUpdate({ animationsEnabled: value })}
              trackColor={{ false: COLORS.backgroundInput, true: COLORS.primary }}
              thumbColor={COLORS.text}
              disabled={isUpdating}
            />
          </View>
        </View>

        {/* Danger Zone */}
        <View style={[styles.section, styles.dangerSection]}>
          <Text style={[styles.sectionTitle, styles.dangerTitle]}>Danger Zone</Text>

          <Text style={styles.dangerDescription}>
            Deleting your account will permanently remove all your data, including bet history,
            transactions, and any remaining balance.
          </Text>

          <Button
            title="Delete Account"
            variant="danger"
            onPress={handleDeleteAccount}
            loading={isDeleting}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.lg,
  },
  backButton: {
    fontSize: FONT_SIZES.md,
    color: COLORS.primary,
  },
  title: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  placeholder: {
    width: 50,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: SPACING.lg,
    paddingTop: 0,
    paddingBottom: SPACING.xxl,
  },
  section: {
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
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  settingInfo: {
    flex: 1,
    marginRight: SPACING.md,
  },
  settingLabel: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
  },
  settingDescription: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  settingValue: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
  },
  selectorContainer: {
    paddingVertical: SPACING.sm,
  },
  selectorOption: {
    padding: SPACING.md,
    borderRadius: 8,
    marginBottom: SPACING.xs,
    backgroundColor: COLORS.backgroundInput,
  },
  selectorOptionSelected: {
    backgroundColor: COLORS.primary,
  },
  selectorOptionText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
  },
  selectorOptionTextSelected: {
    fontWeight: '600',
  },
  selectorOptionDescription: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  dangerSection: {
    borderWidth: 1,
    borderColor: COLORS.error + '50',
  },
  dangerTitle: {
    color: COLORS.error,
  },
  dangerDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
    lineHeight: 20,
  },
});
