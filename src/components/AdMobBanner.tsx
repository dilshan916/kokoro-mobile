import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { AdService, ADMOB_BANNER_UNIT_ID } from '../engine/AdService';

let BannerAd: any = null;
let BannerAdSize: any = null;
let TestIds: any = null;

try {
  const gma = require('react-native-google-mobile-ads');
  BannerAd = gma.BannerAd;
  BannerAdSize = gma.BannerAdSize;
  TestIds = gma.TestIds;
} catch (e) {
  // Gracefully handles environment where native Google Mobile Ads binary is not linked yet
}

interface AdMobBannerProps {
  style?: any;
}

export const AdMobBanner: React.FC<AdMobBannerProps> = ({ style }) => {
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    checkAdStatus();
  }, []);

  const checkAdStatus = async () => {
    const active = await AdService.isAdEnabled();
    setIsEnabled(active);
  };

  // Do not render if user is Pro or native module is unavailable
  if (!isEnabled || !BannerAd || !BannerAdSize) {
    return null;
  }

  const unitId = __DEV__ && TestIds ? (TestIds.ADAPTIVE_BANNER || TestIds.BANNER) : ADMOB_BANNER_UNIT_ID;

  return (
    <View style={[styles.container, style]}>
      <BannerAd
        unitId={unitId}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: false,
        }}
        onAdFailedToLoad={(error: any) => {
          console.warn('[AdMobBanner] Ad failed to load:', error);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 6,
    width: '100%',
    overflow: 'hidden',
  },
});
