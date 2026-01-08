import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, FONT_SIZES } from '@/shared/constants';
import {
  useGetAvailableBonusesQuery,
  useGetActiveUserBonusesQuery,
  useGetFreeBetsQuery,
  useClaimBonusMutation,
  useWithdrawBonusMutation,
} from '../api';
import { Loader, Button } from '@/shared/components';
import {
  BONUS_TYPE_LABELS,
  BONUS_TYPE_COLORS,
  USER_BONUS_STATUS_LABELS,
} from '../types';
import type { Bonus, UserBonus, FreeBet } from '../types';

type TabType = 'available' | 'active' | 'freebets';

export const BonusesScreen: React.FC = () => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState<TabType>('available');

  const {
    data: availableBonuses,
    isLoading: loadingAvailable,
    isError: errorAvailable,
    refetch: refetchAvailable,
    isFetching: fetchingAvailable,
  } = useGetAvailableBonusesQuery();

  const {
    data: activeBonuses,
    isLoading: loadingActive,
    isError: errorActive,
    refetch: refetchActive,
    isFetching: fetchingActive,
  } = useGetActiveUserBonusesQuery();

  const {
    data: freeBetsData,
    isLoading: loadingFreeBets,
    isError: errorFreeBets,
    refetch: refetchFreeBets,
    isFetching: fetchingFreeBets,
  } = useGetFreeBetsQuery();

  const [claimBonus, { isLoading: isClaiming }] = useClaimBonusMutation();
  const [withdrawBonus, { isLoading: isWithdrawing }] = useWithdrawBonusMutation();

  const handleRefresh = () => {
    if (activeTab === 'available') refetchAvailable();
    else if (activeTab === 'active') refetchActive();
    else refetchFreeBets();
  };

  const handleClaimBonus = async (bonus: Bonus) => {
    Alert.alert(
      'Claim Bonus',
      `Are you sure you want to claim "${bonus.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Claim',
          onPress: async () => {
            try {
              await claimBonus(bonus.id).unwrap();
              Alert.alert('Success', 'Bonus claimed successfully!');
              refetchActive();
              refetchFreeBets();
            } catch (error: unknown) {
              const message = error && typeof error === 'object' && 'data' in error
                ? (error.data as { message?: string })?.message || 'Failed to claim bonus'
                : 'Failed to claim bonus';
              Alert.alert('Error', message);
            }
          },
        },
      ]
    );
  };

  const handleWithdrawBonus = async (userBonus: UserBonus) => {
    Alert.alert(
      'Withdraw Bonus',
      `Withdraw $${userBonus.amount.toFixed(2)} to your main balance?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Withdraw',
          onPress: async () => {
            try {
              const result = await withdrawBonus(userBonus.id).unwrap();
              Alert.alert(
                'Success',
                `$${result.amount.toFixed(2)} transferred to main balance!\nNew balance: $${result.newBalance.toFixed(2)}`
              );
              refetchActive();
            } catch (error: unknown) {
              const message = error && typeof error === 'object' && 'data' in error
                ? (error.data as { message?: string })?.message || 'Failed to withdraw bonus'
                : 'Failed to withdraw bonus';
              Alert.alert('Error', message);
            }
          },
        },
      ]
    );
  };

  const renderBonusCard = ({ item }: { item: Bonus }) => (
    <View style={styles.bonusCard}>
      <View style={[styles.bonusTypeBadge, { backgroundColor: BONUS_TYPE_COLORS[item.type] }]}>
        <Text style={styles.bonusTypeText}>{BONUS_TYPE_LABELS[item.type]}</Text>
      </View>

      <Text style={styles.bonusName}>{item.name}</Text>
      {item.description && (
        <Text style={styles.bonusDescription}>{item.description}</Text>
      )}

      <View style={styles.bonusDetails}>
        {item.amount && (
          <View style={styles.bonusDetailItem}>
            <Text style={styles.bonusDetailLabel}>Amount</Text>
            <Text style={styles.bonusDetailValue}>${item.amount}</Text>
          </View>
        )}
        {item.percentage && (
          <View style={styles.bonusDetailItem}>
            <Text style={styles.bonusDetailLabel}>Percentage</Text>
            <Text style={styles.bonusDetailValue}>{item.percentage}%</Text>
          </View>
        )}
        {item.minDeposit && (
          <View style={styles.bonusDetailItem}>
            <Text style={styles.bonusDetailLabel}>Min Deposit</Text>
            <Text style={styles.bonusDetailValue}>${item.minDeposit}</Text>
          </View>
        )}
        <View style={styles.bonusDetailItem}>
          <Text style={styles.bonusDetailLabel}>Wagering</Text>
          <Text style={styles.bonusDetailValue}>{item.wageringRequirement}x</Text>
        </View>
        <View style={styles.bonusDetailItem}>
          <Text style={styles.bonusDetailLabel}>Valid for</Text>
          <Text style={styles.bonusDetailValue}>{item.expiresDays} days</Text>
        </View>
      </View>

      <Button
        title="Claim Bonus"
        onPress={() => handleClaimBonus(item)}
        loading={isClaiming}
        fullWidth
      />
    </View>
  );

  const renderUserBonusCard = ({ item }: { item: UserBonus }) => {
    const progress = item.requiredWagering > 0
      ? (item.wageredAmount / item.requiredWagering) * 100
      : 100;

    return (
      <View style={styles.bonusCard}>
        <View style={styles.userBonusHeader}>
          <Text style={styles.bonusName}>{item.bonus?.name || 'Bonus'}</Text>
          <View style={[
            styles.statusBadge,
            item.status === 'active' && styles.statusActive,
            item.status === 'completed' && styles.statusCompleted,
            item.status === 'expired' && styles.statusExpired,
          ]}>
            <Text style={styles.statusText}>
              {USER_BONUS_STATUS_LABELS[item.status]}
            </Text>
          </View>
        </View>

        <View style={styles.bonusAmount}>
          <Text style={styles.amountLabel}>Bonus Amount</Text>
          <Text style={styles.amountValue}>${item.amount.toFixed(2)}</Text>
        </View>

        <View style={styles.wageringProgress}>
          <View style={styles.wageringHeader}>
            <Text style={styles.wageringLabel}>Wagering Progress</Text>
            <Text style={styles.wageringValue}>
              ${item.wageredAmount.toFixed(2)} / ${item.requiredWagering.toFixed(2)}
            </Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${Math.min(progress, 100)}%` }]} />
          </View>
          <Text style={styles.progressPercent}>{progress.toFixed(1)}%</Text>
        </View>

        {item.expiresAt && (
          <Text style={styles.expiresText}>
            Expires: {new Date(item.expiresAt).toLocaleDateString()}
          </Text>
        )}

        {item.status === 'completed' && item.amount > 0 && (
          <Button
            title="Withdraw to Main Balance"
            onPress={() => handleWithdrawBonus(item)}
            loading={isWithdrawing}
            fullWidth
            style={styles.withdrawButton}
          />
        )}
      </View>
    );
  };

  const renderFreeBetCard = ({ item }: { item: FreeBet }) => (
    <View style={styles.freeBetCard}>
      <View style={styles.freeBetHeader}>
        <Text style={styles.freeBetEmoji}>🎫</Text>
        <View style={styles.freeBetInfo}>
          <Text style={styles.freeBetAmount}>${item.amount.toFixed(2)} Free Bet</Text>
          <Text style={styles.freeBetOdds}>Min odds: {item.minOdds}</Text>
        </View>
      </View>
      {item.expiresAt && (
        <Text style={styles.freeBetExpires}>
          Expires: {new Date(item.expiresAt).toLocaleDateString()}
        </Text>
      )}
    </View>
  );

  const isLoading = loadingAvailable || loadingActive || loadingFreeBets;
  const isFetching = fetchingAvailable || fetchingActive || fetchingFreeBets;

  // Check for errors based on active tab
  const hasError = (activeTab === 'available' && errorAvailable) ||
    (activeTab === 'active' && errorActive) ||
    (activeTab === 'freebets' && errorFreeBets);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>{'< Back'}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Bonuses</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'available' && styles.tabActive]}
          onPress={() => setActiveTab('available')}
        >
          <Text style={[styles.tabText, activeTab === 'available' && styles.tabTextActive]}>
            Available
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'active' && styles.tabActive]}
          onPress={() => setActiveTab('active')}
        >
          <Text style={[styles.tabText, activeTab === 'active' && styles.tabTextActive]}>
            My Bonuses
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'freebets' && styles.tabActive]}
          onPress={() => setActiveTab('freebets')}
        >
          <Text style={[styles.tabText, activeTab === 'freebets' && styles.tabTextActive]}>
            Free Bets
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {isLoading ? (
        <Loader />
      ) : hasError ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorEmoji}>!</Text>
          <Text style={styles.errorText}>Failed to load bonuses</Text>
          <Button title="Retry" variant="primary" onPress={handleRefresh} />
        </View>
      ) : (
        <>
          {activeTab === 'available' && (
            <FlatList
              data={availableBonuses?.bonuses || []}
              renderItem={renderBonusCard}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
              refreshControl={
                <RefreshControl
                  refreshing={isFetching}
                  onRefresh={handleRefresh}
                  tintColor={COLORS.primary}
                />
              }
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateEmoji}>🎁</Text>
                  <Text style={styles.emptyStateText}>No bonuses available</Text>
                  <Text style={styles.emptyStateSubtext}>
                    Check back later for new promotions
                  </Text>
                </View>
              }
            />
          )}

          {activeTab === 'active' && (
            <FlatList
              data={activeBonuses || []}
              renderItem={renderUserBonusCard}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
              refreshControl={
                <RefreshControl
                  refreshing={isFetching}
                  onRefresh={handleRefresh}
                  tintColor={COLORS.primary}
                />
              }
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateEmoji}>📭</Text>
                  <Text style={styles.emptyStateText}>No active bonuses</Text>
                  <Text style={styles.emptyStateSubtext}>
                    Claim a bonus from the Available tab
                  </Text>
                </View>
              }
            />
          )}

          {activeTab === 'freebets' && (
            <FlatList
              data={freeBetsData?.freeBets || []}
              renderItem={renderFreeBetCard}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
              refreshControl={
                <RefreshControl
                  refreshing={isFetching}
                  onRefresh={handleRefresh}
                  tintColor={COLORS.primary}
                />
              }
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateEmoji}>🎫</Text>
                  <Text style={styles.emptyStateText}>No free bets</Text>
                  <Text style={styles.emptyStateSubtext}>
                    Free bets will appear here when available
                  </Text>
                </View>
              }
            />
          )}
        </>
      )}
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
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  tabTextActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  listContent: {
    padding: SPACING.lg,
    paddingTop: 0,
  },
  bonusCard: {
    backgroundColor: COLORS.backgroundCard,
    borderRadius: 12,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  bonusTypeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 4,
    marginBottom: SPACING.sm,
  },
  bonusTypeText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.text,
  },
  bonusName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  bonusDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  bonusDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  bonusDetailItem: {
    minWidth: '45%',
  },
  bonusDetailLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  bonusDetailValue: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  userBonusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 4,
    backgroundColor: COLORS.textMuted,
  },
  statusActive: {
    backgroundColor: COLORS.success,
  },
  statusCompleted: {
    backgroundColor: COLORS.primary,
  },
  statusExpired: {
    backgroundColor: COLORS.error,
  },
  statusText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.text,
  },
  bonusAmount: {
    marginBottom: SPACING.md,
  },
  amountLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  amountValue: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.secondary,
  },
  wageringProgress: {
    marginBottom: SPACING.md,
  },
  wageringHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  wageringLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  wageringValue: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
  },
  progressBar: {
    height: 8,
    backgroundColor: COLORS.backgroundLight,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  progressPercent: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    textAlign: 'right',
    marginTop: SPACING.xs,
  },
  expiresText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
  },
  withdrawButton: {
    marginTop: SPACING.md,
  },
  freeBetCard: {
    backgroundColor: COLORS.backgroundCard,
    borderRadius: 12,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  freeBetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  freeBetEmoji: {
    fontSize: 36,
    marginRight: SPACING.md,
  },
  freeBetInfo: {
    flex: 1,
  },
  freeBetAmount: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.secondary,
  },
  freeBetOdds: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  freeBetExpires: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    marginTop: SPACING.sm,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xxl,
  },
  emptyStateEmoji: {
    fontSize: 48,
    marginBottom: SPACING.md,
  },
  emptyStateText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  emptyStateSubtext: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  errorEmoji: {
    fontSize: 48,
    marginBottom: SPACING.md,
    color: COLORS.error,
    fontWeight: 'bold',
  },
  errorText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.error,
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
});
