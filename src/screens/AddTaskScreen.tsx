import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useTheme } from '../context/ThemeContext';
import { useTasks } from '../context/TaskContext';
import { InputField } from '../components/InputField';
import { Priority } from '../models/Task';
import { formatDate, formatTime } from '../utils/dateUtils';

export function AddTaskScreen({ navigation }: { navigation: { goBack: () => void } }) {
  const { isDark } = useTheme();
  const { addTask } = useTasks();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState(new Date(Date.now() + 24 * 60 * 60 * 1000));
  const [priority, setPriority] = useState<Priority>('medium');
  const [showPicker, setShowPicker] = useState<'date' | 'time' | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a task title');
      return;
    }
    setLoading(true);
    try {
      await addTask({
        title: title.trim(),
        description: description.trim(),
        deadline: deadline.getTime(),
        priority,
      });
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to add task');
    } finally {
      setLoading(false);
    }
  };

  const onDateChange = React.useCallback(
    (event: DateTimePickerEvent, selectedDate?: Date) => {
      // Always dismiss picker immediately for stability
      setShowPicker(null);

      if (event.type === 'dismissed' || !selectedDate) {
        return;
      }

      setDeadline((prevDeadline) => {
        const newDate = new Date(prevDeadline);
        if (showPicker === 'date') {
          newDate.setFullYear(
            selectedDate.getFullYear(),
            selectedDate.getMonth(),
            selectedDate.getDate()
          );
        } else if (showPicker === 'time') {
          newDate.setHours(selectedDate.getHours(), selectedDate.getMinutes(), 0, 0);
        }
        return newDate;
      });
    },
    [showPicker]
  );

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
          <DateTimePicker
            testID="dateTimePicker"
            value={deadline}
            mode={showPicker}
            is24Hour={false}
            display={
              Platform.OS === 'ios'
                ? 'spinner'
                : showPicker === 'date'
                  ? 'calendar'
                  : 'clock'
            }
            onChange={onDateChange}
          />
        )}

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
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
    padding: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  priorityRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  priorityBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  priorityBtnActive: {
    borderColor: '#3B82F6',
    backgroundColor: '#3B82F620',
  },
  priorityText: {
    fontSize: 14,
    fontWeight: '600',
  },
  priorityTextActive: {
    color: '#3B82F6',
  },
  deadlineRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  deadlineBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateText: {
    fontSize: 14,
    fontWeight: '500',
  },
  button: {
    backgroundColor: '#3B82F6',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
