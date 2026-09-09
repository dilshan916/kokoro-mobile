import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Search, Play, Square, Star } from 'lucide-react-native';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import Colors from '../../src/constants/Colors';
import { VOICES_CATALOG, LANGUAGES_FILTER, VoiceItem } from '../../src/constants/VoicesCatalog';
import { KokoroOnDeviceEngine } from '../../src/engine/KokoroOnDeviceEngine';

const SAMPLE_PHRASES: Record<string, string> = {
  'en-us': 'Hello! I am a neural voice powered by Kokoro Studio.',
  'en-gb': 'Good day! Delivering polished British English narration.',
  ja: 'こんにちは！日本語音声合成をお届けします。',
  zh: '你好！很高兴为你提供高品质中文语音合成。',
  es: '¡Hola! Tu voz neural en español de alta fidelidad.',
  fr: 'Bonjour! Votre voix française de qualité studio.',
  hi: 'नमस्ते! कोकोरो न्यूरल वॉयस स्टूडियो द्वारा संचालित।',
  it: 'Ciao! La tua voce neurale italiana ad alta fedeltà.',
  'pt-br': 'Olá! Trazendo síntese de voz natural em português.',
};

const LANG_CODE_MAP: Record<string, string> = {
  af: 'en-US',
  am: 'en-US',
  bf: 'en-GB',
  bm: 'en-GB',
  jf: 'ja-JP',
  jm: 'ja-JP',
  zf: 'zh-CN',
  zm: 'zh-CN',
  ef: 'es-ES',
  em: 'es-ES',
  ff: 'fr-FR',
  hf: 'hi-IN',
  hm: 'hi-IN',
  if: 'it-IT',
  im: 'it-IT',
  pf: 'pt-BR',
  pm: 'pt-BR',
};

