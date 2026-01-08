/**
 * Sound Service - Manages audio playback for the app
 *
 * SETUP REQUIRED:
 * 1. Install: npm install react-native-sound
 * 2. iOS: cd ios && pod install
 * 3. Add sound files to assets/sounds/
 *
 * Sound files needed:
 * - bet_placed.mp3 - Short confirmation sound
 * - win.mp3 - Celebration sound
 * - notification.mp3 - Alert chime
 */

// Sound type definitions
export type SoundType = 'betPlaced' | 'win' | 'notification';

interface SoundConfig {
  [key: string]: {
    file: string;
    volume: number;
  };
}

const SOUND_CONFIG: SoundConfig = {
  betPlaced: { file: 'bet_placed.mp3', volume: 0.8 },
  win: { file: 'win.mp3', volume: 1.0 },
  notification: { file: 'notification.mp3', volume: 0.7 },
};

class SoundService {
  private enabled: boolean = true;
  private initialized: boolean = false;
  private sounds: Map<SoundType, unknown> = new Map();

  /**
   * Initialize the sound service
   * Call this early in app lifecycle
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Attempt to load react-native-sound dynamically
      // This allows the app to work even if the native module isn't linked
      const Sound = await this.loadSoundModule();
      if (!Sound) {
        console.warn('Sound module not available - sounds disabled');
        return;
      }

      // Preload sounds
      for (const [key, config] of Object.entries(SOUND_CONFIG)) {
        try {
          const sound = new Sound(config.file, Sound.MAIN_BUNDLE, (error: Error | null) => {
            if (error) {
              console.warn(`Failed to load sound ${key}:`, error);
              return;
            }
            sound.setVolume(config.volume);
            this.sounds.set(key as SoundType, sound);
          });
        } catch {
          console.warn(`Failed to initialize sound: ${key}`);
        }
      }

      this.initialized = true;
    } catch {
      console.warn('Sound service initialization failed - continuing without sounds');
    }
  }

  private async loadSoundModule(): Promise<unknown> {
    try {
      // Dynamic import to avoid crash if module not installed
      const module = await import('react-native-sound');
      return module.default;
    } catch {
      return null;
    }
  }

  /**
   * Enable or disable sound playback
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * Check if sounds are enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Play a sound by type
   */
  play(type: SoundType): void {
    if (!this.enabled || !this.initialized) return;

    const sound = this.sounds.get(type);
    if (sound && typeof (sound as { play?: (cb?: () => void) => void }).play === 'function') {
      try {
        (sound as { stop: () => void; play: (cb?: () => void) => void }).stop();
        (sound as { play: (cb?: () => void) => void }).play();
      } catch {
        console.warn(`Failed to play sound: ${type}`);
      }
    }
  }

  /**
   * Play bet placed sound
   */
  playBetPlaced(): void {
    this.play('betPlaced');
  }

  /**
   * Play win sound
   */
  playWin(): void {
    this.play('win');
  }

  /**
   * Play notification sound
   */
  playNotification(): void {
    this.play('notification');
  }

  /**
   * Release all sound resources
   */
  release(): void {
    for (const sound of this.sounds.values()) {
      if (sound && typeof (sound as { release?: () => void }).release === 'function') {
        (sound as { release: () => void }).release();
      }
    }
    this.sounds.clear();
    this.initialized = false;
  }
}

// Singleton instance
export const soundService = new SoundService();
