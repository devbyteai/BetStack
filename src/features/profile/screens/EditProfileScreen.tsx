import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, FONT_SIZES } from '@/shared/constants';
import { useGetProfileQuery, useUpdateProfileMutation } from '../api';
import { Button, Loader } from '@/shared/components';
import { GENDERS } from '../types';
import type { UpdateProfileRequest } from '../types';

export const EditProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const { data: profile, isLoading: isLoadingProfile } = useGetProfileQuery();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();

  const [formData, setFormData] = useState<UpdateProfileRequest>({
    email: '',
    nickname: '',
    firstName: '',
    lastName: '',
    gender: '',
    birthDate: '',
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        email: profile.email || '',
        nickname: profile.nickname || '',
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        gender: profile.gender || '',
        birthDate: profile.birthDate || '',
      });
    }
  }, [profile]);

  const handleChange = (field: keyof UpdateProfileRequest, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear validation error when user types
    if (validationErrors[field]) {
      setValidationErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const [validationErrors, setValidationErrors] = useState<Record<string, string | undefined>>({});

  // Validation helpers
  const validateEmail = (email: string): string | undefined => {
    if (!email) return undefined; // Optional field
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address';
    }
    return undefined;
  };

  const validateBirthDate = (date: string): string | undefined => {
    if (!date) return undefined; // Optional field
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return 'Please use YYYY-MM-DD format';
    }
    // Check if it's a valid date
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      return 'Please enter a valid date';
    }
    // Check if date is not in the future
    if (parsedDate > new Date()) {
      return 'Birth date cannot be in the future';
    }
    // Check minimum age (e.g., 18 years)
    const minAge = 18;
    const minDate = new Date();
    minDate.setFullYear(minDate.getFullYear() - minAge);
    if (parsedDate > minDate) {
      return `You must be at least ${minAge} years old`;
    }
    return undefined;
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string | undefined> = {};

    // Trim all values
    const trimmedEmail = formData.email?.trim() || '';
    const trimmedBirthDate = formData.birthDate?.trim() || '';

    const emailError = validateEmail(trimmedEmail);
    if (emailError) errors.email = emailError;

    const birthDateError = validateBirthDate(trimmedBirthDate);
    if (birthDateError) errors.birthDate = birthDateError;

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    // Validate form first
    if (!validateForm()) {
      return;
    }

    try {
      // Trim all values before comparison and submission
      const trimmed = {
        email: formData.email?.trim() || '',
        nickname: formData.nickname?.trim() || '',
        firstName: formData.firstName?.trim() || '',
        lastName: formData.lastName?.trim() || '',
        gender: formData.gender?.trim() || '',
        birthDate: formData.birthDate?.trim() || '',
      };

      // Only send fields that have changed and are not empty
      const updates: UpdateProfileRequest = {};
      if (trimmed.email !== (profile?.email || '')) updates.email = trimmed.email || undefined;
      if (trimmed.nickname !== (profile?.nickname || '')) updates.nickname = trimmed.nickname || undefined;
      if (trimmed.firstName !== (profile?.firstName || '')) updates.firstName = trimmed.firstName || undefined;
      if (trimmed.lastName !== (profile?.lastName || '')) updates.lastName = trimmed.lastName || undefined;
      if (trimmed.gender !== (profile?.gender || '')) updates.gender = trimmed.gender || undefined;
      if (trimmed.birthDate !== (profile?.birthDate || '')) updates.birthDate = trimmed.birthDate || undefined;

      if (Object.keys(updates).length === 0) {
        Alert.alert('No Changes', 'No changes to save.');
        return;
      }

      await updateProfile(updates).unwrap();
      Alert.alert('Success', 'Profile updated successfully', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error: unknown) {
      const message = error && typeof error === 'object' && 'data' in error
        ? (error.data as { message?: string })?.message || 'Failed to update profile'
        : 'Failed to update profile';
      Alert.alert('Error', message);
    }
  };

  if (isLoadingProfile) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Loader />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>{'< Back'}</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Edit Profile</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Personal Information</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>First Name</Text>
              <TextInput
                style={styles.input}
                value={formData.firstName}
                onChangeText={(v) => handleChange('firstName', v)}
                placeholder="Enter first name"
                placeholderTextColor={COLORS.textDisabled}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Last Name</Text>
              <TextInput
                style={styles.input}
                value={formData.lastName}
                onChangeText={(v) => handleChange('lastName', v)}
                placeholder="Enter last name"
                placeholderTextColor={COLORS.textDisabled}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nickname</Text>
              <TextInput
                style={styles.input}
                value={formData.nickname}
                onChangeText={(v) => handleChange('nickname', v)}
                placeholder="Enter nickname"
                placeholderTextColor={COLORS.textDisabled}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={[styles.input, validationErrors.email && styles.inputError]}
                value={formData.email}
                onChangeText={(v) => handleChange('email', v)}
                placeholder="Enter email"
                placeholderTextColor={COLORS.textDisabled}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {validationErrors.email && (
                <Text style={styles.errorText}>{validationErrors.email}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Gender</Text>
              <View style={styles.genderOptions}>
                {GENDERS.map((gender) => (
                  <TouchableOpacity
                    key={gender.id}
                    style={[
                      styles.genderOption,
                      formData.gender === gender.id && styles.genderOptionSelected,
                    ]}
                    onPress={() => handleChange('gender', gender.id)}
                  >
                    <Text
                      style={[
                        styles.genderOptionText,
                        formData.gender === gender.id && styles.genderOptionTextSelected,
                      ]}
                    >
                      {gender.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Birth Date</Text>
              <TextInput
                style={[styles.input, validationErrors.birthDate && styles.inputError]}
                value={formData.birthDate}
                onChangeText={(v) => handleChange('birthDate', v)}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={COLORS.textDisabled}
              />
              {validationErrors.birthDate && (
                <Text style={styles.errorText}>{validationErrors.birthDate}</Text>
              )}
            </View>
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.infoText}>Phone number cannot be changed</Text>
            <Text style={styles.phoneNumber}>
              {profile?.dialingCode} {profile?.mobileNumber}
            </Text>
          </View>

          <View style={styles.buttonSection}>
            <Button
              title="Save Changes"
              onPress={handleSave}
              loading={isUpdating}
              fullWidth
            />
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
  scrollView: {
    flex: 1,
  },
  content: {
    padding: SPACING.lg,
    paddingTop: 0,
  },
  section: {
    backgroundColor: COLORS.backgroundCard,
    borderRadius: 12,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.lg,
  },
  inputGroup: {
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  input: {
    backgroundColor: COLORS.backgroundInput,
    borderRadius: 8,
    padding: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
  },
  genderOptions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  genderOption: {
    flex: 1,
    backgroundColor: COLORS.backgroundInput,
    borderRadius: 8,
    padding: SPACING.md,
    alignItems: 'center',
  },
  genderOptionSelected: {
    backgroundColor: COLORS.primary,
  },
  genderOptionText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  genderOptionTextSelected: {
    color: COLORS.text,
    fontWeight: '600',
  },
  infoSection: {
    backgroundColor: COLORS.backgroundCard,
    borderRadius: 12,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    alignItems: 'center',
  },
  infoText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  phoneNumber: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
  },
  buttonSection: {
    paddingBottom: SPACING.lg,
  },
  inputError: {
    borderWidth: 1,
    borderColor: COLORS.error,
  },
  errorText: {
    color: COLORS.error,
    fontSize: FONT_SIZES.xs,
    marginTop: SPACING.xs,
  },
});
