import AsyncStorage from '@react-native-async-storage/async-storage';
import { DeviceManager } from './DeviceManager';

export const ADMOB_APP_ID = 'ca-app-pub-4911081363726956~5891952434';
export const ADMOB_INTERSTITIAL_UNIT_ID = 'ca-app-pub-4911081363726956/6942230090';
export const ADMOB_BANNER_UNIT_ID = 'ca-app-pub-4911081363726956/3609404028';

const GENERATION_COUNT_KEY = 'KOKORO_AD_GEN_COUNT';
const LAST_INTERSTITIAL_TIME_KEY = 'KOKORO_LAST_INTERSTITIAL_TIME';

let mobileAds: any = null;
let InterstitialAd: any = null;
let AdEventType: any = null;
let TestIds: any = null;

try {
  const gma = require('react-native-google-mobile-ads');
  mobileAds = gma.default;
  InterstitialAd = gma.InterstitialAd;
  AdEventType = gma.AdEventType;
  TestIds = gma.TestIds;
} catch (e) {
  console.warn('[AdMob] Native module not loaded yet:', e);
}

export class AdService {
  private static isInitialized = false;
  private static interstitial: any = null;
  private static isAdLoaded = false;
  private static isLoading = false;

  /**
   * Initialize Google Mobile Ads SDK and start preloading
   */
  public static async init(): Promise<void> {
    if (this.isInitialized || !mobileAds) return;
    try {
      await mobileAds().initialize();
      this.isInitialized = true;
      this.preloadInterstitial();
    } catch (e) {
      console.warn('[AdMob] Init error:', e);
    }
  }

  /**
   * Preload Google AdMob Interstitial in background
   */
  public static preloadInterstitial(): void {
    if (!InterstitialAd || this.isAdLoaded || this.isLoading) return;

    try {
      this.isLoading = true;
      const adUnitId = __DEV__ && TestIds ? TestIds.INTERSTITIAL : ADMOB_INTERSTITIAL_UNIT_ID;

      this.interstitial = InterstitialAd.createForAdRequest(adUnitId, {
        requestNonPersonalizedAdsOnly: false,
      });

      this.interstitial.addAdEventListener(AdEventType.LOADED, () => {
        this.isAdLoaded = true;
        this.isLoading = false;
      });

      this.interstitial.addAdEventListener(AdEventType.ERROR, (error: any) => {
        this.isAdLoaded = false;
        this.isLoading = false;
        console.warn('[AdMob] Interstitial load error:', error);
      });

      this.interstitial.addAdEventListener(AdEventType.CLOSED, () => {
        this.isAdLoaded = false;
        this.isLoading = false;
        // Preload next ad after user closes this one
        setTimeout(() => this.preloadInterstitial(), 1500);
      });

      this.interstitial.load();
    } catch (e) {
      this.isLoading = false;
      console.warn('[AdMob] Preload failed:', e);
    }
  }

  /**
   * Check if user is eligible for ads (Free tier only; disabled for Pro/VIP)
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
   * Show interstitial ad if loaded and criteria met
   */
  public static async showInterstitial(): Promise<boolean> {
    const enabled = await this.isAdEnabled();
    if (!enabled) return false;

    if (this.isAdLoaded && this.interstitial) {
      try {
        await this.interstitial.show();
        return true;
      } catch (e) {
        console.warn('[AdMob] Failed to show interstitial:', e);
        this.preloadInterstitial();
        return false;
      }
    } else {
      // Trigger preload if not loaded yet
      this.preloadInterstitial();
      return false;
    }
  }

  /**
   * Called whenever a speech generation completes.
   * Tracks count and triggers interstitial (every 2nd generation with 45s cooldown).
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

      if (count % 2 === 0 && cooldownPassed) {
        await AsyncStorage.setItem(LAST_INTERSTITIAL_TIME_KEY, now.toString());
        return await this.showInterstitial();
      }

      if (!this.isAdLoaded) {
        this.preloadInterstitial();
      }

      return false;
    } catch (e) {
      console.warn('[AdMob] onGenerationCompleted error:', e);
      return false;
    }
  }
}
