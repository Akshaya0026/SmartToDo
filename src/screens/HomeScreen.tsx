import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import DraggableFlatList, { ScaleDecorator, RenderItemParams } from 'react-native-draggable-flatlist';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useTasks } from '../context/TaskContext';
import { TaskCard } from '../components/TaskCard';
import { StatsCard } from '../components/StatsCard';
import { ProgressBar } from '../components/ProgressBar';
import { Task } from '../models/Task';

const FILTERS = [
  { key: 'all' as const, label: 'All' },
  { key: 'pending' as const, label: 'Pending' },
  { key: 'completed' as const, label: 'Done' },
  { key: 'high' as const, label: 'High' },
  { key: 'medium' as const, label: 'Medium' },
  { key: 'low' as const, label: 'Low' },
];

export function HomeScreen({ navigation }: { navigation: any }) {
  const { theme } = useTheme();
  const { user, logout } = useAuth();
  const {
    filteredTasks,
    loading,
    refreshTasks,
    filter,
    setFilter,
    toggleComplete,
    deleteTask,
    reorderTasks,
    stats,
    isOnline,
  } = useTasks();

  const { background: bg, text, subtext, card: cardBg } = theme;
  const dailyProgress = stats.total > 0 ? stats.completed / stats.total : 0;

  const renderItem = useCallback(({ item, drag, isActive }: RenderItemParams<Task>) => {
    return (
      <ScaleDecorator>
        <TouchableOpacity
          onLongPress={filter === 'all' ? drag : undefined}
          disabled={isActive}
          activeOpacity={1}
        >
          <TaskCard
            task={item}
            onComplete={() => toggleComplete(item.id)}
            onDelete={() => deleteTask(item.id)}
            navigation={navigation}
          />
        </TouchableOpacity>
      </ScaleDecorator>
    );
  }, [filter, toggleComplete, deleteTask, navigation]);

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <View style={[styles.header, { backgroundColor: cardBg }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
            <Text style={[styles.greeting, { color: subtext }]}>Hello,</Text>
            <Text style={[styles.userName, { color: text }]}>
              {user?.email?.split('@')[0] ?? 'User'}
            </Text>
          </TouchableOpacity>
          <View style={styles.headerActions}>
            {!isOnline && (
              <View style={styles.offlineBadge}>
                <Text style={styles.offlineText}>Offline</Text>
              </View>
            )}
            <TouchableOpacity
              style={[styles.themeBtn, { backgroundColor: theme.primary + '20' }]}
              onPress={() => navigation.navigate('Settings')}
            >
              <Text style={{ fontSize: 20 }}>⚙️</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.logoutBtn, { backgroundColor: '#EF444420' }]}
              onPress={logout}
            >
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ProgressBar progress={dailyProgress} label="Daily Progress" />

        <View style={styles.statsRow}>
          <StatsCard label="Total" value={stats.total} />
          <StatsCard label="Completed" value={stats.completed} color="#10B981" />
          <StatsCard label="Pending" value={stats.pending} color="#F59E0B" />
          <StatsCard label="High Priority" value={stats.highPriority} color="#EF4444" />
        </View>
      </View>

      <View style={styles.filterRow}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[
              styles.filterChip,
              { backgroundColor: cardBg },
              filter === f.key && { backgroundColor: theme.primary },
            ]}
            onPress={() => setFilter(f.key)}
          >
            <Text
              style={[
                styles.filterText,
                { color: text },
                filter === f.key && { color: '#FFF' },
              ]}
            >
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : (
        <DraggableFlatList
          data={filteredTasks}
          keyExtractor={(item) => item.id}
          onDragEnd={({ data }) => reorderTasks(data)}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={[styles.emptyText, { color: subtext }]}>
                No tasks yet. Tap + to add one!
              </Text>
            </View>
          }
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={refreshTasks}
              tintColor={theme.primary}
            />
          }
        />
      )}

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: theme.primary }]}
        onPress={() => navigation.navigate('AddTask')}
        activeOpacity={0.8}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    padding: 20,
    paddingTop: 48,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greeting: { fontSize: 14 },
  userName: { fontSize: 20, fontWeight: '700' },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  offlineBadge: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  offlineText: { color: '#FFF', fontSize: 12, fontWeight: '600' },
  themeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  logoutText: { color: '#EF4444', fontWeight: '600', fontSize: 14 },
  statsRow: { flexDirection: 'row', flexWrap: 'wrap' },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', padding: 12, gap: 8 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  filterText: { fontSize: 14, fontWeight: '500' },
  list: { paddingBottom: 100 },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { padding: 48, alignItems: 'center' },
  emptyText: { fontSize: 16 },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  fabText: { color: '#FFF', fontSize: 28, fontWeight: '300', lineHeight: 32 },
});
