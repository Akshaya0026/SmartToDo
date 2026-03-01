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

export const TaskCard = React.memo(({ task, onComplete, onDelete }: TaskCardProps) => {
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

  const priorityColor = PRIORITY_COLORS[task.priority];
  const bg = isDark ? '#1F2937' : '#FFFFFF';
  const text = isDark ? '#F9FAFB' : '#111827';
  const subtext = isDark ? '#9CA3AF' : '#6B7280';

  return (
    <GestureDetector gesture={panGesture}>
      <View style={styles.wrapper}>
        <View style={[styles.swipeHint, styles.completeHint]}>
          <Text style={styles.swipeText}>Complete</Text>
        </View>
        <View style={[styles.swipeHint, styles.deleteHint]}>
          <Text style={styles.swipeText}>Delete</Text>
        </View>
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
            onPress={onComplete}
            activeOpacity={0.7}
          >
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
            {task.description ? (
              <Text
                style={[styles.description, { color: subtext }]}
                numberOfLines={2}
              >
                {task.description}
              </Text>
            ) : null}
            <View style={styles.footer}>
              <View style={[styles.badge, { backgroundColor: priorityColor + '30' }]}>
                <Text style={[styles.badgeText, { color: priorityColor }]}>
                  {task.priority}
                </Text>
              </View>
              <Text style={[styles.countdown, { color: subtext }]}>
                {formatCountdown(task.deadline)}
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
    marginVertical: 6,
    position: 'relative',
  },
  swipeHint: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completeHint: {
    left: 0,
    backgroundColor: '#10B981',
  },
  deleteHint: {
    right: 0,
    backgroundColor: '#EF4444',
  },
  swipeText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 12,
  },
  card: {
    borderRadius: 12,
    overflow: 'hidden',
    flexDirection: 'row',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  priorityBar: {
    width: 4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  completedText: {
    textDecorationLine: 'line-through',
    opacity: 0.7,
  },
  description: {
    fontSize: 14,
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  countdown: {
    fontSize: 12,
  },
});
