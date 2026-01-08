import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button, Input } from '@/shared/components';
import { COLORS, SPACING, FONT_SIZES } from '@/shared/constants';
import { useSendOtpMutation } from '../api/authApi';
import type { AuthStackParamList } from '@/navigation/types';

type NavigationProp = NativeStackNavigationProp<AuthStackParamList, 'ForgotPassword'>;

export const ForgotPasswordScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [mobileNumber, setMobileNumber] = useState('');
  const [error, setError] = useState<string | undefined>();

  const [sendOtp, { isLoading }] = useSendOtpMutation();

  const validate = () => {
    if (!mobileNumber) {
      setError('Mobile number is required');
      return false;
    }
    if (mobileNumber.length < 9) {
      setError('Mobile number must be at least 9 digits');
      return false;
    }
    setError(undefined);
    return true;
  };

  const handleSendOtp = async () => {
    if (!validate()) return;

    try {
      await sendOtp({
        mobileNumber,
        purpose: 'reset_password',
      }).unwrap();

      // Navigate to OTP verification
      navigation.navigate('VerifyOtp', {
        mobileNumber,
        purpose: 'reset_password',
      });
    } catch (err: unknown) {
      const error = err as { data?: { error?: { message?: string } } };
      Alert.alert(
        'Error',
        error.data?.error?.message || 'Failed to send verification code'
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.title}>Forgot Password</Text>
            <Text style={styles.subtitle}>
              Enter your mobile number and we'll send you a verification code to
              reset your password.
            </Text>
          </View>

          <View style={styles.form}>
            <Input
              label="Mobile Number"
              placeholder="Enter your mobile number"
              value={mobileNumber}
              onChangeText={(text) => {
                setMobileNumber(text);
                setError(undefined);
              }}
              keyboardType="phone-pad"
              error={error}
              autoCapitalize="none"
              autoFocus
            />

            <Button
              title="Send Verification Code"
              onPress={handleSendOtp}
              loading={isLoading}
              fullWidth
              style={styles.submitButton}
            />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Remember your password? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
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
  scrollContent: {
    flexGrow: 1,
    padding: SPACING.lg,
  },
  backButton: {
    marginBottom: SPACING.lg,
  },
  backText: {
    color: COLORS.primary,
    fontSize: FONT_SIZES.md,
  },
  header: {
    marginBottom: SPACING.xl,
  },
  title: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  form: {
    marginBottom: SPACING.xl,
  },
  submitButton: {
    marginTop: SPACING.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.md,
  },
  loginLink: {
    color: COLORS.primary,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
});
