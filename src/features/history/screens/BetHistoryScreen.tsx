import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { DrawerNavigationProp } from '@react-navigation/drawer';
import { COLORS, SPACING, FONT_SIZES } from '@/shared/constants';
import { useGetBetHistoryQuery } from '@/features/betslip/api/betsApi';
import { useOddsFormat } from '@/shared/hooks';
import { CashoutDialog } from '../components';
import type { Bet, BetStatus } from '@/features/betslip/types';
import type { DrawerParamList } from '@/navigation/types';

const STATUS_FILTERS: { label: string; value: BetStatus | undefined }[] = [
  { label: 'All', value: undefined },
  { label: 'Pending', value: 'pending' },
  { label: 'Won', value: 'won' },
  { label: 'Lost', value: 'lost' },
  { label: 'Cashout', value: 'cashout' },
];

const PAGE_SIZE = 20;

const getStatusColor = (status: BetStatus): string => {
  switch (status) {
    case 'won':
      return COLORS.success;
    case 'lost':
      return COLORS.error;
    case 'cashout':
      return COLORS.warning;
    case 'pending':
      return COLORS.primary;
    case 'cancelled':
    case 'returned':
      return COLORS.textMuted;
    default:
      return COLORS.textSecondary;
  }
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatCurrency = (amount: number): string => {
  return 'GHS ' + amount.toFixed(2);
};

export const BetHistoryScreen: React.FC = () => {
  const navigation = useNavigation<DrawerNavigationProp<DrawerParamList>>();
  const { formatOdds } = useOddsFormat();
  const [selectedStatus, setSelectedStatus] = useState<BetStatus | undefined>();
  const [page, setPage] = useState(0);
  const [cashoutBet, setCashoutBet] = useState<Bet | null>(null);
  const [isCashoutDialogVisible, setIsCashoutDialogVisible] = useState(false);

  const {
    data: betHistory,
    isLoading,
    isFetching,
    refetch,
  } = useGetBetHistoryQuery({
    status: selectedStatus,
    limit: PAGE_SIZE,
    offset: page * PAGE_SIZE,
  });

  const handleStatusFilter = useCallback((status: BetStatus | undefined) => {
    setSelectedStatus(status);
    setPage(0);
  }, []);

  const handleLoadMore = useCallback(() => {
    if (betHistory && betHistory.bets.length < betHistory.total && !isFetching) {
      setPage((prev) => prev + 1);
    }
  }, [betHistory, isFetching]);

  const handleOpenCashout = useCallback((bet: Bet) => {
    setCashoutBet(bet);
    setIsCashoutDialogVisible(true);
  }, []);

  const handleCloseCashout = useCallback(() => {
    setIsCashoutDialogVisible(false);
    setCashoutBet(null);
  }, []);

  const handleCashoutSuccess = useCallback(() => {
    refetch();
  }, [refetch]);

  const renderStatusFilter = useCallback(
    ({ label, value }: { label: string; value: BetStatus | undefined }) => (
      <TouchableOpacity
        key={label}
        style={[
          styles.filterChip,
          selectedStatus === value && styles.filterChipActive,
        ]}
        onPress={() => handleStatusFilter(value)}
      >
        <Text
          style={[
            styles.filterText,
            selectedStatus === value && styles.filterTextActive,
          ]}
        >
          {label}
        </Text>
      </TouchableOpacity>
    ),
    [selectedStatus, handleStatusFilter]
  );

  const renderBetItem = useCallback(({ item: bet }: { item: Bet }) => {
    const statusColor = getStatusColor(bet.status);
    const selectionCount = bet.selections.length;
    const firstSelection = bet.selections[0];

    return (
      <TouchableOpacity style={styles.betCard} activeOpacity={0.7}>
        <View style={styles.betHeader}>
          <View style={styles.betTypeContainer}>
            <Text style={styles.betType}>
              {bet.betType.charAt(0).toUpperCase() + bet.betType.slice(1)}
              {selectionCount > 1 && ' (' + selectionCount + ')'}
            </Text>
            {bet.bookingCode && (
              <Text style={styles.bookingCode}>#{bet.bookingCode}</Text>
            )}
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Text style={styles.statusText}>
              {bet.status.toUpperCase()}
            </Text>
          </View>
        </View>

        {firstSelection && (
          <View style={styles.selectionPreview}>
            <Text style={styles.matchText} numberOfLines={1}>
              {firstSelection.team1Name} vs {firstSelection.team2Name}
            </Text>
            <Text style={styles.marketText} numberOfLines={1}>
              {firstSelection.marketName}: {firstSelection.eventName}
            </Text>
            {selectionCount > 1 && (
              <Text style={styles.moreSelections}>
                +{selectionCount - 1} more selection{selectionCount > 2 ? 's' : ''}
              </Text>
            )}
          </View>
        )}

        <View style={styles.betFooter}>
          <View style={styles.betDetail}>
            <Text style={styles.detailLabel}>Stake</Text>
            <Text style={styles.detailValue}>{formatCurrency(bet.stake)}</Text>
          </View>
          <View style={styles.betDetail}>
            <Text style={styles.detailLabel}>Odds</Text>
            <Text style={styles.detailValue}>{formatOdds(bet.totalOdds)}</Text>
          </View>
          <View style={styles.betDetail}>
            <Text style={styles.detailLabel}>
              {bet.status === 'won' || bet.status === 'cashout' ? 'Payout' : 'Potential'}
            </Text>
            <Text style={[styles.detailValue, bet.status === 'won' && styles.winAmount]}>
              {formatCurrency(bet.payout || bet.potentialWin)}
            </Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.dateText}>{formatDate(bet.createdAt)}</Text>
          {bet.status === 'pending' && (
            <TouchableOpacity
              style={styles.cashoutButton}
              onPress={() => handleOpenCashout(bet)}
            >
              <Text style={styles.cashoutButtonText}>Cashout</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  }, [handleOpenCashout]);

  const renderEmpty = useCallback(() => {
    if (isLoading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No bets found</Text>
        <Text style={styles.emptySubtext}>
          {selectedStatus
            ? 'You have no ' + selectedStatus + ' bets'
            : 'Place your first bet to see it here'}
        </Text>
      </View>
    );
  }, [isLoading, selectedStatus]);

  const renderFooter = useCallback(() => {
    if (!isFetching || isLoading) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={COLORS.primary} />
      </View>
    );
  }, [isFetching, isLoading]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => navigation.openDrawer()}
        >
          <Text style={styles.menuIcon}>☰</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Bet History</Text>
      </View>

      <View style={styles.filtersContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={STATUS_FILTERS}
          keyExtractor={(item) => item.label}
          renderItem={({ item }) => renderStatusFilter(item)}
          contentContainerStyle={styles.filtersList}
        />
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={betHistory?.bets || []}
          renderItem={renderBetItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.betsList}
          refreshControl={
            <RefreshControl
              refreshing={isFetching && !isLoading}
              onRefresh={refetch}
              tintColor={COLORS.primary}
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={renderEmpty}
          ListFooterComponent={renderFooter}
        />
      )}

      <CashoutDialog
        visible={isCashoutDialogVisible}
        bet={cashoutBet}
        onClose={handleCloseCashout}
        onSuccess={handleCashoutSuccess}
      />
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
    padding: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  menuButton: {
    marginRight: SPACING.md,
  },
  menuIcon: {
    fontSize: 24,
    color: COLORS.text,
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  filtersContainer: {
    marginBottom: SPACING.sm,
  },
  filtersList: {
    paddingHorizontal: SPACING.lg,
  },
  filterChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    backgroundColor: COLORS.backgroundCard,
    marginRight: SPACING.sm,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
  },
  filterText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  filterTextActive: {
    color: COLORS.text,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  betsList: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
  },
  betCard: {
    backgroundColor: COLORS.backgroundCard,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  betHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  betTypeContainer: {
    flex: 1,
  },
  betType: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  bookingCode: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.text,
  },
  selectionPreview: {
    marginBottom: SPACING.sm,
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  matchText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    fontWeight: '500',
  },
  marketText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  moreSelections: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.primary,
    marginTop: 4,
  },
  betFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  betDetail: {
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
  },
  detailValue: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 2,
  },
  winAmount: {
    color: COLORS.success,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  dateText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
  },
  cashoutButton: {
    backgroundColor: COLORS.warning,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 16,
  },
  cashoutButtonText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.background,
  },
  emptyContainer: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
  },
  emptySubtext: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  footerLoader: {
    paddingVertical: SPACING.lg,
  },
});
