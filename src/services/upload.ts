import api, { ApiResponse, InitUploadRequest, InitUploadResponse } from './api';

// File upload services
export const initFileUpload = async (taskId: string, fileData: InitUploadRequest): Promise<InitUploadResponse> => {
  try {
    const response = await api.post<ApiResponse<InitUploadResponse>>(`/task/${taskId}/files/init-upload`, fileData);
    return response.data.data;
  } catch (error) {
    console.error('Failed to initialize file upload:', error);
    throw error;
  }
};

export const checkUploadedChunks = async (taskId: string, uploadId: string): Promise<{ uploadedChunks: number[]; count: number }> => {
  try {
    const response = await api.get<ApiResponse<{ uploadedChunks: number[]; count: number }>>(
      `/task/${taskId}/files/upload/${uploadId}/check`
    );
    return response.data.data;
  } catch (error) {
    console.error('Failed to check uploaded chunks:', error);
    throw error;
  }
};

export const uploadChunk = async (
  taskId: string,
  uploadId: string,
  chunkIndex: number,
  chunkData: Blob,
  chunkMd5: string
): Promise<{ chunkIdx: string }> => {
  try {
    const formData = new FormData();
    formData.append('chunk', chunkData);
    
    const response = await api.put<ApiResponse<{ chunkIdx: string }>>(
      `/task/${taskId}/files/upload/${uploadId}/chunk?chunkIdx=${chunkIndex}&chunkMd5=${chunkMd5}`,
      chunkData,
      {
        headers: {
          'Content-Type': 'application/octet-stream',
        },
      }
    );
    
    return response.data.data;
  } catch (error) {
    console.error('Failed to upload chunk:', error);
    throw error;
  }
};

export const completeFileUpload = async (
  taskId: string,
  uploadId: string,
  fileMd5: string,
  totalChunks: number
): Promise<any> => {
  try {
    const response = await api.post<ApiResponse<any>>(
      `/task/${taskId}/files/upload/${uploadId}/complete`,
      {
        fileMd5,
        totalChunks,
      }
    );
    return response.data.data;
  } catch (error) {
    console.error('Failed to complete file upload:', error);
    throw error;
  }
};

// Utility function to calculate MD5 hash
export const calculateMD5 = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const crypto = require('crypto-js');
      const wordArray = crypto.lib.WordArray.create(e.target?.result as ArrayBuffer);
      const hash = crypto.MD5(wordArray).toString();
      resolve(hash);
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
};

// Utility function to split file into chunks
export const splitFileIntoChunks = (file: File, chunkSize: number): Blob[] => {
  const chunks: Blob[] = [];
  let offset = 0;
  
  while (offset < file.size) {
    const chunk = file.slice(offset, offset + chunkSize);
    chunks.push(chunk);
    offset += chunkSize;
  }
  
  return chunks;
};