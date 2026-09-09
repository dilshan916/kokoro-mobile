import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import {
  Cpu,
  Wifi,
  Server,
  Trash2,
  Info,
  CheckCircle2,
  Radio,
  Sliders,
  ShieldCheck,
  RefreshCw,
  Download,
  HardDrive,
  Check,
  Zap,
  Crown,
  KeyRound,
  Gift,
  Sparkles,
} from 'lucide-react-native';
import * as Linking from 'expo-linking';
import Colors from '../../src/constants/Colors';
import { KokoroOnDeviceEngine, AppSettings, DEFAULT_SETTINGS } from '../../src/engine/KokoroOnDeviceEngine';
import { UpdateManager } from '../../src/engine/UpdateManager';
import { MODEL_VARIANTS, ModelDownloader, ModelVariant } from '../../src/engine/ModelDownloader';
import { ToastNotification } from '../../src/components/ToastNotification';
import { DeviceManager } from '../../src/engine/DeviceManager';
import { QuotaService, QuotaInfo } from '../../src/engine/QuotaService';

export default function SettingsScreen() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [serverUrl, setServerUrl] = useState(DEFAULT_SETTINGS.lanServerUrl);
  const [isTestingLan, setIsTestingLan] = useState(false);
  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);

  // Quota & Billing state
  const [quotaInfo, setQuotaInfo] = useState<QuotaInfo | null>(null);
  const [promoCode, setPromoCode] = useState('');
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [deviceId, setDeviceId] = useState('');

  // Model Downloader states
  const [downloadingModelId, setDownloadingModelId] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadedStatus, setDownloadedStatus] = useState<Record<string, boolean>>({});
  const [activeModelId, setActiveModelId] = useState('fp32_master');
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const engine = KokoroOnDeviceEngine.getInstance();

  useFocusEffect(
    useCallback(() => {
      loadSettings();
      checkDownloadedModels();
    }, [])
  );

  const loadSettings = async () => {
    const s = await engine.getSettings();
    setSettings(s);
    setServerUrl(s.lanServerUrl);
    const active = await ModelDownloader.getActiveModelId();
    setActiveModelId(active);

    const devId = await DeviceManager.getDeviceId();
    setDeviceId(devId);

    // 1. Instant 0ms cached quota display
    const cachedQ = await DeviceManager.getQuotaCache();
    if (cachedQ) {
      setQuotaInfo(cachedQ);
    }

    // 2. Refresh from server in background without blocking UI
    QuotaService.fetchQuota().then((q) => {
      if (q) {
        setQuotaInfo(q);
      }
    });
  };

  const checkDownloadedModels = async () => {
    const status: Record<string, boolean> = {};
    for (const v of MODEL_VARIANTS) {
      status[v.id] = await ModelDownloader.isModelDownloaded(v);
    }
    setDownloadedStatus(status);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setToastVisible(true);
  };

  const handleDownloadModel = async (variant: ModelVariant) => {
    if (downloadingModelId) return;

    try {
      setDownloadingModelId(variant.id);
      setDownloadProgress(0);

      await ModelDownloader.downloadModel(variant, (progress) => {
        setDownloadProgress(progress);
      });

      setDownloadingModelId(null);
      setDownloadProgress(0);
      setActiveModelId(variant.id);
      await checkDownloadedModels();
      const path = await ModelDownloader.getActiveModelPath();
      if (path) {
        engine.getWasmRunner()?.loadModel(path).catch(() => {});
      }
      showToast(`✓ ${variant.name} installed & activated!`);
    } catch (e: any) {
      setDownloadingModelId(null);
      setDownloadProgress(0);
      Alert.alert('Download Failed', e.message || 'Could not download model file');
    }
  };

  const handleDeleteModel = (variant: ModelVariant) => {
    Alert.alert('Delete Model', `Remove ${variant.name} (${variant.sizeMb} MB) from device storage?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await ModelDownloader.deleteModel(variant);
          await checkDownloadedModels();
          const active = await ModelDownloader.getActiveModelId();
          setActiveModelId(active);
          const path = await ModelDownloader.getActiveModelPath();
          if (path) {
            engine.getWasmRunner()?.loadModel(path).catch(() => {});
          }
          showToast(`Deleted ${variant.name}`);
        },
      },
    ]);
  };

  const handleSelectActiveModel = async (variant: ModelVariant) => {
    await ModelDownloader.setActiveModelId(variant.id);
    setActiveModelId(variant.id);
    const path = await ModelDownloader.getActiveModelPath();
    if (path) {
      engine.getWasmRunner()?.loadModel(path).catch(() => {});
    }
    showToast(`✓ Activated: ${variant.name}`);
  };

  const handleModeChange = async (mode: 'cloud_studio' | 'offline_on_device') => {
    const updated = await engine.updateSettings({ engineMode: mode });
    setSettings(updated);
  };

  const handleTestConnection = async () => {
    try {
      setIsTestingLan(true);
      const active = await engine.probeActiveServer(true);
      setIsTestingLan(false);

      if (active) {
        Alert.alert('Connected! 🟢', `Successfully reached Kokoro Cloud Studio Server at:\n${active}`);
      } else {
        Alert.alert(
          'Cloud Server Offline',
          `Could not reach your Kokoro Studio server.\n\nMake sure 'start_permanent_server.bat' is running on your PC!`
        );
      }
    } catch (e: any) {
      setIsTestingLan(false);
      Alert.alert('Error', e.message || 'Failed to test connection');
    }
  };

  const handleToggleAutoSave = async (val: boolean) => {
    const updated = await engine.updateSettings({ autoSaveHistory: val });
    setSettings(updated);
  };

  const handleCheckOtaUpdate = async () => {
    try {
      setIsCheckingUpdate(true);
      await UpdateManager.checkForUpdate(true);
      setIsCheckingUpdate(false);
    } catch (e) {
      setIsCheckingUpdate(false);
    }
  };

  const handleRedeemPromo = async () => {
    if (!promoCode.trim()) {
      Alert.alert('Input Required', 'Please enter a valid promo or license key.');
      return;
    }

    try {
      setIsRedeeming(true);
      const res = await QuotaService.redeemLicense(promoCode.trim());
      setIsRedeeming(false);
      setPromoCode('');
      if (res.quota) {
        setQuotaInfo(res.quota);
      }
      showToast(res.message);
      Alert.alert('Success 🎉', res.message);
    } catch (e: any) {
      setIsRedeeming(false);
      Alert.alert('Redemption Failed', e.message || 'Invalid or expired code.');
    }
  };

  const handleUpgradeCheckout = async () => {
    try {
      const url = await QuotaService.createCheckoutSession();
      if (url && (url.startsWith('https://checkout.stripe.com') || url.startsWith('https://buy.stripe.com') || url.startsWith('https://gumroad.com') || url.startsWith('https://lemonsqueezy.com'))) {
        await Linking.openURL(url);
      } else {
        Alert.alert(
          'Kokoro Pro Activation',
          'To activate Unlimited Lifetime Cloud GPU synthesis, please enter your VIP Promo or License Code in the "Redeem VIP Promo Code" card below.'
        );
      }
    } catch (e: any) {
      Alert.alert(
        'Kokoro Pro Activation',
        'To activate Unlimited Lifetime Cloud GPU synthesis, please enter your VIP Promo or License Code in the "Redeem VIP Promo Code" card below.'
      );
    }
  };

  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.safeArea, { paddingTop: insets.top }]}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Engine & Studio Settings</Text>
          <Text style={styles.headerSub}>Configure on-device neural models, sync, and preferences</Text>
        </View>

        {/* Kokoro Pro & Monthly Quota Card */}
        <View style={[styles.card, styles.quotaCard]}>
          <View style={styles.cardHeader}>
            <Crown size={18} color="#FFD700" />
            <Text style={[styles.cardTitle, { color: '#FFD700' }]}>
              {quotaInfo?.is_pro ? 'Kokoro Pro Member ✨' : 'Cloud GPU Free Tier'}
            </Text>
            {quotaInfo?.is_pro && (
              <View style={styles.proTag}>
                <Text style={styles.proTagText}>UNLIMITED</Text>
              </View>
            )}
          </View>

          {quotaInfo?.is_pro ? (
            <Text style={styles.quotaDesc}>
              You have unlimited, unmetered access to high-speed Cloud GPU synthesis and all 60+ neural voices.
            </Text>
          ) : (
            <View style={styles.quotaContent}>
              <View style={styles.quotaRow}>
                <Text style={styles.quotaLabel}>Monthly Cloud GPU Usage</Text>
                <Text style={styles.quotaValue}>
                  {(quotaInfo?.monthly_usage || 0).toLocaleString()} / {(quotaInfo?.monthly_limit || 20000).toLocaleString()} chars
                </Text>
              </View>

              {/* Progress Bar */}
              <View style={styles.quotaBarBg}>
                <View
                  style={[
                    styles.quotaBarFill,
                    {
                      width: `${Math.min(100, quotaInfo?.percent_used || 0)}%`,
                      backgroundColor: (quotaInfo?.percent_used || 0) > 85 ? '#F28B82' : Colors.primary,
                    },
                  ]}
                />
              </View>

              <Text style={styles.quotaSubText}>
                {quotaInfo?.remaining_chars !== 'unlimited'
                  ? `${(quotaInfo?.remaining_chars || 20000).toLocaleString()} characters remaining this cycle.`
                  : 'Unlimited generation active.'}
                {'\n'}💡 <Text style={{ color: Colors.text }}>On-Device Offline synthesis is always 100% free and unlimited!</Text>
              </Text>

              <TouchableOpacity style={styles.upgradeBtn} onPress={handleUpgradeCheckout}>
                <Sparkles size={14} color="#070a12" />
                <Text style={styles.upgradeBtnText}>Upgrade to Pro (Unlimited Cloud)</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Neural Model Variants Downloader Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <HardDrive size={16} color={Colors.primary} />
            <Text style={styles.cardTitle}>Offline Neural Model Manager</Text>
          </View>
          <Text style={styles.modelSectionSub}>
            Download any of the 3 Kokoro-82M model variants to run 100% offline without PC.
          </Text>

          {MODEL_VARIANTS.map((variant) => {
            const isDownloaded = downloadedStatus[variant.id];
            const isActive = activeModelId === variant.id;
            const isDownloadingThis = downloadingModelId === variant.id;

            return (
              <View
                key={variant.id}
                style={[
                  styles.modelVariantCard,
                  isActive && isDownloaded && styles.modelVariantActive,
                ]}
              >
                <View style={styles.modelTopRow}>
                  <View style={{ flex: 1 }}>
                    <View style={styles.modelNameRow}>
                      <Text style={styles.modelName}>{variant.name}</Text>
                      <View style={styles.sizeBadge}>
                        <Text style={styles.sizeBadgeText}>{variant.sizeMb} MB</Text>
                      </View>
                    </View>
                    <Text style={styles.modelBadge}>{variant.badge}</Text>
                  </View>

                  {/* Actions */}
                  {isDownloadingThis ? (
                    <View style={styles.downloadingIndicator}>
                      <ActivityIndicator size="small" color={Colors.primary} />
                      <Text style={styles.progressText}>{Math.round(downloadProgress * 100)}%</Text>
                    </View>
                  ) : isDownloaded ? (
                    <View style={styles.modelActionsRow}>
                      {isActive ? (
                        <View style={styles.activeTag}>
                          <Check size={12} color="#070a12" />
                          <Text style={styles.activeTagText}>Active</Text>
                        </View>
                      ) : (
                        <TouchableOpacity
                          style={styles.selectBtn}
                          onPress={() => handleSelectActiveModel(variant)}
                        >
                          <Text style={styles.selectBtnText}>Select</Text>
                        </TouchableOpacity>
                      )}
                      <TouchableOpacity
                        style={styles.deleteModelBtn}
                        onPress={() => handleDeleteModel(variant)}
                        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                      >
                        <Trash2 size={14} color={Colors.textMuted} />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={styles.downloadBtn}
                      onPress={() => handleDownloadModel(variant)}
                      disabled={!!downloadingModelId}
                    >
                      <Download size={13} color="#070a12" />
                      <Text style={styles.downloadBtnText}>Get</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {/* Progress Bar when downloading */}
                {isDownloadingThis && (
                  <View style={styles.progressContainer}>
                    <View style={styles.progressBarBg}>
                      <View style={[styles.progressBarFill, { width: `${downloadProgress * 100}%` }]} />
                    </View>
                    <Text style={styles.downloadStatusText}>
                      Downloading neural weights... {Math.round(downloadProgress * variant.sizeMb)} MB / {variant.sizeMb} MB
                    </Text>
                  </View>
                )}

                <Text style={styles.modelDesc}>{variant.description}</Text>
              </View>
            );
          })}
        </View>

        {/* Engine Mode Selection */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Inference Engine Mode</Text>

          {/* Cloud Studio Pro Mode Card */}
          <TouchableOpacity
            style={[
              styles.modeCard,
              settings.engineMode === 'cloud_studio' && styles.modeCardActive,
            ]}
            onPress={() => handleModeChange('cloud_studio')}
            activeOpacity={0.8}
          >
            <View style={[styles.modeIconCircle, { backgroundColor: 'rgba(3, 218, 198, 0.15)' }]}>
              <Server size={22} color={Colors.primary} />
            </View>
            <View style={styles.modeInfo}>
              <View style={styles.modeTitleRow}>
                <Text style={styles.modeTitle}>Cloud Studio Pro (Lightning Fast)</Text>
                {settings.engineMode === 'cloud_studio' && (
                  <CheckCircle2 size={16} color={Colors.primary} />
                )}
              </View>
              <Text style={styles.modeDesc}>
                Direct 24kHz studio rendering via dedicated cloud server (Works anywhere over 4G/5G/Wi-Fi)
              </Text>
            </View>
          </TouchableOpacity>

          {/* Offline On-Device Mode Card */}
          <TouchableOpacity
            style={[
              styles.modeCard,
              settings.engineMode === 'offline_on_device' && styles.modeCardActive,
            ]}
            onPress={() => handleModeChange('offline_on_device')}
            activeOpacity={0.8}
          >
            <View style={styles.modeIconCircle}>
              <Cpu size={22} color={Colors.accentSuccess} />
            </View>
            <View style={styles.modeInfo}>
              <View style={styles.modeTitleRow}>
                <Text style={styles.modeTitle}>100% On-Device Mobile Voice</Text>
                {settings.engineMode === 'offline_on_device' && (
                  <CheckCircle2 size={16} color={Colors.accentSuccess} />
                )}
              </View>
              <Text style={styles.modeDesc}>
                Synthesizes offline directly on phone without PC or Wi-Fi
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Preferences */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Preferences</Text>

          <View style={styles.prefRow}>
            <View>
              <Text style={styles.prefTitle}>Auto-Save History</Text>
              <Text style={styles.prefDesc}>Automatically save synthesized clips to library</Text>
            </View>
            <Switch
              value={settings.autoSaveHistory}
              onValueChange={handleToggleAutoSave}
              trackColor={{ false: '#1e293b', true: Colors.primary }}
              thumbColor="#ffffff"
            />
          </View>
        </View>

        {/* OTA Updates Section */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <RefreshCw size={16} color={Colors.accentSuccess} />
            <Text style={styles.cardTitle}>Over-The-Air (OTA) Updates</Text>
          </View>

          <View style={styles.prefRow}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={styles.prefTitle}>Automatic Cloud Updates</Text>
              <Text style={styles.prefDesc}>Enabled • Seamless instant updates without reinstalling APK</Text>
            </View>
            <View style={{ backgroundColor: 'rgba(52, 211, 153, 0.15)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}>
              <Text style={{ color: Colors.accentSuccess, fontSize: 11, fontWeight: '700' }}>Active</Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.testBtn, { marginTop: 10, borderColor: 'rgba(52, 211, 153, 0.3)' }]}
            onPress={handleCheckOtaUpdate}
            disabled={isCheckingUpdate}
          >
            {isCheckingUpdate ? (
              <ActivityIndicator size="small" color={Colors.accentSuccess} />
            ) : (
              <RefreshCw size={14} color={Colors.accentSuccess} />
            )}
            <Text style={[styles.testBtnText, { color: Colors.accentSuccess }]}>
              {isCheckingUpdate ? 'Checking for updates...' : 'Check for Updates Now'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Redeem VIP Promo / License Key Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <KeyRound size={16} color={Colors.primary} />
            <Text style={styles.cardTitle}>Redeem VIP Promo / License Code</Text>
          </View>
          <Text style={styles.modelSectionSub}>
            Have a VIP promo code, beta tester pass, or gift key? Enter it below to unlock lifetime Pro instantly.
          </Text>

          <View style={styles.promoInputRow}>
            <TextInput
              style={styles.promoInput}
              placeholder="Enter Promo Code"
              placeholderTextColor={Colors.textMuted}
              value={promoCode}
              onChangeText={setPromoCode}
              autoCapitalize="characters"
              autoCorrect={false}
            />
            <TouchableOpacity
              style={[styles.redeemBtn, isRedeeming && { opacity: 0.6 }]}
              onPress={handleRedeemPromo}
              disabled={isRedeeming}
            >
              {isRedeeming ? (
                <ActivityIndicator size="small" color="#070a12" />
              ) : (
                <Text style={styles.redeemBtnText}>Activate</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Neural Architecture & Engine Specs */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Info size={16} color={Colors.primary} />
            <Text style={styles.cardTitle}>Engine Diagnostics</Text>
          </View>

          <View style={styles.diagRow}>
            <Text style={styles.diagKey}>Neural Architecture</Text>
            <Text style={styles.diagVal}>Kokoro-82M v1.0 ONNX</Text>
          </View>
          <View style={styles.diagRow}>
            <Text style={styles.diagKey}>Vocab Tokens</Text>
            <Text style={styles.diagVal}>114 IPA Phonemes</Text>
          </View>
          <View style={styles.diagRow}>
            <Text style={styles.diagKey}>Audio Output</Text>
            <Text style={styles.diagVal}>24,000 Hz 16-bit Mono WAV</Text>
          </View>
          <View style={styles.diagRow}>
            <Text style={styles.diagKey}>Voice Embeddings</Text>
            <Text style={styles.diagVal}>54 Vectors (256-Dim Float)</Text>
          </View>
          <View style={styles.diagRow}>
            <Text style={styles.diagKey}>Lead Developer</Text>
            <Text style={styles.diagValHighlight}>Dilshan Chandrarathne</Text>
          </View>
        </View>
      </ScrollView>

      {/* Toast Notification */}
      <ToastNotification
        visible={toastVisible}
        message={toastMessage}
        onHide={() => setToastVisible(false)}
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
    paddingBottom: 40,
    gap: 14,
  },
  header: {
    marginBottom: 4,
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
  card: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  cardTitle: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  modelSectionSub: {
    color: Colors.textMuted,
    fontSize: 12,
    marginBottom: 12,
    lineHeight: 16,
  },
  modelVariantCard: {
    backgroundColor: Colors.backgroundSecondary,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.07)',
    marginBottom: 8,
  },
  modelVariantActive: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(3, 218, 198, 0.08)',
  },
  modelTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modelNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modelName: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  sizeBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  sizeBadgeText: {
    color: Colors.textSecondary,
    fontSize: 10,
    fontWeight: '600',
  },
  modelBadge: {
    color: Colors.secondary,
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  modelDesc: {
    color: Colors.textMuted,
    fontSize: 11,
    marginTop: 6,
    lineHeight: 15,
  },
  modelActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  activeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  activeTagText: {
    color: '#070a12',
    fontSize: 11,
    fontWeight: '700',
  },
  selectBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  selectBtnText: {
    color: Colors.text,
    fontSize: 11,
    fontWeight: '600',
  },
  deleteModelBtn: {
    padding: 5,
  },
  downloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  downloadBtnText: {
    color: '#070a12',
    fontSize: 11,
    fontWeight: '700',
  },
  downloadingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  progressText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  progressContainer: {
    marginTop: 8,
    gap: 4,
  },
  progressBarBg: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  downloadStatusText: {
    color: Colors.textSecondary,
    fontSize: 10,
  },
  modeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundSecondary,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 10,
    gap: 12,
  },
  modeCardActive: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(3, 218, 198, 0.1)',
  },
  modeIconCircle: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modeInfo: {
    flex: 1,
  },
  modeTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modeTitle: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  modeDesc: {
    color: Colors.textMuted,
    fontSize: 11,
    marginTop: 2,
    lineHeight: 16,
  },
  lanConfigBox: {
    backgroundColor: Colors.backgroundSecondary,
    padding: 12,
    borderRadius: 12,
    marginTop: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  lanLabel: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  urlInput: {
    flex: 1,
    backgroundColor: Colors.inputBg,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 40,
    color: Colors.text,
    fontSize: 13,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
  },
  saveUrlBtn: {
    backgroundColor: Colors.backgroundTertiary,
    paddingHorizontal: 14,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  saveUrlBtnText: {
    color: Colors.text,
    fontSize: 12,
    fontWeight: '600',
  },
  testBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(3, 218, 198, 0.1)',
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(3, 218, 198, 0.25)',
  },
  testBtnText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  prefRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  prefTitle: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  prefDesc: {
    color: Colors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  diagRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.04)',
  },
  diagKey: {
    color: Colors.textMuted,
    fontSize: 12,
  },
  diagVal: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  diagValHighlight: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  // Quota & Pro Styles
  quotaCard: {
    borderColor: 'rgba(255, 215, 0, 0.25)',
    backgroundColor: '#171612',
  },
  proTag: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 8,
  },
  proTagText: {
    color: '#070a12',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  quotaDesc: {
    color: Colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },
  quotaContent: {
    marginTop: 4,
    gap: 8,
  },
  quotaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quotaLabel: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  quotaValue: {
    color: Colors.text,
    fontSize: 12,
    fontWeight: '700',
  },
  quotaBarBg: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  quotaBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  quotaSubText: {
    color: Colors.textMuted,
    fontSize: 11,
    lineHeight: 16,
  },
  upgradeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FFD700',
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 6,
  },
  upgradeBtnText: {
    color: '#070a12',
    fontSize: 13,
    fontWeight: '800',
  },
  // Promo / License Styles
  promoInputRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
  },
  promoInput: {
    flex: 1,
    backgroundColor: Colors.inputBg,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 42,
    color: Colors.text,
    fontSize: 13,
    fontWeight: '700',
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    letterSpacing: 0.5,
  },
  redeemBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  redeemBtnText: {
    color: '#070a12',
    fontSize: 13,
    fontWeight: '800',
  },
});
