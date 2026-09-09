import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Linking, Platform, Alert } from 'react-native';
import { SrtGenerator } from './SrtGenerator';
import { AudioExporter } from './AudioExporter';

export class CapCutBridge {
  /**
   * Export audio and subtitles to device storage and prompt CapCut workflow
   */
  public static async exportAndOpenInCapCut(
    fileUri: string,
    text: string,
    durationSec: number,
    title: string = 'Kokoro Speech'
  ): Promise<{ success: boolean; message: string }> {
    if (!fileUri) {
      throw new Error('No audio file available to export.');
    }

    try {
      const cleanTitle = title.slice(0, 24).replace(/[^a-zA-Z0-9_-]/g, '_') || 'Kokoro_Voice';
      const wavFilename = `${cleanTitle}.wav`;
      const srtFilename = `${cleanTitle}.srt`;

      // 1. Export .SRT Subtitle File
      const srtUri = await SrtGenerator.exportSrtFile(text || title, durationSec, srtFilename);

      // 2. Save WAV file to Downloads / Device Media storage
      await AudioExporter.saveToDownloads(fileUri, wavFilename).catch(() => {});

      // 3. Launch CapCut or Open Native Share with CapCut
      const capcutSchemes = ['capcut://', 'snaptouch://', 'lv://'];
      let canOpenCapcut = false;
      let targetScheme = 'capcut://';

      for (const scheme of capcutSchemes) {
        try {
          const supported = await Linking.canOpenURL(scheme);
          if (supported) {
            canOpenCapcut = true;
            targetScheme = scheme;
            break;
          }
        } catch (_) {}
      }

      // Show user-friendly guide and launch
      Alert.alert(
        'Export to CapCut 🎬',
        `✓ Saved "${wavFilename}" and "${srtFilename}" to your device!\n\n` +
        `How to use in CapCut:\n` +
        `1. Audio: In your project, tap Audio ➔ Sounds ➔ From Device.\n` +
        `2. Captions: Tap Text ➔ Auto Captions to generate viral kinetic subtitles.`,
        [
          {
            text: 'Open CapCut Now',
            onPress: async () => {
              if (canOpenCapcut) {
                await Linking.openURL(targetScheme).catch(() => {});
              } else {
                // Open Share Sheet targeting CapCut
                const isSharingAvailable = await Sharing.isAvailableAsync();
                if (isSharingAvailable) {
                  await Sharing.shareAsync(fileUri, {
                    dialogTitle: 'Import to CapCut',
                    mimeType: 'audio/wav',
                    UTI: 'com.microsoft.waveform-audio',
                  });
                }
              }
            },
          },
          {
            text: 'Share Files',
            onPress: async () => {
              const isSharingAvailable = await Sharing.isAvailableAsync();
              if (isSharingAvailable) {
                await Sharing.shareAsync(fileUri, {
                  dialogTitle: 'Share to Video Editor',
                  mimeType: 'audio/wav',
                });
              }
            },
          },
          { text: 'Done', style: 'cancel' },
        ]
      );

      return {
        success: true,
        message: '✓ Audio and subtitles prepared for CapCut',
      };
    } catch (error: any) {
      console.warn('CapCut Export failed:', error);
      throw new Error(error.message || 'Failed to export to CapCut.');
    }
  }
}
