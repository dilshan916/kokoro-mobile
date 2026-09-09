import * as FileSystem from 'expo-file-system/legacy';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ModelVariant {
  id: 'q8_fast' | 'fp16_balanced' | 'fp32_master';
  name: string;
  badge: string;
  sizeMb: number;
  expectedBytes: number;
  description: string;
  filename: string;
  downloadUrl: string;
}

export const MODEL_VARIANTS: ModelVariant[] = [
  {
    id: 'q8_fast',
    name: 'Mobile Turbo (INT8)',
    badge: 'Fastest • Saves Battery',
    sizeMb: 88,
    expectedBytes: 92361271,
    description: 'Optimized 8-bit quantization for rapid generation with minimal battery usage.',
    filename: 'kokoro-v1.0.int8.onnx',
    downloadUrl: 'https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/kokoro-v1.0.int8.onnx',
  },
  {
    id: 'fp16_balanced',
    name: 'Balanced Studio (FP16)',
    badge: 'Balanced • High Speed',
    sizeMb: 165,
    expectedBytes: 165000000,
    description: 'Half-precision 16-bit float model offering high fidelity and reduced memory footprint.',
    filename: 'kokoro-v1.0.fp16.onnx',
    downloadUrl: 'https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/kokoro-v1.0.fp16.onnx',
  },
  {
    id: 'fp32_master',
    name: 'Master Studio (FP32)',
    badge: '100% Studio Reference',
    sizeMb: 325,
    expectedBytes: 325532387,
    description: 'Full uncompressed 32-bit floating-point neural weights for maximum audio precision.',
    filename: 'kokoro-v1.0.onnx',
    downloadUrl: 'https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/kokoro-v1.0.onnx',
  },
];

const ACTIVE_MODEL_KEY = '@kokoro_active_model_variant';
const ACTIVE_MODEL_PATH_KEY = '@kokoro_active_model_path';

export class ModelDownloader {
  /**
   * Get target directory for storing ONNX models
   */
  public static getModelsDir(): string {
    return `${FileSystem.documentDirectory}models/`;
  }

  /**
   * Ensure models directory exists
   */
  public static async ensureModelsDir(): Promise<void> {
    const dir = this.getModelsDir();
    const info = await FileSystem.getInfoAsync(dir);
    if (!info.exists) {
      await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
    }
  }

  /**
   * Check if a specific model variant is downloaded and verified on device
   */
  public static async isModelDownloaded(variant: ModelVariant): Promise<boolean> {
    try {
      const filePath = `${this.getModelsDir()}${variant.filename}`;
      const info = await FileSystem.getInfoAsync(filePath);
      // Validated if file exists and size is at least 30MB
      const minSize = Math.max(30 * 1024 * 1024, variant.expectedBytes * 0.70);
      return info.exists && (info.size || 0) >= minSize;
    } catch {
      return false;
    }
  }

  /**
   * Get file size of downloaded model in bytes
   */
  public static async getDownloadedSize(variant: ModelVariant): Promise<number> {
    try {
      const filePath = `${this.getModelsDir()}${variant.filename}`;
      const info = await FileSystem.getInfoAsync(filePath);
      return info.exists ? (info.size || 0) : 0;
    } catch {
      return 0;
    }
  }

  /**
   * Get the active model variant ID
   */
  public static async getActiveModelId(): Promise<string> {
    const stored = await AsyncStorage.getItem(ACTIVE_MODEL_KEY);
    return stored || 'q8_fast';
  }

  /**
   * Set active model variant ID and update absolute path
   */
  public static async setActiveModelId(id: string): Promise<void> {
    await AsyncStorage.setItem(ACTIVE_MODEL_KEY, id);
    const variant = MODEL_VARIANTS.find((v) => v.id === id) || MODEL_VARIANTS[0];
    const path = `${this.getModelsDir()}${variant.filename}`;
    await AsyncStorage.setItem(ACTIVE_MODEL_PATH_KEY, path);
  }

  /**
   * Get absolute path to active model file if downloaded, with auto-fallback to any available variant
   */
  public static async getActiveModelPath(): Promise<string | null> {
    // 1. Check selected active variant
    const activeId = await this.getActiveModelId();
    const activeVariant = MODEL_VARIANTS.find((v) => v.id === activeId);
    if (activeVariant && await this.isModelDownloaded(activeVariant)) {
      return `${this.getModelsDir()}${activeVariant.filename}`;
    }

    // 2. Auto-search across all variants in priority order: q8_fast -> fp16_balanced -> fp32_master
    const searchOrder: ModelVariant['id'][] = ['q8_fast', 'fp16_balanced', 'fp32_master'];
    for (const id of searchOrder) {
      const variant = MODEL_VARIANTS.find((v) => v.id === id);
      if (variant && await this.isModelDownloaded(variant)) {
        await this.setActiveModelId(variant.id);
        return `${this.getModelsDir()}${variant.filename}`;
      }
    }

    return null;
  }

  /**
   * Download a model variant with progress tracking and post-download file integrity verification
   */
  public static async downloadModel(
    variant: ModelVariant,
    onProgress: (progress: number, bytesWritten: number, totalBytes: number) => void
  ): Promise<string> {
    await this.ensureModelsDir();
    const destinationPath = `${this.getModelsDir()}${variant.filename}`;

    // 1. If already downloaded and verified, return immediately
    const alreadyValid = await this.isModelDownloaded(variant);
    if (alreadyValid) {
      await this.setActiveModelId(variant.id);
      return destinationPath;
    }

    // 2. Download with resumable stream and live progress
    const downloadResumable = FileSystem.createDownloadResumable(
      variant.downloadUrl,
      destinationPath,
      {},
      (downloadProgress) => {
        const expected = downloadProgress.totalBytesExpectedToWrite > 0
          ? downloadProgress.totalBytesExpectedToWrite
          : variant.expectedBytes;
        const progress = Math.min(1.0, downloadProgress.totalBytesWritten / expected);
        onProgress(progress, downloadProgress.totalBytesWritten, expected);
      }
    );

    const result = await downloadResumable.downloadAsync();
    if (!result || !result.uri) {
      throw new Error('Download failed to produce a valid file');
    }

    // 3. Post-Download Integrity Verification Check
    const fileInfo = await FileSystem.getInfoAsync(destinationPath);
    if (!fileInfo.exists || (fileInfo.size || 0) < variant.expectedBytes * 0.85) {
      // Incomplete download - remove corrupted file
      try {
        await FileSystem.deleteAsync(destinationPath);
      } catch (_) {}
      throw new Error('Downloaded file size verification failed. Please check internet connection and retry.');
    }

    // 4. Activate model in app state
    await this.setActiveModelId(variant.id);
    return result.uri;
  }

  /**
   * Delete a downloaded model file to free up storage space
   */
  public static async deleteModel(variant: ModelVariant): Promise<void> {
    try {
      const filePath = `${this.getModelsDir()}${variant.filename}`;
      const info = await FileSystem.getInfoAsync(filePath);
      if (info.exists) {
        await FileSystem.deleteAsync(filePath);
      }
    } catch (e) {
      console.warn('Failed to delete model file:', e);
    }
  }
}
