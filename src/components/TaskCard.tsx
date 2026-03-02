import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Task } from '../models/Task';
import { PRIORITY_COLORS } from '../utils/constants';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');
const SWIPE_THRESHOLD = width * 0.25;

interface TaskCardProps {
  task: Task;
  onComplete: () => void;
  onDelete: () => void;
  navigation?: any;
}

function formatCountdown(deadline: number): string {
  const now = Date.now();
  const diff = deadline - now;
  if (diff <= 0) return 'Overdue';
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days}d left`;
  if (hours > 0) return `${hours}h left`;
  const mins = Math.floor(diff / (1000 * 60));
  return `${mins}m left`;
}

export const TaskCard = React.memo(({ task, onComplete, onDelete, navigation }: TaskCardProps) => {
  const { isDark } = useTheme();
  const translateX = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .onUpdate((e: { translationX: number }) => {
      translateX.value = e.translationX;
    })
    .onEnd((e: { translationX: number }) => {
      if (e.translationX > SWIPE_THRESHOLD) {
        translateX.value = withTiming(width, {}, () => {
          runOnJS(onComplete)();
        });
      } else if (e.translationX < -SWIPE_THRESHOLD) {
        translateX.value = withTiming(-width, {}, () => {
          runOnJS(onDelete)();
        });
      } else {
        translateX.value = withTiming(0);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const opacityComplete = useAnimatedStyle(() => ({
    opacity: translateX.value > 20 ? Math.min(translateX.value / SWIPE_THRESHOLD, 1) : 0,
  }));

  const opacityDelete = useAnimatedStyle(() => ({
    opacity: translateX.value < -20 ? Math.min(Math.abs(translateX.value) / SWIPE_THRESHOLD, 1) : 0,
  }));

  const priorityColor = PRIORITY_COLORS[task.priority];
  const bg = isDark ? '#1F2937' : '#FFFFFF';
  const text = isDark ? '#F9FAFB' : '#111827';
  const subtext = isDark ? '#9CA3AF' : '#6B7280';

  const completedSubtasks = task.subtasks?.filter((s: any) => s.completed).length || 0;
  const totalSubtasks = task.subtasks?.length || 0;

  return (
    <GestureDetector gesture={panGesture}>
      <View style={styles.wrapper}>
        <Animated.View style={[styles.swipeHint, styles.completeHint, opacityComplete]}>
          <Text style={styles.swipeIcon}>✅</Text>
          <Text style={styles.swipeText}>Complete</Text>
        </Animated.View>
        <Animated.View style={[styles.swipeHint, styles.deleteHint, opacityDelete]}>
          <Text style={styles.swipeIcon}>🗑️</Text>
          <Text style={styles.swipeText}>Delete</Text>
        </Animated.View>

        <Animated.View
          style={[
            styles.card,
            { backgroundColor: bg },
            animatedStyle,
          ]}
        >
          <View style={[styles.priorityBar, { backgroundColor: priorityColor }]} />
          <TouchableOpacity
            style={styles.content}
            onPress={() => navigation?.navigate('TaskDetail', { taskId: task.id })}
            activeOpacity={0.7}
          >
            <View style={styles.header}>
              <Text
                style={[
                  styles.title,
                  { color: text },
                  task.completed && styles.completedText,
                ]}
                numberOfLines={1}
              >
                {task.title}
              </Text>
              <View style={[styles.badge, { backgroundColor: priorityColor + '20' }]}>
                <Text style={[styles.badgeText, { color: priorityColor }]}>
                  {task.priority}
                </Text>
              </View>
            </View>

            {task.description ? (
              <Text
                style={[styles.description, { color: subtext }]}
                numberOfLines={2}
              >
                {task.description}
              </Text>
            ) : null}

            <View style={styles.footer}>
              {totalSubtasks > 0 && (
                <View style={styles.subtaskInfo}>
                  <Text style={[styles.subtaskText, { color: subtext }]}>
                    📋 {completedSubtasks}/{totalSubtasks} subtasks
                  </Text>
                </View>
              )}
              <Text style={[styles.countdown, { color: subtext }]}>
                {task.completed ? 'Done' : `⏳ ${formatCountdown(task.deadline)}`}
              </Text>
            </View>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </GestureDetector>
  );
});

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: 16,
    marginVertical: 8,
    position: 'relative',
    borderRadius: 16,
    backgroundColor: '#00000010', // Shadow/Depth base
    overflow: 'hidden',
  },
  swipeHint: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: width,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  completeHint: {
    left: 0,
    backgroundColor: '#10B981',
    justifyContent: 'flex-start',
  },
  deleteHint: {
    right: 0,
    backgroundColor: '#EF4444',
    justifyContent: 'flex-end',
  },
  swipeIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  swipeText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 16,
  },
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    flexDirection: 'row',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  priorityBar: {
    width: 6,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
    marginRight: 10,
  },
  completedText: {
    textDecorationLine: 'line-through',
    opacity: 0.5,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E5E7EB33',
    paddingTop: 12,
  },
  subtaskInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subtaskText: {
    fontSize: 12,
    fontWeight: '600',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  countdown: {
    fontSize: 12,
    fontWeight: '600',
  },
});
