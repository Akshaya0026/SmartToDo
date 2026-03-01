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
  // Disabled legacy notification service for universal stability
  console.log('[NotificationService] Notifications are disabled in this build.');
}

export function scheduleTaskReminder(task: Task): void {
  // Disabled
}

export function cancelTaskReminder(taskId: string): void {
  // Disabled
}
