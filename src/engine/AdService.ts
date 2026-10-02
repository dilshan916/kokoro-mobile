import AsyncStorage from '@react-native-async-storage/async-storage';
import { DeviceManager } from './DeviceManager';

export const ADMOB_APP_ID = 'ca-app-pub-4911081363726956~5891952434';
export const ADMOB_INTERSTITIAL_UNIT_ID = 'ca-app-pub-4911081363726956/6942230090'; // Audio_Generated_Interstitial
export const ADMOB_BANNER_UNIT_ID = 'ca-app-pub-4911081363726956/3609404028'; // Main_Banner
export const ADMOB_REWARDED_UNIT_ID = 'ca-app-pub-4911081363726956/7201164677'; // Bonus_Credits_Reward

const GENERATION_COUNT_KEY = 'KOKORO_AD_GEN_COUNT';
const LAST_INTERSTITIAL_TIME_KEY = 'KOKORO_LAST_INTERSTITIAL_TIME';

let mobileAds: any = null;
let InterstitialAd: any = null;
let RewardedInterstitialAd: any = null;
let AdEventType: any = null;
let RewardedAdEventType: any = null;
let TestIds: any = null;

try {
  const gma = require('react-native-google-mobile-ads');
  mobileAds = gma.default;
  InterstitialAd = gma.InterstitialAd;
  RewardedInterstitialAd = gma.RewardedInterstitialAd;
  AdEventType = gma.AdEventType;
  RewardedAdEventType = gma.RewardedAdEventType;
  TestIds = gma.TestIds;
} catch (e) {
  console.warn('[AdMob] Native module not loaded yet:', e);
}

export class AdService {
  private static isInitialized = false;

  // Interstitial Ad state
  private static interstitial: any = null;
  private static isAdLoaded = false;
  private static isLoading = false;

  // Rewarded Interstitial Ad state (Bonus Credits)
  private static rewardedAd: any = null;
  private static isRewardedLoaded = false;
  private static isLoadingRewarded = false;

  /**
   * Initialize Google Mobile Ads SDK and start preloading ads
   */
  public static async init(): Promise<void> {
    if (this.isInitialized || !mobileAds) return;
    try {
      await mobileAds().initialize();
      this.isInitialized = true;
      this.preloadInterstitial();
      this.preloadRewardedAd();
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
   * Preload Google AdMob Rewarded Interstitial for Bonus Credits
   */
  public static preloadRewardedAd(): void {
    if (!RewardedInterstitialAd || this.isRewardedLoaded || this.isLoadingRewarded) return;

    try {
      this.isLoadingRewarded = true;
      const adUnitId = __DEV__ && TestIds ? TestIds.REWARDED_INTERSTITIAL : ADMOB_REWARDED_UNIT_ID;

      this.rewardedAd = RewardedInterstitialAd.createForAdRequest(adUnitId, {
        requestNonPersonalizedAdsOnly: false,
      });

      this.rewardedAd.addAdEventListener(RewardedAdEventType.LOADED, () => {
        this.isRewardedLoaded = true;
        this.isLoadingRewarded = false;
      });

      this.rewardedAd.addAdEventListener(AdEventType.ERROR, (error: any) => {
        this.isRewardedLoaded = false;
        this.isLoadingRewarded = false;
        console.warn('[AdMob] Rewarded ad load error:', error);
      });

      this.rewardedAd.addAdEventListener(AdEventType.CLOSED, () => {
        this.isRewardedLoaded = false;
        this.isLoadingRewarded = false;
        setTimeout(() => this.preloadRewardedAd(), 2000);
      });

      this.rewardedAd.load();
    } catch (e) {
      this.isLoadingRewarded = false;
      console.warn('[AdMob] Rewarded preload failed:', e);
    }
  }

  /**
   * Check if rewarded ad is ready to display
   */
  public static isRewardedAdReady(): boolean {
    return this.isRewardedLoaded && !!this.rewardedAd;
  }

  /**
   * Show rewarded ad to grant bonus tokens/characters.
   * Resolves with { earned: true, amount: number } upon completion.
   */
  public static showRewardedAd(): Promise<{ earned: boolean; amount: number }> {
    return new Promise((resolve) => {
      if (!this.isRewardedLoaded || !this.rewardedAd) {
        this.preloadRewardedAd();
        resolve({ earned: false, amount: 0 });
        return;
      }

      let userEarned = false;
      let earnedAmount = 1000;

      const rewardListener = this.rewardedAd.addAdEventListener(
        RewardedAdEventType.EARNED_REWARD,
        (reward: any) => {
          userEarned = true;
          if (reward && typeof reward.amount === 'number' && reward.amount > 0) {
            earnedAmount = reward.amount;
          }
        }
      );

      const closeListener = this.rewardedAd.addAdEventListener(
        AdEventType.CLOSED,
        () => {
          try {
            rewardListener?.();
            closeListener?.();
          } catch (_) {}
          this.isRewardedLoaded = false;
          this.preloadRewardedAd();
          resolve({ earned: userEarned, amount: userEarned ? earnedAmount : 0 });
        }
      );

      try {
        this.rewardedAd.show();
      } catch (err) {
        try {
          rewardListener?.();
          closeListener?.();
        } catch (_) {}
        this.isRewardedLoaded = false;
        this.preloadRewardedAd();
        resolve({ earned: false, amount: 0 });
      }
    });
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
