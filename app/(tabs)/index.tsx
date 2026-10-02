import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import {
  ChevronDown,
  Trash2,
  Zap,
  Layers,
  Gauge,
  Music2,
} from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Linking from 'expo-linking';
import Colors from '../../src/constants/Colors';
import { HeaderStudio } from '../../src/components/HeaderStudio';
import { AudioWaveformPlayer } from '../../src/components/AudioWaveformPlayer';
import { VoiceSelectorModal } from '../../src/components/VoiceSelectorModal';
import { VoiceBlenderCard } from '../../src/components/VoiceBlenderCard';
import { VOICES_CATALOG, VoiceItem } from '../../src/constants/VoicesCatalog';
import { MASTERING_PRESETS } from '../../src/constants/MasteringPresets';
import {
  KokoroOnDeviceEngine,
  GenerationResult,
  AppSettings,
} from '../../src/engine/KokoroOnDeviceEngine';
import { resolveAutoVoice } from '../../src/engine/LanguageDetector';
import { AdService } from '../../src/engine/AdService';
import { AdsterraBanner } from '../../src/components/AdsterraBanner';
import { AdsterraInterstitialModal } from '../../src/components/AdsterraInterstitialModal';

const SPEED_OPTIONS = [0.8, 1.0, 1.25, 1.5];

