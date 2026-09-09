import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Layers, ArrowLeftRight, ChevronRight } from 'lucide-react-native';
import Colors from '../constants/Colors';
import { VoiceItem } from '../constants/VoicesCatalog';

interface VoiceBlenderCardProps {
  voiceA: VoiceItem;
  voiceB: VoiceItem;
  blendRatio: number; // 0.0 to 1.0
  onRatioChange: (ratio: number) => void;
  onOpenVoiceAPicker: () => void;
  onOpenVoiceBPicker: () => void;
  onSwapVoices: () => void;
}

export const VoiceBlenderCard: React.FC<VoiceBlenderCardProps> = ({
  voiceA,
  voiceB,
  blendRatio,
  onRatioChange,
  onOpenVoiceAPicker,
  onOpenVoiceBPicker,
  onSwapVoices,
}) => {
  const percentB = Math.round(blendRatio * 100);
  const percentA = 100 - percentB;

  const presets = [
    { label: '100% A', val: 0.0 },
    { label: '70 / 30', val: 0.3 },
    { label: '50 / 50', val: 0.5 },
    { label: '30 / 70', val: 0.7 },
    { label: '100% B', val: 1.0 },
  ];

  return (
    <View style={styles.card}>
      {/* Title */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Layers size={16} color={Colors.primary} />
          <Text style={styles.title}>Dual-Voice Neural Blender</Text>
        </View>
        <TouchableOpacity style={styles.swapBtn} onPress={onSwapVoices}>
          <ArrowLeftRight size={14} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Voice Selection Row */}
      <View style={styles.voicesRow}>
        {/* Voice A */}
        <TouchableOpacity style={styles.voiceSelectBtn} onPress={onOpenVoiceAPicker}>
          <Text style={styles.voiceFlag}>{voiceA.flag}</Text>
          <View style={styles.voiceDetails}>
            <Text style={styles.voiceLabel}>Voice A ({percentA}%)</Text>
            <Text style={styles.voiceName} numberOfLines={1}>{voiceA.name}</Text>
          </View>
          <ChevronRight size={14} color={Colors.textMuted} />
        </TouchableOpacity>

        {/* Voice B */}
        <TouchableOpacity style={styles.voiceSelectBtn} onPress={onOpenVoiceBPicker}>
          <Text style={styles.voiceFlag}>{voiceB.flag}</Text>
          <View style={styles.voiceDetails}>
            <Text style={styles.voiceLabel}>Voice B ({percentB}%)</Text>
            <Text style={styles.voiceName} numberOfLines={1}>{voiceB.name}</Text>
          </View>
          <ChevronRight size={14} color={Colors.textMuted} />
        </TouchableOpacity>
      </View>

      {/* Ratio Visual Bar */}
      <View style={styles.ratioBarContainer}>
        <View style={[styles.ratioBarA, { width: `${percentA}%` }]} />
        <View style={[styles.ratioBarB, { width: `${percentB}%` }]} />
      </View>

      {/* Ratio Quick Presets */}
      <View style={styles.presetRow}>
        {presets.map((p) => {
          const isSelected = Math.abs(blendRatio - p.val) < 0.05;
          return (
            <TouchableOpacity
              key={p.label}
              style={[styles.presetBtn, isSelected && styles.presetBtnActive]}
              onPress={() => onRatioChange(p.val)}
            >
              <Text style={[styles.presetText, isSelected && styles.presetTextActive]}>
                {p.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    marginVertical: 6,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  swapBtn: {
    padding: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 6,
  },
  voicesRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  voiceSelectBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundSecondary,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  voiceFlag: {
    fontSize: 20,
    marginRight: 8,
  },
  voiceDetails: {
    flex: 1,
  },
  voiceLabel: {
    color: Colors.primary,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  voiceName: {
    color: Colors.text,
    fontSize: 13,
    fontWeight: '600',
  },
  ratioBarContainer: {
    flexDirection: 'row',
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  ratioBarA: {
    height: '100%',
    backgroundColor: Colors.primary,
  },
  ratioBarB: {
    height: '100%',
    backgroundColor: Colors.secondary,
  },
  presetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 4,
  },
  presetBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  presetBtnActive: {
    backgroundColor: 'rgba(249, 115, 22, 0.18)',
    borderColor: Colors.primary,
  },
  presetText: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
  },
  presetTextActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
});
