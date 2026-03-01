import { Platform } from 'react-native';
import { Task } from '../models/Task';

let PushNotification: {
  configure: (opts: object) => void;
  createChannel: (opts: object, cb: () => void) => void;
  localNotificationSchedule: (opts: object) => void;
  cancelLocalNotification: (id: string) => void;
} | null = null;

try {
  PushNotification = require('react-native-push-notification').default;
} catch {
  // Package not linked or unavailable
}

export function initNotifications(): void {
  try {
    if (!PushNotification) return;
    PushNotification.configure({
      onNotification: () => { },
      permissions: { alert: true, badge: true, sound: true },
      popInitialNotification: true,
      requestPermissions: Platform.OS === 'ios',
    });
    PushNotification.createChannel(
      {
        channelId: 'task-reminders',
        channelName: 'Task Reminders',
        channelDescription: 'Reminders for task deadlines',
        playSound: true,
        importance: 4,
      },
      () => { }
    );
  } catch (e) {
    console.warn('[NotificationService] Init failed:', e);
  }
}

export function scheduleTaskReminder(task: Task): void {
  try {
    if (!PushNotification) return;
    const reminderTime = task.deadline - 15 * 60 * 1000;
    if (reminderTime <= Date.now()) return;

    PushNotification.localNotificationSchedule({
      channelId: 'task-reminders',
      id: task.id,
      title: `Task due soon: ${task.title}`,
      message: task.description || 'Your task deadline is approaching',
      date: new Date(reminderTime),
      allowWhileIdle: true,
    });
  } catch (e) {
    console.warn('[NotificationService] Schedule failed:', e);
  }
}

export function cancelTaskReminder(taskId: string): void {
  try {
    if (!PushNotification) return;
    PushNotification.cancelLocalNotification(taskId);
  } catch (e) {
    console.warn('[NotificationService] Cancel failed:', e);
  }
}
