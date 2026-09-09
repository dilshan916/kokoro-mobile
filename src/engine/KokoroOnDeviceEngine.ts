import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
import * as Speech from 'expo-speech';
import { Tokenizer } from './Tokenizer';
import { VoiceBlender } from './VoiceBlender';
import { AudioExporter } from './AudioExporter';
import { ModelDownloader } from './ModelDownloader';
import { KokoroWasmRunnerRef } from './KokoroWasmRunner';
import { DeviceManager } from './DeviceManager';

export interface GenerationRequest {
  text: string;
  voiceId: string;
  secondaryVoiceId?: string;
  blendRatio?: number; // 0.0 to 1.0
  speed?: number; // 0.5 to 2.0
  pitch?: number; // 0.5 to 1.5
  presetId?: string;
}

export interface GenerationResult {
  id: string;
  title: string;
  text: string;
  voiceName: string;
  voiceId: string;
  secondaryVoiceId?: string;
  blendRatio?: number;
  speed: number;
  duration: number;
  fileUri: string;
  srtUri?: string;
  timestamp: number;
  isOffline: boolean;
}

const SETTINGS_KEY = 'KOKORO_SETTINGS';
const HISTORY_KEY = 'KOKORO_GENERATION_HISTORY';

export const CLOUD_STUDIO_URL = 'https://saytts.site';

export interface AppSettings {
  engineMode: 'cloud_studio' | 'offline_on_device';
  lanServerUrl: string;
  autoSaveHistory: boolean;
  hapticFeedback: boolean;
}

// List of candidate cloud & fallback tunnel addresses
export const DEFAULT_CANDIDATE_URLS = [
  CLOUD_STUDIO_URL,
  'https://saytts.site',
  'http://161.118.193.63:8000',
  'http://localhost:8000',
];

export const DEFAULT_SETTINGS: AppSettings = {
  engineMode: 'cloud_studio',
  lanServerUrl: CLOUD_STUDIO_URL,
  autoSaveHistory: true,
  hapticFeedback: true,
};

export class KokoroOnDeviceEngine {
  private static instance: KokoroOnDeviceEngine;
  private settings: AppSettings = DEFAULT_SETTINGS;
  private isInitialized = false;
  private activeServerUrl: string | null = null;
  private lastProbeTime = 0;
  private wasmRunner: KokoroWasmRunnerRef | null = null;

  public static getInstance(): KokoroOnDeviceEngine {
    if (!KokoroOnDeviceEngine.instance) {
      KokoroOnDeviceEngine.instance = new KokoroOnDeviceEngine();
    }
    return KokoroOnDeviceEngine.instance;
  }

  public registerWasmRunner(runner: KokoroWasmRunnerRef | null): void {
    this.wasmRunner = runner;
    if (runner) {
      ModelDownloader.getActiveModelPath().then((path) => {
        if (path) {
          runner.loadModel(path).catch(() => {});
        }
      });
    }
  }

  public getWasmRunner(): KokoroWasmRunnerRef | null {
    return this.wasmRunner;
  }

