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

// File download with resume support
export const downloadFile = async (
  taskId: string,
  fileId: string,
  fileName?: string,
  onProgress?: (loaded: number, total: number) => void
): Promise<Blob> => {
  try {
    const params = new URLSearchParams();
    if (fileName) {
      params.append('fileName', fileName);
    }
    
    const response = await api.get(`/task/${taskId}/files/${fileId}/download?${params}`, {
      responseType: 'blob',
      onDownloadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          onProgress(progressEvent.loaded, progressEvent.total);
        }
      },
    });
    
    return response.data;
  } catch (error) {
    console.error('Failed to download file:', error);
    throw error;
  }
};

// Download file with range support (for large files > 100MB)
export const downloadFileWithRange = async (
  taskId: string,
  fileId: string,
  fileName: string,
  onProgress?: (loaded: number, total: number) => void
): Promise<Blob> => {
  try {
    // First, get file metadata to determine file size
    const params = new URLSearchParams();
    if (fileName) {
      params.append('fileName', fileName);
    }

    // Check if file size is available from task info
    // If file is > 100MB, we should use range requests
    const CHUNK_SIZE = 10 * 1024 * 1024; // 10MB chunks
    
    // Make a HEAD request to get file size
    const headResponse = await api.head(`/task/${taskId}/files/${fileId}/download?${params}`);
    const fileSize = parseInt(headResponse.headers['content-length'] || '0');
    
    // If file is small enough, download directly
    if (fileSize < 100 * 1024 * 1024) {
      return downloadFile(taskId, fileId, fileName, onProgress);
    }
    
    // For large files, download in chunks
    const chunks: Blob[] = [];
    let downloadedSize = 0;
    
    while (downloadedSize < fileSize) {
      const start = downloadedSize;
      const end = Math.min(downloadedSize + CHUNK_SIZE - 1, fileSize - 1);
      
      const response = await api.get(`/task/${taskId}/files/${fileId}/download?${params}`, {
        responseType: 'blob',
        headers: {
          'Range': `bytes=${start}-${end}`,
        },
      });
      
      chunks.push(response.data);
      downloadedSize = end + 1;
      
      if (onProgress) {
        onProgress(downloadedSize, fileSize);
      }
    }
    
    // Combine all chunks into one blob
    return new Blob(chunks);
  } catch (error) {
    console.error('Failed to download file with range:', error);
    throw error;
  }
};

export const getFileUrl = (taskId: string, fileId: string): string => {
  return `${api.defaults.baseURL}/task/${taskId}/files/${fileId}/download`;
};