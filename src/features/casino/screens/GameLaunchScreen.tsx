import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { WebView } from 'react-native-webview';
import { COLORS, SPACING, FONT_SIZES } from '@/shared/constants';
import { useLaunchGameMutation } from '../api';

type CasinoStackParamList = {
  GameLaunch: { gameId: string; gameName: string };
};

type GameLaunchRouteProp = RouteProp<CasinoStackParamList, 'GameLaunch'>;

// Validate and sanitize launch URL for security
const validateLaunchUrl = (url: string): { valid: boolean; error?: string } => {
  // Check if URL is defined and non-empty
  if (!url || typeof url !== 'string') {
    return { valid: false, error: 'Invalid game URL received' };
  }

  try {
    const parsed = new URL(url);

    // Must be HTTPS for security
    if (parsed.protocol !== 'https:') {
      return { valid: false, error: 'Game URL must use secure connection (HTTPS)' };
    }

    // Block dangerous/invalid domains
    const blockedPatterns = ['localhost', '127.0.0.1', '0.0.0.0', 'file://', 'javascript:'];
    const hostLower = parsed.host.toLowerCase();
    if (blockedPatterns.some(pattern => hostLower.includes(pattern))) {
      return { valid: false, error: 'Invalid game server' };
    }

    return { valid: true };
  } catch {
    return { valid: false, error: 'Invalid game URL format' };
  }
};

export const GameLaunchScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<GameLaunchRouteProp>();
  const { gameId, gameName } = route.params;

  const [launchGame, { isLoading }] = useLaunchGameMutation();
  const [launchUrl, setLaunchUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'real' | 'demo' | null>(null);

  const handleLaunch = async (selectedMode: 'real' | 'demo') => {
    setMode(selectedMode);
    setError(null);

    try {
      const result = await launchGame({ gameId, mode: selectedMode }).unwrap();

      // Validate URL before using it
      const validation = validateLaunchUrl(result.launchUrl);
      if (!validation.valid) {
        setError(validation.error || 'Invalid game URL');
        Alert.alert('Error', validation.error || 'Invalid game URL');
        return;
      }

      setLaunchUrl(result.launchUrl);
    } catch (err: unknown) {
      const message = err && typeof err === 'object' && 'data' in err
        ? (err.data as { message?: string })?.message || 'Failed to launch game'
        : 'Failed to launch game';
      setError(message);
      Alert.alert('Error', message);
    }
  };

  const handleClose = () => {
    Alert.alert(
      'Exit Game',
      'Are you sure you want to exit the game?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Exit', onPress: () => navigation.goBack() },
      ]
    );
  };

  // Mode selection screen
  if (!mode) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>{'< Back'}</Text>
          </TouchableOpacity>
          <Text style={styles.title} numberOfLines={1}>
            {gameName}
          </Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.modeSelection}>
          <Text style={styles.modeTitle}>Select Game Mode</Text>
          <Text style={styles.modeSubtitle}>
            Choose how you want to play this game
          </Text>

          <TouchableOpacity
            style={styles.modeButton}
            onPress={() => handleLaunch('real')}
            disabled={isLoading}
          >
            <Text style={styles.modeButtonEmoji}>💰</Text>
            <View style={styles.modeButtonContent}>
              <Text style={styles.modeButtonTitle}>Play for Real</Text>
              <Text style={styles.modeButtonDescription}>
                Use your balance to play and win real money
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.modeButton, styles.demoButton]}
            onPress={() => handleLaunch('demo')}
            disabled={isLoading}
          >
            <Text style={styles.modeButtonEmoji}>🎮</Text>
            <View style={styles.modeButtonContent}>
              <Text style={styles.modeButtonTitle}>Play Demo</Text>
              <Text style={styles.modeButtonDescription}>
                Practice with free credits, no real money
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Loading state
  if (isLoading || !launchUrl) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading game...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (error) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorEmoji}>❌</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => setMode(null)}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Game WebView
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.gameHeader}>
        <TouchableOpacity onPress={handleClose}>
          <Text style={styles.closeButton}>✕ Close</Text>
        </TouchableOpacity>
        <Text style={styles.gameTitle} numberOfLines={1}>
          {gameName} ({mode === 'demo' ? 'Demo' : 'Real'})
        </Text>
        <View style={styles.placeholder} />
      </View>

      <WebView
        source={{ uri: launchUrl }}
        style={styles.webview}
        javaScriptEnabled
        domStorageEnabled
        startInLoadingState
        // Security props
        originWhitelist={['https://*']}
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        mixedContentMode="never"
        thirdPartyCookiesEnabled={false}
        // Prevent navigation to other URLs
        onShouldStartLoadWithRequest={(request) => {
          const validation = validateLaunchUrl(request.url);
          return validation.valid;
        }}
        renderLoading={() => (
          <View style={styles.webviewLoading}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        )}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          setError(`Failed to load game: ${nativeEvent.description}`);
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
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
    flex: 1,
    textAlign: 'center',
    marginHorizontal: SPACING.md,
  },
  placeholder: {
    width: 50,
  },
  modeSelection: {
    flex: 1,
    padding: SPACING.lg,
    justifyContent: 'center',
  },
  modeTitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  modeSubtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  modeButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    padding: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  demoButton: {
    backgroundColor: COLORS.backgroundCard,
  },
  modeButtonEmoji: {
    fontSize: 36,
    marginRight: SPACING.lg,
  },
  modeButtonContent: {
    flex: 1,
  },
  modeButtonTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  modeButtonDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  errorEmoji: {
    fontSize: 48,
    marginBottom: SPACING.md,
  },
  errorText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.error,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  gameHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    backgroundColor: COLORS.backgroundCard,
  },
  closeButton: {
    fontSize: FONT_SIZES.md,
    color: COLORS.error,
    fontWeight: '500',
  },
  gameTitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: SPACING.sm,
  },
  webview: {
    flex: 1,
  },
  webviewLoading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
  },
});
