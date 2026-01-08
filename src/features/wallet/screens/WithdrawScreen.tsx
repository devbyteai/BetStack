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
import { useInitiateWithdrawalMutation, useGetWalletQuery } from '../api';
import { PAYMENT_PROVIDERS, PaymentProvider } from '../types';

export const WithdrawScreen: React.FC = () => {
  const navigation = useNavigation();
  const { data: wallet } = useGetWalletQuery();
  const [initiateWithdrawal, { isLoading }] = useInitiateWithdrawalMutation();

  const [amount, setAmount] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<PaymentProvider | null>(null);

  const MIN_WITHDRAWAL = 5;
  const MAX_WITHDRAWAL = 5000;

  const handleWithdraw = useCallback(async () => {
    if (!selectedProvider) {
      Alert.alert('Error', 'Please select a payment provider');
      return;
    }

    const withdrawAmount = parseFloat(amount);
    if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    if (withdrawAmount < MIN_WITHDRAWAL) {
      Alert.alert('Error', `Minimum withdrawal amount is ${wallet?.currency || 'GHS'} ${MIN_WITHDRAWAL}`);
      return;
    }

    if (withdrawAmount > MAX_WITHDRAWAL) {
      Alert.alert('Error', `Maximum withdrawal amount is ${wallet?.currency || 'GHS'} ${MAX_WITHDRAWAL.toLocaleString()}`);
      return;
    }

    if (withdrawAmount > (wallet?.balance || 0)) {
      Alert.alert('Error', 'Insufficient balance');
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

    if (!password) {
      Alert.alert('Error', 'Please enter your password');
      return;
    }

    try {
      const result = await initiateWithdrawal({
        amount: withdrawAmount,
        paymentProvider: selectedProvider,
        phoneNumber,
        password,
      }).unwrap();

      Alert.alert('Withdrawal Initiated', result.message, [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error: unknown) {
      const err = error as { data?: { error?: string } };
      Alert.alert('Error', err.data?.error || 'Failed to initiate withdrawal');
    }
  }, [selectedProvider, amount, phoneNumber, password, wallet, initiateWithdrawal, navigation]);

  const handleWithdrawAll = useCallback(() => {
    if (wallet?.balance) {
      setAmount(wallet.balance.toString());
    }
  }, [wallet]);

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
            <Text style={styles.headerTitle}>Withdraw</Text>
            <View style={styles.placeholder} />
          </View>

          {/* Available Balance */}
          <View style={styles.balanceInfo}>
            <Text style={styles.balanceLabel}>Available Balance</Text>
            <Text style={styles.balanceValue}>
              {wallet?.currency || 'GHS'} {(wallet?.balance || 0).toFixed(2)}
            </Text>
            <TouchableOpacity onPress={handleWithdrawAll} style={styles.withdrawAllButton}>
              <Text style={styles.withdrawAllText}>Withdraw All</Text>
            </TouchableOpacity>
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
            <Text style={styles.minWithdrawal}>
              Min: {wallet?.currency || 'GHS'} {MIN_WITHDRAWAL} | Max: {wallet?.currency || 'GHS'} {MAX_WITHDRAWAL.toLocaleString()}
            </Text>
          </View>

          {/* Payment Provider Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Withdraw To</Text>
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
              style={styles.input}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
              placeholder="Enter your mobile money number"
              placeholderTextColor={COLORS.textSecondary}
            />
          </View>

          {/* Password Input */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Confirm Password</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder="Enter your account password"
              placeholderTextColor={COLORS.textSecondary}
            />
          </View>
        </ScrollView>

        {/* Withdraw Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.withdrawButton, isLoading && styles.withdrawButtonDisabled]}
            onPress={handleWithdraw}
            disabled={isLoading}
          >
            <Text style={styles.withdrawButtonText}>
              {isLoading ? 'Processing...' : 'Withdraw'}
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
  withdrawAllButton: {
    marginTop: SPACING.sm,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
  },
  withdrawAllText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
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
  minWithdrawal: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
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
  input: {
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
  withdrawButton: {
    backgroundColor: COLORS.error,
    paddingVertical: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  withdrawButtonDisabled: {
    opacity: 0.5,
  },
  withdrawButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.text,
  },
});
