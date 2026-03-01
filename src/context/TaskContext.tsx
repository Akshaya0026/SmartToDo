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
  updateTask,
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
  refreshTasks: () => Promise<void>;
  filter: 'all' | 'pending' | 'completed' | 'high' | 'medium' | 'low';
  setFilter: (f: TaskContextType['filter']) => void;
  filteredTasks: Task[];
  stats: {
    total: number;
    completed: number;
    pending: number;
    highPriority: number;
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
      console.log('[TaskContext] ADDTASK_START', { title: input.title });
      if (!userId) {
        console.error('[TaskContext] ADDTASK_FAIL_NO_USER');
        return;
      }
      try {
        const task = await addTaskService(userId, input);
        console.log('[TaskContext] ADDTASK_SERVICE_SUCCESS', { id: task.id });
        setTasks((prev) => {
          const newList = sortTasks([...prev, task]);
          console.log('[TaskContext] ADDTASK_STATE_UPDATED', { total: newList.length });
          return newList;
        });
      } catch (e: any) {
        console.error('[TaskContext] ADDTASK_SERVICE_EXCEPTION:', e?.message || e);
        throw e; // Re-throw so UI can handle it
      }
    },
    [userId]
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

  const filteredTasks = React.useMemo(() => {
    let list = tasks;
    if (filter === 'pending') list = list.filter((t) => !t.completed);
    else if (filter === 'completed') list = list.filter((t) => t.completed);
    else if (filter === 'high') list = list.filter((t) => t.priority === 'high');
    else if (filter === 'medium') list = list.filter((t) => t.priority === 'medium');
    else if (filter === 'low') list = list.filter((t) => t.priority === 'low');
    return list;
  }, [tasks, filter]);

  const stats = React.useMemo(() => ({
    total: tasks.length,
    completed: tasks.filter((t) => t.completed).length,
    pending: tasks.filter((t) => !t.completed).length,
    highPriority: tasks.filter((t) => t.priority === 'high' && !t.completed).length,
  }), [tasks]);

  return (
    <TaskContext.Provider
      value={{
        tasks,
        loading,
        isOnline,
        addTask,
        toggleComplete,
        deleteTask,
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