  public async init(): Promise<void> {
    if (this.isInitialized) return;
    try {
      const stored = await AsyncStorage.getItem(SETTINGS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Auto-migrate stale ngrok / localtunnel / trycloudflare / old urls to active cloud VPS
        if (!parsed.lanServerUrl || parsed.lanServerUrl.includes('trycloudflare') || parsed.lanServerUrl.includes('ngrok') || parsed.lanServerUrl.includes('loca.lt') || parsed.lanServerUrl.includes('161.118.193.63')) {
          parsed.lanServerUrl = CLOUD_STUDIO_URL;
          await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(parsed));
        }
        this.settings = { ...DEFAULT_SETTINGS, ...parsed };
      }
      this.isInitialized = true;
    } catch (e) {
      console.warn('Failed to load settings from storage:', e);
    }
  }

  public async getSettings(): Promise<AppSettings> {
    await this.init();
    return { ...this.settings };
  }

  public async updateSettings(newSettings: Partial<AppSettings>): Promise<AppSettings> {
    await this.init();
    this.settings = { ...this.settings, ...newSettings };
    this.activeServerUrl = null;
    this.lastProbeTime = 0;
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(this.settings));
    return { ...this.settings };
  }

  /**
   * Probes active cloud studio server endpoint
   */
  public async probeActiveServer(force = false): Promise<string | null> {
    if (this.settings.engineMode === 'offline_on_device') {
      this.activeServerUrl = null;
      return null;
    }

    const targetUrl = (this.settings.lanServerUrl || CLOUD_STUDIO_URL).replace(/\/$/, '');
    this.activeServerUrl = targetUrl;
    this.lastProbeTime = Date.now();
    return targetUrl;
  }

  /**
   * Main Text-To-Speech Synthesis Method (Auto-routes to Server or On-Device ONNX)
   */
  public async synthesize(
    request: GenerationRequest,
    onStatus?: (status: string) => void
  ): Promise<GenerationResult> {
    await this.init();
    const speed = request.speed ?? 1.0;
    const pitch = request.pitch ?? 1.0;

    // 1. Attempt High-Fidelity Kokoro Neural Synthesis via Cloud Studio Server
    if (this.settings.engineMode === 'cloud_studio') {
      const serverUrl = (this.settings.lanServerUrl || CLOUD_STUDIO_URL).replace(/\/$/, '');
      if (onStatus) onStatus('Rendering via Cloud GPU (24kHz)...');
      try {
        return await this.synthesizeViaServer(serverUrl, request);
      } catch (err: any) {
        const errMsg = err?.message || '';
        // If quota was exceeded or server returned 402, throw directly
        if (errMsg.includes('quota') || errMsg.includes('Quota') || errMsg.includes('402')) {
          throw err;
        }

        // Check if an on-device model is available to fall back to
        const modelPath = await ModelDownloader.getActiveModelPath();
        if (!modelPath) {
          throw new Error(
            `Could not reach Cloud Studio Server.\n\n` +
            `1. Make sure 'start_permanent_server.bat' is running on your PC.\n` +
            `2. Or download an offline voice model in Settings -> Offline Models to generate speech without PC/Wi-Fi.`
          );
        }
        console.warn('Cloud Server synthesis failed, falling back to on-device neural model:', err);
      }
    }

    // 2. True 100% On-Device Neural Kokoro ONNX Inference
    const modelPath = await ModelDownloader.getActiveModelPath();
    if (!modelPath) {
      throw new Error(
        'No Kokoro ONNX model found on device.\n\nPlease open Settings -> Model Downloads and download any model variant (e.g. Mobile Turbo INT8 or Master FP32).'
      );
    }

    if (!this.wasmRunner) {
      throw new Error('On-Device Neural Engine is initializing. Please wait a moment and tap Synthesize again.');
    }

    // Ensure model is loaded into WebAssembly
    await this.wasmRunner.loadModel(modelPath, onStatus);

    if (onStatus) onStatus('Tokenizing phonemes & style vector...');
    const tokens = Tokenizer.tokenize(request.text);
    const style = VoiceBlender.getBlendedEmbedding(
      request.voiceId,
      request.secondaryVoiceId,
      request.blendRatio
    );

    const reqId = `wasm_${Date.now()}`;
    const wasmRes = await this.wasmRunner.synthesize(
      {
        requestId: reqId,
        tokens,
        style,
        speed,
      },
      onStatus
    );

    if (!wasmRes.success || !wasmRes.wavBase64) {
      throw new Error(wasmRes.error || 'On-device neural synthesis failed in WebAssembly engine.');
    }

    const id = `kokoro_onnx_${Date.now()}`;
    const filename = `${id}.wav`;
    const fileUri = await AudioExporter.saveWavFile(wasmRes.wavBase64, filename);
    const title = request.text.slice(0, 30).trim() || 'Kokoro Offline Neural';

    const result: GenerationResult = {
      id,
      title: title.length >= 30 ? `${title}...` : title,
      text: request.text,
      voiceName: request.voiceId,
      voiceId: request.voiceId,
      secondaryVoiceId: request.secondaryVoiceId,
      blendRatio: request.blendRatio,
      speed,
      duration: wasmRes.duration ?? Math.max(1.5, (request.text.length * 0.06) / speed),
      fileUri,
      timestamp: Date.now(),
      isOffline: true,
    };

    if (this.settings.autoSaveHistory) {
      await this.saveToHistory(result);
    }
    return result;
  }

  /**
   * Synthesize via Desktop Studio REST /render Endpoint
   */
  private async synthesizeViaServer(serverUrl: string, request: GenerationRequest): Promise<GenerationResult> {
    const url = `${serverUrl.replace(/\/$/, '')}/render`;

    const presetMap: Record<string, string> = {
      studio_reference: 'Clean Studio (Default)',
      warm_podcast: 'Warm Podcast',
      crisp_commercial: 'Crisp Commercial',
      radio_broadcast: 'Radio Broadcast (Punchy)',
      raw_unprocessed: 'Raw Unprocessed',
    };

    const body: Record<string, any> = {
      text: request.text,
      voice_id: request.voiceId,
      speed: request.speed ?? 1.0,
      pitch: request.pitch ?? 1.0,
      eq_preset: presetMap[request.presetId || 'studio_reference'] || 'Clean Studio (Default)',
    };

    const deviceId = await DeviceManager.getDeviceId();
    const fingerprint = await DeviceManager.getFingerprint();
    body.device_id = deviceId;

    if (request.secondaryVoiceId && request.blendRatio !== undefined && request.blendRatio > 0) {
      body.secondary_voice_id = request.secondaryVoiceId;
      body.blend_ratio = request.blendRatio;
    }

    // Dynamic timeout for long texts: base 120s + 20s per 1000 chars (up to 5 min)
    const timeoutMs = Math.max(120000, Math.min(300000, Math.ceil(request.text.length * 35) + 60000));
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    let response: Response;
    try {
      response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Device-Id': deviceId,
          'X-Device-Fingerprint': fingerprint,
          'Bypass-Tunnel-Reminder': 'true',
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
    } catch (fetchErr: any) {
      clearTimeout(timeoutId);
      if (fetchErr.name === 'AbortError') {
        throw new Error(`Rendering timed out after ${Math.round(timeoutMs / 1000)}s. Please try generating in smaller chunks.`);
      }
      throw fetchErr;
    } finally {
      clearTimeout(timeoutId);
    }

    if (!response.ok) {
      if (response.status === 402) {
        const errData = await response.json().catch(() => ({}));
        const detail = errData.detail || {};
        const msg = typeof detail === 'string' ? detail : (detail.message || 'Monthly free Cloud GPU quota reached (30,000 characters). Switch to On-Device Offline Engine or Upgrade to Pro.');
        throw new Error(msg);
      }
      throw new Error(`Studio server returned HTTP ${response.status}`);
    }

    const data = await response.json();
    const id = `kokoro_${Date.now()}`;
    const filename = `${id}.wav`;

    let fileUri = '';
    if (data.audio_base64) {
      fileUri = await AudioExporter.saveWavFile(data.audio_base64, filename);
    } else if (data.audio_url) {
      fileUri = data.audio_url.startsWith('http')
        ? data.audio_url
        : `${serverUrl.replace(/\/$/, '')}${data.audio_url}`;
    }

    const title = request.text.slice(0, 30).trim() || 'Kokoro Studio Render';

    const result: GenerationResult = {
      id,
      title: title.length >= 30 ? `${title}...` : title,
      text: request.text,
      voiceName: data.voice_name || request.voiceId,
      voiceId: request.voiceId,
      secondaryVoiceId: request.secondaryVoiceId,
      blendRatio: request.blendRatio,
      speed: request.speed ?? 1.0,
      duration: data.duration ?? 3.0,
      fileUri,
      srtUri: data.srt_content ? filename.replace(/\.wav$/, '.srt') : undefined,
      timestamp: Date.now(),
      isOffline: false,
    };

    if (this.settings.autoSaveHistory) {
      await this.saveToHistory(result);
    }

    return result;
  }

  /**
   * Save result to local device storage history
   */
  public async saveToHistory(item: GenerationResult): Promise<void> {
    try {
      const history = await this.getHistory();
      const updated = [item, ...history.filter((h) => h.id !== item.id)].slice(0, 50);
      await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save to history:', e);
    }
  }

  /**
   * Retrieve saved history
   */
  public async getHistory(): Promise<GenerationResult[]> {
    try {
      const raw = await AsyncStorage.getItem(HISTORY_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  /**
   * Delete item from history
   */
  public async deleteHistoryItem(id: string): Promise<void> {
    try {
      const history = await this.getHistory();
      const filtered = history.filter((h) => h.id !== id);
      await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(filtered));
    } catch (e) {
      console.warn('Failed to delete history item:', e);
    }
  }
}
