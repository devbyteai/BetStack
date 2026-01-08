import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, FONT_SIZES } from '@/shared/constants';
import { useInitiateDepositMutation, useGetWalletQuery } from '../api';
import { PAYMENT_PROVIDERS, PaymentProvider } from '../types';

export const DepositScreen: React.FC = () => {
  const navigation = useNavigation();
  const { data: wallet } = useGetWalletQuery();
  const [initiateDeposit, { isLoading }] = useInitiateDepositMutation();

  const [amount, setAmount] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<PaymentProvider | null>(null);

  const MIN_DEPOSIT = 5;
  const MAX_DEPOSIT = 10000;
  const quickAmounts = [10, 20, 50, 100, 200, 500];

  const handleQuickAmount = useCallback((value: number) => {
    setAmount(value.toString());
  }, []);

  const handleDeposit = useCallback(async () => {
    if (!selectedProvider) {
      Alert.alert('Error', 'Please select a payment provider');
      return;
    }

    const depositAmount = parseFloat(amount);
    if (isNaN(depositAmount) || depositAmount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    if (depositAmount < MIN_DEPOSIT) {
      Alert.alert('Error', `Minimum deposit amount is ${wallet?.currency || 'GHS'} ${MIN_DEPOSIT}`);
      return;
    }

    if (depositAmount > MAX_DEPOSIT) {
      Alert.alert('Error', `Maximum deposit amount is ${wallet?.currency || 'GHS'} ${MAX_DEPOSIT.toLocaleString()}`);
      return;
    }

    if (!phoneNumber || phoneNumber.length < 10) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return;
    }

    // Basic phone format validation (Ghana numbers)
    const phoneRegex = /^0[235][0-9]{8}$/;
    if (!phoneRegex.test(phoneNumber)) {
      Alert.alert('Error', 'Please enter a valid Ghana phone number (e.g., 0241234567)');
      return;
    }

    try {
      const result = await initiateDeposit({
        amount: depositAmount,
        paymentProvider: selectedProvider,
        phoneNumber,
      }).unwrap();

      Alert.alert('Deposit Initiated', result.message, [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error: unknown) {
      const err = error as { data?: { error?: string } };
      Alert.alert('Error', err.data?.error || 'Failed to initiate deposit');
    }
  }, [selectedProvider, amount, phoneNumber, initiateDeposit, navigation]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Deposit</Text>
            <View style={styles.placeholder} />
          </View>

          {/* Current Balance */}
          <View style={styles.balanceInfo}>
            <Text style={styles.balanceLabel}>Current Balance</Text>
            <Text style={styles.balanceValue}>
              {wallet?.currency || 'GHS'} {(wallet?.balance || 0).toFixed(2)}
            </Text>
          </View>

          {/* Amount Input */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Amount</Text>
            <View style={styles.amountInputContainer}>
              <Text style={styles.currencyPrefix}>{wallet?.currency || 'GHS'}</Text>
              <TextInput
                style={styles.amountInput}
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
                placeholder="0.00"
                placeholderTextColor={COLORS.textSecondary}
              />
            </View>
            <Text style={styles.amountHint}>
              Min: {wallet?.currency || 'GHS'} {MIN_DEPOSIT} | Max: {wallet?.currency || 'GHS'} {MAX_DEPOSIT.toLocaleString()}
            </Text>

            {/* Quick Amount Buttons */}
            <View style={styles.quickAmounts}>
              {quickAmounts.map((value) => (
                <TouchableOpacity
                  key={value}
                  style={[
                    styles.quickAmountButton,
                    amount === value.toString() && styles.quickAmountButtonActive,
                  ]}
                  onPress={() => handleQuickAmount(value)}
                >
                  <Text
                    style={[
                      styles.quickAmountText,
                      amount === value.toString() && styles.quickAmountTextActive,
                    ]}
                  >
                    {value}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Payment Provider Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment Method</Text>
            {PAYMENT_PROVIDERS.map((provider) => (
              <TouchableOpacity
                key={provider.id}
                style={[
                  styles.providerButton,
                  selectedProvider === provider.id && styles.providerButtonActive,
                ]}
                onPress={() => setSelectedProvider(provider.id)}
              >
                <View style={[styles.providerIcon, { backgroundColor: provider.color }]}>
                  <Text style={styles.providerIconText}>
                    {provider.name.charAt(0)}
                  </Text>
                </View>
                <Text style={styles.providerName}>{provider.name}</Text>
                {selectedProvider === provider.id && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Phone Number Input */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Phone Number</Text>
            <TextInput
              style={styles.phoneInput}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
              placeholder="Enter your mobile money number"
              placeholderTextColor={COLORS.textSecondary}
            />
          </View>
        </ScrollView>

        {/* Deposit Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.depositButton, isLoading && styles.depositButtonDisabled]}
            onPress={handleDeposit}
            disabled={isLoading}
          >
            <Text style={styles.depositButtonText}>
              {isLoading ? 'Processing...' : 'Deposit'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
  },
  backButton: {
    padding: SPACING.sm,
  },
  backButtonText: {
    fontSize: 24,
    color: COLORS.text,
  },
  headerTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  placeholder: {
    width: 40,
  },
  balanceInfo: {
    backgroundColor: COLORS.surface,
    margin: SPACING.md,
    padding: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  balanceValue: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 4,
  },
  section: {
    padding: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    paddingHorizontal: SPACING.md,
  },
  currencyPrefix: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.textSecondary,
    marginRight: SPACING.sm,
  },
  amountInput: {
    flex: 1,
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.text,
    paddingVertical: SPACING.md,
  },
  amountHint: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  quickAmounts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
  quickAmountButton: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: 8,
  },
  quickAmountButtonActive: {
    backgroundColor: COLORS.primary,
  },
  quickAmountText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    fontWeight: '600',
  },
  quickAmountTextActive: {
    color: COLORS.textOnPrimary,
  },
  providerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: 12,
    marginBottom: SPACING.sm,
  },
  providerButtonActive: {
    borderColor: COLORS.primary,
    borderWidth: 2,
  },
  providerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  providerIconText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: '#FFF',
  },
  providerName: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    marginLeft: SPACING.md,
  },
  checkmark: {
    fontSize: 20,
    color: COLORS.primary,
  },
  phoneInput: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
  },
  footer: {
    padding: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  depositButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  depositButtonDisabled: {
    opacity: 0.5,
  },
  depositButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.textOnPrimary,
  },
});
