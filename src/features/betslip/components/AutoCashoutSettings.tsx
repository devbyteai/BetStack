import React, { useCallback, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { COLORS, SPACING, FONT_SIZES } from '@/shared/constants';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  selectAutoCashoutEnabled,
  selectAutoCashoutValue,
  selectPotentialWin,
  setAutoCashoutEnabled,
  setAutoCashoutValue,
} from '../store';

interface AutoCashoutSettingsProps {
  stake: number;
}

export const AutoCashoutSettings: React.FC<AutoCashoutSettingsProps> = ({ stake }) => {
  const dispatch = useAppDispatch();
  const autoCashoutEnabled = useAppSelector(selectAutoCashoutEnabled);
  const autoCashoutValue = useAppSelector(selectAutoCashoutValue);
  const potentialWin = useAppSelector(selectPotentialWin);

  const [inputValue, setInputValue] = useState('');

  // Sync input with store value
  useEffect(() => {
    if (autoCashoutValue !== null) {
      setInputValue(autoCashoutValue.toString());
    } else {
      setInputValue('');
    }
  }, [autoCashoutValue]);

  const handleToggle = useCallback((value: boolean) => {
    dispatch(setAutoCashoutEnabled(value));
    if (value && !autoCashoutValue && potentialWin > 0) {
      // Set default to 80% of potential win
      const defaultValue = Math.round(potentialWin * 0.8 * 100) / 100;
      dispatch(setAutoCashoutValue(defaultValue));
    }
  }, [dispatch, autoCashoutValue, potentialWin]);

  const handleInputChange = useCallback((text: string) => {
    setInputValue(text);
    const numValue = parseFloat(text);
    if (!isNaN(numValue) && numValue > 0) {
      dispatch(setAutoCashoutValue(numValue));
    } else if (text === '') {
      dispatch(setAutoCashoutValue(null));
    }
  }, [dispatch]);

  const handlePreset = useCallback((percent: number) => {
    if (potentialWin > 0) {
      const value = Math.round(potentialWin * (percent / 100) * 100) / 100;
      dispatch(setAutoCashoutValue(value));
    }
  }, [dispatch, potentialWin]);

  // Calculate profit based on auto-cashout value
  const profit = autoCashoutValue !== null ? autoCashoutValue - stake : 0;
  const profitPercent = stake > 0 && autoCashoutValue !== null
    ? ((autoCashoutValue / stake) - 1) * 100
    : 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>Auto-Cashout</Text>
          <Text style={styles.subtitle}>Cash out automatically when value reaches target</Text>
        </View>
        <Switch
          value={autoCashoutEnabled}
          onValueChange={handleToggle}
          trackColor={{ false: COLORS.surface, true: COLORS.primary }}
          thumbColor={COLORS.text}
          ios_backgroundColor={COLORS.surface}
        />
      </View>

      {autoCashoutEnabled && (
        <View style={styles.settings}>
          <View style={styles.inputRow}>
            <Text style={styles.inputLabel}>Target Value</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.currencyPrefix}>GHS</Text>
              <TextInput
                style={styles.input}
                value={inputValue}
                onChangeText={handleInputChange}
                keyboardType="decimal-pad"
                placeholder="0.00"
                placeholderTextColor={COLORS.textMuted}
              />
            </View>
          </View>

          {/* Preset buttons */}
          <View style={styles.presets}>
            <TouchableOpacity
              style={styles.presetButton}
              onPress={() => handlePreset(50)}
            >
              <Text style={styles.presetText}>50%</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.presetButton}
              onPress={() => handlePreset(70)}
            >
              <Text style={styles.presetText}>70%</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.presetButton, styles.presetButtonActive]}
              onPress={() => handlePreset(80)}
            >
              <Text style={[styles.presetText, styles.presetTextActive]}>80%</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.presetButton}
              onPress={() => handlePreset(90)}
            >
              <Text style={styles.presetText}>90%</Text>
            </TouchableOpacity>
          </View>

          {/* Info display */}
          {autoCashoutValue !== null && autoCashoutValue > 0 && (
            <View style={styles.info}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Target Profit</Text>
                <Text style={[styles.infoValue, profit >= 0 ? styles.profit : styles.loss]}>
                  {profit >= 0 ? '+' : ''}{profit.toFixed(2)} GHS ({profitPercent >= 0 ? '+' : ''}{profitPercent.toFixed(0)}%)
                </Text>
              </View>
              <Text style={styles.hint}>
                Bet will auto-cashout when value reaches GHS {autoCashoutValue.toFixed(2)}
              </Text>
            </View>
          )}

          {/* Warning if target is higher than potential */}
          {autoCashoutValue !== null && autoCashoutValue > potentialWin && (
            <Text style={styles.warning}>
              Target exceeds potential win (GHS {potentialWin.toFixed(2)})
            </Text>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    marginBottom: SPACING.md,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
  },
  headerLeft: {
    flex: 1,
    marginRight: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  settings: {
    padding: SPACING.md,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: SPACING.sm,
  },
  inputLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 8,
    paddingHorizontal: SPACING.sm,
  },
  currencyPrefix: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    marginRight: SPACING.xs,
  },
  input: {
    width: 100,
    height: 40,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    textAlign: 'right',
  },
  presets: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
  presetButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.background,
    borderRadius: 6,
    alignItems: 'center',
  },
  presetButtonActive: {
    backgroundColor: COLORS.primary,
  },
  presetText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  presetTextActive: {
    color: COLORS.textOnPrimary,
  },
  info: {
    marginTop: SPACING.md,
    padding: SPACING.sm,
    backgroundColor: COLORS.background,
    borderRadius: 6,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  infoValue: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
  profit: {
    color: COLORS.success,
  },
  loss: {
    color: COLORS.error,
  },
  hint: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
  },
  warning: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.warning,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
});
