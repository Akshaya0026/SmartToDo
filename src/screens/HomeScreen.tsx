import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useTasks } from '../context/TaskContext';
import { TaskCard } from '../components/TaskCard';
import { StatsCard } from '../components/StatsCard';

const FILTERS = [
  { key: 'all' as const, label: 'All' },
  { key: 'pending' as const, label: 'Pending' },
  { key: 'completed' as const, label: 'Done' },
  { key: 'high' as const, label: 'High' },
  { key: 'medium' as const, label: 'Medium' },
  { key: 'low' as const, label: 'Low' },
];

export function HomeScreen({ navigation }: { navigation: { navigate: (s: string) => void } }) {
  const { isDark } = useTheme();
  const { user, logout } = useAuth();
  const {
    filteredTasks,
    loading,
    refreshTasks,
    filter,
    setFilter,
    toggleComplete,
    deleteTask,
    stats,
    isOnline,
  } = useTasks();

  const bg = isDark ? '#111827' : '#F9FAFB';
  const text = isDark ? '#F9FAFB' : '#111827';
  const subtext = isDark ? '#9CA3AF' : '#6B7280';
  const cardBg = isDark ? '#1F2937' : '#FFFFFF';

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <View style={[styles.header, { backgroundColor: cardBg }]}>
        <View style={styles.headerTop}>
          <View>
            <Text style={[styles.greeting, { color: subtext }]}>Hello,</Text>
            <Text style={[styles.userName, { color: text }]}>
              {user?.email?.split('@')[0] ?? 'User'}
            </Text>
          </View>
          <View style={styles.headerActions}>
            {!isOnline && (
              <View style={styles.offlineBadge}>
                <Text style={styles.offlineText}>Offline</Text>
              </View>
            )}
            <TouchableOpacity
              style={[styles.themeBtn, { backgroundColor: isDark ? '#374151' : '#E5E7EB' }]}
              onPress={() => navigation.navigate('Settings')}
            >
              <Text style={[styles.themeBtnLabel, { color: text }]}>⚙️</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.logoutBtn, { backgroundColor: '#EF444420' }]}
              onPress={logout}
            >
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>

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
              filter === f.key && styles.filterChipActive,
            ]}
            onPress={() => setFilter(f.key)}
          >
            <Text
              style={[
                styles.filterText,
                { color: text },
                filter === f.key && styles.filterTextActive,
              ]}
            >
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      ) : (
        <FlatList
          data={filteredTasks}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TaskCard
              task={item}
              onComplete={() => toggleComplete(item.id)}
              onDelete={() => deleteTask(item.id)}
            />
          )}
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
              tintColor="#3B82F6"
            />
          }
          // Performance props
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={5}
          removeClippedSubviews={Platform.OS === 'android'}
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddTask')}
        activeOpacity={0.8}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
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
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greeting: {
    fontSize: 14,
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  offlineBadge: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  offlineText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  themeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  themeBtnLabel: {
    fontSize: 20,
  },
  logoutBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  logoutText: {
    color: '#EF4444',
    fontWeight: '600',
    fontSize: 14,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  filterChipActive: {
    backgroundColor: '#3B82F6',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#FFF',
  },
  list: {
    paddingBottom: 100,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  empty: {
    padding: 48,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  fabText: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: '300',
    lineHeight: 32,
  },
});
