import React, { useState, useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X, Search, Check, Mic, Star } from 'lucide-react-native';
import Colors from '../constants/Colors';
import { VOICES_CATALOG, LANGUAGES_FILTER, VoiceItem } from '../constants/VoicesCatalog';

interface VoiceSelectorModalProps {
  visible: boolean;
  onClose: () => void;
  selectedVoiceId: string;
  onSelectVoice: (voice: VoiceItem) => void;
  title?: string;
}

export const VoiceSelectorModal: React.FC<VoiceSelectorModalProps> = ({
  visible,
  onClose,
  selectedVoiceId,
  onSelectVoice,
  title = 'Select Studio Voice',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLang, setSelectedLang] = useState('all');

  const filteredVoices = useMemo(() => {
    return VOICES_CATALOG.filter((v) => {
      const matchLang = selectedLang === 'all' || v.lang === selectedLang;
      const matchSearch =
        searchQuery.trim() === '' ||
        v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.traits.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.langName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchLang && matchSearch;
    });
  }, [searchQuery, selectedLang]);

  const renderVoiceItem = ({ item }: { item: VoiceItem }) => {
    const isSelected = item.id === selectedVoiceId;

    return (
      <TouchableOpacity
        style={[styles.voiceCard, isSelected && styles.voiceCardSelected]}
        onPress={() => {
          onSelectVoice(item);
          onClose();
        }}
      >
        <View style={styles.voiceHeader}>
          <Text style={styles.flag}>{item.flag}</Text>
          <View style={styles.voiceInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.voiceName}>{item.name}</Text>
              {item.recommended && (
                <View style={styles.recBadge}>
                  <Star size={10} color="#f59e0b" fill="#f59e0b" />
                  <Text style={styles.recText}>Top</Text>
                </View>
              )}
            </View>
            <Text style={styles.voiceLang}>{item.langName} • {item.gender}</Text>
          </View>
        </View>

        <Text style={styles.traitsText} numberOfLines={1}>
          {item.traits}
        </Text>

        <View style={styles.cardFooter}>
          <View style={styles.gradeBadge}>
            <Text style={styles.gradeText}>{item.grade}</Text>
          </View>
          {isSelected && (
            <View style={styles.selectedBadge}>
              <Check size={14} color="#070a12" />
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <View style={[styles.safeArea, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <View style={styles.container}>
          {/* Top Bar */}
          <View style={styles.topBar}>
            <View style={styles.titleWithIcon}>
              <Mic size={20} color={Colors.primary} />
              <Text style={styles.headerTitle}>{title}</Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <X size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Search Box */}
          <View style={styles.searchBar}>
            <Search size={18} color={Colors.textMuted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search 54 voices by name, language, trait..."
              placeholderTextColor={Colors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              clearButtonMode="while-editing"
            />
          </View>

          {/* Language Filter Tabs */}
          <View style={styles.filterWrapper}>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={LANGUAGES_FILTER}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => {
                const isActive = selectedLang === item.code;
                return (
                  <TouchableOpacity
                    style={[styles.langChip, isActive && styles.langChipActive]}
                    onPress={() => setSelectedLang(item.code)}
                  >
                    <Text style={styles.langChipFlag}>{item.flag}</Text>
                    <Text style={[styles.langChipText, isActive && styles.langChipTextActive]}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              }}
              contentContainerStyle={styles.langListContainer}
            />
          </View>

          {/* Voices List */}
          <FlatList
            data={filteredVoices}
            keyExtractor={(item) => item.id}
            renderItem={renderVoiceItem}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyView}>
                <Text style={styles.emptyText}>No voices found matching "{searchQuery}"</Text>
              </View>
            }
          />
        </View>
      </View>
    </Modal>
  );
};

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
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    color: Colors.text,
    fontSize: 20,
    fontWeight: '700',
  },
  closeBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    padding: 8,
    borderRadius: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.inputBg,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    color: Colors.text,
    fontSize: 15,
  },
  filterWrapper: {
    marginBottom: 12,
  },
  langListContainer: {
    gap: 8,
    paddingVertical: 2,
  },
  langChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.backgroundSecondary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  langChipActive: {
    backgroundColor: 'rgba(249, 115, 22, 0.16)',
    borderColor: Colors.primary,
  },
  langChipFlag: {
    fontSize: 14,
  },
  langChipText: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '500',
  },
  langChipTextActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  listContainer: {
    paddingBottom: 24,
    gap: 10,
  },
  voiceCard: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  voiceCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(249, 115, 22, 0.12)',
  },
  voiceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  flag: {
    fontSize: 28,
  },
  voiceInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  voiceName: {
    color: Colors.text,
    fontSize: 16,
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
    fontSize: 10,
    fontWeight: '700',
  },
  voiceLang: {
    color: Colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  traitsText: {
    color: Colors.textSecondary,
    fontSize: 13,
    marginVertical: 8,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  gradeBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  gradeText: {
    color: Colors.primary,
    fontSize: 11,
    fontWeight: '700',
  },
  selectedBadge: {
    backgroundColor: Colors.primary,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyView: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    color: Colors.textMuted,
    fontSize: 14,
  },
});
