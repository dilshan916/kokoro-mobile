import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import { Play, Pause, RotateCcw, Download, Share2, FileText } from 'lucide-react-native';
import Colors from '../constants/Colors';
import { AudioExporter } from '../engine/AudioExporter';
import { SrtGenerator } from '../engine/SrtGenerator';
import { ToastNotification } from './ToastNotification';

interface AudioWaveformPlayerProps {
  fileUri: string;
  duration?: number;
  title?: string;
  text?: string;
  voiceName?: string;
}

export const AudioWaveformPlayer: React.FC<AudioWaveformPlayerProps> = ({
  fileUri,
  duration = 0,
  title = 'Kokoro Speech',
  text = '',
  voiceName = 'Heart',
}) => {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [positionMillis, setPositionMillis] = useState(0);
  const [durationMillis, setDurationMillis] = useState(duration * 1000);
  const [isLoading, setIsLoading] = useState(false);
  const [waveformPeaks, setWaveformPeaks] = useState<number[]>([]);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    loadAudio();
    if (fileUri) {
      AudioExporter.extractWaveformFromUri(fileUri, 44).then((peaks) => {
        if (peaks && peaks.length > 0) {
          setWaveformPeaks(peaks);
        }
      });
    }
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [fileUri]);

  const loadAudio = async () => {
    if (!fileUri) {
      setIsLoading(false);
      return;
    }
    try {
      if (sound) {
        await sound.unloadAsync();
      }
      setIsLoading(true);
      const { sound: newSound, status } = await Audio.Sound.createAsync(
        { uri: fileUri },
        { shouldPlay: false },
        onPlaybackStatusUpdate
      );
      setSound(newSound);
      if (status.isLoaded) {
        setDurationMillis(status.durationMillis || duration * 1000);
      }
      setIsLoading(false);
    } catch (error) {
      console.warn('Failed to load audio sound:', error);
      setIsLoading(false);
    }
  };

  const onPlaybackStatusUpdate = (status: any) => {
    if (status.isLoaded) {
      setPositionMillis(status.positionMillis);
      setDurationMillis(status.durationMillis || durationMillis);
      setIsPlaying(status.isPlaying);
      if (status.didJustFinish) {
        setIsPlaying(false);
        setPositionMillis(0);
      }
    }
  };

  const togglePlayback = async () => {
    if (!sound) {
      if (text) {
        Speech.stop();
        Speech.speak(text);
      }
      return;
    }
    if (isPlaying) {
      await sound.pauseAsync();
    } else {
      if (positionMillis >= durationMillis) {
        await sound.setPositionAsync(0);
      }
      await sound.playAsync();
    }
  };

  const restartAudio = async () => {
    if (!sound) {
      if (text) {
        Speech.stop();
        Speech.speak(text);
      }
      return;
    }
    await sound.setPositionAsync(0);
    await sound.playAsync();
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setToastVisible(true);
  };

  const handleDownloadWav = async () => {
    if (!fileUri) {
      showToast('Speaking via On-Device Engine');
      return;
    }
    try {
      const cleanName = `${title.slice(0, 20).replace(/[^a-zA-Z0-9_-]/g, '_')}_${Date.now()}.wav`;
      const success = await AudioExporter.saveToDownloads(fileUri, cleanName);
      if (success) {
        showToast('✓ Saved to Downloads');
      }
    } catch (e: any) {
      Alert.alert('Save Failed', e.message || 'Could not save audio file');
    }
  };

  const handleShareWav = async () => {
    if (!fileUri) {
      showToast('No audio to share');
      return;
    }
    try {
      await AudioExporter.shareFile(fileUri, `Share ${title}`);
    } catch (e: any) {
      Alert.alert('Export Failed', e.message);
    }
  };

  const handleExportSrt = async () => {
    try {
      const durSec = (durationMillis || 1000) / 1000;
      const cleanName = `${title.slice(0, 24).replace(/[^a-zA-Z0-9_-]/g, '_') || 'kokoro_speech'}.srt`;
      const success = await SrtGenerator.saveSrtToDownloads(text || title, durSec, cleanName);
      if (success) {
        showToast('✓ Saved .SRT to Downloads');
      }
    } catch (e: any) {
      Alert.alert('SRT Save Failed', e.message || 'Could not save subtitles file');
    }
  };

  const formatTime = (ms: number) => {
    const totalSec = Math.floor(ms / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progressPercent = durationMillis > 0 ? (positionMillis / durationMillis) * 100 : 0;

  const barsCount = 44;
  const waveformBars = Array.from({ length: barsCount }, (_, idx) => {
    let barHeight = 4;
    if (waveformPeaks && waveformPeaks.length > idx) {
      barHeight = waveformPeaks[idx];
    } else {
      // Fallback gentle wave while loading
      const heightRatio = 0.2 + 0.6 * Math.abs(Math.sin(idx * 0.48 + 1.1) * Math.cos(idx * 0.22));
      barHeight = Math.max(4, heightRatio * 32);
    }
    const isPast = (idx / barsCount) * 100 <= progressPercent;
    return { id: idx, height: Math.max(3, Math.min(34, barHeight)), isPast };
  });

  return (
    <View style={styles.container}>
      {/* Top Details & Action Buttons */}
      <View style={styles.topRow}>
        <View style={styles.infoCol}>
          <Text style={styles.titleText} numberOfLines={1}>
            {title}
          </Text>
          <Text style={styles.subText}>
            Voice: <Text style={styles.voiceHighlight}>{voiceName}</Text>
          </Text>
        </View>

        <View style={styles.actionsGroup}>
          {/* Download Audio to Downloads */}
          <TouchableOpacity
            style={[styles.actionBtn, { borderColor: 'rgba(52, 211, 153, 0.35)' }]}
            onPress={handleDownloadWav}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <Download size={16} color={Colors.accentSuccess} />
          </TouchableOpacity>

          {/* Share Audio */}
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={handleShareWav}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <Share2 size={16} color={Colors.primary} />
          </TouchableOpacity>

          {/* Save Subtitles .SRT to Downloads */}
          <TouchableOpacity
            style={[styles.actionBtn, { borderColor: 'rgba(167, 139, 250, 0.35)' }]}
            onPress={handleExportSrt}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <FileText size={16} color={Colors.secondary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Waveform Visualization */}
      <View style={styles.waveformRow}>
        {waveformBars.map((bar) => (
          <View
            key={bar.id}
            style={[
              styles.bar,
              {
                height: bar.height,
                backgroundColor: bar.isPast ? Colors.primary : 'rgba(255, 255, 255, 0.15)',
              },
            ]}
          />
        ))}
      </View>

      {/* Play Controls & Time Track */}
      <View style={styles.controlsRow}>
        <TouchableOpacity style={styles.playBtn} onPress={togglePlayback} disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator size="small" color="#070a12" />
          ) : isPlaying ? (
            <Pause size={18} color="#070a12" fill="#070a12" />
          ) : (
            <Play size={18} color="#070a12" fill="#070a12" style={{ marginLeft: 2 }} />
          )}
        </TouchableOpacity>

        <View style={styles.trackCol}>
          <View style={styles.trackBg}>
            <View style={[styles.trackFill, { width: `${progressPercent}%` }]} />
          </View>
          <View style={styles.timeRow}>
            <Text style={styles.timeLabel}>{formatTime(positionMillis)}</Text>
            <Text style={styles.timeLabel}>{formatTime(durationMillis)}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.restartBtn} onPress={restartAudio} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
          <RotateCcw size={16} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Bottom Fading Toast Notification */}
      <ToastNotification
        visible={toastVisible}
        message={toastMessage}
        onHide={() => setToastVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoCol: {
    flex: 1,
    marginRight: 8,
  },
  titleText: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  subText: {
    color: Colors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  voiceHighlight: {
    color: Colors.primary,
    fontWeight: '600',
  },
  actionsGroup: {
    flexDirection: 'row',
    gap: 6,
  },
  actionBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  waveformRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 38,
    marginVertical: 6,
    paddingHorizontal: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.22)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
  },
  bar: {
    width: 2.5,
    borderRadius: 1.5,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  playBtn: {
    backgroundColor: Colors.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  trackCol: {
    flex: 1,
    gap: 4,
  },
  trackBg: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  trackFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeLabel: {
    color: Colors.textMuted,
    fontSize: 10,
    fontVariant: ['tabular-nums'],
  },
  restartBtn: {
    padding: 6,
  },
});
