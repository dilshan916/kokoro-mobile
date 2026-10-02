import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Linking from 'expo-linking';
import { DeviceManager } from './DeviceManager';

export const ADSTERRA_SMARTLINK = 'https://asiafilm.org/4/cd2b70ccca96e8213f4e198b6fbf9cea';

const GENERATION_COUNT_KEY = 'KOKORO_AD_GEN_COUNT';
const LAST_INTERSTITIAL_TIME_KEY = 'KOKORO_LAST_INTERSTITIAL_TIME';

export class AdService {
  /**
   * Check if advertisements should be enabled.
   * Returns false if the user is a Pro subscriber or has redeemed a VIP code.
   */
  public static async isAdEnabled(): Promise<boolean> {
    try {
      const quota = await DeviceManager.getQuotaCache();
      if (quota && (quota.is_pro || quota.tier === 'pro')) {
        return false;
      }
      return true;
    } catch {
      return true;
    }
  }

  /**
   * Directly open the Adsterra Smartlink in the default system browser.
   */
  public static async openSmartLink(): Promise<void> {
    try {
      const supported = await Linking.canOpenURL(ADSTERRA_SMARTLINK);
      if (supported) {
        await Linking.openURL(ADSTERRA_SMARTLINK);
      }
    } catch (e) {
      console.warn('[AdService] Failed to open Smartlink:', e);
    }
  }

  /**
   * Called whenever a speech generation successfully completes.
   * Increments the generation count and checks if an interstitial should trigger.
   * Defaults to triggering every 2nd generation with a 45-second cooldown.
   */
  public static async onGenerationCompleted(): Promise<boolean> {
    try {
      const enabled = await this.isAdEnabled();
      if (!enabled) return false;

      const rawCount = await AsyncStorage.getItem(GENERATION_COUNT_KEY);
      const count = (rawCount ? parseInt(rawCount, 10) : 0) + 1;
      await AsyncStorage.setItem(GENERATION_COUNT_KEY, count.toString());

      const lastTimeStr = await AsyncStorage.getItem(LAST_INTERSTITIAL_TIME_KEY);
      const now = Date.now();
      const lastTime = lastTimeStr ? parseInt(lastTimeStr, 10) : 0;
      const cooldownPassed = now - lastTime > 45000; // 45 seconds minimum cooldown

      // Trigger interstitial every 2 generations once cooldown passes
      if (count % 2 === 0 && cooldownPassed) {
        await AsyncStorage.setItem(LAST_INTERSTITIAL_TIME_KEY, now.toString());
        return true;
      }

      return false;
    } catch (e) {
      console.warn('[AdService] onGenerationCompleted error:', e);
      return false;
    }
  }
}
