import api, { ApiResponse, Task, CreateTaskRequest } from './api';

// Task management services
export const getTaskList = async (userId: string): Promise<Task[]> => {
  try {
    const response = await api.get<ApiResponse<{ userId: string; taskList: Task[] }>>(`/task/${userId}/list`);
    return response.data.data.taskList;
  } catch (error) {
    console.error('Failed to get task list:', error);
    throw error;
  }
};

export const createTask = async (userId: string, taskData: CreateTaskRequest): Promise<Task> => {
  try {
    const response = await api.post<ApiResponse<Task>>(`/task/${userId}/create`, taskData);
    return response.data.data;
  } catch (error) {
    console.error('Failed to create task:', error);
    throw error;
  }
};

export const getTaskById = async (userId: string, taskId: string): Promise<Task> => {
  try {
    const response = await api.get<ApiResponse<Task>>(`/task/${userId}/${taskId}`);
    return response.data.data;
  } catch (error) {
    console.error('Failed to get task:', error);
    throw error;
  }
};

export const deleteTask = async (userId: string, taskId: string): Promise<void> => {
  try {
    await api.delete<ApiResponse<void>>(`/task/${userId}/${taskId}`);
  } catch (error) {
    console.error('Failed to delete task:', error);
    throw error;
  }
};

// File services
export const downloadFile = async (taskId: string, fileId: string, fileName?: string): Promise<Blob> => {
  try {
    const params = new URLSearchParams();
    if (fileName) {
      params.append('fileName', fileName);
    }
    
    const response = await api.get(`/task/${taskId}/files/${fileId}/download?${params}`, {
      responseType: 'blob',
    });
    
    return response.data;
  } catch (error) {
    console.error('Failed to download file:', error);
    throw error;
  }
};

export const getFileUrl = (taskId: string, fileId: string): string => {
  return `${api.defaults.baseURL}/task/${taskId}/files/${fileId}/download`;
};