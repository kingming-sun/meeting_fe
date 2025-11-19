import api, { ApiResponse, LoginRequest, LoginResponse, RegisterRequest, PublicKeyResponse } from './api';
import JSEncrypt from 'jsencrypt';
import Cookies from 'js-cookie';

// Re-export types for use in components
export type { LoginRequest, LoginResponse, RegisterRequest, PublicKeyResponse };

// RSA encryption utility
let publicKey: string = '';
let publicKeyExpireAt: number = 0;

const USE_MOCK = (
  import.meta.env.VITE_USE_MOCK === 'true' ||
  (typeof window !== 'undefined' && /vercel\.app$/.test(window.location.hostname))
);

export const getPublicKey = async (): Promise<string> => {
  const now = Math.floor(Date.now() / 1000);
  
  // Return cached key if still valid
  if (publicKey && publicKeyExpireAt > now) {
    return publicKey;
  }

  try {
    const response = await api.get<ApiResponse<PublicKeyResponse>>('/auth/crypto/public-key');
    const { publicKey: key, expireAt } = response.data.data;
    
    publicKey = key;
    publicKeyExpireAt = expireAt;
    
    return key;
  } catch (error) {
    console.error('Failed to get public key:', error);
    throw error;
  }
};

export const encryptPassword = async (password: string): Promise<string> => {
  const key = await getPublicKey();
  const encrypt = new JSEncrypt();
  encrypt.setPublicKey(key);
  
  const encrypted = encrypt.encrypt(password);
  if (!encrypted) {
    throw new Error('Failed to encrypt password');
  }
  
  return encrypted;
};

// Authentication services
export const login = async (credentials: LoginRequest): Promise<LoginResponse> => {
  try {
    if (USE_MOCK) {
      const accessToken = 'mock_access_token';
      const refreshToken = 'mock_refresh_token';
      const userInfo = {
        userId: 'mock_user',
        username: credentials.username || 'mock',
        tag: 1,
        totalDur: 3600,
        remainDur: 3600,
        totalSpace: 1000,
        remainSpace: 1000,
        taskValidity: 3,
      };

      Cookies.set('access_token', accessToken, {
        expires: new Date(Date.now() + 4 * 60 * 60 * 1000),
        secure: true,
        sameSite: 'strict',
      });

      Cookies.set('refresh_token', refreshToken, {
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
        secure: true,
        sameSite: 'strict',
      });

      return { accessToken, refreshToken, userInfo };
    }
    // Encrypt password before sending
    const encryptedPassword = await encryptPassword(credentials.password);
    
    const response = await api.post<ApiResponse<LoginResponse>>('/auth/login', {
      ...credentials,
      password: encryptedPassword,
    });

    const { accessToken, refreshToken, userInfo } = response.data.data;
    
    // Store tokens in cookies
    Cookies.set('access_token', accessToken, { 
      expires: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 hours
      secure: true,
      sameSite: 'strict'
    });
    
    Cookies.set('refresh_token', refreshToken, {
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day
      secure: true,
      sameSite: 'strict'
    });

    return { accessToken, refreshToken, userInfo };
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
};

export const register = async (userData: RegisterRequest): Promise<any> => {
  try {
    if (USE_MOCK) {
      return {
        userId: 'mock_user',
        username: userData.username || 'mock',
        email: userData.email,
        tag: 1,
      };
    }
    // Encrypt password before sending
    const encryptedPassword = await encryptPassword(userData.password);
    
    const response = await api.post<ApiResponse<any>>('/auth/register', {
      ...userData,
      password: encryptedPassword,
    });

    return response.data.data;
  } catch (error) {
    console.error('Registration failed:', error);
    throw error;
  }
};

export const sendEmailCode = async (email: string): Promise<{ countdown: number; expireAt: number }> => {
  try {
    if (USE_MOCK) {
      const nowSec = Math.floor(Date.now() / 1000);
      return { countdown: 60, expireAt: nowSec + 60 };
    }
    const response = await api.post<ApiResponse<{ countdown: number; expireAt: number }>>('/auth/send-email-code', {
      email,
    });

    return response.data.data;
  } catch (error) {
    console.error('Failed to send email code:', error);
    throw error;
  }
};

export const logout = (): void => {
  Cookies.remove('access_token');
  Cookies.remove('refresh_token');
  window.location.href = '/login';
};

export const isAuthenticated = (): boolean => {
  const token = Cookies.get('access_token');
  return !!token;
};

export const getAuthHeaders = (): Record<string, string> => {
  const token = Cookies.get('access_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};
