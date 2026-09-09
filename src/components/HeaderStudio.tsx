import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Cpu, Wifi, Volume2 } from 'lucide-react-native';
import Colors from '../constants/Colors';

interface HeaderStudioProps {
  isOfflineMode: boolean;
  serverConnected?: boolean;
  onToggleMode?: () => void;
}

export const HeaderStudio: React.FC<HeaderStudioProps> = ({
  isOfflineMode,
  serverConnected = false,
  onToggleMode,
}) => {
  return (
    <View style={styles.header}>
      <View style={styles.logoSection}>
        <View style={styles.iconCircle}>
          <Volume2 size={16} color="#070a12" />
        </View>
        <View>
          <Text style={styles.brandTitle}>Kokoro Studio</Text>
          <Text style={styles.brandSubtitle}>Pro Neural TTS</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.modeBadge} onPress={onToggleMode} activeOpacity={0.8}>
        {serverConnected ? (
          <>
            <View style={styles.onlineDot} />
            <Text style={[styles.modeText, { color: Colors.accentSuccess }]}>Studio AI</Text>
          </>
        ) : (
          <>
            <Cpu size={12} color={Colors.primary} />
            <Text style={[styles.modeText, { color: Colors.primary }]}>On-Device</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
    backgroundColor: Colors.background,
  },
  logoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconCircle: {
    backgroundColor: Colors.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandTitle: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  brandSubtitle: {
    color: Colors.textMuted,
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  modeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: Colors.accentSuccess,
  },
  modeText: {
    fontSize: 11,
    fontWeight: '700',
  },
});
