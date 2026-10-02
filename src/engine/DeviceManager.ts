import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, Dimensions } from 'react-native';
import Constants from 'expo-constants';

const DEVICE_ID_KEY = 'KOKORO_ANONYMOUS_DEVICE_ID';
const FINGERPRINT_KEY = 'KOKORO_DEVICE_FINGERPRINT';
const QUOTA_CACHE_KEY = 'KOKORO_QUOTA_CACHE';
const QUOTA_RESET_FLAG_KEY = 'KOKORO_QUOTA_RESET_FLAG_V2';

export class DeviceManager {
  private static cachedDeviceId: string | null = null;
  private static cachedFingerprint: string | null = null;

  /**
   * Get or initialize the persistent anonymous device ID (Zero-Login).
   */
  public static async getDeviceId(): Promise<string> {
    if (this.cachedDeviceId) {
      return this.cachedDeviceId;
    }

    try {
      let storedId = await AsyncStorage.getItem(DEVICE_ID_KEY);
      if (!storedId) {
        const fp = await this.getFingerprint();
        const randomPart = Math.random().toString(36).substring(2, 8);
        storedId = `dev_${Date.now().toString(36)}_${fp.substring(0, 8)}_${randomPart}`;
        await AsyncStorage.setItem(DEVICE_ID_KEY, storedId);
      }
      this.cachedDeviceId = storedId;
      return storedId;
    } catch (e) {
      return 'dev_mobile_user';
    }
  }

  /**
   * Generates a deterministic hardware / environment fingerprint
   * to preserve quota and prevent cheating via app uninstalls.
   */
  public static async getFingerprint(): Promise<string> {
    if (this.cachedFingerprint) {
      return this.cachedFingerprint;
    }

    try {
      let storedFp = await AsyncStorage.getItem(FINGERPRINT_KEY);
      if (!storedFp) {
        let width = 360;
        let height = 640;
        let scale = 2;
        try {
          const dims = Dimensions.get('window');
          if (dims) {
            width = dims.width || width;
            height = dims.height || height;
            scale = dims.scale || scale;
          }
        } catch (_) {}

        const os = Platform.OS || 'mobile';
        const osVer = String(Platform.Version || '1.0');
        const model = Constants?.deviceName || 'android_device';
        
        let tz = 'UTC';
        try {
          if (typeof Intl !== 'undefined' && Intl.DateTimeFormat) {
            tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
          }
        } catch (_) {}

        const raw = `${os}_${osVer}_${model}_${Math.round(width)}x${Math.round(height)}_${scale}_${tz}`;
        
        // Simple fast string hash
        let hash = 0;
        for (let i = 0; i < raw.length; i++) {
          hash = (hash << 5) - hash + raw.charCodeAt(i);
          hash |= 0;
        }
        storedFp = `fp_${Math.abs(hash).toString(36)}_${raw.replace(/[^a-zA-Z0-9]/g, '').substring(0, 16)}`;
        await AsyncStorage.setItem(FINGERPRINT_KEY, storedFp);
      }
      this.cachedFingerprint = storedFp;
      return storedFp;
    } catch (e) {
      return `fp_${Platform.OS || 'mobile'}_default`;
    }
  }

  /**
   * Cache quota state inside device storage
   */
  public static async saveQuotaCache(quota: any): Promise<void> {
    try {
      await AsyncStorage.setItem(QUOTA_CACHE_KEY, JSON.stringify(quota));
    } catch (e) {}
  }

  /**
   * Clear quota cache from device storage
   */
  public static async clearQuotaCache(): Promise<void> {
    try {
      await AsyncStorage.removeItem(QUOTA_CACHE_KEY);
    } catch (e) {}
  }

  /**
   * Retrieve cached quota state from device storage.
   * Automatically clears legacy cached Pro/VIP status if reset migration is pending.
   */
  public static async getQuotaCache(): Promise<any | null> {
    try {
      const hasReset = await AsyncStorage.getItem(QUOTA_RESET_FLAG_KEY);
      if (!hasReset) {
        // Enforce global reset of any stored Pro/VIP cache
        await AsyncStorage.removeItem(QUOTA_CACHE_KEY);
        await AsyncStorage.setItem(QUOTA_RESET_FLAG_KEY, 'done');
        return null;
      }

      const raw = await AsyncStorage.getItem(QUOTA_CACHE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }
}
