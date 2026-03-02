import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Image,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useTasks } from '../context/TaskContext';
import { TaskCard } from '../components/TaskCard';

export function ProfileScreen({ navigation }: any) {
    const { isDark } = useTheme();
    const { user, logout } = useAuth();
    const { tasks, stats, toggleComplete, deleteTask } = useTasks();

    const bg = isDark ? '#111827' : '#F9FAFB';
    const text = isDark ? '#F9FAFB' : '#111827';
    const cardBg = isDark ? '#1F2937' : '#FFFFFF';
    const subtext = isDark ? '#9CA3AF' : '#6B7280';

    const completedTasks = tasks.filter(t => t.completed);

    return (
        <View style={[styles.container, { backgroundColor: bg }]}>
            <View style={[styles.header, { backgroundColor: cardBg }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Text style={{ fontSize: 24, color: text }}>←</Text>
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: text }]}>My Profile</Text>
                <TouchableOpacity onPress={logout}>
                    <Text style={{ color: '#EF4444', fontWeight: '700' }}>Logout</Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.scroll}>
                <View style={styles.profileSection}>
                    <View style={[styles.avatarContainer, { backgroundColor: '#3B82F620' }]}>
                        <Text style={styles.avatarText}>
                            {user?.email?.[0].toUpperCase() || 'U'}
                        </Text>
                    </View>
                    <Text style={[styles.email, { color: text }]}>{user?.email}</Text>
                    <View style={styles.streakBadge}>
                        <Text style={styles.streakText}>🔥 {stats.streak} Day Streak</Text>
                    </View>
                </View>

                <View style={styles.statsGrid}>
                    <View style={[styles.statCard, { backgroundColor: cardBg }]}>
                        <Text style={[styles.statValue, { color: '#3B82F6' }]}>{stats.total}</Text>
                        <Text style={[styles.statLabel, { color: subtext }]}>Total Tasks</Text>
                    </View>
                    <View style={[styles.statCard, { backgroundColor: cardBg }]}>
                        <Text style={[styles.statValue, { color: '#10B981' }]}>{stats.completed}</Text>
                        <Text style={[styles.statLabel, { color: subtext }]}>Completed</Text>
                    </View>
                    <View style={[styles.statCard, { backgroundColor: cardBg }]}>
                        <Text style={[styles.statValue, { color: '#F59E0B' }]}>{stats.pending}</Text>
                        <Text style={[styles.statLabel, { color: subtext }]}>Pending</Text>
                    </View>
                    <View style={[styles.statCard, { backgroundColor: cardBg }]}>
                        <Text style={[styles.statValue, { color: '#10B981' }]}>
                            {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
                        </Text>
                        <Text style={[styles.statLabel, { color: subtext }]}>Success Rate</Text>
                    </View>
                </View>

                <Text style={[styles.sectionTitle, { color: text }]}>Finished Tasks</Text>
                {completedTasks.length > 0 ? (
                    completedTasks.map(task => (
                        <TaskCard
                            key={task.id}
                            task={task}
                            onComplete={() => toggleComplete(task.id)}
                            onDelete={() => deleteTask(task.id)}
                        />
                    ))
                ) : (
                    <View style={styles.empty}>
                        <Text style={{ color: subtext }}>No finished tasks yet.</Text>
                    </View>
                )}
            </ScrollView>
        </View>
    );
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
    scroll: { flex: 1 },
    profileSection: {
        alignItems: 'center',
        padding: 30,
    },
    avatarContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
    },
    avatarText: { fontSize: 32, fontWeight: '800', color: '#3B82F6' },
    email: { fontSize: 18, fontWeight: '600', marginBottom: 10 },
    streakBadge: {
        backgroundColor: '#FFEDD5',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    streakText: { color: '#EA580C', fontWeight: '700', fontSize: 14 },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: 10,
        gap: 10,
    },
    statCard: {
        flex: 1,
        minWidth: '45%',
        padding: 20,
        borderRadius: 16,
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    statValue: { fontSize: 24, fontWeight: '800', marginBottom: 4 },
    statLabel: { fontSize: 12, fontWeight: '600' },
    sectionTitle: { fontSize: 20, fontWeight: '800', marginHorizontal: 20, marginTop: 20, marginBottom: 10 },
    empty: { padding: 40, alignItems: 'center' },
});
