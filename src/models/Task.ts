export type Priority = 'high' | 'medium' | 'low';

export interface Task {
  id: string;
  title: string;
  description: string;
  createdAt: number;
  deadline: number;
  priority: Priority;
  completed: boolean;
  userId: string;
}

export interface TaskInput {
  title: string;
  description: string;
  deadline: number;
  priority: Priority;
}
