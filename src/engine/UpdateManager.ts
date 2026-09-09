import * as Updates from 'expo-updates';
import { Alert } from 'react-native';

export class UpdateManager {
  /**
   * Check if running in release build with OTA updates enabled
   */
  public static isOtaEnabled(): boolean {
    return Updates.isEnabled;
  }

  /**
   * Check for Over-The-Air updates and optionally prompt user
   */
  public static async checkForUpdate(manualTrigger = false): Promise<{ isAvailable: boolean; message: string }> {
    if (!Updates.isEnabled) {
      const msg = 'OTA updates are active for production standalone builds (Development mode active in Expo Go).';
      if (manualTrigger) {
        Alert.alert('Development Environment', msg);
      }
      return { isAvailable: false, message: msg };
    }

    try {
      const update = await Updates.checkForUpdateAsync();
      if (update.isAvailable) {
        if (manualTrigger) {
          Alert.alert(
            'Update Available! 🚀',
            'A new version of Kokoro Voice Studio is available. Download and apply now?',
            [
              { text: 'Later', style: 'cancel' },
              {
                text: 'Update & Restart',
                onPress: async () => {
                  await Updates.fetchUpdateAsync();
                  await Updates.reloadAsync();
                },
              },
            ]
          );
        } else {
          // Download in background silently
          await Updates.fetchUpdateAsync();
        }
        return { isAvailable: true, message: 'New update downloaded. Restart app to apply.' };
      } else {
        if (manualTrigger) {
          Alert.alert('Up to Date ✓', 'You are running the latest version of Kokoro Voice Studio.');
        }
        return { isAvailable: false, message: 'App is up to date.' };
      }
    } catch (error: any) {
      console.warn('OTA update check failed:', error);
      if (manualTrigger) {
        Alert.alert('Update Check Failed', error.message || 'Could not reach update server.');
      }
      return { isAvailable: false, message: error.message };
    }
  }

  /**
   * Force fetch and reload update immediately
   */
  public static async fetchAndReload(): Promise<void> {
    if (Updates.isEnabled) {
      await Updates.fetchUpdateAsync();
      await Updates.reloadAsync();
    }
  }
}
