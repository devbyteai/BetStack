import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, FONT_SIZES } from '@/shared/constants';
import { Loader } from '@/shared/components';
import { useGetInfoPageQuery } from '../api/contentApi';

interface FAQItem {
  question: string;
  answer: string;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    question: 'How do I place a bet?',
    answer:
      'Navigate to Live or Prematch sections, select a game, choose your odds, enter your stake in the betslip, and tap "Place Bet".',
  },
  {
    question: 'How do I deposit funds?',
    answer:
      'Go to Wallet from the menu, tap Deposit, select your payment method (MTN, Vodafone, or AirtelTigo), enter the amount, and follow the prompts.',
  },
  {
    question: 'How do I withdraw my winnings?',
    answer:
      'Go to Wallet from the menu, tap Withdraw, select your payment method, enter the amount and your phone number, then confirm with your password.',
  },
  {
    question: 'What is cashout?',
    answer:
      'Cashout allows you to settle your bet early before all selections are complete. The cashout value depends on current odds and remaining selections.',
  },
  {
    question: 'How do I change my odds format?',
    answer:
      'Go to Profile > Settings, and select your preferred odds format: Decimal, Fractional, American, or Malay.',
  },
  {
    question: 'What are booking codes?',
    answer:
      'Booking codes let you save your betslip and share it with others. They can load your selections and place the same bet.',
  },
];

export const HelpScreen: React.FC = () => {
  const { data: helpPage, isLoading, refetch, isFetching } = useGetInfoPageQuery('help');
  const [expandedFAQ, setExpandedFAQ] = React.useState<number | null>(null);

  const handleContactSupport = () => {
    Linking.openURL('mailto:support@example.com');
  };

  const handleWhatsApp = () => {
    Linking.openURL('https://wa.me/1234567890');
  };

  const toggleFAQ = (index: number) => {
    setExpandedFAQ(expandedFAQ === index ? null : index);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.title}>Help & Support</Text>
        </View>
        <Loader fullScreen />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={isFetching && !isLoading}
            onRefresh={refetch}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
      >
        <View style={styles.header}>
          <Text style={styles.title}>Help & Support</Text>
          <Text style={styles.subtitle}>We're here to help</Text>
        </View>

        {helpPage?.content && (
          <View style={styles.section}>
            <Text style={styles.htmlContent}>{helpPage.content}</Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          {FAQ_ITEMS.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.faqItem}
              onPress={() => toggleFAQ(index)}
              activeOpacity={0.7}
            >
              <View style={styles.faqHeader}>
                <Text style={styles.faqQuestion}>{item.question}</Text>
                <Text style={styles.faqIcon}>
                  {expandedFAQ === index ? '-' : '+'}
                </Text>
              </View>
              {expandedFAQ === index && (
                <Text style={styles.faqAnswer}>{item.answer}</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Us</Text>
          <View style={styles.contactContainer}>
            <TouchableOpacity
              style={styles.contactButton}
              onPress={handleContactSupport}
            >
              <Text style={styles.contactButtonText}>Email Support</Text>
              <Text style={styles.contactButtonSubtext}>support@example.com</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.contactButton, styles.whatsappButton]}
              onPress={handleWhatsApp}
            >
              <Text style={styles.contactButtonText}>WhatsApp</Text>
              <Text style={styles.contactButtonSubtext}>Chat with us</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Links</Text>
          <View style={styles.linksContainer}>
            <TouchableOpacity style={styles.linkItem}>
              <Text style={styles.linkText}>Terms of Service</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.linkItem}>
              <Text style={styles.linkText}>Privacy Policy</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.linkItem}>
              <Text style={styles.linkText}>Responsible Gaming</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
  },
  header: {
    padding: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  section: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  htmlContent: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  faqItem: {
    backgroundColor: COLORS.backgroundCard,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestion: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    fontWeight: '500',
    marginRight: SPACING.sm,
  },
  faqIcon: {
    fontSize: FONT_SIZES.xl,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  faqAnswer: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
    lineHeight: 20,
  },
  contactContainer: {
    gap: SPACING.sm,
  },
  contactButton: {
    backgroundColor: COLORS.backgroundCard,
    borderRadius: 12,
    padding: SPACING.md,
    alignItems: 'center',
  },
  whatsappButton: {
    backgroundColor: COLORS.success,
  },
  contactButtonText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    fontWeight: '600',
  },
  contactButtonSubtext: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  linksContainer: {
    backgroundColor: COLORS.backgroundCard,
    borderRadius: 12,
    overflow: 'hidden',
  },
  linkItem: {
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  linkText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.primary,
  },
  bottomSpacer: {
    height: SPACING.xl,
  },
});