export default function VoicesScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLang, setSelectedLang] = useState('all');
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const [loadingVoiceId, setLoadingVoiceId] = useState<string | null>(null);

  const currentSound = useRef<Audio.Sound | null>(null);
  const engine = KokoroOnDeviceEngine.getInstance();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    return () => {
      stopAllAudio();
    };
  }, []);

  const stopAllAudio = async () => {
    Speech.stop();
    if (currentSound.current) {
      try {
        await currentSound.current.stopAsync();
        await currentSound.current.unloadAsync();
      } catch (_) {}
      currentSound.current = null;
    }
    setPlayingVoiceId(null);
    setLoadingVoiceId(null);
  };

  const filteredVoices = useMemo(() => {
    return VOICES_CATALOG.filter((v) => {
      const matchLang = selectedLang === 'all' || v.lang === selectedLang;
      const matchSearch =
        searchQuery.trim() === '' ||
        v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.traits.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.langName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.id.toLowerCase().includes(searchQuery.toLowerCase());
      return matchLang && matchSearch;
    });
  }, [searchQuery, selectedLang]);

  const handleTogglePreview = async (voice: VoiceItem) => {
    // If this voice is currently playing, stop it
    if (playingVoiceId === voice.id) {
      await stopAllAudio();
      return;
    }

    // Stop any previous playing audio
    await stopAllAudio();
    setLoadingVoiceId(voice.id);

    const phrase = SAMPLE_PHRASES[voice.lang] || `Hello, this is ${voice.name}.`;

    try {
      // 1. Try High-Fidelity Kokoro Neural Server first (Distinct trained timbre)
      const activeUrl = await engine.probeActiveServer();
      if (activeUrl) {
        const result = await engine.synthesize({
          text: phrase,
          voiceId: voice.id,
          speed: 1.0,
        });

        if (result.fileUri) {
          setLoadingVoiceId(null);
          setPlayingVoiceId(voice.id);

          const { sound } = await Audio.Sound.createAsync(
            { uri: result.fileUri },
            { shouldPlay: true },
            (status: any) => {
              if (status.didJustFinish) {
                stopAllAudio();
              }
            }
          );
          currentSound.current = sound;
          return;
        }
      }

      // 2. Offline / On-Device distinct voice acoustic profiling
      setLoadingVoiceId(null);
      setPlayingVoiceId(voice.id);

      const prefix = voice.id.slice(0, 2);
      const isMale = voice.gender === 'Male';
      const langCode = LANG_CODE_MAP[prefix] || 'en-US';

      // Pitch & rate characteristics based on voice profile
      let pitch = isMale ? 0.82 : 1.18;
      let rate = 0.95;

      if (voice.id.includes('santa')) {
        pitch = 0.70;
        rate = 0.85;
      } else if (voice.id === 'am_michael' || voice.id === 'bm_george' || voice.id === 'hm_omega') {
        pitch = 0.76;
        rate = 0.90;
      } else if (voice.id === 'af_sky' || voice.id === 'jf_nezumi' || voice.id === 'zf_xiaoni') {
        pitch = 1.32;
        rate = 1.05;
      } else if (voice.id === 'af_aoede' || voice.id === 'jf_tebukuro') {
        pitch = 1.08;
        rate = 0.88;
      }

      Speech.speak(phrase, {
        language: langCode,
        pitch,
        rate,
        onDone: () => setPlayingVoiceId(null),
        onStopped: () => setPlayingVoiceId(null),
        onError: () => setPlayingVoiceId(null),
      });
    } catch (err) {
      console.warn('Voice preview error:', err);
      stopAllAudio();
    }
  };

  const renderItem = ({ item }: { item: VoiceItem }) => {
    const isPlaying = playingVoiceId === item.id;
    const isLoading = loadingVoiceId === item.id;

    return (
      <View style={styles.voiceCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.flag}>{item.flag}</Text>
          <View style={styles.infoCol}>
            <View style={styles.nameRow}>
              <Text style={styles.name}>{item.name}</Text>
              {item.recommended && (
                <View style={styles.recBadge}>
                  <Star size={10} color="#f59e0b" fill="#f59e0b" />
                  <Text style={styles.recText}>Featured</Text>
                </View>
              )}
            </View>
            <Text style={styles.langText}>{item.langName} • {item.gender}</Text>
          </View>

          <TouchableOpacity
            style={[
              styles.previewBtn,
              isPlaying && styles.previewBtnPlaying,
              isLoading && styles.previewBtnLoading,
            ]}
            onPress={() => handleTogglePreview(item)}
            activeOpacity={0.8}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#070a12" />
            ) : isPlaying ? (
              <>
                <Square size={12} color="#070a12" fill="#070a12" />
                <Text style={styles.previewBtnText}>Stop</Text>
              </>
            ) : (
              <>
                <Play size={13} color="#070a12" fill="#070a12" style={{ marginLeft: 2 }} />
                <Text style={styles.previewBtnText}>Sample</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.traits}>{item.traits}</Text>

        <View style={styles.cardFooter}>
          <View style={styles.gradeBadge}>
            <Text style={styles.gradeText}>Quality {item.grade}</Text>
          </View>
          <Text style={styles.idTag}>{item.id}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.safeArea, { paddingTop: insets.top }]}>
      <View style={styles.container}>
        {/* Screen Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Voice Catalog</Text>
            <Text style={styles.headerSub}>54 Multilingual Neural Voices (100% Offline)</Text>
          </View>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{filteredVoices.length} Voices</Text>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Search size={18} color={Colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by voice name, language, gender..."
            placeholderTextColor={Colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            clearButtonMode="while-editing"
          />
        </View>

        {/* Language Filter Tabs */}
        <View style={styles.langWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.langScroll}
          >
            {LANGUAGES_FILTER.map((l) => {
              const isActive = selectedLang === l.code;
              return (
                <TouchableOpacity
                  key={l.code}
                  style={[styles.langChip, isActive && styles.langChipActive]}
                  onPress={() => setSelectedLang(l.code)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.langFlag}>{l.flag}</Text>
                  <Text style={[styles.langTextChip, isActive && styles.langTextChipActive]}>
                    {l.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Voices List */}
        <FlatList
          data={filteredVoices}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      </View>
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
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerTitle: {
    color: Colors.text,
    fontSize: 22,
    fontWeight: '800',
  },
  headerSub: {
    color: Colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  countBadge: {
    backgroundColor: 'rgba(249, 115, 22, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(249, 115, 22, 0.25)',
  },
  countText: {
    color: Colors.primary,
    fontSize: 11,
    fontWeight: '700',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.inputBg,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 44,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    color: Colors.text,
    fontSize: 14,
  },
  langWrapper: {
    marginBottom: 10,
  },
  langScroll: {
    gap: 8,
  },
  langChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.backgroundSecondary,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  langChipActive: {
    backgroundColor: 'rgba(249, 115, 22, 0.16)',
    borderColor: Colors.primary,
  },
  langFlag: {
    fontSize: 13,
  },
  langTextChip: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '500',
  },
  langTextChipActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  list: {
    gap: 10,
    paddingBottom: 24,
  },
  voiceCard: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  flag: {
    fontSize: 26,
  },
  infoCol: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  name: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  recBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  recText: {
    color: '#f59e0b',
    fontSize: 9,
    fontWeight: '700',
  },
  langText: {
    color: Colors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  previewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    minWidth: 70,
    justifyContent: 'center',
  },
  previewBtnPlaying: {
    backgroundColor: Colors.accentWarning,
  },
  previewBtnLoading: {
    opacity: 0.7,
  },
  previewBtnText: {
    color: '#070a12',
    fontSize: 11,
    fontWeight: '700',
  },
  traits: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginVertical: 8,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
    paddingTop: 8,
  },
  gradeBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  gradeText: {
    color: Colors.primary,
    fontSize: 10,
    fontWeight: '700',
  },
  idTag: {
    color: Colors.textMuted,
    fontSize: 10,
    fontFamily: 'monospace',
  },
});
