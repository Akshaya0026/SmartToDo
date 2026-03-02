import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
  Modal,
  Keyboard,
  TextInput,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useTasks } from '../context/TaskContext';
import { InputField } from '../components/InputField';
import { Priority } from '../models/Task';
import { formatDate, formatTime } from '../utils/dateUtils';

interface CustomPickerProps {
  visible: boolean;
  onClose: () => void;
  value: Date;
  mode: 'date' | 'time';
  onSelect: (date: Date) => void;
}

function CustomPicker({ visible, onClose, value, mode, onSelect }: CustomPickerProps) {
  const { isDark } = useTheme();
  const [tempDate, setTempDate] = useState(new Date(value));

  const bg = isDark ? '#1F2937' : '#FFFFFF';
  const text = isDark ? '#F9FAFB' : '#111827';
  const overlay = 'rgba(0,0,0,0.5)';

  const adjustDate = (unit: 'day' | 'month' | 'year' | 'hour' | 'min', amount: number) => {
    const next = new Date(tempDate);
    if (unit === 'day') next.setDate(next.getDate() + amount);
    if (unit === 'month') next.setMonth(next.getMonth() + amount);
    if (unit === 'year') next.setFullYear(next.getFullYear() + amount);
    if (unit === 'hour') next.setHours(next.getHours() + amount);
    if (unit === 'min') next.setMinutes(next.getMinutes() + amount);

    if (!isNaN(next.getTime())) {
      setTempDate(next);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={[styles.modalOverlay, { backgroundColor: overlay }]}>
        <View style={[styles.modalContent, { backgroundColor: bg }]}>
          <Text style={[styles.modalTitle, { color: text }]}>
            Set {mode === 'date' ? 'Date' : 'Time'}
          </Text>

          {mode === 'date' ? (
            <View style={styles.pickerRow}>
              <View style={styles.pickerCol}>
                <TouchableOpacity onPress={() => adjustDate('day', 1)}><Text style={styles.arrow}>▲</Text></TouchableOpacity>
                <Text style={[styles.pickerValue, { color: text }]}>{tempDate.getDate()}</Text>
                <TouchableOpacity onPress={() => adjustDate('day', -1)}><Text style={styles.arrow}>▼</Text></TouchableOpacity>
                <Text style={styles.pickerLabel}>Day</Text>
              </View>
              <View style={styles.pickerCol}>
                <TouchableOpacity onPress={() => adjustDate('month', 1)}><Text style={styles.arrow}>▲</Text></TouchableOpacity>
                <Text style={[styles.pickerValue, { color: text }]}>{tempDate.getMonth() + 1}</Text>
                <TouchableOpacity onPress={() => adjustDate('month', -1)}><Text style={styles.arrow}>▼</Text></TouchableOpacity>
                <Text style={styles.pickerLabel}>Month</Text>
              </View>
              <View style={styles.pickerCol}>
                <TouchableOpacity onPress={() => adjustDate('year', 1)}><Text style={styles.arrow}>▲</Text></TouchableOpacity>
                <Text style={[styles.pickerValue, { color: text }]}>{tempDate.getFullYear()}</Text>
                <TouchableOpacity onPress={() => adjustDate('year', -1)}><Text style={styles.arrow}>▼</Text></TouchableOpacity>
                <Text style={styles.pickerLabel}>Year</Text>
              </View>
            </View>
          ) : (
            <View style={styles.pickerRow}>
              <View style={styles.pickerCol}>
                <TouchableOpacity onPress={() => adjustDate('hour', 1)}><Text style={styles.arrow}>▲</Text></TouchableOpacity>
                <Text style={[styles.pickerValue, { color: text }]}>{tempDate.getHours().toString().padStart(2, '0')}</Text>
                <TouchableOpacity onPress={() => adjustDate('hour', -1)}><Text style={styles.arrow}>▼</Text></TouchableOpacity>
                <Text style={styles.pickerLabel}>Hour</Text>
              </View>
              <Text style={[styles.colon, { color: text }]}>:</Text>
              <View style={styles.pickerCol}>
                <TouchableOpacity onPress={() => adjustDate('min', 5)}><Text style={styles.arrow}>▲</Text></TouchableOpacity>
                <Text style={[styles.pickerValue, { color: text }]}>{tempDate.getMinutes().toString().padStart(2, '0')}</Text>
                <TouchableOpacity onPress={() => adjustDate('min', -5)}><Text style={styles.arrow}>▼</Text></TouchableOpacity>
                <Text style={styles.pickerLabel}>Min</Text>
              </View>
            </View>
          )}

          <View style={styles.modalButtons}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.confirmBtn}
              onPress={() => {
                onSelect(tempDate);
                onClose();
              }}
            >
              <Text style={styles.confirmText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export function AddTaskScreen({ navigation }: { navigation: { goBack: () => void } }) {
  const { isDark } = useTheme();
  const { addTask } = useTasks();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState(new Date(Date.now() + 24 * 60 * 60 * 1000));
  const [priority, setPriority] = useState<Priority>('medium');
  const [showPicker, setShowPicker] = useState<'date' | 'time' | null>(null);
  const [loading, setLoading] = useState(false);

  // New features
  const [subtasks, setSubtasks] = useState<{ id: string, title: string, completed: boolean }[]>([]);
  const [subtaskInput, setSubtaskInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  const handleAddSubtask = () => {
    if (!subtaskInput.trim()) return;
    setSubtasks([...subtasks, {
      id: Math.random().toString(36).substr(2, 9),
      title: subtaskInput.trim(),
      completed: false,
    }]);
    setSubtaskInput('');
  };

  const handleAddTag = () => {
    if (!tagInput.trim()) return;
    if (!tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
    }
    setTagInput('');
  };

  const handleSave = () => {
    console.log('[AddTask] ABSOLUTE_SAVE_TRIGGERED');

    // Safety: Hide keyboard immediately to prevent thread locks
    Keyboard.dismiss();

    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a task title');
      return;
    }

    const now = Date.now();
    const deadlineMs = deadline.getTime();

    if (isNaN(deadlineMs)) {
      Alert.alert('Error', 'Invalid date selected.');
      return;
    }

    if (deadlineMs < now) {
      Alert.alert('Invalid Deadline', 'Please select a future date and time.');
      return;
    }

    // 1. Invoke "Never-Fail" Add
    addTask({
      title: title.trim(),
      description: description.trim(),
      deadline: deadlineMs,
      priority,
      subtasks,
      tags,
    });

    console.log('[AddTask] CLOSING_SCREEN_DIRECTLY');

    // 2. Hard Navigation Fallback
    try {
      navigation.goBack();
    } catch (e) {
      console.error('[AddTask] goBack failed, using navigate home');
      (navigation as any).navigate('Home');
    }
  };

  const bg = isDark ? '#111827' : '#F9FAFB';
  const text = isDark ? '#F9FAFB' : '#111827';
  const cardBg = isDark ? '#1F2937' : '#FFFFFF';

  const priorities: Priority[] = ['high', 'medium', 'low'];

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <ScrollView style={styles.scroll} keyboardShouldPersistTaps="handled">
        <InputField
          label="Title"
          value={title}
          onChangeText={setTitle}
          placeholder="Task title"
        />
        <InputField
          label="Description (optional)"
          value={description}
          onChangeText={setDescription}
          placeholder="Task description"
          multiline
          numberOfLines={3}
        />

        <Text style={[styles.label, { color: text }]}>Priority</Text>
        <View style={styles.priorityRow}>
          {priorities.map((p) => (
            <TouchableOpacity
              key={p}
              style={[
                styles.priorityBtn,
                { backgroundColor: cardBg },
                priority === p && styles.priorityBtnActive,
              ]}
              onPress={() => setPriority(p)}
            >
              <Text
                style={[
                  styles.priorityText,
                  { color: text },
                  priority === p && styles.priorityTextActive,
                ]}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.label, { color: text }]}>Deadline</Text>
        <View style={styles.deadlineRow}>
          <TouchableOpacity
            style={[styles.deadlineBtn, { backgroundColor: cardBg }]}
            onPress={() => setShowPicker('date')}
          >
            <Text style={[styles.dateText, { color: text }]}>
              📅 {formatDate(deadline)}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.deadlineBtn, { backgroundColor: cardBg }]}
            onPress={() => setShowPicker('time')}
          >
            <Text style={[styles.dateText, { color: text }]}>
              ⏰ {formatTime(deadline)}
            </Text>
          </TouchableOpacity>
        </View>

        {showPicker && (
          <CustomPicker
            visible={!!showPicker}
            mode={showPicker}
            value={deadline}
            onClose={() => setShowPicker(null)}
            onSelect={(newDate) => setDeadline(newDate)}
          />
        )}

        <View style={styles.section}>
          <Text style={[styles.label, { color: text }]}>Subtasks</Text>
          <View style={styles.addSubtaskRow}>
            <TextInput
              style={[styles.miniInput, { color: text, backgroundColor: cardBg }]}
              placeholder="Add subtask..."
              placeholderTextColor="#9CA3AF"
              value={subtaskInput}
              onChangeText={setSubtaskInput}
            />
            <TouchableOpacity style={styles.addMiniBtn} onPress={handleAddSubtask}>
              <Text style={styles.addMiniBtnText}>+</Text>
            </TouchableOpacity>
          </View>
          {subtasks.map((s, idx) => (
            <View key={idx} style={styles.subtaskItem}>
              <Text style={{ color: text, flex: 1 }}>• {s.title}</Text>
              <TouchableOpacity onPress={() => setSubtasks(subtasks.filter((_, i) => i !== idx))}>
                <Text style={{ color: '#EF4444' }}>✕</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={[styles.label, { color: text }]}>Tags</Text>
          <View style={styles.addSubtaskRow}>
            <TextInput
              style={[styles.miniInput, { color: text, backgroundColor: cardBg }]}
              placeholder="Add tag..."
              placeholderTextColor="#9CA3AF"
              value={tagInput}
              onChangeText={setTagInput}
            />
            <TouchableOpacity style={styles.addMiniBtn} onPress={handleAddTag}>
              <Text style={styles.addMiniBtnText}>+</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.tagList}>
            {tags.map((tag, idx) => (
              <View key={idx} style={styles.tagBadge}>
                <Text style={styles.tagText}>#{tag}</Text>
                <TouchableOpacity onPress={() => setTags(tags.filter((_, i) => i !== idx))}>
                  <Text style={{ color: '#3B82F6', marginLeft: 5 }}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSave}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Add Task</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1, padding: 24 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 6 },
  priorityRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  priorityBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  priorityBtnActive: { borderColor: '#3B82F6', backgroundColor: '#3B82F620' },
  priorityText: { fontSize: 14, fontWeight: '600' },
  priorityTextActive: { color: '#3B82F6' },
  deadlineRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  deadlineBtn: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB33'
  },
  dateText: { fontSize: 15, fontWeight: '600' },
  button: {
    backgroundColor: '#3B82F6',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: '#FFF', fontSize: 16, fontWeight: '700' },

  // New UI components
  section: { marginBottom: 20 },
  addSubtaskRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  miniInput: { flex: 1, padding: 12, borderRadius: 8, fontSize: 14 },
  addMiniBtn: { backgroundColor: '#3B82F6', width: 44, height: 44, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  addMiniBtnText: { color: '#FFF', fontSize: 24, fontWeight: '700' },
  subtaskItem: { flexDirection: 'row', alignItems: 'center', padding: 10, marginVertical: 2 },
  tagList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  tagBadge: { backgroundColor: '#3B82F620', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12, flexDirection: 'row', alignItems: 'center' },
  tagText: { color: '#3B82F6', fontSize: 12, fontWeight: '700' },

  // Modal Styles
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { width: '100%', borderRadius: 20, padding: 24, alignItems: 'center', elevation: 5 },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 20 },
  pickerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 20, marginBottom: 30 },
  pickerCol: { alignItems: 'center' },
  arrow: { fontSize: 24, color: '#3B82F6', padding: 10 },
  pickerValue: { fontSize: 28, fontWeight: '700', marginVertical: 5 },
  pickerLabel: { fontSize: 12, color: '#9CA3AF', fontWeight: '600' },
  colon: { fontSize: 28, fontWeight: '700' },
  modalButtons: { flexDirection: 'row', gap: 12, width: '100%' },
  cancelBtn: { flex: 1, padding: 14, borderRadius: 10, alignItems: 'center', backgroundColor: '#F3F4F6' },
  cancelText: { color: '#4B5563', fontWeight: '600' },
  confirmBtn: { flex: 1, padding: 14, borderRadius: 10, alignItems: 'center', backgroundColor: '#3B82F6' },
  confirmText: { color: '#FFF', fontWeight: '600' },
});
