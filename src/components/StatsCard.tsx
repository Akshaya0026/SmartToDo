import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface StatsCardProps {
  label: string;
  value: number;
  color?: string;
}

export function StatsCard({ label, value, color }: StatsCardProps) {
  const { isDark } = useTheme();
  const bg = isDark ? '#1F2937' : '#F3F4F6';
  const text = isDark ? '#F9FAFB' : '#111827';
  const accent = color ?? (isDark ? '#60A5FA' : '#3B82F6');

  return (
    <View style={[styles.card, { backgroundColor: bg }]}>
      <Text style={[styles.value, { color: accent }]}>{value}</Text>
      <Text style={[styles.label, { color: text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    margin: 4,
    alignItems: 'center',
  },
  value: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
  },
});
