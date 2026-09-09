import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import {
  FileMusic,
  Trash2,
  Share2,
  Download,
  Play,
  Clock,
  Search,
  Zap,
} from 'lucide-react-native';
import Colors from '../../src/constants/Colors';
import { KokoroOnDeviceEngine, GenerationResult } from '../../src/engine/KokoroOnDeviceEngine';
import { AudioWaveformPlayer } from '../../src/components/AudioWaveformPlayer';
import { AudioExporter } from '../../src/engine/AudioExporter';
import { ToastNotification } from '../../src/components/ToastNotification';

export default function LibraryScreen() {
  const [history, setHistory] = useState<GenerationResult[]>([]);
  const [selectedItem, setSelectedItem] = useState<GenerationResult | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const engine = KokoroOnDeviceEngine.getInstance();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [])
  );

  const loadHistory = async () => {
    const list = await engine.getHistory();
    setHistory(list);
    if (list.length > 0 && !selectedItem) {
      setSelectedItem(list[0]);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setToastVisible(true);
  };

  const filteredHistory = history.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.text.toLowerCase().includes(q) ||
      item.title.toLowerCase().includes(q) ||
      item.voiceName.toLowerCase().includes(q) ||
      item.voiceId.toLowerCase().includes(q)
    );
  });

  const handleDeleteItem = (item: GenerationResult) => {
    Alert.alert('Delete Audio', `Delete "${item.title}" from library?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await engine.deleteHistoryItem(item.id);
          if (selectedItem?.id === item.id) {
            setSelectedItem(null);
          }
          await loadHistory();
          showToast('Audio deleted from library');
        },
      },
    ]);
  };

  const handleClearAll = () => {
    if (history.length === 0) return;
    Alert.alert('Clear Library', 'Delete all saved audio clips from storage?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear All',
        style: 'destructive',
        onPress: async () => {
          for (const h of history) {
            await engine.deleteHistoryItem(h.id);
          }
          setSelectedItem(null);
          await loadHistory();
          showToast('Library cleared');
        },
      },
    ]);
  };

  const handleDownloadItem = async (item: GenerationResult) => {
    if (!item.fileUri) {
      showToast('Speaking natively via On-Device Engine');
      return;
    }
    try {
      const cleanName = `${item.title.slice(0, 20).replace(/[^a-zA-Z0-9_-]/g, '_')}_${Date.now()}.wav`;
      const success = await AudioExporter.saveToDownloads(item.fileUri, cleanName);
      if (success) {
        showToast('✓ Saved to Downloads');
      }
    } catch (e: any) {
      Alert.alert('Save Failed', e.message || 'Could not save audio file');
    }
  };

  const handleShareItem = async (item: GenerationResult) => {
    if (!item.fileUri) {
      showToast('Connect Studio for WAV export');
      return;
    }
    try {
      await AudioExporter.shareFile(item.fileUri, `Share ${item.title}`);
    } catch (e: any) {
      Alert.alert('Export Failed', e.message);
    }
  };

  const formatDate = (timestamp: number) => {
    const d = new Date(timestamp);
    return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  const renderHistoryItem = ({ item }: { item: GenerationResult }) => {
    const isSelected = selectedItem?.id === item.id;

    return (
      <TouchableOpacity
        style={[styles.historyCard, isSelected && styles.historyCardActive]}
        onPress={() => setSelectedItem(item)}
        activeOpacity={0.85}
      >
        <View style={styles.cardTopRow}>
          <View style={styles.badgeGroup}>
            <View style={styles.voiceBadge}>
              <Text style={styles.voiceBadgeText}>{item.voiceName}</Text>
            </View>
            <View style={[styles.modeBadge, item.isOffline ? styles.modeOffline : styles.modeLan]}>
              <Text style={styles.modeBadgeText}>{item.isOffline ? 'Offline' : 'Neural Studio'}</Text>
            </View>
          </View>

          {/* Action Icons */}
          <View style={styles.itemActions}>
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => handleDownloadItem(item)}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            >
              <Download size={15} color={Colors.accentSuccess} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => handleShareItem(item)}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            >
              <Share2 size={15} color={Colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => handleDeleteItem(item)}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            >
              <Trash2 size={15} color={Colors.textMuted} />
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.itemTitle} numberOfLines={2}>
          {item.text}
        </Text>

        <View style={styles.cardBottomRow}>
          <View style={styles.timeGroup}>
            <Clock size={12} color={Colors.textMuted} />
            <Text style={styles.timeText}>{formatDate(item.timestamp)}</Text>
          </View>
          <Text style={styles.durationText}>{item.duration.toFixed(1)}s • {item.speed.toFixed(1)}x</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.safeArea, { paddingTop: insets.top }]}>
      <View style={styles.container}>
        {/* Top Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Audio Library</Text>
            <Text style={styles.headerSub}>{history.length} Saved Generations</Text>
          </View>
          {history.length > 0 && (
            <TouchableOpacity style={styles.clearBtn} onPress={handleClearAll}>
              <Text style={styles.clearBtnText}>Clear All</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Selected Audio Player */}
        {selectedItem && (
          <View style={styles.playerContainer}>
            <AudioWaveformPlayer
              fileUri={selectedItem.fileUri}
              duration={selectedItem.duration}
              title={selectedItem.title}
              text={selectedItem.text}
              voiceName={selectedItem.voiceName}
            />
          </View>
        )}

        {/* Search Filter */}
        {history.length > 0 && (
          <View style={styles.searchBar}>
            <Search size={16} color={Colors.textMuted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search audio clips..."
              placeholderTextColor={Colors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              clearButtonMode="while-editing"
            />
          </View>
        )}

        {/* History List */}
        <FlatList
          data={filteredHistory}
          keyExtractor={(item) => item.id}
          renderItem={renderHistoryItem}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyView}>
              <FileMusic size={44} color={Colors.textMuted} />
              <Text style={styles.emptyTitle}>No Audio Clips Yet</Text>
              <Text style={styles.emptySub}>
                Synthesize lifelike speech in the Studio tab to see your offline audio renders here.
              </Text>
              <TouchableOpacity
                style={styles.createBtn}
                onPress={() => router.push('/')}
                activeOpacity={0.8}
              >
                <Zap size={16} color="#070a12" fill="#070a12" />
                <Text style={styles.createBtnText}>Go to Studio</Text>
              </TouchableOpacity>
            </View>
          }
        />
      </View>

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
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
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
  clearBtn: {
    backgroundColor: 'rgba(242, 139, 130, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(242, 139, 130, 0.25)',
  },
  clearBtnText: {
    color: Colors.accent,
    fontSize: 11,
    fontWeight: '700',
  },
  playerContainer: {
    marginBottom: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.inputBg,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 40,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    color: Colors.text,
    fontSize: 13,
  },
  listContainer: {
    gap: 8,
    paddingBottom: 28,
  },
  historyCard: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  historyCardActive: {
    borderColor: Colors.primary,
    backgroundColor: '#242526',
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  badgeGroup: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  voiceBadge: {
    backgroundColor: 'rgba(3, 218, 198, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  voiceBadgeText: {
    color: Colors.primary,
    fontSize: 11,
    fontWeight: '700',
  },
  modeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  modeOffline: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  modeLan: {
    backgroundColor: 'rgba(138, 180, 248, 0.12)',
  },
  modeBadgeText: {
    color: Colors.textSecondary,
    fontSize: 10,
    fontWeight: '600',
  },
  itemActions: {
    flexDirection: 'row',
    gap: 6,
  },
  iconBtn: {
    padding: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 6,
  },
  itemTitle: {
    color: Colors.text,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 8,
  },
  cardBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
    paddingTop: 6,
  },
  timeGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    color: Colors.textMuted,
    fontSize: 11,
  },
  durationText: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
  emptyView: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
    gap: 8,
  },
  emptyTitle: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  emptySub: {
    color: Colors.textMuted,
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 8,
  },
  createBtnText: {
    color: '#070a12',
    fontSize: 13,
    fontWeight: '700',
  },
});
