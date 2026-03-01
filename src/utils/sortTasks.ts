import { Task } from '../models/Task';

const PRIORITY_WEIGHT: Record<string, number> = {
  high: 3,
  medium: 2,
  low: 1,
};

/**
 * Smart task sorting algorithm:
 * 1. Incomplete tasks first, completed last
 * 2. By priority (High > Medium > Low)
 * 3. By deadline proximity (nearer deadline first)
 */
export function sortTasks(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    // Completed tasks go to the bottom
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }

    // If both completed, sort by completion time (most recent first)
    if (a.completed && b.completed) {
      return b.createdAt - a.createdAt;
    }

    // Incomplete tasks: sort by priority first
    const priorityA = PRIORITY_WEIGHT[a.priority] ?? 0;
    const priorityB = PRIORITY_WEIGHT[b.priority] ?? 0;

    if (priorityA !== priorityB) {
      return priorityB - priorityA; // Higher priority first
    }

    // Same priority: sort by deadline (sooner first)
    return a.deadline - b.deadline;
  });
}
