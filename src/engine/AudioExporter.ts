import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SAF_DIR_KEY = '@kokoro_saf_download_dir';

export class AudioExporter {
  /**
   * Convert Float32Array PCM samples (24000 Hz) to a standard 16-bit PCM WAV base64 string
   */
  public static pcmToWavBase64(samples: Float32Array, sampleRate: number = 24000): string {
    const numChannels = 1;
    const bitsPerSample = 16;
    const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
    const blockAlign = (numChannels * bitsPerSample) / 8;
    const dataSize = samples.length * 2;
    const buffer = new ArrayBuffer(44 + dataSize);
    const view = new DataView(buffer);

    // RIFF identifier
    this.writeString(view, 0, 'RIFF');
    // RIFF chunk length
    view.setUint32(4, 36 + dataSize, true);
    // RIFF type
    this.writeString(view, 8, 'WAVE');
    // format chunk identifier
    this.writeString(view, 12, 'fmt ');
    // format chunk length
    view.setUint32(16, 16, true);
    // sample format (raw PCM)
    view.setUint16(20, 1, true);
    // channel count
    view.setUint16(22, numChannels, true);
    // sample rate
    view.setUint32(24, sampleRate, true);
    // byte rate
    view.setUint32(28, byteRate, true);
    // block align
    view.setUint16(32, blockAlign, true);
    // bits per sample
    view.setUint16(34, bitsPerSample, true);
    // data chunk identifier
    this.writeString(view, 36, 'data');
    // data chunk length
    view.setUint32(40, dataSize, true);

    // Write 16-bit PCM samples with clipping protection
    let offset = 44;
    for (let i = 0; i < samples.length; i++, offset += 2) {
      const s = Math.max(-1, Math.min(1, samples[i]));
      const val = s < 0 ? s * 0x8000 : s * 0x7fff;
      view.setInt16(offset, val, true);
    }

    // Convert array buffer to binary string then base64
    const bytes = new Uint8Array(buffer);
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  private static writeString(view: DataView, offset: number, string: string): void {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }

  /**
   * Save WAV base64 data to local file and return URI
   */
  public static async saveWavFile(base64Data: string, filename: string): Promise<string> {
    const fileUri = `${FileSystem.documentDirectory}${filename}`;
    await FileSystem.writeAsStringAsync(fileUri, base64Data, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return fileUri;
  }

  /**
   * Save WAV file directly to Downloads / Internal device storage immediately
   */
  public static async saveToDownloads(fileUri: string, filename: string = 'kokoro_audio.wav'): Promise<boolean> {
    if (Platform.OS === 'android') {
      try {
        let dirUri = await AsyncStorage.getItem(SAF_DIR_KEY);
        if (!dirUri) {
          const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
          if (permissions.granted) {
            dirUri = permissions.directoryUri;
            await AsyncStorage.setItem(SAF_DIR_KEY, dirUri);
          }
        }

        if (dirUri) {
          const base64 = await FileSystem.readAsStringAsync(fileUri, {
            encoding: FileSystem.EncodingType.Base64,
          });
          const safeName = filename.endsWith('.wav') ? filename : `${filename}.wav`;
          const createdUri = await FileSystem.StorageAccessFramework.createFileAsync(
            dirUri,
            safeName,
            'audio/wav'
          );
          await FileSystem.writeAsStringAsync(createdUri, base64, {
            encoding: FileSystem.EncodingType.Base64,
          });
          return true;
        }
      } catch (e) {
        console.warn('StorageAccessFramework save error, falling back to share sheet:', e);
        // Clear cached dir in case user revoked it
        await AsyncStorage.removeItem(SAF_DIR_KEY);
      }
    }

    // Fallback on iOS or if SAF not granted: trigger native share / save dialog
    await this.shareFile(fileUri, `Save ${filename}`);
    return true;
  }

  /**
   * Open native share sheet for file URI
   */
  public static async shareFile(fileUri: string, dialogTitle: string = 'Export Audio'): Promise<void> {
    const isAvailable = await Sharing.isAvailableAsync();
    if (!isAvailable) {
      throw new Error('Sharing is not available on this device');
    }
    await Sharing.shareAsync(fileUri, {
      dialogTitle,
      UTI: 'com.microsoft.waveform-audio',
      mimeType: 'audio/wav',
    });
  }

  /**
   * Extract real CapCut-style audio waveform peak bars from raw Float32Array PCM samples
   */
  public static extractWaveformFromPcm(samples: Float32Array, numBars: number = 42): number[] {
    if (!samples || samples.length === 0) {
      return Array(numBars).fill(4);
    }
    const blockSize = Math.floor(samples.length / numBars);
    if (blockSize <= 0) {
      return Array(numBars).fill(4);
    }

    const rawPeaks: number[] = [];
    let maxVal = 0.001;

    for (let i = 0; i < numBars; i++) {
      const start = i * blockSize;
      const end = Math.min(start + blockSize, samples.length);
      let sumSq = 0;
      let count = 0;
      for (let j = start; j < end; j++) {
        const val = samples[j];
        sumSq += val * val;
        count++;
      }
      const rms = Math.sqrt(sumSq / Math.max(1, count));
      rawPeaks.push(rms);
      if (rms > maxVal) {
        maxVal = rms;
      }
    }

    // Normalize so highest peak = 32px height, silence baseline = 3px height
    return rawPeaks.map((rms) => {
      const norm = Math.min(1.0, rms / maxVal);
      const scaled = Math.pow(norm, 0.75); // Perceptual dynamic curve
      return Math.round(Math.max(3, scaled * 32));
    });
  }

  /**
   * Extract real CapCut-style audio waveform peaks from Base64 WAV data
   */
  public static extractWaveformFromBase64(base64Data: string, numBars: number = 42): number[] {
    try {
      const binary = atob(base64Data);
      const len = binary.length;
      const dataOffset = 44; // Standard WAV Header
      const pcmByteLen = len - dataOffset;
      if (pcmByteLen <= 0) return Array(numBars).fill(4);

      const numSamples = Math.floor(pcmByteLen / 2);
      const blockSize = Math.floor(numSamples / numBars);
      if (blockSize <= 0) return Array(numBars).fill(4);

      const rawPeaks: number[] = [];
      let maxVal = 1;

      for (let i = 0; i < numBars; i++) {
        const startSample = i * blockSize;
        const endSample = Math.min(startSample + blockSize, numSamples);
        let sumSq = 0;
        let count = 0;

        for (let s = startSample; s < endSample; s += 2) {
          const byteIdx = dataOffset + s * 2;
          if (byteIdx + 1 < len) {
            const low = binary.charCodeAt(byteIdx);
            const high = binary.charCodeAt(byteIdx + 1);
            let intVal = (high << 8) | low;
            if (intVal >= 0x8000) intVal -= 0x10000;
            sumSq += intVal * intVal;
            count++;
          }
        }
        const rms = Math.sqrt(sumSq / Math.max(1, count));
        rawPeaks.push(rms);
        if (rms > maxVal) {
          maxVal = rms;
        }
      }

      return rawPeaks.map((rms) => {
        const norm = Math.min(1.0, rms / maxVal);
        const scaled = Math.pow(norm, 0.75);
        return Math.round(Math.max(3, scaled * 32));
      });
    } catch (e) {
      console.warn('Waveform extraction failed:', e);
      return Array(numBars).fill(4);
    }
  }

  /**
   * Extract real CapCut-style audio waveform peaks from local file URI
   */
  public static async extractWaveformFromUri(fileUri: string, numBars: number = 42): Promise<number[]> {
    try {
      if (!fileUri || !fileUri.startsWith('file://')) {
        return Array(numBars).fill(4);
      }
      const base64 = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      return this.extractWaveformFromBase64(base64, numBars);
    } catch (e) {
      return Array(numBars).fill(4);
    }
  }
}
