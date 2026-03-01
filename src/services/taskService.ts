import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  Timestamp,
  writeBatch,
} from 'firebase/firestore';
import { getFirebaseDb } from './firebase';
import { Task, TaskInput } from '../models/Task';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { OFFLINE_TASKS_KEY } from '../utils/constants';

const TASKS_COLLECTION = 'tasks';

function taskFromFirestore(docData: Record<string, unknown>, id: string): Task {
  const data = docData as Record<string, unknown>;
  const deadline = data.deadline instanceof Timestamp
    ? data.deadline.toMillis()
    : (data.deadline as number);
  const createdAt = data.createdAt instanceof Timestamp
    ? data.createdAt.toMillis()
    : (data.createdAt as number);

  return {
    id,
    title: data.title as string,
    description: data.description as string,
    createdAt,
    deadline,
    priority: data.priority as Task['priority'],
    completed: data.completed as boolean,
    userId: data.userId as string,
  };
}

export async function fetchTasks(userId: string): Promise<Task[]> {
  try {
    const db = getFirebaseDb();
    const tasksRef = collection(db, TASKS_COLLECTION);
    const q = query(tasksRef, where('userId', '==', userId));
    const snapshot = await getDocs(q);
    const firestoreTasks = snapshot.docs.map((d) =>
      taskFromFirestore(d.data() as Record<string, unknown>, d.id)
    );
    const offlineTasks = await getOfflineTasks(userId);
    const firestoreIds = new Set(firestoreTasks.map((t) => t.id));
    const merged = [
      ...firestoreTasks,
      ...offlineTasks.filter((t) => !firestoreIds.has(t.id)),
    ];
    return merged;
  } catch (error) {
    console.warn('Fetch tasks failed, using offline cache:', error);
    return getOfflineTasks(userId);
  }
}

export async function addTask(
  userId: string,
  input: TaskInput
): Promise<Task> {
  const db = getFirebaseDb();
  const tasksRef = collection(db, TASKS_COLLECTION);
  const now = Date.now();

  const taskData = {
    title: input.title,
    description: input.description,
    createdAt: now,
    deadline: input.deadline,
    priority: input.priority,
    completed: false,
    userId,
  };

  try {
    const docRef = await addDoc(tasksRef, {
      ...taskData,
      createdAt: Timestamp.fromMillis(now),
      deadline: Timestamp.fromMillis(input.deadline),
    });
    return {
      id: docRef.id,
      ...taskData,
    };
  } catch (error) {
    // Offline: save to local and return
    const offlineTask: Task = {
      id: `offline_${Date.now()}`,
      ...taskData,
    };
    await saveOfflineTask(userId, offlineTask);
    return offlineTask;
  }
}

export async function updateTask(
  taskId: string,
  updates: Partial<Pick<Task, 'completed' | 'title' | 'description' | 'deadline' | 'priority'>>
): Promise<void> {
  if (taskId.startsWith('offline_')) {
    const raw = await AsyncStorage.getItem(OFFLINE_TASKS_KEY);
    if (!raw) return;
    const all = JSON.parse(raw) as Task[];
    const task = all.find((t) => t.id === taskId);
    if (task) {
      const updated = all.map((t) =>
        t.id === taskId ? { ...t, ...updates } : t
      );
      await AsyncStorage.setItem(OFFLINE_TASKS_KEY, JSON.stringify(updated));
    }
    return;
  }

  const db = getFirebaseDb();
  const taskRef = doc(db, TASKS_COLLECTION, taskId);
  const firestoreUpdates: Record<string, unknown> = { ...updates };
  if (updates.deadline !== undefined) {
    firestoreUpdates.deadline = Timestamp.fromMillis(updates.deadline);
  }
  try {
    await updateDoc(taskRef, firestoreUpdates);
  } catch (error) {
    console.warn('Update task failed (offline?):', error);
  }
}

export async function deleteTask(taskId: string): Promise<void> {
  if (taskId.startsWith('offline_')) {
    const raw = await AsyncStorage.getItem(OFFLINE_TASKS_KEY);
    if (!raw) return;
    const all = (JSON.parse(raw) as Task[]).filter((t) => t.id !== taskId);
    await AsyncStorage.setItem(OFFLINE_TASKS_KEY, JSON.stringify(all));
    return;
  }

  const db = getFirebaseDb();
  const taskRef = doc(db, TASKS_COLLECTION, taskId);
  try {
    await deleteDoc(taskRef);
  } catch (error) {
    console.warn('Delete task failed (offline?):', error);
  }
}

export async function getOfflineTasks(userId: string): Promise<Task[]> {
  try {
    const raw = await AsyncStorage.getItem(OFFLINE_TASKS_KEY);
    if (!raw) return [];
    const all = JSON.parse(raw) as Task[];
    return all.filter((t) => t.userId === userId);
  } catch {
    return [];
  }
}

export async function saveOfflineTask(userId: string, task: Task): Promise<void> {
  const existing = await getOfflineTasks(userId);
  const filtered = existing.filter((t) => t.id !== task.id);
  const updated = [...filtered, task];
  const all = await getAllOfflineTasks();
  const merged = mergeOfflineWithUser(all, userId, updated);
  await AsyncStorage.setItem(OFFLINE_TASKS_KEY, JSON.stringify(merged));
}

function getAllOfflineTasks(): Promise<Task[]> {
  return AsyncStorage.getItem(OFFLINE_TASKS_KEY).then((raw: string | null) =>
    raw ? JSON.parse(raw) : []
  );
}

function mergeOfflineWithUser(
  all: Task[],
  userId: string,
  userTasks: Task[]
): Task[] {
  const otherUsers = all.filter((t) => t.userId !== userId);
  return [...otherUsers, ...userTasks];
}

export async function syncOfflineTasksToFirestore(
  userId: string,
  tasks: Task[]
): Promise<void> {
  const db = getFirebaseDb();
  const batch = writeBatch(db);
  const tasksRef = collection(db, TASKS_COLLECTION);

  for (const task of tasks) {
    if (task.id.startsWith('offline_')) {
      const docRef = doc(tasksRef);
      batch.set(docRef, {
        title: task.title,
        description: task.description,
        createdAt: Timestamp.fromMillis(task.createdAt),
        deadline: Timestamp.fromMillis(task.deadline),
        priority: task.priority,
        completed: task.completed,
        userId,
      });
    }
  }

  try {
    await batch.commit();
    await clearOfflineTasksForUser(userId);
  } catch (error) {
    console.warn('Sync offline tasks failed:', error);
  }
}

async function clearOfflineTasksForUser(userId: string): Promise<void> {
  const all = await getAllOfflineTasks();
  const filtered = all.filter((t) => t.userId !== userId);
  await AsyncStorage.setItem(OFFLINE_TASKS_KEY, JSON.stringify(filtered));
}
