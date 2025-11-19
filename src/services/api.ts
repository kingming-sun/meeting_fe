import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import Cookies from 'js-cookie';

// API base configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'X-Request-Id': generateRequestId(),
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Handle token expiration
      Cookies.remove('access_token');
      Cookies.remove('refresh_token');
      localStorage.removeItem('user_info');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Generate unique request ID
function generateRequestId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// API response types
export interface ApiResponse<T = any> {
  code: number;
  msg: string;
  data: T;
  reqId: string;
}

// Authentication types
export interface LoginRequest {
  username: string;
  password: string;
  expireAt?: number;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  userInfo: UserInfo;
}

export interface UserInfo {
  userId: string;
  username: string;
  tag: number;
  totalDur: number;
  remainDur: number;
  totalSpace: number;
  remainSpace: number;
  taskValidity: number;
  email?: string;
  zone?: string;
  birthday?: string;
  gender?: string;
  des?: string;
  createdAt?: string;
}

export interface RegisterRequest {
  username?: string;
  password: string;
  email: string;
  emailCode: string;
  zone?: string;
}

export interface PublicKeyResponse {
  publicKey: string;
  algorithm: string;
  hash: string;
  maskFunc: string;
  keyLen: number;
  expireAt: number;
}

// Task types
export interface Task {
  taskId: string;
  taskName: string;
  taskStatus: string;
  taskSize: number;
  expireAt: number;
  fileList: File[];
  createdAt?: string;
}

export interface File {
  fileId: string;
  fileTag: number;
  fileName: string;
  fileType: string;
  fileSize: number;
  fileMd5: string;
  fileAddr: string;
}

export interface CreateTaskRequest {
  taskName: string;
}

// File upload types
export interface InitUploadRequest {
  fileName: string;
  fileSize: number;
  fileType: string;
  fileTag: string;
  fileMd5: string;
  chunkSize?: number;
}

export interface InitUploadResponse {
  uploadId: string;
  chunkSize: number;
  totalChunks: number;
  allowedTypes: string;
  maxSize: number;
}

export default api;