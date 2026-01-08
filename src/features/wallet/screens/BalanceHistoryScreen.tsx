import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, FONT_SIZES } from '@/shared/constants';
import { useGetTransactionHistoryQuery, useGetWalletQuery } from '../api';
import { Loader } from '@/shared/components';
import type { Transaction } from '../types';

const TRANSACTION_TYPE_ICONS: Record<string, string> = {
  deposit: '↓',
  withdrawal: '↑',
  bet: '🎲',
  win: '🏆',
  bonus: '🎁',
  bonus_withdrawal: '💰',
  cashout: '💵',
};

export const BalanceHistoryScreen: React.FC = () => {
  const navigation = useNavigation();

  const {
    data: wallet,
    isLoading: loadingWallet,
  } = useGetWalletQuery();

  const {
    data: transactionsData,
    isLoading: loadingTransactions,
    isFetching,
    refetch,
  } = useGetTransactionHistoryQuery({ limit: 50 });

  // Calculate min/max for simple visualization
  const balanceStats = useMemo(() => {
    if (!transactionsData?.transactions?.length) {
      return { min: 0, max: 100, points: [] };
    }

    const transactions = [...transactionsData.transactions].reverse();
    const balances = transactions.map(t => t.balanceAfter);

    // Add current balance
    if (wallet) {
      balances.push(wallet.balance);
    }

    const min = Math.min(...balances);
    const max = Math.max(...balances);
    const range = max - min || 1;

    return {
      min,
      max,
      range,
      points: balances.map(b => ((b - min) / range) * 100),
    };
  }, [transactionsData, wallet]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getBalanceChange = (transaction: Transaction) => {
    const change = transaction.balanceAfter - transaction.balanceBefore;
    return change;
  };

  const renderTransaction = ({ item }: { item: Transaction }) => {
    const change = getBalanceChange(item);
    const isPositive = change >= 0;

    return (
      <View style={styles.transactionCard}>
        <View style={styles.transactionLeft}>
          <Text style={styles.transactionIcon}>
            {TRANSACTION_TYPE_ICONS[item.type] || '•'}
          </Text>
          <View style={styles.transactionInfo}>
            <Text style={styles.transactionType}>
              {item.type.replace('_', ' ').toUpperCase()}
            </Text>
            <Text style={styles.transactionDate}>{formatDate(item.createdAt)}</Text>
          </View>
        </View>
        <View style={styles.transactionRight}>
          <Text style={[
            styles.transactionChange,
            isPositive ? styles.positive : styles.negative,
          ]}>
            {isPositive ? '+' : ''}{change.toFixed(2)}
          </Text>
          <Text style={styles.transactionBalance}>
            Balance: {item.balanceAfter.toFixed(2)}
          </Text>
        </View>
      </View>
    );
  };

  // Simple text-based chart
  const renderChart = () => {
    if (balanceStats.points.length < 2) return null;

    const chartHeight = 80;
    const chartWidth = 100; // percentage
    const points = balanceStats.points.slice(-10); // Last 10 points

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Balance Trend</Text>
        <View style={styles.chart}>
          <View style={styles.chartYAxis}>
            <Text style={styles.chartLabel}>{balanceStats.max.toFixed(0)}</Text>
            <Text style={styles.chartLabel}>{balanceStats.min.toFixed(0)}</Text>
          </View>
          <View style={styles.chartBars}>
            {points.map((point, index) => (
              <View
                key={index}
                style={[
                  styles.chartBar,
                  {
                    height: `${Math.max(point, 5)}%`,
                    backgroundColor: index === points.length - 1
                      ? COLORS.primary
                      : COLORS.primaryAlpha10,
                  },
                ]}
              />
            ))}
          </View>
        </View>
      </View>
    );
  };

  const isLoading = loadingWallet || loadingTransactions;

  if (isLoading) {
    return <Loader text="Loading balance history..." />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>{'< Back'}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Balance History</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Current Balance */}
      <View style={styles.currentBalance}>
        <Text style={styles.currentBalanceLabel}>Current Balance</Text>
        <Text style={styles.currentBalanceValue}>
          {wallet?.currency || 'GHS'} {wallet?.balance.toFixed(2) || '0.00'}
        </Text>
        {wallet && wallet.bonusBalance > 0 && (
          <Text style={styles.bonusBalance}>
            + {wallet.bonusBalance.toFixed(2)} bonus
          </Text>
        )}
      </View>

      {/* Chart */}
      {renderChart()}

      {/* Transactions List */}
      <View style={styles.listHeader}>
        <Text style={styles.listHeaderText}>Recent Changes</Text>
      </View>

      <FlatList
        data={transactionsData?.transactions || []}
        keyExtractor={(item) => item.id}
        renderItem={renderTransaction}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isFetching && !isLoading}
            onRefresh={refetch}
            tintColor={COLORS.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateEmoji}>📊</Text>
            <Text style={styles.emptyStateText}>No transactions yet</Text>
            <Text style={styles.emptyStateSubtext}>
              Your balance history will appear here
            </Text>
          </View>
        }
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
  currentBalance: {
    padding: SPACING.lg,
    backgroundColor: COLORS.surface,
    marginHorizontal: SPACING.lg,
    borderRadius: 12,
    alignItems: 'center',
  },
  currentBalanceLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  currentBalanceValue: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  bonusBalance: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.success,
    marginTop: SPACING.xs,
  },
  chartContainer: {
    margin: SPACING.lg,
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
  },
  chartTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  chart: {
    flexDirection: 'row',
    height: 80,
  },
  chartYAxis: {
    width: 50,
    justifyContent: 'space-between',
    paddingRight: SPACING.sm,
  },
  chartLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    textAlign: 'right',
  },
  chartBars: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    gap: 4,
  },
  chartBar: {
    flex: 1,
    maxWidth: 20,
    borderRadius: 4,
    minHeight: 4,
  },
  listHeader: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  listHeaderText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  listContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
  },
  transactionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: 8,
    marginBottom: SPACING.sm,
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  transactionIcon: {
    fontSize: 24,
    marginRight: SPACING.md,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionType: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text,
  },
  transactionDate: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionChange: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
  },
  positive: {
    color: COLORS.success,
  },
  negative: {
    color: COLORS.error,
  },
  transactionBalance: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    marginTop: 2,
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
});