export default function StudioScreen() {
  const [text, setText] = useState('Welcome to Kokoro Studio! High fidelity offline voice synthesis.');
  const [selectedVoice, setSelectedVoice] = useState<VoiceItem>(VOICES_CATALOG[0]);
  const [secondaryVoice, setSecondaryVoice] = useState<VoiceItem>(VOICES_CATALOG[1]);
  const [isBlenderActive, setIsBlenderActive] = useState(false);
  const [blendRatio, setBlendRatio] = useState(0.5);
  const [showInterstitial, setShowInterstitial] = useState(false);

  const [speedIndex, setSpeedIndex] = useState(1); // default 1.0x
  const [presetIndex, setPresetIndex] = useState(0); // default Studio Reference

  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [pickingTarget, setPickingTarget] = useState<'primary' | 'secondary'>('primary');

  const [isGenerating, setIsGenerating] = useState(false);
  const [currentResult, setCurrentResult] = useState<GenerationResult | null>(null);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [serverConnected, setServerConnected] = useState(false);

  const engine = KokoroOnDeviceEngine.getInstance();
  const insets = useSafeAreaInsets();

  useFocusEffect(
    useCallback(() => {
      loadSettings();
      checkConnection();
    }, [])
  );

  const loadSettings = async () => {
    const s = await engine.getSettings();
    setSettings(s);
  };

  const checkConnection = async () => {
    const active = await engine.probeActiveServer();
    setServerConnected(!!active);
  };

  const cycleSpeed = () => {
    setSpeedIndex((prev) => (prev + 1) % SPEED_OPTIONS.length);
  };

  const cyclePreset = () => {
    setPresetIndex((prev) => (prev + 1) % MASTERING_PRESETS.length);
  };

  const [generationStatus, setGenerationStatus] = useState('Synthesizing audio...');
  const currentSpeed = SPEED_OPTIONS[speedIndex];
  const currentPreset = MASTERING_PRESETS[presetIndex];

  const handleGenerate = async () => {
    if (!text.trim()) {
      Alert.alert('Input Required', 'Please enter some text to synthesize.');
      return;
    }

    try {
      setIsGenerating(true);
      setGenerationStatus('Preparing neural engine...');
      const result = await engine.synthesize(
        {
          text: text.trim(),
          voiceId: selectedVoice.id,
          secondaryVoiceId: isBlenderActive ? secondaryVoice.id : undefined,
          blendRatio: isBlenderActive ? blendRatio : undefined,
          speed: currentSpeed,
          pitch: 1.0,
          presetId: currentPreset.id,
        },
        (status) => {
          setGenerationStatus(status);
        }
      );

      setCurrentResult(result);
      setIsGenerating(false);
      checkConnection();

      // Trigger sponsored interstitial if eligible (Free tier)
      AdService.onGenerationCompleted().then((shouldShow) => {
        if (shouldShow) {
          setShowInterstitial(true);
        }
      });
    } catch (error: any) {
      setIsGenerating(false);
      Alert.alert('Synthesis Error', error.message || 'Failed to synthesize audio');
    }
  };

  const openPicker = (target: 'primary' | 'secondary') => {
    setPickingTarget(target);
    setIsPickerOpen(true);
  };

  const handleVoiceSelected = (voice: VoiceItem) => {
    if (pickingTarget === 'primary') {
      setSelectedVoice(voice);
    } else {
      setSecondaryVoice(voice);
    }
  };

  const swapVoices = () => {
    const temp = selectedVoice;
    setSelectedVoice(secondaryVoice);
    setSecondaryVoice(temp);
  };

  const handleTextChange = (newText: string) => {
    setText(newText);
    if (newText.trim().length >= 3) {
      const autoVoice = resolveAutoVoice(newText, selectedVoice);
      if (autoVoice && autoVoice.id !== selectedVoice.id) {
        setSelectedVoice(autoVoice);
      }
    }
  };

  const handleDeepLink = useCallback(async (url: string | null) => {
    if (!url) return;
    try {
      const parsed = Linking.parse(url);
      const incomingText = (parsed.queryParams?.text as string) || (parsed.queryParams?.q as string);
      if (incomingText && incomingText.trim()) {
        const trimmed = incomingText.trim();
        setText(trimmed);

        const targetVoice = resolveAutoVoice(trimmed, selectedVoice);
        if (targetVoice && targetVoice.id !== selectedVoice.id) {
          setSelectedVoice(targetVoice);
        }

        setIsGenerating(true);
        setGenerationStatus('Synthesizing audio...');
        const result = await engine.synthesize(
          {
            text: trimmed,
            voiceId: targetVoice?.id || selectedVoice.id,
            secondaryVoiceId: isBlenderActive ? secondaryVoice.id : undefined,
            blendRatio: isBlenderActive ? blendRatio : undefined,
            speed: currentSpeed,
            pitch: 1.0,
            presetId: currentPreset.id,
          },
          (status) => {
            setGenerationStatus(status);
          }
        );
        setCurrentResult(result);
        setIsGenerating(false);
        checkConnection();
      }
    } catch (err: any) {
      setIsGenerating(false);
    }
  }, [selectedVoice, isBlenderActive, secondaryVoice, blendRatio, currentSpeed, currentPreset]);

  // Deep Link / 1-Tap Widget Trigger (e.g. kokoromobile://synthesize?text=...)
  React.useEffect(() => {
    Linking.getInitialURL().then(handleDeepLink);
    const sub = Linking.addEventListener('url', (event) => handleDeepLink(event.url));
    return () => sub.remove();
  }, [handleDeepLink]);

  return (
    <View style={[styles.safeArea, { paddingTop: insets.top }]}>
      <HeaderStudio
        isOfflineMode={settings?.engineMode === 'offline_on_device'}
        serverConnected={serverConnected}
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Main Text Input Card */}
        <View style={styles.card}>
          <TextInput
            style={styles.textInput}
            multiline
            placeholder="Type or paste text to synthesize..."
            placeholderTextColor={Colors.textMuted}
            value={text}
            onChangeText={handleTextChange}
            textAlignVertical="top"
          />

          <View style={styles.inputBottomRow}>
            {text.length > 0 ? (
              <TouchableOpacity onPress={() => setText('')} style={styles.clearBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Trash2 size={13} color={Colors.textMuted} />
                <Text style={styles.clearText}>Clear</Text>
              </TouchableOpacity>
            ) : <View />}

            <Text style={styles.charCount}>{text.length} chars</Text>
          </View>
        </View>

        {/* Clean Controls Strip */}
        <View style={styles.controlsStrip}>
          {/* Voice Selector Pill */}
          <TouchableOpacity
            style={styles.pillSelector}
            onPress={() => openPicker('primary')}
            activeOpacity={0.8}
          >
            <Text style={styles.pillFlag}>{selectedVoice.flag}</Text>
            <View style={styles.pillTextCol}>
              <Text style={styles.pillLabel}>Voice</Text>
              <Text style={styles.pillValue} numberOfLines={1}>
                {selectedVoice.name}
              </Text>
            </View>
            <ChevronDown size={14} color={Colors.textSecondary} />
          </TouchableOpacity>

          {/* Speed Toggle Pill */}
          <TouchableOpacity
            style={styles.pillButton}
            onPress={cycleSpeed}
            activeOpacity={0.8}
          >
            <Gauge size={13} color={Colors.primary} />
            <View style={styles.pillTextCol}>
              <Text style={styles.pillLabel}>Speed</Text>
              <Text style={styles.pillValue}>{currentSpeed.toFixed(1)}x</Text>
            </View>
          </TouchableOpacity>

          {/* EQ Preset Pill */}
          <TouchableOpacity
            style={styles.pillButton}
            onPress={cyclePreset}
            activeOpacity={0.8}
          >
            <Music2 size={13} color={Colors.secondary} />
            <View style={styles.pillTextCol}>
              <Text style={styles.pillLabel}>EQ</Text>
              <Text style={styles.pillValue} numberOfLines={1}>{currentPreset.name.split(' ')[0]}</Text>
            </View>
          </TouchableOpacity>

          {/* Blend Toggle Button */}
          <TouchableOpacity
            style={[styles.blendIconBtn, isBlenderActive && styles.blendIconBtnActive]}
            onPress={() => setIsBlenderActive(!isBlenderActive)}
            activeOpacity={0.8}
          >
            <Layers size={15} color={isBlenderActive ? '#070a12' : Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Optional Collapsible Voice Blender Card */}
        {isBlenderActive && (
          <View style={styles.blenderWrapper}>
            <VoiceBlenderCard
              voiceA={selectedVoice}
              voiceB={secondaryVoice}
              blendRatio={blendRatio}
              onRatioChange={setBlendRatio}
              onOpenVoiceAPicker={() => openPicker('primary')}
              onOpenVoiceBPicker={() => openPicker('secondary')}
              onSwapVoices={swapVoices}
            />
          </View>
        )}

        {/* Primary Generate CTA */}
        <TouchableOpacity
          style={[styles.generateButton, isGenerating && styles.generateButtonLoading]}
          onPress={handleGenerate}
          disabled={isGenerating}
          activeOpacity={0.85}
        >
          {isGenerating ? (
            <View style={styles.generatingContent}>
              <ActivityIndicator color="#070a12" size="small" />
              <Text style={styles.generateButtonText}>{generationStatus || 'Synthesizing Speech...'}</Text>
            </View>
          ) : (
            <View style={styles.generatingContent}>
              <Zap size={18} color="#070a12" fill="#070a12" />
              <Text style={styles.generateButtonText}>Generate Speech</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Live Audio Player */}
        {currentResult && (
          <View style={styles.playerWrapper}>
            <AudioWaveformPlayer
              fileUri={currentResult.fileUri}
              duration={currentResult.duration}
              title={currentResult.title}
              text={currentResult.text}
              voiceName={currentResult.voiceName}
            />
          </View>
        )}

        {/* Sponsored Partner Banner */}
        <AdsterraBanner style={{ marginTop: 8 }} />
      </ScrollView>

      {/* 54-Voice Selector Modal */}
      <VoiceSelectorModal
        visible={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        selectedVoiceId={pickingTarget === 'primary' ? selectedVoice.id : secondaryVoice.id}
        onSelectVoice={handleVoiceSelected}
        title={pickingTarget === 'primary' ? 'Select Primary Voice' : 'Select Secondary Voice'}
      />

      {/* Sponsored Partner Interstitial Modal */}
      <AdsterraInterstitialModal
        visible={showInterstitial}
        onClose={() => setShowInterstitial(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 36,
    gap: 12,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  textInput: {
    color: Colors.text,
    fontSize: 15,
    lineHeight: 22,
    minHeight: 110,
    maxHeight: 180,
  },
  inputBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  clearText: {
    color: Colors.textMuted,
    fontSize: 11,
  },
  charCount: {
    color: Colors.textMuted,
    fontSize: 11,
  },
  controlsStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pillSelector: {
    flex: 1.8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    gap: 8,
  },
  pillFlag: {
    fontSize: 18,
  },
  pillButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    gap: 6,
  },
  pillTextCol: {
    flex: 1,
  },
  pillLabel: {
    color: Colors.textMuted,
    fontSize: 9,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  pillValue: {
    color: Colors.text,
    fontSize: 12,
    fontWeight: '700',
  },
  blendIconBtn: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  blendIconBtnActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  blenderWrapper: {
    marginTop: 2,
  },
  generateButton: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  generateButtonLoading: {
    opacity: 0.75,
  },
  generatingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  generateButtonText: {
    color: '#070a12',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  playerWrapper: {
    marginTop: 4,
  },
});
