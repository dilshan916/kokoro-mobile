import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HardDrive, Check, Sparkles, Zap, ArrowRight } from 'lucide-react-native';
import Colors from '../constants/Colors';
import { MODEL_VARIANTS, ModelDownloader, ModelVariant } from '../engine/ModelDownloader';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const ONBOARDING_KEY = '@kokoro_onboarding_completed';

interface OnboardingModelModalProps {
  visible: boolean;
  onComplete: () => void;
}

export const OnboardingModelModal: React.FC<OnboardingModelModalProps> = ({
  visible,
  onComplete,
}) => {
  const [selectedVariant, setSelectedVariant] = useState<ModelVariant>(MODEL_VARIANTS[0]); // Default INT8
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState(0);

  const insets = useSafeAreaInsets();

  const handleStartDownload = async () => {
    try {
      setIsDownloading(true);
      setProgress(0);

      await ModelDownloader.downloadModel(selectedVariant, (prog) => {
        setProgress(prog);
      });

      await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
      setIsDownloading(false);
      onComplete();
    } catch (e: any) {
      setIsDownloading(false);
      setProgress(0);
      Alert.alert(
        'Download Issue',
        'Could not complete model download. You can download it anytime in Settings or connect to PC Studio.',
        [
          { text: 'Retry', onPress: handleStartDownload },
          {
            text: 'Continue to App',
            onPress: async () => {
              await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
              onComplete();
            },
          },
        ]
      );
    }
  };

  const handleSkip = async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    onComplete();
  };

  return (
    <Modal visible={visible} animationType="fade" transparent={false}>
      <View style={[styles.container, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 16 }]}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.iconCircle}>
            <Sparkles size={24} color="#070a12" />
          </View>
          <Text style={styles.title}>Kokoro Voice Studio</Text>
          <Text style={styles.subtitle}>
            Select your offline neural model to set up 100% on-device speech synthesis:
          </Text>
        </View>

        {/* Model Variant Selector Cards */}
        <View style={styles.variantsList}>
          {MODEL_VARIANTS.map((variant) => {
            const isSelected = selectedVariant.id === variant.id;

            return (
              <TouchableOpacity
                key={variant.id}
                style={[styles.variantCard, isSelected && styles.variantCardSelected]}
                onPress={() => !isDownloading && setSelectedVariant(variant)}
                activeOpacity={0.8}
                disabled={isDownloading}
              >
                <View style={styles.cardTop}>
                  <View style={{ flex: 1 }}>
                    <View style={styles.nameRow}>
                      <Text style={styles.nameText}>{variant.name}</Text>
                      <View style={styles.sizeBadge}>
                        <Text style={styles.sizeBadgeText}>{variant.sizeMb} MB</Text>
                      </View>
                    </View>
                    <Text style={styles.badgeText}>{variant.badge}</Text>
                  </View>

                  <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
                    {isSelected && <Check size={14} color="#070a12" />}
                  </View>
                </View>

                <Text style={styles.descText}>{variant.description}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Download Progress or Action CTA */}
        <View style={styles.footer}>
          {isDownloading ? (
            <View style={styles.progressBox}>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${progress * 100}%` }]} />
              </View>
              <View style={styles.progressInfoRow}>
                <Text style={styles.progressInfoText}>
                  Setting up {selectedVariant.name}... {Math.round(progress * 100)}%
                </Text>
                <Text style={styles.progressMbText}>
                  {Math.round(progress * selectedVariant.sizeMb)} / {selectedVariant.sizeMb} MB
                </Text>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.downloadCta}
              onPress={handleStartDownload}
              activeOpacity={0.85}
            >
              <Zap size={18} color="#070a12" fill="#070a12" />
              <Text style={styles.downloadCtaText}>
                Download & Start Studio ({selectedVariant.sizeMb} MB)
              </Text>
            </TouchableOpacity>
          )}

          {!isDownloading && (
            <TouchableOpacity style={styles.skipBtn} onPress={handleSkip}>
              <Text style={styles.skipBtnText}>Skip for now (Connect to PC / LAN)</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginTop: 12,
  },
  iconCircle: {
    backgroundColor: Colors.primary,
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  title: {
    color: Colors.text,
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
    paddingHorizontal: 10,
  },
  variantsList: {
    gap: 12,
    marginVertical: 16,
  },
  variantCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1.5,
    borderColor: Colors.cardBorder,
  },
  variantCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: '#242526',
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  nameText: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  sizeBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  sizeBadgeText: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
  badgeText: {
    color: Colors.secondary,
    fontSize: 11,
    fontWeight: '600',
    marginTop: 3,
  },
  descText: {
    color: Colors.textMuted,
    fontSize: 12,
    marginTop: 8,
    lineHeight: 16,
  },
  radioCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioCircleSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  footer: {
    gap: 12,
    marginBottom: 8,
  },
  downloadCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 14,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  downloadCtaText: {
    color: '#070a12',
    fontSize: 15,
    fontWeight: '700',
  },
  progressBox: {
    backgroundColor: Colors.card,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    gap: 8,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },
  progressInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressInfoText: {
    color: Colors.text,
    fontSize: 12,
    fontWeight: '600',
  },
  progressMbText: {
    color: Colors.textMuted,
    fontSize: 11,
  },
  skipBtn: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  skipBtnText: {
    color: Colors.textMuted,
    fontSize: 12,
  },
});
