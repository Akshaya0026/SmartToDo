import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useTheme, THEMES, ThemeType } from '../context/ThemeContext';

export function SettingsScreen({ navigation }: { navigation: any }) {
  const { theme, themeType, setThemeType } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={[styles.backText, { color: theme.primary }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Appearance</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={[styles.sectionLabel, { color: theme.subtext }]}>CHOOSE THEME</Text>

        <View style={styles.themeGrid}>
          {(Object.keys(THEMES) as ThemeType[]).map((key) => {
            const t = THEMES[key];
            const isSelected = themeType === key;

            return (
              <TouchableOpacity
                key={key}
                style={[
                  styles.themeCard,
                  { backgroundColor: t.card, borderColor: isSelected ? t.primary : t.border },
                  isSelected && styles.themeCardActive
                ]}
                onPress={() => setThemeType(key)}
              >
                <View style={[styles.colorBubble, { backgroundColor: t.primary }]} />
                <Text style={[styles.themeLabel, { color: t.text }]}>
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </Text>
                {isSelected && <Text style={{ color: t.primary }}>✓</Text>}
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.previewContainer}>
          <Text style={[styles.previewLabel, { color: theme.subtext }]}>PREVIEW</Text>
          <View style={[styles.previewCard, { backgroundColor: theme.card }]}>
            <Text style={[styles.previewTitle, { color: theme.text }]}>Sample Task</Text>
            <Text style={[styles.previewSub, { color: theme.subtext }]}>This is how your tasks will look.</Text>
            <View style={[styles.previewFab, { backgroundColor: theme.primary }]}>
              <Text style={{ color: '#FFF', fontSize: 20 }}>+</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    padding: 24,
    paddingTop: 60,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  backText: { fontSize: 16, fontWeight: '600' },
  title: { fontSize: 24, fontWeight: '800' },
  scroll: { padding: 24 },
  sectionLabel: { fontSize: 12, fontWeight: '700', letterSpacing: 1, marginBottom: 16 },
  themeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  themeCard: {
    width: '48%',
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    gap: 8,
  },
  themeCardActive: {
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  colorBubble: { width: 40, height: 40, borderRadius: 20 },
  themeLabel: { fontSize: 16, fontWeight: '600' },
  previewContainer: { marginTop: 40 },
  previewLabel: { fontSize: 12, fontWeight: '700', letterSpacing: 1, marginBottom: 16 },
  previewCard: {
    padding: 24,
    borderRadius: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  previewTitle: { fontSize: 18, fontWeight: '700', marginBottom: 4 },
  previewSub: { fontSize: 14, marginBottom: 20 },
  previewFab: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-end',
  },
});
