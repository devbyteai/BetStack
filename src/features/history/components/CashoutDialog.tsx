import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { COLORS, SPACING, FONT_SIZES } from '@/shared/constants';
import { useRequestCashoutMutation, useGetCashoutValueQuery } from '@/features/betslip/api/betsApi';
import type { Bet } from '@/features/betslip/types';

interface CashoutDialogProps {
  visible: boolean;
  bet: Bet | null;
  onClose: () => void;
  onSuccess?: () => void;
}

const formatCurrency = (amount: number): string => {
  return 'GHS ' + amount.toFixed(2);
};

export const CashoutDialog: React.FC<CashoutDialogProps> = ({
  visible,
  bet,
  onClose,
  onSuccess,
}) => {
  const [cashoutPercent, setCashoutPercent] = useState(100);
  const [requestCashout, { isLoading: isCashingOut }] = useRequestCashoutMutation();

  const { data: cashoutData, isLoading: isLoadingValue, refetch } = useGetCashoutValueQuery(
    bet?.id || '',
    { skip: !bet || !visible }
  );

  // Reset slider when dialog opens
  useEffect(() => {
    if (visible) {
      setCashoutPercent(100);
      if (bet) {
        refetch();
      }
    }
  }, [visible, bet, refetch]);

  const cashoutValue = cashoutData?.value || 0;
  const currentAmount = (cashoutValue * cashoutPercent) / 100;
  const isPartial = cashoutPercent < 100;

  const handleSliderChange = useCallback((value: number) => {
    // Round to nearest 5%
    const rounded = Math.round(value / 5) * 5;
    setCashoutPercent(Math.max(10, Math.min(100, rounded)));
  }, []);

  const handleFullCashout = useCallback(() => {
    setCashoutPercent(100);
  }, []);

  const handleCashout = useCallback(async () => {
    if (!bet) return;

    try {
      const result = await requestCashout({
        betId: bet.id,
        request: {
          type: isPartial ? 'partial' : 'full',
          amount: isPartial ? currentAmount : undefined,
        },
      }).unwrap();

      Alert.alert(
        'Cashout Successful',
        `${formatCurrency(result.amount)} has been added to your balance.`,
        [
          {
            text: 'OK',
            onPress: () => {
              onClose();
              onSuccess?.();
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert(
        'Cashout Failed',
        error instanceof Error ? error.message : 'Unable to process cashout. Please try again.',
        [{ text: 'OK' }]
      );
    }
  }, [bet, isPartial, currentAmount, requestCashout, onClose, onSuccess]);

  if (!bet) return null;

  const profitLoss = currentAmount - bet.stake;
  const profitLossPercent = ((currentAmount / bet.stake) - 1) * 100;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          <View style={styles.header}>
            <Text style={styles.title}>Cashout</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeIcon}>×</Text>
            </TouchableOpacity>
          </View>

          {isLoadingValue ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={styles.loadingText}>Loading cashout value...</Text>
            </View>
          ) : cashoutValue <= 0 ? (
            <View style={styles.unavailableContainer}>
              <Text style={styles.unavailableText}>Cashout not available</Text>
              <Text style={styles.unavailableSubtext}>
                This bet is not eligible for cashout at this time.
              </Text>
            </View>
          ) : (
            <>
              {/* Bet Info */}
              <View style={styles.betInfo}>
                <View style={styles.betInfoRow}>
                  <Text style={styles.infoLabel}>Original Stake</Text>
                  <Text style={styles.infoValue}>{formatCurrency(bet.stake)}</Text>
                </View>
                <View style={styles.betInfoRow}>
                  <Text style={styles.infoLabel}>Potential Win</Text>
                  <Text style={styles.infoValue}>{formatCurrency(bet.potentialWin)}</Text>
                </View>
                <View style={styles.betInfoRow}>
                  <Text style={styles.infoLabel}>Current Cashout</Text>
                  <Text style={[styles.infoValue, styles.cashoutValue]}>
                    {formatCurrency(cashoutValue)}
                  </Text>
                </View>
              </View>

              {/* Cashout Amount Display */}
              <View style={styles.amountContainer}>
                <Text style={styles.amountLabel}>
                  {isPartial ? 'Partial Cashout' : 'Full Cashout'}
                </Text>
                <Text style={styles.amountValue}>{formatCurrency(currentAmount)}</Text>
                <Text style={[
                  styles.profitLoss,
                  profitLoss >= 0 ? styles.profit : styles.loss
                ]}>
                  {profitLoss >= 0 ? '+' : ''}{formatCurrency(profitLoss)} ({profitLossPercent >= 0 ? '+' : ''}{profitLossPercent.toFixed(1)}%)
                </Text>
              </View>

              {/* Slider for partial cashout */}
              <View style={styles.sliderContainer}>
                <Text style={styles.sliderLabel}>Adjust cashout amount</Text>
                <Slider
                  style={styles.slider}
                  minimumValue={10}
                  maximumValue={100}
                  value={cashoutPercent}
                  onValueChange={handleSliderChange}
                  minimumTrackTintColor={COLORS.primary}
                  maximumTrackTintColor={COLORS.border}
                  thumbTintColor={COLORS.primary}
                  step={5}
                />
                <View style={styles.sliderLabels}>
                  <Text style={styles.sliderPercent}>10%</Text>
                  <Text style={styles.sliderPercentCurrent}>{cashoutPercent}%</Text>
                  <Text style={styles.sliderPercent}>100%</Text>
                </View>
              </View>

              {/* Quick Actions */}
              <View style={styles.quickActions}>
                <TouchableOpacity
                  style={[styles.quickButton, cashoutPercent === 100 && styles.quickButtonActive]}
                  onPress={handleFullCashout}
                >
                  <Text style={[styles.quickButtonText, cashoutPercent === 100 && styles.quickButtonTextActive]}>
                    Full (100%)
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.quickButton, cashoutPercent === 50 && styles.quickButtonActive]}
                  onPress={() => setCashoutPercent(50)}
                >
                  <Text style={[styles.quickButtonText, cashoutPercent === 50 && styles.quickButtonTextActive]}>
                    Half (50%)
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.quickButton, cashoutPercent === 25 && styles.quickButtonActive]}
                  onPress={() => setCashoutPercent(25)}
                >
                  <Text style={[styles.quickButtonText, cashoutPercent === 25 && styles.quickButtonTextActive]}>
                    Quarter (25%)
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Cashout Button */}
              <TouchableOpacity
                style={[styles.cashoutButton, isCashingOut && styles.cashoutButtonDisabled]}
                onPress={handleCashout}
                disabled={isCashingOut}
              >
                {isCashingOut ? (
                  <ActivityIndicator size="small" color={COLORS.text} />
                ) : (
                  <Text style={styles.cashoutButtonText}>
                    Cashout {formatCurrency(currentAmount)}
                  </Text>
                )}
              </TouchableOpacity>

              {/* Warning */}
              <Text style={styles.warning}>
                Cashout values may change. Confirm quickly to lock in this amount.
              </Text>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  dialog: {
    backgroundColor: COLORS.backgroundCard,
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.backgroundLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIcon: {
    fontSize: 24,
    color: COLORS.textMuted,
    lineHeight: 26,
  },
  loadingContainer: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.md,
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.sm,
  },
  unavailableContainer: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  unavailableText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
  },
  unavailableSubtext: {
    marginTop: SPACING.sm,
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.sm,
    textAlign: 'center',
  },
  betInfo: {
    padding: SPACING.lg,
    backgroundColor: COLORS.background,
  },
  betInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  infoLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  infoValue: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    fontWeight: '500',
  },
  cashoutValue: {
    color: COLORS.success,
    fontWeight: '700',
  },
  amountContainer: {
    padding: SPACING.lg,
    alignItems: 'center',
  },
  amountLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  amountValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.text,
    marginVertical: SPACING.xs,
  },
  profitLoss: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
  profit: {
    color: COLORS.success,
  },
  loss: {
    color: COLORS.error,
  },
  sliderContainer: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  sliderLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.xs,
  },
  sliderPercent: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
  },
  sliderPercentCurrent: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: '600',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
  },
  quickButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  quickButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  quickButtonText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  quickButtonTextActive: {
    color: COLORS.text,
  },
  cashoutButton: {
    backgroundColor: COLORS.success,
    marginHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  cashoutButtonDisabled: {
    opacity: 0.6,
  },
  cashoutButtonText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  warning: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    textAlign: 'center',
    padding: SPACING.lg,
    paddingTop: SPACING.md,
  },
});
