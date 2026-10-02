import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import { ExternalLink, Sparkles, X } from 'lucide-react-native';
import Colors from '../constants/Colors';
import { AdService } from '../engine/AdService';

interface AdsterraInterstitialModalProps {
  visible: boolean;
  onClose: () => void;
}

export const AdsterraInterstitialModal: React.FC<AdsterraInterstitialModalProps> = ({
  visible,
  onClose,
}) => {
  const [secondsRemaining, setSecondsRemaining] = useState(3);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (visible) {
      setSecondsRemaining(3);
      timer = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [visible]);

  const handleOpenAd = async () => {
    onClose();
    await AdService.openSmartLink();
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={() => {
        if (secondsRemaining === 0) onClose();
      }}
    >
      <TouchableWithoutFeedback onPress={secondsRemaining === 0 ? onClose : undefined}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback>
            <View style={styles.card}>
              {/* Header with Close / Countdown */}
              <View style={styles.headerRow}>
                <View style={styles.badgeWrapper}>
                  <Sparkles size={13} color={Colors.accentWarning} />
                  <Text style={styles.badgeText}>SPONSORED PARTNER</Text>
                </View>

                {secondsRemaining > 0 ? (
                  <View style={styles.countdownBadge}>
                    <Text style={styles.countdownText}>Skip in {secondsRemaining}s</Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.closeBtn}
                    onPress={onClose}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <X size={16} color={Colors.textSecondary} />
                  </TouchableOpacity>
                )}
              </View>

              {/* Main Visual / Content */}
              <TouchableOpacity activeOpacity={0.9} onPress={handleOpenAd} style={styles.adHero}>
                <Text style={styles.heroEmoji}>🎬</Text>
                <Text style={styles.heroTitle}>Exclusive Media &amp; Offers</Text>
                <Text style={styles.heroSubtitle}>
                  Check out today's top featured films, trending streaming apps, and special partner deals.
                </Text>
              </TouchableOpacity>

              {/* Support Notice */}
              <View style={styles.supportBox}>
                <Text style={styles.supportText}>
                  💡 Exploring partner offers helps keep Kokoro's neural speech servers 100% free!
                </Text>
              </View>

              {/* Action Buttons */}
              <TouchableOpacity
                style={styles.ctaButton}
                activeOpacity={0.85}
                onPress={handleOpenAd}
              >
                <Text style={styles.ctaButtonText}>View Sponsored Offer</Text>
                <ExternalLink size={15} color="#070a12" strokeWidth={2.5} />
              </TouchableOpacity>

              {secondsRemaining === 0 && (
                <TouchableOpacity style={styles.continueBtn} onPress={onClose}>
                  <Text style={styles.continueBtnText}>Continue to Audio Playback</Text>
                </TouchableOpacity>
              )}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.78)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#1A1C1E',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(3, 218, 198, 0.3)',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  badgeWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(253, 214, 99, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 6,
  },
  badgeText: {
    color: Colors.accentWarning,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  countdownBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  countdownText: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
  closeBtn: {
    padding: 4,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  adHero: {
    backgroundColor: '#131416',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    marginBottom: 12,
  },
  heroEmoji: {
    fontSize: 34,
    marginBottom: 8,
  },
  heroTitle: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 4,
  },
  heroSubtitle: {
    color: Colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
  },
  supportBox: {
    backgroundColor: 'rgba(3, 218, 198, 0.08)',
    padding: 10,
    borderRadius: 10,
    marginBottom: 16,
  },
  supportText: {
    color: Colors.primary,
    fontSize: 11,
    lineHeight: 16,
    textAlign: 'center',
    fontWeight: '500',
  },
  ctaButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  ctaButtonText: {
    color: '#070a12',
    fontSize: 14,
    fontWeight: '800',
  },
  continueBtn: {
    marginTop: 10,
    alignItems: 'center',
    paddingVertical: 4,
  },
  continueBtnText: {
    color: Colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
