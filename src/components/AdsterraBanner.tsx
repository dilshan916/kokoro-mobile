import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ExternalLink, Sparkles } from 'lucide-react-native';
import Colors from '../constants/Colors';
import { AdService } from '../engine/AdService';

interface AdsterraBannerProps {
  style?: any;
}

export const AdsterraBanner: React.FC<AdsterraBannerProps> = ({ style }) => {
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    checkAdStatus();
  }, []);

  const checkAdStatus = async () => {
    const active = await AdService.isAdEnabled();
    setIsEnabled(active);
  };

  if (!isEnabled) {
    return null;
  }

  return (
    <TouchableOpacity
      style={[styles.bannerContainer, style]}
      activeOpacity={0.85}
      onPress={AdService.openSmartLink}
    >
      <View style={styles.leftCol}>
        <View style={styles.badgeRow}>
          <View style={styles.adBadge}>
            <Text style={styles.adBadgeText}>SPONSORED</Text>
          </View>
          <View style={styles.partnerBadge}>
            <Sparkles size={11} color={Colors.accentWarning} />
            <Text style={styles.partnerText}>Featured Partner</Text>
          </View>
        </View>

        <Text style={styles.headlineText} numberOfLines={1}>
          Trending Media &amp; Special Offers
        </Text>
        <Text style={styles.subText} numberOfLines={1}>
          Tap to explore exclusive content &amp; entertainment
        </Text>
      </View>

      <View style={styles.actionBtn}>
        <Text style={styles.actionBtnText}>Visit</Text>
        <ExternalLink size={12} color="#070a12" strokeWidth={2.5} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  bannerContainer: {
    backgroundColor: '#181A1B',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(3, 218, 198, 0.25)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 4,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  leftCol: {
    flex: 1,
    marginRight: 10,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  adBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  adBadgeText: {
    color: Colors.textSecondary,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  partnerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  partnerText: {
    color: Colors.accentWarning,
    fontSize: 10,
    fontWeight: '600',
  },
  headlineText: {
    color: Colors.text,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  subText: {
    color: Colors.textSecondary,
    fontSize: 11,
    marginTop: 1,
  },
  actionBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    shrink: 0,
  },
  actionBtnText: {
    color: '#070a12',
    fontSize: 12,
    fontWeight: '700',
  },
});
