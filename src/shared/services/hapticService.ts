import { Platform } from 'react-native';
import ReactNativeHapticFeedback, {
  HapticFeedbackTypes,
} from 'react-native-haptic-feedback';

export type HapticType =
  | 'selection'
  | 'success'
  | 'warning'
  | 'error'
  | 'light'
  | 'medium'
  | 'heavy';

const hapticOptions = {
  enableVibrateFallback: true,
  ignoreAndroidSystemSettings: false,
};

const hapticTypeMap: Record<HapticType, HapticFeedbackTypes> = {
  selection: HapticFeedbackTypes.selection,
  success: HapticFeedbackTypes.notificationSuccess,
  warning: HapticFeedbackTypes.notificationWarning,
  error: HapticFeedbackTypes.notificationError,
  light: HapticFeedbackTypes.impactLight,
  medium: HapticFeedbackTypes.impactMedium,
  heavy: HapticFeedbackTypes.impactHeavy,
};

class HapticService {
  private enabled: boolean = true;

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  trigger(type: HapticType = 'selection'): void {
    if (!this.enabled) return;

    try {
      const feedbackType = hapticTypeMap[type] || HapticFeedbackTypes.selection;
      ReactNativeHapticFeedback.trigger(feedbackType, hapticOptions);
    } catch (error) {
      // Silently fail if haptic feedback is not available
      if (__DEV__) {
        console.warn('Haptic feedback failed:', error);
      }
    }
  }

  // Convenience methods
  selection(): void {
    this.trigger('selection');
  }

  success(): void {
    this.trigger('success');
  }

  warning(): void {
    this.trigger('warning');
  }

  error(): void {
    this.trigger('error');
  }

  light(): void {
    this.trigger('light');
  }

  medium(): void {
    this.trigger('medium');
  }

  heavy(): void {
    this.trigger('heavy');
  }

  // Special methods for betting actions
  onOddsSelect(): void {
    this.trigger('selection');
  }

  onBetPlaced(): void {
    this.trigger('success');
  }

  onBetFailed(): void {
    this.trigger('error');
  }

  onCashout(): void {
    this.trigger('heavy');
  }

  onWin(): void {
    // Double haptic for wins
    this.trigger('success');
    setTimeout(() => this.trigger('success'), 150);
  }
}

export const hapticService = new HapticService();
export default hapticService;
