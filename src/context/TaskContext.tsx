import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import NetInfo from '@react-native-community/netinfo';
import { Task, TaskInput } from '../models/Task';
import {
  fetchTasks,
  addTask as addTaskService,
  updateTask as updateTaskService,
  deleteTask as deleteTaskService,
  syncOfflineTasksToFirestore,
  getOfflineTasks,
} from '../services/taskService';
import { sortTasks } from '../utils/sortTasks';

interface TaskContextType {
  tasks: Task[];
  loading: boolean;
  isOnline: boolean;
  addTask: (input: TaskInput) => Promise<void>;
  toggleComplete: (taskId: string) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<void>;
  refreshTasks: () => Promise<void>;
  filter: 'all' | 'pending' | 'completed' | 'high' | 'medium' | 'low';
  setFilter: (f: TaskContextType['filter']) => void;
  reorderTasks: (newTasks: Task[]) => void;
  filteredTasks: Task[];
  stats: {
    total: number;
    completed: number;
    pending: number;
    highPriority: number;
    streak: number;
  };
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export function TaskProvider({
  children,
  userId,
}: {
  children: ReactNode;
  userId: string | null;
}) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const [filter, setFilter] = useState<TaskContextType['filter']>('all');

  const loadTasks = useCallback(async () => {
    if (!userId) {
      setTasks([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await fetchTasks(userId);
      setTasks(sortTasks(data));
    } catch (error) {
      console.error('Load tasks error:', error);
      const offline = await getOfflineTasks(userId);
      setTasks(sortTasks(offline));
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(async (state: { isConnected: boolean | null }) => {
      const online = state.isConnected ?? false;
      setIsOnline(online);
      if (online && userId) {
        const offline = await getOfflineTasks(userId);
        if (offline.length > 0) {
          await syncOfflineTasksToFirestore(userId, offline);
        }
        loadTasks();
      }
    });
    return () => unsubscribe();
  }, [userId, loadTasks]);

  const addTask = useCallback(
    async (input: TaskInput) => {
      console.log('[TaskContext] ADDTASK_START (Optimistic)', { title: input.title });

      // Safety Guard: Use guest_user if userId is missing to prevent button being stuck
      const effectiveUserId = userId || 'guest_user';
      if (!userId) {
        console.warn('[TaskContext] userId missing, falling back to guest_user');
      }

      // 1. Create Heartbeat ID (Guaranteed Unique)
      const heartbeatId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
      const newTask: Task = {
        id: heartbeatId,
        title: input.title,
        description: input.description,
        createdAt: Date.now(),
        deadline: input.deadline,
        priority: input.priority,
        completed: false,
        userId: effectiveUserId,
        subtasks: input.subtasks || [],
        tags: input.tags || [],
        order: tasks.length,
      };

      // 2. Update UI Instantly
      setTasks((prev) => sortTasks([...prev, newTask]));

      // 3. Background Sync
      addTaskService(effectiveUserId, input)
        .then((realTask) => {
          console.log('[TaskContext] Sync Success, replacing Heartbeat ID');
          setTasks((prev) =>
            prev.map((t) => (t.id === heartbeatId ? { ...realTask, order: newTask.order } : t))
          );
        })
        .catch((e) => {
          console.error('[TaskContext] Background Sync Failed (Still saved locally):', e);
        });
    },
    [userId, tasks.length]
  );

  const toggleComplete = useCallback(async (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;
    const completed = !task.completed;
    await updateTask(taskId, { completed });
    setTasks((prev) =>
      sortTasks(
        prev.map((t) => (t.id === taskId ? { ...t, completed } : t))
      )
    );
  }, [tasks]);

  const deleteTask = useCallback(async (taskId: string) => {
    await deleteTaskService(taskId);
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  }, []);

  const updateTask = useCallback(async (taskId: string, updates: Partial<Task>) => {
    await updateTaskService(taskId, updates);
    setTasks((prev) =>
      sortTasks(
        prev.map((t) => (t.id === taskId ? { ...t, ...updates } : t))
      )
    );
  }, []);

  const reorderTasks = useCallback((newTasks: Task[]) => {
    const updated = newTasks.map((t, index) => ({ ...t, order: index }));
    setTasks(updated);
  }, []);

  const filteredTasks = React.useMemo(() => {
    let list = tasks;
    if (filter === 'pending') list = list.filter((t) => !t.completed);
    else if (filter === 'completed') list = list.filter((t) => t.completed);
    else if (filter === 'high') list = list.filter((t) => t.priority === 'high');
    else if (filter === 'medium') list = list.filter((t) => t.priority === 'medium');
    else if (filter === 'low') list = list.filter((t) => t.priority === 'low');
    return list;
  }, [tasks, filter]);

  const stats = React.useMemo(() => {
    // Calculate streak
    const completedDates = new Set(
      tasks
        .filter(t => t.completed)
        .map(t => new Date(t.createdAt).toDateString())
    );

    let streak = 0;
    let curr = new Date();
    while (completedDates.has(curr.toDateString())) {
      streak++;
      curr.setDate(curr.getDate() - 1);
    }

    return {
      total: tasks.length,
      completed: tasks.filter((t) => t.completed).length,
      pending: tasks.filter((t) => !t.completed).length,
      highPriority: tasks.filter((t) => t.priority === 'high' && !t.completed).length,
      streak,
    };
  }, [tasks]);

  return (
    <TaskContext.Provider
      value={{
        tasks,
        loading,
        isOnline,
        addTask,
        toggleComplete,
        deleteTask,
        updateTask,
        reorderTasks,
        refreshTasks: loadTasks,
        filter,
        setFilter,
        filteredTasks,
        stats,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
}

export function useTasks() {
  const ctx = useContext(TaskContext);
  if (!ctx) throw new Error('useTasks must be used within TaskProvider');
  return ctx;
}
