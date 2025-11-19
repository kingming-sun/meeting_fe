import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format file size
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Format duration
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m ${remainingSeconds}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  } else {
    return `${remainingSeconds}s`;
  }
}

// Format date
export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Get file icon based on type
export function getFileIcon(fileType: string): string {
  const type = fileType.toLowerCase();
  
  if (type.includes('audio')) return '🎵';
  if (type.includes('video')) return '🎬';
  if (type.includes('pdf')) return '📄';
  if (type.includes('text')) return '📝';
  if (type.includes('word')) return '📝';
  if (type.includes('excel')) return '📊';
  if (type.includes('powerpoint')) return '📽️';
  if (type.includes('image')) return '🖼️';
  
  return '📎';
}

// Get task status color
export function getTaskStatusColor(status: string): string {
  switch (status) {
    case 'completed':
      return 'text-green-600 bg-green-100';
    case 'processing':
      return 'text-blue-600 bg-blue-100';
    case 'failed':
      return 'text-red-600 bg-red-100';
    case 'expired':
      return 'text-gray-600 bg-gray-100';
    default:
      return 'text-yellow-600 bg-yellow-100';
  }
}

// Get task status text
export function getTaskStatusText(status: string): string {
  switch (status) {
    case 'completed':
      return '已完成';
    case 'processing':
      return '处理中';
    case 'failed':
      return '失败';
    case 'expired':
      return '已过期';
    default:
      return '待处理';
  }
}

// Validate email
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validate password
export function validatePassword(password: string): { valid: boolean; message: string } {
  if (password.length < 8 || password.length > 20) {
    return { valid: false, message: '密码长度应为8-20位' };
  }
  
  const hasNumber = /\d/.test(password);
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasSpecialChar = /[_*.]/.test(password);
  
  const conditions = [hasNumber, hasUpperCase, hasLowerCase, hasSpecialChar];
  const metConditions = conditions.filter(Boolean).length;
  
  if (metConditions < 3) {
    return { valid: false, message: '密码必须包含数字、大写字母、小写字母、特殊字符(_*.)中的至少3种' };
  }
  
  return { valid: true, message: '' };
}

// Generate random string
export function generateRandomString(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Debounce function
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Throttle function
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}