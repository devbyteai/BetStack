import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';

import { useGetJobByIdQuery, useApplyForJobMutation } from '../api/jobsApi';
import type { RootStackParamList } from '@/navigation/types';
import { colors, spacing, typography, borderRadius } from '@/shared/constants/theme';

type RouteParams = RouteProp<RootStackParamList, 'JobDetail'>;

export const JobDetailScreen: React.FC = () => {
  const route = useRoute<RouteParams>();
  const navigation = useNavigation();
  const { jobId } = route.params;

  const { data: job, isLoading, error } = useGetJobByIdQuery(jobId);
  const [applyForJob, { isLoading: isApplying }] = useApplyForJobMutation();

  const [showApplyForm, setShowApplyForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email';
    }

    if (formData.phone && !/^[\d\s\-+()]{7,20}$/.test(formData.phone)) {
      errors.phone = 'Please enter a valid phone number';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleApply = async () => {
    if (!validateForm()) return;

    try {
      await applyForJob({
        jobId,
        data: {
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim() || undefined,
        },
      }).unwrap();

      Alert.alert(
        'Application Submitted',
        'Thank you for your application! We will review it and get back to you soon.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (err: unknown) {
      const errorMessage = err && typeof err === 'object' && 'data' in err
        ? (err.data as { error?: { message?: string } })?.error?.message
        : 'Failed to submit application';
      Alert.alert('Error', errorMessage || 'Please try again later.');
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary.main} />
          <Text style={styles.loadingText}>Loading job details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !job) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.errorContainer}>
          <Icon name="alert-circle-outline" size={64} color={colors.status.error} />
          <Text style={styles.errorTitle}>Job Not Found</Text>
          <Text style={styles.errorSubtitle}>
            This job may no longer be available
          </Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Job Header */}
          <View style={styles.header}>
            <View style={styles.jobIcon}>
              <Icon name="briefcase" size={32} color={colors.primary.main} />
            </View>
            <Text style={styles.jobTitle}>{job.title}</Text>
            {job.location && (
              <View style={styles.locationRow}>
                <Icon name="location" size={16} color={colors.text.secondary} />
                <Text style={styles.locationText}>{job.location}</Text>
              </View>
            )}
            <Text style={styles.postedDate}>
              Posted on {formatDate(job.createdAt)}
            </Text>
          </View>

          {/* Job Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.sectionContent}>{job.description}</Text>
          </View>

          {/* Requirements */}
          {job.requirements && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Requirements</Text>
              <Text style={styles.sectionContent}>{job.requirements}</Text>
            </View>
          )}

          {/* Apply Form */}
          {showApplyForm ? (
            <View style={styles.applyForm}>
              <Text style={styles.formTitle}>Apply for this Position</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Full Name *</Text>
                <TextInput
                  style={[styles.input, formErrors.name && styles.inputError]}
                  placeholder="Enter your full name"
                  placeholderTextColor={colors.text.disabled}
                  value={formData.name}
                  onChangeText={(text) => {
                    setFormData((prev) => ({ ...prev, name: text }));
                    if (formErrors.name) {
                      setFormErrors((prev) => ({ ...prev, name: '' }));
                    }
                  }}
                />
                {formErrors.name && (
                  <Text style={styles.errorText}>{formErrors.name}</Text>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email Address *</Text>
                <TextInput
                  style={[styles.input, formErrors.email && styles.inputError]}
                  placeholder="Enter your email"
                  placeholderTextColor={colors.text.disabled}
                  value={formData.email}
                  onChangeText={(text) => {
                    setFormData((prev) => ({ ...prev, email: text }));
                    if (formErrors.email) {
                      setFormErrors((prev) => ({ ...prev, email: '' }));
                    }
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                {formErrors.email && (
                  <Text style={styles.errorText}>{formErrors.email}</Text>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Phone Number (Optional)</Text>
                <TextInput
                  style={[styles.input, formErrors.phone && styles.inputError]}
                  placeholder="Enter your phone number"
                  placeholderTextColor={colors.text.disabled}
                  value={formData.phone}
                  onChangeText={(text) => {
                    setFormData((prev) => ({ ...prev, phone: text }));
                    if (formErrors.phone) {
                      setFormErrors((prev) => ({ ...prev, phone: '' }));
                    }
                  }}
                  keyboardType="phone-pad"
                />
                {formErrors.phone && (
                  <Text style={styles.errorText}>{formErrors.phone}</Text>
                )}
              </View>

              <View style={styles.formButtons}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setShowApplyForm(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.submitButton, isApplying && styles.submitButtonDisabled]}
                  onPress={handleApply}
                  disabled={isApplying}
                >
                  {isApplying ? (
                    <ActivityIndicator size="small" color={colors.common.white} />
                  ) : (
                    <Text style={styles.submitButtonText}>Submit Application</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.applyButton}
              onPress={() => setShowApplyForm(true)}
            >
              <Icon name="paper-plane" size={20} color={colors.common.white} />
              <Text style={styles.applyButtonText}>Apply for this Position</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: typography.sizes.body,
    color: colors.text.secondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  errorTitle: {
    fontSize: typography.sizes.h3,
    fontWeight: '600',
    color: colors.text.primary,
    marginTop: spacing.lg,
  },
  errorSubtitle: {
    fontSize: typography.sizes.body,
    color: colors.text.secondary,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  backButton: {
    marginTop: spacing.xl,
    backgroundColor: colors.primary.main,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  backButtonText: {
    fontSize: typography.sizes.body,
    fontWeight: '600',
    color: colors.common.white,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl * 2,
  },
  header: {
    alignItems: 'center',
    paddingBottom: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
    marginBottom: spacing.lg,
  },
  jobIcon: {
    width: 72,
    height: 72,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.primary.main + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  jobTitle: {
    fontSize: typography.sizes.h2,
    fontWeight: '700',
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  locationText: {
    fontSize: typography.sizes.body,
    color: colors.text.secondary,
    marginLeft: spacing.xs,
  },
  postedDate: {
    fontSize: typography.sizes.caption,
    color: colors.text.disabled,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.sizes.h3,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  sectionContent: {
    fontSize: typography.sizes.body,
    color: colors.text.secondary,
    lineHeight: 24,
  },
  applyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary.main,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.md,
    marginTop: spacing.md,
  },
  applyButtonText: {
    fontSize: typography.sizes.body,
    fontWeight: '600',
    color: colors.common.white,
    marginLeft: spacing.sm,
  },
  applyForm: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.primary,
  },
  formTitle: {
    fontSize: typography.sizes.h3,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  inputLabel: {
    fontSize: typography.sizes.small,
    fontWeight: '500',
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.background.primary,
    borderWidth: 1,
    borderColor: colors.border.primary,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: typography.sizes.body,
    color: colors.text.primary,
  },
  inputError: {
    borderColor: colors.status.error,
  },
  errorText: {
    fontSize: typography.sizes.caption,
    color: colors.status.error,
    marginTop: spacing.xs,
  },
  formButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border.primary,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: typography.sizes.body,
    fontWeight: '500',
    color: colors.text.secondary,
  },
  submitButton: {
    flex: 2,
    backgroundColor: colors.primary.main,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    fontSize: typography.sizes.body,
    fontWeight: '600',
    color: colors.common.white,
  },
});

export default JobDetailScreen;
