import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import type { ThemeMode } from '../context/ThemeContext';
import { logger } from '../utils/DebugLogger';

const THEMES: { key: ThemeMode; label: string }[] = [
  { key: 'light', label: 'Light' },
  { key: 'dark', label: 'Dark' },
  { key: 'system', label: 'System' },
];

export function SettingsScreen({ navigation }: { navigation: { goBack: () => void } }) {
  const { isDark, themeMode, setThemeMode } = useTheme();
  const bg = isDark ? '#111827' : '#F9FAFB';
  const text = isDark ? '#F9FAFB' : '#111827';
  const cardBg = isDark ? '#1F2937' : '#FFFFFF';

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={[styles.back, { color: '#3B82F6' }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: text }]}>Settings</Text>
      </View>

      <View style={[styles.card, { backgroundColor: cardBg }]}>
        <Text style={[styles.sectionTitle, { color: text }]}>Theme</Text>
        {THEMES.map((t) => (
          <TouchableOpacity
            key={t.key}
            style={[
              styles.option,
              themeMode === t.key && styles.optionActive,
            ]}
            onPress={() => setThemeMode(t.key)}
          >
            <Text
              style={[
                styles.optionText,
                { color: text },
                themeMode === t.key && styles.optionTextActive,
              ]}
            >
              {t.label}
            </Text>
            {themeMode === t.key && <Text style={styles.check}>✓</Text>}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 48,
  },
  back: {
    fontSize: 16,
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  card: {
    margin: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    padding: 16,
    paddingBottom: 8,
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  optionActive: {
    backgroundColor: '#3B82F620',
  },
  optionText: {
    fontSize: 16,
  },
  optionTextActive: {
    color: '#3B82F6',
    fontWeight: '600',
  },
  check: {
    color: '#3B82F6',
    fontSize: 18,
    fontWeight: '700',
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logContainer: {
    padding: 10,
    maxHeight: 300,
  },
  logText: {
    fontSize: 10,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    marginBottom: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E5E7EB33',
    paddingBottom: 2,
  },
});
