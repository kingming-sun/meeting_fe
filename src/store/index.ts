import { create } from 'zustand';
import { UserInfo, Task } from '../services/api';

interface UserState {
  user: UserInfo | null;
  isAuthenticated: boolean;
  setUser: (user: UserInfo | null) => void;
  setAuth: (auth: boolean) => void;
  logout: () => void;
}

interface TaskState {
  tasks: Task[];
  currentTask: Task | null;
  loading: boolean;
  setTasks: (tasks: Task[]) => void;
  setCurrentTask: (task: Task | null) => void;
  setLoading: (loading: boolean) => void;
  addTask: (task: Task) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
}

interface UIState {
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  language: 'zh' | 'en';
  setSidebarOpen: (open: boolean) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setLanguage: (language: 'zh' | 'en') => void;
}

interface FileUploadState {
  uploadProgress: Record<string, number>; // uploadId -> progress
  uploadStatus: Record<string, 'pending' | 'uploading' | 'completed' | 'error'>;
  setUploadProgress: (uploadId: string, progress: number) => void;
  setUploadStatus: (uploadId: string, status: 'pending' | 'uploading' | 'completed' | 'error') => void;
  resetUpload: (uploadId: string) => void;
}

// User store
export const useUserStore = create<UserState>((set) => ({
  user: null,
  isAuthenticated: false,
  setUser: (user) => set({ user }),
  setAuth: (isAuthenticated) => set({ isAuthenticated }),
  logout: () => set({ user: null, isAuthenticated: false }),
}));

// Task store
export const useTaskStore = create<TaskState>((set) => ({
  tasks: [],
  currentTask: null,
  loading: false,
  setTasks: (tasks) => set({ tasks }),
  setCurrentTask: (currentTask) => set({ currentTask }),
  setLoading: (loading) => set({ loading }),
  addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
  updateTask: (taskId, updates) =>
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.taskId === taskId ? { ...task, ...updates } : task
      ),
      currentTask: state.currentTask?.taskId === taskId
        ? { ...state.currentTask, ...updates }
        : state.currentTask,
    })),
  deleteTask: (taskId) =>
    set((state) => ({
      tasks: state.tasks.filter((task) => task.taskId !== taskId),
      currentTask: state.currentTask?.taskId === taskId ? null : state.currentTask,
    })),
}));

// UI store
export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: false,
  theme: 'light',
  language: 'zh',
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  setTheme: (theme) => set({ theme }),
  setLanguage: (language) => set({ language }),
}));

// File upload store
export const useFileUploadStore = create<FileUploadState>((set) => ({
  uploadProgress: {},
  uploadStatus: {},
  setUploadProgress: (uploadId, progress) =>
    set((state) => ({
      uploadProgress: { ...state.uploadProgress, [uploadId]: progress },
    })),
  setUploadStatus: (uploadId, status) =>
    set((state) => ({
      uploadStatus: { ...state.uploadStatus, [uploadId]: status },
    })),
  resetUpload: (uploadId) =>
    set((state) => {
      const { [uploadId]: _, ...remainingProgress } = state.uploadProgress;
      const { [uploadId]: __, ...remainingStatus } = state.uploadStatus;
      return {
        uploadProgress: remainingProgress,
        uploadStatus: remainingStatus,
      };
    }),
}));