import { DeviceManager } from './DeviceManager';
import { KokoroOnDeviceEngine } from './KokoroOnDeviceEngine';

export interface QuotaInfo {
  device_id: string;
  tier: 'free' | 'pro';
  is_pro: boolean;
  monthly_usage: number;
  monthly_limit: number | null;
  remaining_chars: number | 'unlimited';
  percent_used: number;
  billing_cycle: string;
  license_key?: string | null;
}

export class QuotaService {
  /**
   * Fetch current quota and subscription status for this device
   */
  public static async fetchQuota(): Promise<QuotaInfo> {
    const deviceId = await DeviceManager.getDeviceId();
    const fingerprint = await DeviceManager.getFingerprint();
    const cached = await DeviceManager.getQuotaCache();

    const engine = KokoroOnDeviceEngine.getInstance();
    const activeUrl = await engine.probeActiveServer();
    const serverUrl = activeUrl || 'https://saytts.site';

    try {
      const url = `${serverUrl.replace(/\/$/, '')}/v1/user/quota?device_id=${encodeURIComponent(deviceId)}`;
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'X-Device-Id': deviceId,
          'X-Device-Fingerprint': fingerprint,
          'Bypass-Tunnel-Reminder': 'true',
          'ngrok-skip-browser-warning': 'true',
        },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        await DeviceManager.saveQuotaCache(data);
        return data;
      }
    } catch (e) {
      // If network is slow or offline, fallback
    }

    // If cache exists and is free tier, use it
    if (cached && !cached.is_pro && cached.tier === 'free') {
      return cached;
    }

    // Default fallback (Offline / Disconnected)
    const currentCycle = new Date().toISOString().substring(0, 7);
    const defaultFreeQuota: QuotaInfo = {
      device_id: deviceId,
      tier: 'free',
      is_pro: false,
      monthly_usage: 0,
      monthly_limit: 30000,
      remaining_chars: 30000,
      percent_used: 0.0,
      billing_cycle: currentCycle,
    };
    await DeviceManager.saveQuotaCache(defaultFreeQuota);
    return defaultFreeQuota;
  }

  /**
   * Redeem Promo or VIP License Code
   */
  public static async redeemLicense(code: string): Promise<{ success: boolean; message: string; quota?: QuotaInfo }> {
    const engine = KokoroOnDeviceEngine.getInstance();
    const activeUrl = await engine.probeActiveServer();
    const serverUrl = activeUrl || 'https://saytts.site';
    const deviceId = await DeviceManager.getDeviceId();
    const fingerprint = await DeviceManager.getFingerprint();

    const url = `${serverUrl.replace(/\/$/, '')}/v1/user/redeem-license`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Device-Id': deviceId,
        'X-Device-Fingerprint': fingerprint,
        'Bypass-Tunnel-Reminder': 'true',
        'ngrok-skip-browser-warning': 'true',
      },
      body: JSON.stringify({
        device_id: deviceId,
        code: code.trim(),
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.detail || data.message || 'Failed to redeem license code.');
    }

    if (data.quota) {
      await DeviceManager.saveQuotaCache(data.quota);
    }

    return {
      success: true,
      message: data.message || 'License activated successfully!',
      quota: data.quota,
    };
  }

  /**
   * Request a Stripe / Payment Checkout URL for upgrading to Pro
   */
  public static async createCheckoutSession(): Promise<string | null> {
    const engine = KokoroOnDeviceEngine.getInstance();
    const activeUrl = await engine.probeActiveServer();
    const serverUrl = activeUrl || 'https://saytts.site';
    const deviceId = await DeviceManager.getDeviceId();
    const fingerprint = await DeviceManager.getFingerprint();

    const url = `${serverUrl.replace(/\/$/, '')}/v1/billing/create-checkout-session`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Device-Id': deviceId,
        'X-Device-Fingerprint': fingerprint,
        'Bypass-Tunnel-Reminder': 'true',
        'ngrok-skip-browser-warning': 'true',
      },
      body: JSON.stringify({
        device_id: deviceId,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.detail || 'Could not reach billing service.');
    }

    return data.checkout_url || null;
  }
}
