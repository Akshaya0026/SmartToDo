import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    TextInput,
    Alert,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useTasks } from '../context/TaskContext';
import { formatDate, formatTime } from '../utils/dateUtils';

export function TaskDetailScreen({ route, navigation }: any) {
    const { taskId } = route.params;
    const { isDark } = useTheme();
    const { tasks, toggleComplete, deleteTask, updateTask } = useTasks() as any; // Assuming updateTask will be added
    const task = tasks.find((t: any) => t.id === taskId);

    const [newSubtask, setNewSubtask] = useState('');

    if (!task) {
        return (
            <View style={styles.container}>
                <Text>Task not found</Text>
            </View>
        );
    }

    const bg = isDark ? '#111827' : '#F9FAFB';
    const text = isDark ? '#F9FAFB' : '#111827';
    const cardBg = isDark ? '#1F2937' : '#FFFFFF';
    const subtext = isDark ? '#9CA3AF' : '#6B7280';

    const handleAddSubtask = () => {
        if (!newSubtask.trim()) return;
        const subtasks = [...(task.subtasks || []), {
            id: Math.random().toString(36).substr(2, 9),
            title: newSubtask.trim(),
            completed: false,
        }];
        updateTask(taskId, { subtasks });
        setNewSubtask('');
    };

    const toggleSubtask = (subId: string) => {
        const subtasks = task.subtasks.map((s: any) =>
            s.id === subId ? { ...s, completed: !s.completed } : s
        );
        updateTask(taskId, { subtasks });
    };

    const removeSubtask = (subId: string) => {
        const subtasks = task.subtasks.filter((s: any) => s.id !== subId);
        updateTask(taskId, { subtasks });
    };

    return (
        <View style={[styles.container, { backgroundColor: bg }]}>
            <View style={[styles.header, { backgroundColor: cardBg }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Text style={{ fontSize: 24, color: text }}>←</Text>
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: text }]}>Task Details</Text>
                <TouchableOpacity
                    onPress={() => {
                        Alert.alert('Delete Task', 'Are you sure?', [
                            { text: 'Cancel', style: 'cancel' },
                            {
                                text: 'Delete', style: 'destructive', onPress: () => {
                                    deleteTask(taskId);
                                    navigation.goBack();
                                }
                            },
                        ]);
                    }}
                >
                    <Text style={{ fontSize: 20 }}>🗑️</Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.scroll}>
                <View style={[styles.section, { backgroundColor: cardBg }]}>
                    <Text style={[styles.title, { color: text }]}>{task.title}</Text>
                    {task.description ? (
                        <Text style={[styles.description, { color: subtext }]}>{task.description}</Text>
                    ) : null}

                    <View style={styles.metaRow}>
                        <View style={styles.metaItem}>
                            <Text style={styles.metaLabel}>Priority</Text>
                            <Text style={[styles.metaValue, { color: getPriorityColor(task.priority) }]}>
                                {task.priority.toUpperCase()}
                            </Text>
                        </View>
                        <View style={styles.metaItem}>
                            <Text style={styles.metaLabel}>Deadline</Text>
                            <Text style={[styles.metaValue, { color: text }]}>
                                {formatDate(task.deadline)} {formatTime(task.deadline)}
                            </Text>
                        </View>
                    </View>
                </View>

                <View style={[styles.section, { backgroundColor: cardBg }]}>
                    <Text style={[styles.sectionTitle, { color: text }]}>Subtasks</Text>
                    {task.subtasks?.map((s: any) => (
                        <View key={s.id} style={styles.subtaskRow}>
                            <TouchableOpacity onPress={() => toggleSubtask(s.id)} style={styles.checkbox}>
                                <Text style={{ fontSize: 18 }}>{s.completed ? '✅' : '⬜'}</Text>
                            </TouchableOpacity>
                            <Text style={[
                                styles.subtaskTitle,
                                { color: text },
                                s.completed && styles.completedText
                            ]}>
                                {s.title}
                            </Text>
                            <TouchableOpacity onPress={() => removeSubtask(s.id)}>
                                <Text style={{ fontSize: 16 }}>✕</Text>
                            </TouchableOpacity>
                        </View>
                    ))}

                    <View style={styles.addSubtask}>
                        <TextInput
                            style={[styles.input, { color: text, borderBottomColor: subtext + '40' }]}
                            placeholder="Add subtask..."
                            placeholderTextColor={subtext}
                            value={newSubtask}
                            onChangeText={setNewSubtask}
                            onSubmitEditing={handleAddSubtask}
                        />
                        <TouchableOpacity onPress={handleAddSubtask} style={styles.addBtn}>
                            <Text style={{ color: '#3B82F6', fontWeight: '700' }}>ADD</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={[styles.section, { backgroundColor: cardBg }]}>
                    <Text style={[styles.sectionTitle, { color: text }]}>Tags</Text>
                    <View style={styles.tagContainer}>
                        {task.tags?.map((tag: string) => (
                            <View key={tag} style={styles.tag}>
                                <Text style={styles.tagText}>#{tag}</Text>
                            </View>
                        ))}
                        {(!task.tags || task.tags.length === 0) && (
                            <Text style={{ color: subtext, fontSize: 12 }}>No tags added</Text>
                        )}
                    </View>
                </View>
            </ScrollView>

            <TouchableOpacity
                style={[styles.completeBtn, { backgroundColor: task.completed ? '#6B7280' : '#10B981' }]}
                onPress={() => toggleComplete(taskId)}
            >
                <Text style={styles.completeBtnText}>
                    {task.completed ? 'Mark as Pending' : 'Mark as Completed'}
                </Text>
            </TouchableOpacity>
        </View>
    );
}

function getPriorityColor(p: string) {
    if (p === 'high') return '#EF4444';
    if (p === 'medium') return '#F59E0B';
    return '#10B981';
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 50,
        paddingBottom: 15,
        paddingHorizontal: 20,
    },
    backBtn: { padding: 5 },
    headerTitle: { fontSize: 18, fontWeight: '700' },
    scroll: { flex: 1, padding: 16 },
    section: {
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    title: { fontSize: 24, fontWeight: '800', marginBottom: 10 },
    description: { fontSize: 16, lineHeight: 24, marginBottom: 20 },
    metaRow: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#E5E7EB10', paddingTop: 15 },
    metaItem: { flex: 1 },
    metaLabel: { fontSize: 12, color: '#9CA3AF', fontWeight: '600', marginBottom: 4 },
    metaValue: { fontSize: 14, fontWeight: '700' },
    sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 15 },
    subtaskRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 10 },
    checkbox: { padding: 2 },
    subtaskTitle: { flex: 1, fontSize: 16 },
    completedText: { textDecorationLine: 'line-through', opacity: 0.5 },
    addSubtask: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 10 },
    input: { flex: 1, fontSize: 16, paddingVertical: 8, borderBottomWidth: 1 },
    addBtn: { padding: 10 },
    tagContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    tag: { backgroundColor: '#3B82F620', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
    tagText: { color: '#3B82F6', fontSize: 12, fontWeight: '700' },
    completeBtn: {
        margin: 20,
        padding: 18,
        borderRadius: 12,
        alignItems: 'center',
    },
    completeBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});
