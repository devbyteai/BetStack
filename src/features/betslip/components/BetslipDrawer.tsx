import React, { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SPACING, FONT_SIZES } from '@/shared/constants';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  selectSelections,
  selectBetType,
  selectTotalStake,
  selectStakes,
  selectIsOpen,
  selectIsPlacing,
  selectError,
  selectTotalOdds,
  selectPotentialWin,
  selectHasSuspendedSelections,
  selectOddsAcceptance,
  selectAutoCashoutEnabled,
  selectAutoCashoutValue,
  removeSelection,
  clearSelections,
  setTotalStake,
  setSelectionStake,
  setBetType,
  setOddsAcceptance,
  closeBetslip,
  setIsPlacing,
  setError,
  setBookingCode,
  updateSelectionOdds,
  clearAutoCashout,
} from '../store';
import { AutoCashoutSettings } from './AutoCashoutSettings';
import { usePlaceBetMutation, useCreateBookingMutation } from '../api';
import { useGetWalletQuery } from '@/features/wallet/api';
import { useGetFreeBetsQuery } from '@/features/bonuses/api';
import { useLiveOdds, useOddsFormat } from '@/shared/hooks';
import type { BetType } from '../types';
import type { FreeBet } from '@/features/bonuses/types';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export const BetslipDrawer: React.FC = () => {
  const dispatch = useAppDispatch();
  const insets = useSafeAreaInsets();
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  const selections = useAppSelector(selectSelections);
  const betType = useAppSelector(selectBetType);
  const totalStake = useAppSelector(selectTotalStake);
  const stakes = useAppSelector(selectStakes);
  const isOpen = useAppSelector(selectIsOpen);
  const isPlacing = useAppSelector(selectIsPlacing);
  const error = useAppSelector(selectError);
  const totalOdds = useAppSelector(selectTotalOdds);
  const potentialWin = useAppSelector(selectPotentialWin);
  const hasSuspended = useAppSelector(selectHasSuspendedSelections);
  const oddsAcceptance = useAppSelector(selectOddsAcceptance);
  const autoCashoutEnabled = useAppSelector(selectAutoCashoutEnabled);
  const autoCashoutValue = useAppSelector(selectAutoCashoutValue);

  const [placeBet] = usePlaceBetMutation();
  const [createBooking] = useCreateBookingMutation();
  const { data: wallet } = useGetWalletQuery();
  const { data: freeBetsData } = useGetFreeBetsQuery();
  const { formatOdds } = useOddsFormat();

  // Selected free bet for placing bet
  const [selectedFreeBet, setSelectedFreeBet] = useState<FreeBet | null>(null);

  // Subscribe to live odds updates for all selections
  const { oddsUpdates } = useLiveOdds({
    onUpdate: useCallback((update) => {
      // Update selection odds in real-time
      dispatch(updateSelectionOdds({
        eventId: update.eventId,
        odds: update.price,
        isSuspended: false,
      }));
    }, [dispatch]),
  });

  // Check for odds changes on betslip selections
  useEffect(() => {
    selections.forEach((selection) => {
      const liveUpdate = oddsUpdates.get(selection.eventId);
      if (liveUpdate && liveUpdate.price !== selection.odds) {
        dispatch(updateSelectionOdds({
          eventId: selection.eventId,
          odds: liveUpdate.price,
        }));
      }
    });
  }, [oddsUpdates, selections, dispatch]);

  // Animate drawer
  React.useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: isOpen ? 0 : SCREEN_HEIGHT,
      useNativeDriver: true,
      damping: 20,
      stiffness: 90,
    }).start();
  }, [isOpen, slideAnim]);

  const handleRemoveSelection = useCallback(
    (eventId: string) => {
      dispatch(removeSelection(eventId));
    },
    [dispatch]
  );

  const handleClearAll = useCallback(() => {
    Alert.alert('Clear Betslip', 'Remove all selections?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: () => dispatch(clearSelections()),
      },
    ]);
  }, [dispatch]);

  const handleStakeChange = useCallback(
    (eventId: string, value: string) => {
      const numValue = parseFloat(value) || 0;
      dispatch(setSelectionStake({ eventId, stake: numValue }));
    },
    [dispatch]
  );

  const handleTotalStakeChange = useCallback(
    (value: string) => {
      const numValue = parseFloat(value) || 0;
      dispatch(setTotalStake(numValue));
    },
    [dispatch]
  );

  const handleBetTypeChange = useCallback(
    (type: BetType) => {
      dispatch(setBetType(type));
    },
    [dispatch]
  );

  const handlePlaceBet = useCallback(async () => {
    if (hasSuspended) {
      Alert.alert('Error', 'Please remove suspended selections');
      return;
    }

    // When using free bet, use free bet amount as stake
    const stake = selectedFreeBet
      ? selectedFreeBet.amount
      : betType === 'single'
        ? Object.values(stakes).reduce((sum, s) => sum + s, 0)
        : totalStake;

    if (stake <= 0) {
      dispatch(setError('Please enter a stake'));
      return;
    }

    // Validate free bet minimum odds requirement
    if (selectedFreeBet && totalOdds < selectedFreeBet.minOdds) {
      dispatch(setError(`Free bet requires minimum odds of ${selectedFreeBet.minOdds}`));
      return;
    }

    dispatch(setIsPlacing(true));
    dispatch(setError(null));

    try {
      const result = await placeBet({
        betType,
        stake,
        selections: selections.map((s) => ({
          gameId: s.gameId,
          marketId: s.marketId,
          eventId: s.eventId,
          odds: s.odds,
          isLive: s.isLive,
        })),
        acceptOddsChanges: oddsAcceptance,
        freeBetId: selectedFreeBet?.id,
        autoCashoutValue: autoCashoutEnabled && autoCashoutValue ? autoCashoutValue : undefined,
      }).unwrap();

      dispatch(setBookingCode(result.bookingCode));
      dispatch(clearSelections());
      dispatch(clearAutoCashout());
      dispatch(closeBetslip());
      setSelectedFreeBet(null); // Clear selected free bet

      Alert.alert(
        'Bet Placed!',
        `Booking Code: ${result.bookingCode}\nPotential Win: ${result.bet.potentialWin.toFixed(2)}`
      );
    } catch (err: unknown) {
      const error = err as { data?: { error?: string } };
      dispatch(setError(error.data?.error || 'Failed to place bet'));
    } finally {
      dispatch(setIsPlacing(false));
    }
  }, [dispatch, placeBet, selections, betType, stakes, totalStake, totalOdds, hasSuspended, oddsAcceptance, selectedFreeBet, autoCashoutEnabled, autoCashoutValue]);

  const handleCreateBooking = useCallback(async () => {
    try {
      const result = await createBooking({
        selections: selections.map((s) => ({
          gameId: s.gameId,
          marketId: s.marketId,
          eventId: s.eventId,
          odds: s.odds,
          isLive: s.isLive,
        })),
      }).unwrap();

      Alert.alert('Booking Created', `Code: ${result.bookingCode}`, [
        { text: 'OK' },
      ]);
    } catch (err) {
      Alert.alert('Error', 'Failed to create booking');
    }
  }, [createBooking, selections]);

  const quickStakes = [5, 10, 20, 50, 100];

  if (selections.length === 0 && !isOpen) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
          paddingBottom: insets.bottom,
        },
      ]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>Betslip</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{selections.length}</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity onPress={handleCreateBooking} style={styles.bookButton}>
              <Text style={styles.bookButtonText}>Book</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleClearAll} style={styles.clearButton}>
              <Text style={styles.clearButtonText}>Clear</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => dispatch(closeBetslip())} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bet Type Tabs */}
        {selections.length > 1 && (
          <View style={styles.betTypeTabs}>
            <TouchableOpacity
              style={[styles.betTypeTab, betType === 'single' && styles.betTypeTabActive]}
              onPress={() => handleBetTypeChange('single')}
            >
              <Text
                style={[styles.betTypeText, betType === 'single' && styles.betTypeTextActive]}
              >
                Singles
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.betTypeTab, betType === 'multiple' && styles.betTypeTabActive]}
              onPress={() => handleBetTypeChange('multiple')}
            >
              <Text
                style={[styles.betTypeText, betType === 'multiple' && styles.betTypeTextActive]}
              >
                Multiple
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Selections List */}
        <ScrollView style={styles.selectionsList} showsVerticalScrollIndicator={false}>
          {selections.map((selection) => (
            <View
              key={selection.eventId}
              style={[styles.selectionItem, selection.isSuspended && styles.selectionSuspended]}
            >
              <View style={styles.selectionInfo}>
                <Text style={styles.selectionTeams} numberOfLines={1}>
                  {selection.team1Name} vs {selection.team2Name}
                </Text>
                <Text style={styles.selectionMarket} numberOfLines={1}>
                  {selection.marketName}: {selection.eventName}
                </Text>
                {selection.isSuspended && (
                  <Text style={styles.suspendedLabel}>SUSPENDED</Text>
                )}
              </View>
              <View style={styles.selectionRight}>
                <Text
                  style={[
                    styles.selectionOdds,
                    selection.odds !== selection.initialOdds &&
                      (selection.odds > selection.initialOdds
                        ? styles.oddsUp
                        : styles.oddsDown),
                  ]}
                >
                  {formatOdds(selection.odds)}
                </Text>
                <TouchableOpacity
                  onPress={() => handleRemoveSelection(selection.eventId)}
                  style={styles.removeButton}
                >
                  <Text style={styles.removeButtonText}>×</Text>
                </TouchableOpacity>
              </View>

              {/* Stake input for singles */}
              {betType === 'single' && (
                <View style={styles.stakeRow}>
                  <TextInput
                    style={styles.stakeInput}
                    value={stakes[selection.eventId]?.toString() || ''}
                    onChangeText={(v) => handleStakeChange(selection.eventId, v)}
                    keyboardType="decimal-pad"
                    placeholder="Stake"
                    placeholderTextColor={COLORS.textSecondary}
                  />
                  <Text style={styles.potentialWinText}>
                    Win: {(stakes[selection.eventId] || 0) * selection.odds > 0
                      ? ((stakes[selection.eventId] || 0) * selection.odds).toFixed(2)
                      : '0.00'}
                  </Text>
                </View>
              )}
            </View>
          ))}
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          {/* Free Bets Section */}
          {freeBetsData?.freeBets && freeBetsData.freeBets.length > 0 && (
            <View style={styles.freeBetSection}>
              <Text style={styles.freeBetSectionTitle}>Use Free Bet</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.freeBetOptions}>
                  {/* None option */}
                  <TouchableOpacity
                    style={[
                      styles.freeBetOption,
                      !selectedFreeBet && styles.freeBetOptionSelected,
                    ]}
                    onPress={() => setSelectedFreeBet(null)}
                  >
                    <Text style={[
                      styles.freeBetOptionText,
                      !selectedFreeBet && styles.freeBetOptionTextSelected,
                    ]}>
                      None
                    </Text>
                  </TouchableOpacity>
                  {/* Available free bets */}
                  {freeBetsData.freeBets.map((fb) => (
                    <TouchableOpacity
                      key={fb.id}
                      style={[
                        styles.freeBetOption,
                        selectedFreeBet?.id === fb.id && styles.freeBetOptionSelected,
                        totalOdds < fb.minOdds && styles.freeBetOptionDisabled,
                      ]}
                      onPress={() => totalOdds >= fb.minOdds && setSelectedFreeBet(fb)}
                      disabled={totalOdds < fb.minOdds}
                    >
                      <Text style={[
                        styles.freeBetOptionText,
                        selectedFreeBet?.id === fb.id && styles.freeBetOptionTextSelected,
                        totalOdds < fb.minOdds && styles.freeBetOptionTextDisabled,
                      ]}>
                        ${fb.amount.toFixed(0)}
                      </Text>
                      <Text style={[
                        styles.freeBetMinOdds,
                        totalOdds < fb.minOdds && styles.freeBetMinOddsWarning,
                      ]}>
                        min {fb.minOdds}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
          )}

          {/* Quick Stakes - hidden when using free bet */}
          {!selectedFreeBet && (
          <View style={styles.quickStakes}>
            {quickStakes.map((amount) => (
              <TouchableOpacity
                key={amount}
                style={styles.quickStakeButton}
                onPress={() =>
                  betType === 'single'
                    ? selections.forEach((s) =>
                        handleStakeChange(s.eventId, amount.toString())
                      )
                    : handleTotalStakeChange(amount.toString())
                }
              >
                <Text style={styles.quickStakeText}>{amount}</Text>
              </TouchableOpacity>
            ))}
          </View>
          )}

          {/* Total Stake for Multiples - hidden when using free bet */}
          {betType === 'multiple' && !selectedFreeBet && (
            <View style={styles.totalStakeRow}>
              <Text style={styles.totalStakeLabel}>Total Stake</Text>
              <TextInput
                style={styles.totalStakeInput}
                value={totalStake.toString()}
                onChangeText={handleTotalStakeChange}
                keyboardType="decimal-pad"
                placeholder="0.00"
                placeholderTextColor={COLORS.textSecondary}
              />
            </View>
          )}

          {/* Summary */}
          <View style={styles.summary}>
            {/* Balance display */}
            {wallet && !selectedFreeBet && (
              <View style={styles.balanceRow}>
                <Text style={styles.balanceLabel}>Balance</Text>
                <Text style={styles.balanceValue}>
                  {wallet.balance.toFixed(2)} {wallet.currency}
                </Text>
              </View>
            )}
            {/* Free bet selected indicator */}
            {selectedFreeBet && (
              <View style={styles.freeBetActiveRow}>
                <Text style={styles.freeBetActiveLabel}>Using Free Bet</Text>
                <Text style={styles.freeBetActiveValue}>
                  ${selectedFreeBet.amount.toFixed(2)}
                </Text>
              </View>
            )}
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Odds</Text>
              <Text style={styles.summaryValue}>{formatOdds(totalOdds)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Potential Win</Text>
              <Text style={styles.summaryValueHighlight}>
                {selectedFreeBet
                  ? (selectedFreeBet.amount * totalOdds).toFixed(2)
                  : potentialWin.toFixed(2)}
              </Text>
            </View>
            {/* Insufficient balance warning - only when not using free bet */}
            {!selectedFreeBet && wallet && (betType === 'single'
              ? Object.values(stakes).reduce((sum, s) => sum + s, 0)
              : totalStake) > wallet.balance && (
              <Text style={styles.insufficientBalance}>
                Insufficient balance. Please deposit more funds.
              </Text>
            )}
          </View>

          {/* Auto-Cashout Settings */}
          {betType === 'multiple' && selections.length > 1 && (
            <AutoCashoutSettings
              stake={selectedFreeBet ? selectedFreeBet.amount : totalStake}
            />
          )}

          {/* Error */}
          {error && <Text style={styles.errorText}>{error}</Text>}

          {/* Place Bet Button */}
          <TouchableOpacity
            style={[
              styles.placeBetButton,
              selectedFreeBet && styles.placeBetButtonFreeBet,
              (isPlacing || hasSuspended) && styles.placeBetButtonDisabled,
            ]}
            onPress={handlePlaceBet}
            disabled={isPlacing || hasSuspended}
          >
            <Text style={styles.placeBetButtonText}>
              {isPlacing
                ? 'Placing...'
                : selectedFreeBet
                  ? `Use Free Bet ($${selectedFreeBet.amount.toFixed(0)})`
                  : 'Place Bet'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    maxHeight: SCREEN_HEIGHT * 0.85,
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  badge: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: SPACING.sm,
  },
  badgeText: {
    color: COLORS.textOnPrimary,
    fontSize: FONT_SIZES.sm,
    fontWeight: 'bold',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bookButton: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  bookButtonText: {
    color: COLORS.primary,
    fontSize: FONT_SIZES.sm,
  },
  clearButton: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  clearButtonText: {
    color: COLORS.error,
    fontSize: FONT_SIZES.sm,
  },
  closeButton: {
    padding: SPACING.xs,
    marginLeft: SPACING.sm,
  },
  closeButtonText: {
    fontSize: 24,
    color: COLORS.textSecondary,
  },
  betTypeTabs: {
    flexDirection: 'row',
    padding: SPACING.sm,
    gap: SPACING.sm,
  },
  betTypeTab: {
    flex: 1,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: COLORS.surface,
  },
  betTypeTabActive: {
    backgroundColor: COLORS.primary,
  },
  betTypeText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  betTypeTextActive: {
    color: COLORS.textOnPrimary,
  },
  selectionsList: {
    flex: 1,
    padding: SPACING.sm,
  },
  selectionItem: {
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    padding: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  selectionSuspended: {
    opacity: 0.6,
    borderColor: COLORS.error,
    borderWidth: 1,
  },
  selectionInfo: {
    flex: 1,
  },
  selectionTeams: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    fontWeight: '600',
  },
  selectionMarket: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  suspendedLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.error,
    fontWeight: 'bold',
    marginTop: 4,
  },
  selectionRight: {
    position: 'absolute',
    right: SPACING.sm,
    top: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectionOdds: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  oddsUp: {
    color: COLORS.success,
  },
  oddsDown: {
    color: COLORS.error,
  },
  removeButton: {
    marginLeft: SPACING.sm,
    padding: 4,
  },
  removeButtonText: {
    fontSize: 18,
    color: COLORS.textSecondary,
  },
  stakeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.sm,
    gap: SPACING.sm,
  },
  stakeInput: {
    flex: 1,
    height: 36,
    backgroundColor: COLORS.background,
    borderRadius: 6,
    paddingHorizontal: SPACING.sm,
    color: COLORS.text,
    fontSize: FONT_SIZES.sm,
  },
  potentialWinText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.success,
    fontWeight: '600',
  },
  footer: {
    padding: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  quickStakes: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  quickStakeButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderRadius: 6,
    alignItems: 'center',
  },
  quickStakeText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    fontWeight: '600',
  },
  totalStakeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  totalStakeLabel: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  totalStakeInput: {
    width: 120,
    height: 40,
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    paddingHorizontal: SPACING.md,
    color: COLORS.text,
    fontSize: FONT_SIZES.md,
    textAlign: 'right',
  },
  summary: {
    marginBottom: SPACING.md,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  balanceLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  balanceValue: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  summaryLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  summaryValue: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    fontWeight: '600',
  },
  summaryValueHighlight: {
    fontSize: FONT_SIZES.md,
    color: COLORS.success,
    fontWeight: 'bold',
  },
  insufficientBalance: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.warning,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  errorText: {
    color: COLORS.error,
    fontSize: FONT_SIZES.sm,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  placeBetButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  placeBetButtonDisabled: {
    opacity: 0.5,
  },
  placeBetButtonFreeBet: {
    backgroundColor: COLORS.success,
  },
  placeBetButtonText: {
    color: COLORS.textOnPrimary,
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
  },
  // Free bet section styles
  freeBetSection: {
    marginBottom: SPACING.md,
  },
  freeBetSectionTitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  freeBetOptions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  freeBetOption: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 70,
  },
  freeBetOptionSelected: {
    backgroundColor: COLORS.success,
  },
  freeBetOptionDisabled: {
    opacity: 0.5,
  },
  freeBetOptionText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    fontWeight: '600',
  },
  freeBetOptionTextSelected: {
    color: COLORS.textOnPrimary,
  },
  freeBetOptionTextDisabled: {
    color: COLORS.textMuted,
  },
  freeBetMinOdds: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  freeBetMinOddsWarning: {
    color: COLORS.warning,
  },
  freeBetActiveRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.success,
  },
  freeBetActiveLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.success,
    fontWeight: '600',
  },
  freeBetActiveValue: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.success,
    fontWeight: 'bold',
  },
});
