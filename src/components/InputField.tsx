import React from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface InputFieldProps extends TextInputProps {
  label: string;
  error?: string;
}

export function InputField({ label, error, style, ...props }: InputFieldProps) {
  const { isDark } = useTheme();
  const bg = isDark ? '#374151' : '#F9FAFB';
  const text = isDark ? '#F9FAFB' : '#111827';
  const placeholder = isDark ? '#9CA3AF' : '#6B7280';
  const border = error ? '#EF4444' : (isDark ? '#4B5563' : '#E5E7EB');

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: text }]}>{label}</Text>
      <TextInput
        style={[
          styles.input,
          { backgroundColor: bg, color: text, borderColor: border },
          style,
        ]}
        placeholderTextColor={placeholder}
        {...props}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  error: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
  },
});
