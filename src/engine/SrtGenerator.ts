import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SAF_DIR_KEY = '@kokoro_saf_download_dir';

export interface SubtitleSegment {
  index: number;
  startTime: number; // in seconds
  endTime: number; // in seconds
  text: string;
}

export class SrtGenerator {
  /**
   * Format seconds to SRT timestamp format (HH:MM:SS,mmm)
   */
  public static formatTime(seconds: number): string {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);

    const pad = (n: number, z: number = 2) => String(n).padStart(z, '0');
    return `${pad(hrs)}:${pad(mins)}:${pad(secs)},${pad(ms, 3)}`;
  }

  /**
   * Split full text into sentence segments with estimated timing proportional to length
   */
  public static generateSubtitles(text: string, totalDuration: number): SubtitleSegment[] {
    const rawSentences = text
      .split(/(?<=[.!?\n])\s+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    if (rawSentences.length === 0) {
      return [{ index: 1, startTime: 0, endTime: totalDuration, text }];
    }

    const totalChars = rawSentences.reduce((acc, s) => acc + s.length, 0);
    const segments: SubtitleSegment[] = [];
    let currentTime = 0;

    rawSentences.forEach((sentence, idx) => {
      const charRatio = sentence.length / totalChars;
      const duration = charRatio * totalDuration;
      const endTime = Math.min(totalDuration, currentTime + duration);

      segments.push({
        index: idx + 1,
        startTime: currentTime,
        endTime,
        text: sentence,
      });

      currentTime = endTime;
    });

    return segments;
  }

  /**
   * Convert segments to standard SRT string
   */
  public static toSrtString(segments: SubtitleSegment[]): string {
    return segments
      .map((seg) => {
        return `${seg.index}\n${this.formatTime(seg.startTime)} --> ${this.formatTime(seg.endTime)}\n${seg.text}\n`;
      })
      .join('\n');
  }

  /**
   * Export .SRT file to app storage and return local URI
   */
  public static async exportSrtFile(text: string, duration: number, filename: string): Promise<string> {
    const segments = this.generateSubtitles(text, duration);
    const srtContent = this.toSrtString(segments);
    const fileUri = `${FileSystem.documentDirectory}${filename.replace(/\.wav$/i, '')}.srt`;

    await FileSystem.writeAsStringAsync(fileUri, srtContent, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    return fileUri;
  }

  /**
   * Save .SRT file directly to device Downloads folder (same location as WAV file)
   */
  public static async saveSrtToDownloads(text: string, duration: number, filename: string = 'kokoro_subtitles.srt'): Promise<boolean> {
    const segments = this.generateSubtitles(text, duration);
    const srtContent = this.toSrtString(segments);
    const baseName = filename.replace(/\.wav$/i, '').replace(/\.srt$/i, '');
    const safeName = `${baseName}.srt`;
    const localUri = `${FileSystem.documentDirectory}${safeName}`;

    await FileSystem.writeAsStringAsync(localUri, srtContent, {
      encoding: FileSystem.EncodingType.UTF8,
    });

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
          const createdUri = await FileSystem.StorageAccessFramework.createFileAsync(
            dirUri,
            safeName,
            'application/x-subrip'
          );
          await FileSystem.writeAsStringAsync(createdUri, srtContent, {
            encoding: FileSystem.EncodingType.UTF8,
          });
          return true;
        }
      } catch (e) {
        console.warn('StorageAccessFramework SRT save error, falling back to share:', e);
      }
    }

    // Fallback on iOS or if SAF not granted: trigger native share / save dialog
    await this.shareSrt(localUri);
    return true;
  }

  public static async shareSrt(fileUri: string): Promise<void> {
    const isAvailable = await Sharing.isAvailableAsync();
    if (!isAvailable) {
      throw new Error('Sharing is not available on this device');
    }
    await Sharing.shareAsync(fileUri, {
      dialogTitle: 'Export Subtitles (.srt)',
      UTI: 'public.plain-text',
      mimeType: 'text/plain',
    });
  }
}
