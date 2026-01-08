import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { COLORS, SPACING, FONT_SIZES } from '@/shared/constants';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { useOddsFormat } from '@/shared/hooks';
import {
  closeQuickBetDialog,
  selectQuickBetSelection,
  selectIsQuickBetDialogOpen,
  selectQuickBetStake,
  setQuickBetStake,
} from '@/features/betslip/store';
import { usePlaceBetMutation } from '@/features/betslip/api/betsApi';
import { QUICK_BET_PRESETS } from '@/features/betslip/types';

export const QuickBetDialog: React.FC = () => {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector(selectIsQuickBetDialogOpen);
  const selection = useAppSelector(selectQuickBetSelection);
  const defaultStake = useAppSelector(selectQuickBetStake);

  const [stake, setStake] = useState(defaultStake.toString());
  const [placeBet, { isLoading: isPlacing }] = usePlaceBetMutation();
  const { formatOdds } = useOddsFormat();

  const stakeValue = useMemo(() => {
    const parsed = parseFloat(stake);
    return isNaN(parsed) ? 0 : parsed;
  }, [stake]);

  const potentialWin = useMemo(() => {
    if (!selection) return 0;
    return stakeValue * selection.odds;
  }, [stakeValue, selection]);

  const handlePresetPress = useCallback((preset: number) => {
    setStake(preset.toString());
    dispatch(setQuickBetStake(preset));
  }, [dispatch]);

  const handleStakeChange = useCallback((value: string) => {
    // Only allow numbers and decimals
    const cleaned = value.replace(/[^0-9.]/g, '');
    // Prevent multiple decimal points
    const parts = cleaned.split('.');
    if (parts.length > 2) return;
    setStake(cleaned);
  }, []);

  const handleClose = useCallback(() => {
    dispatch(closeQuickBetDialog());
    setStake(defaultStake.toString());
  }, [dispatch, defaultStake]);

  const handlePlaceBet = useCallback(async () => {
    if (!selection || stakeValue <= 0) return;

    try {
      await placeBet({
        betType: 'single',
        stake: stakeValue,
        selections: [{
          gameId: selection.gameId,
          marketId: selection.marketId,
          eventId: selection.eventId,
          odds: selection.odds,
          isLive: selection.isLive,
        }],
        acceptOddsChanges: 'any',
        source: 'main_balance',
      }).unwrap();

      Alert.alert(
        'Bet Placed',
        `Your bet of GHS ${stakeValue.toFixed(2)} has been placed successfully!`,
        [{ text: 'OK', onPress: handleClose }]
      );
    } catch (error: unknown) {
      const errorMessage = error instanceof Error
        ? error.message
        : (error as { data?: { message?: string } })?.data?.message || 'Failed to place bet';
      Alert.alert('Error', errorMessage);
    }
  }, [selection, stakeValue, placeBet, handleClose]);

  if (!isOpen || !selection) return null;

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Quick Bet</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Text style={styles.closeText}>X</Text>
            </TouchableOpacity>
          </View>

          {/* Selection Info */}
          <View style={styles.selectionInfo}>
            <Text style={styles.teams} numberOfLines={1}>
              {selection.team1Name} vs {selection.team2Name}
            </Text>
            <Text style={styles.market}>{selection.marketName}</Text>
            <View style={styles.oddsRow}>
              <Text style={styles.eventName}>{selection.eventName}</Text>
              <Text style={styles.odds}>{formatOdds(selection.odds)}</Text>
            </View>
          </View>

          {/* Preset Stakes */}
          <View style={styles.presetsContainer}>
            <Text style={styles.presetsLabel}>Quick Stakes (GHS)</Text>
            <View style={styles.presets}>
              {QUICK_BET_PRESETS.map((preset) => (
                <TouchableOpacity
                  key={preset}
                  style={[
                    styles.presetButton,
                    stakeValue === preset && styles.presetButtonActive,
                  ]}
                  onPress={() => handlePresetPress(preset)}
                >
                  <Text
                    style={[
                      styles.presetText,
                      stakeValue === preset && styles.presetTextActive,
                    ]}
                  >
                    {preset}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Custom Stake Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Stake (GHS)</Text>
            <TextInput
              style={styles.input}
              value={stake}
              onChangeText={handleStakeChange}
              keyboardType="decimal-pad"
              placeholder="Enter stake"
              placeholderTextColor={COLORS.textMuted}
            />
          </View>

          {/* Potential Win */}
          <View style={styles.potentialWinContainer}>
            <Text style={styles.potentialWinLabel}>Potential Win</Text>
            <Text style={styles.potentialWinValue}>
              GHS {potentialWin.toFixed(2)}
            </Text>
          </View>

          {/* Place Bet Button */}
          <TouchableOpacity
            style={[
              styles.placeBetButton,
              (isPlacing || stakeValue <= 0) && styles.placeBetButtonDisabled,
            ]}
            onPress={handlePlaceBet}
            disabled={isPlacing || stakeValue <= 0}
          >
            {isPlacing ? (
              <ActivityIndicator color={COLORS.text} />
            ) : (
              <Text style={styles.placeBetText}>
                Place Bet - GHS {stakeValue.toFixed(2)}
              </Text>
            )}
          </TouchableOpacity>
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
  container: {
    backgroundColor: COLORS.backgroundCard,
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    padding: SPACING.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
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
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    fontWeight: 'bold',
  },
  selectionInfo: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  teams: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  market: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  oddsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eventName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '500',
    color: COLORS.text,
  },
  odds: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  presetsContainer: {
    marginBottom: SPACING.md,
  },
  presetsLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  presets: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  presetButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    marginHorizontal: 2,
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  presetButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  presetText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  presetTextActive: {
    color: COLORS.text,
  },
  inputContainer: {
    marginBottom: SPACING.md,
  },
  inputLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
  },
  potentialWinContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  potentialWinLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  potentialWinValue: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.success,
  },
  placeBetButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: SPACING.md,
    alignItems: 'center',
  },
  placeBetButtonDisabled: {
    backgroundColor: COLORS.surface,
    opacity: 0.6,
  },
  placeBetText: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.text,
  },
});
