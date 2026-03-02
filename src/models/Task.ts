export type Priority = 'high' | 'medium' | 'low';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  createdAt: number;
  deadline: number;
  priority: Priority;
  completed: boolean;
  userId: string;
  subtasks?: Subtask[];
  tags?: string[];
  order: number;
}

export interface TaskInput {
  title: string;
  description: string;
  deadline: number;
  priority: Priority;
  subtasks?: Subtask[];
  tags?: string[];
}
