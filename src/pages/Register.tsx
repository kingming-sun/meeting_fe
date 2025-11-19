import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Eye, EyeOff, User, Lock, Mail, Globe } from 'lucide-react';
import { register as registerUser, sendEmailCode, RegisterRequest } from '../services/auth';
import { validateEmail, validatePassword, cn } from '../utils';

interface RegisterForm {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  emailCode: string;
  zone: string;
}

export default function Register() {
  const navigate = useNavigate();
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [countdown, setCountdown] = useState(0);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    trigger,
  } = useForm<RegisterForm>();

  const password = watch('password');
  const email = watch('email');

  const onSubmit = async (data: RegisterForm) => {
    if (data.password !== data.confirmPassword) {
      toast.error('两次输入的密码不一致');
      return;
    }

    setIsLoading(true);
    
    try {
      const registerData: RegisterRequest = {
        username: data.username,
        password: data.password,
        email: data.email,
        emailCode: data.emailCode,
        zone: data.zone,
      };

      await registerUser(registerData);
      
      toast.success('注册成功！请登录');
      navigate('/login');
    } catch (error: any) {
      const errorMessage = error.response?.data?.msg || '注册失败，请重试';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendEmailCode = async () => {
    const isValid = await trigger('email');
    if (!isValid) return;

    setIsSendingCode(true);
    
    try {
      const response = await sendEmailCode(email);
      setCountdown(response.countdown);
      
      // Start countdown
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      toast.success('验证码已发送');
    } catch (error: any) {
      const errorMessage = error.response?.data?.msg || '发送验证码失败';
      toast.error(errorMessage);
    } finally {
      setIsSendingCode(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-6 md:mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 md:w-16 md:h-16 bg-blue-600 rounded-full mb-3 md:mb-4">
            <User className="w-7 h-7 md:w-8 md:h-8 text-white" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1 md:mb-2">TransNote AI</h1>
          <p className="text-sm md:text-base text-gray-600">创建您的账户</p>
        </div>

        {/* Register Form */}
        <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 md:space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                用户名
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('username', {
                    required: '请输入用户名',
                    minLength: {
                      value: 3,
                      message: '用户名至少3个字符'
                    },
                    maxLength: {
                      value: 30,
                      message: '用户名最多30个字符'
                    },
                    pattern: {
                      value: /^[a-zA-Z0-9_]+$/,
                      message: '用户名只能包含字母、数字和下划线'
                    }
                  })}
                  type="text"
                  id="username"
                  className={cn(
                    "block w-full pl-10 pr-3 py-2.5 md:py-3 text-sm md:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                    errors.username && "border-red-300"
                  )}
                  placeholder="请输入用户名"
                />
              </div>
              {errors.username && (
                <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                邮箱地址
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('email', {
                    required: '请输入邮箱地址',
                    validate: (value) => validateEmail(value) || '请输入有效的邮箱地址'
                  })}
                  type="email"
                  id="email"
                  className={cn(
                    "block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                    errors.email && "border-red-300"
                  )}
                  placeholder="请输入邮箱地址"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                密码
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('password', {
                    required: '请输入密码',
                    validate: (value) => {
                      const validation = validatePassword(value);
                      return validation.valid || validation.message;
                    }
                  })}
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  className={cn(
                    "block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                    errors.password && "border-red-300"
                  )}
                  placeholder="请输入密码"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                确认密码
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('confirmPassword', {
                    required: '请确认密码',
                    validate: (value) => value === password || '两次输入的密码不一致'
                  })}
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  className={cn(
                    "block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                    errors.confirmPassword && "border-red-300"
                  )}
                  placeholder="请再次输入密码"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="emailCode" className="block text-sm font-medium text-gray-700 mb-2">
                邮箱验证码
              </label>
              <div className="flex space-x-2">
                <input
                  {...register('emailCode', {
                    required: '请输入邮箱验证码'
                  })}
                  type="text"
                  id="emailCode"
                  className={cn(
                    "flex-1 block w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                    errors.emailCode && "border-red-300"
                  )}
                  placeholder="请输入验证码"
                />
                <button
                  type="button"
                  onClick={handleSendEmailCode}
                  disabled={countdown > 0 || isSendingCode}
                  className={cn(
                    "px-4 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500",
                    (countdown > 0 || isSendingCode) && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {countdown > 0 ? `${countdown}s` : '发送验证码'}
                </button>
              </div>
              {errors.emailCode && (
                <p className="mt-1 text-sm text-red-600">{errors.emailCode.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="zone" className="block text-sm font-medium text-gray-700 mb-2">
                国家/地区 (可选)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Globe className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('zone')}
                  type="text"
                  id="zone"
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="请输入国家/地区"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={cn(
                "w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500",
                isLoading && "opacity-50 cursor-not-allowed"
              )}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  注册中...
                </div>
              ) : (
                '注册'
              )}
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">已有账号？</span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                to="/login"
                className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                立即登录
              </Link>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 md:mt-8 text-center text-xs md:text-sm text-gray-500">
          <p>注册即表示您同意我们的</p>
          <div className="flex justify-center space-x-3 md:space-x-4 mt-1">
            <Link to="/terms" className="text-blue-600 hover:text-blue-500">服务条款</Link>
            <span>和</span>
            <Link to="/privacy" className="text-blue-600 hover:text-blue-500">隐私政策</Link>
          </div>
        </div>
      </div>
    </div>
  );
}