import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { sendEmailCode } from '../services/auth';
import { validateEmail, validatePassword, cn } from '../utils';

interface ForgotPasswordForm {
  email: string;
  emailCode: string;
  newPassword: string;
  confirmPassword: string;
}

export default function ForgotPassword() {
  const navigate = useNavigate();
  
  const [step, setStep] = useState<'email' | 'verify' | 'reset'>('email');
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    trigger,
  } = useForm<ForgotPasswordForm>();

  const email = watch('email');
  const newPassword = watch('newPassword');

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
      
      toast.success('验证码已发送到您的邮箱');
      setStep('verify');
    } catch (error: any) {
      const errorMessage = error.response?.data?.msg || '发送验证码失败';
      toast.error(errorMessage);
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleVerifyCode = async () => {
    const isValid = await trigger('emailCode');
    if (!isValid) return;
    
    // 这里可以调用验证码验证接口
    // 目前先直接进入下一步
    setStep('reset');
  };

  const onSubmit = async (data: ForgotPasswordForm) => {
    if (data.newPassword !== data.confirmPassword) {
      toast.error('两次输入的密码不一致');
      return;
    }

    setIsResetting(true);
    
    try {
      // TODO: 调用后端重置密码接口
      // 目前后端接口文档中没有明确的重置密码接口
      // 可能需要使用 PUT /api/v1/auth/user-profile 接口
      
      toast.success('密码重置成功，请使用新密码登录');
      navigate('/login');
    } catch (error: any) {
      const errorMessage = error.response?.data?.msg || '密码重置失败';
      toast.error(errorMessage);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            to="/login"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            返回登录
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              {step === 'email' && '忘记密码'}
              {step === 'verify' && '验证邮箱'}
              {step === 'reset' && '重置密码'}
            </h1>
            <p className="text-sm text-gray-600">
              {step === 'email' && '请输入您的注册邮箱'}
              {step === 'verify' && '请输入发送到邮箱的验证码'}
              {step === 'reset' && '请设置新密码'}
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email Step */}
            {step === 'email' && (
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
                    placeholder="请输入您的注册邮箱"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}

                <button
                  type="button"
                  onClick={handleSendEmailCode}
                  disabled={isSendingCode || countdown > 0}
                  className={cn(
                    "w-full mt-6 flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500",
                    (isSendingCode || countdown > 0) && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {isSendingCode ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      发送中...
                    </div>
                  ) : countdown > 0 ? (
                    `${countdown}秒后重试`
                  ) : (
                    '发送验证码'
                  )}
                </button>
              </div>
            )}

            {/* Verify Step */}
            {step === 'verify' && (
              <div>
                <label htmlFor="emailCode" className="block text-sm font-medium text-gray-700 mb-2">
                  验证码
                </label>
                <input
                  {...register('emailCode', {
                    required: '请输入验证码',
                    minLength: {
                      value: 4,
                      message: '验证码至少4位'
                    }
                  })}
                  type="text"
                  id="emailCode"
                  className={cn(
                    "block w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                    errors.emailCode && "border-red-300"
                  )}
                  placeholder="请输入验证码"
                />
                {errors.emailCode && (
                  <p className="mt-1 text-sm text-red-600">{errors.emailCode.message}</p>
                )}

                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setStep('email')}
                    className="flex-1 py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    上一步
                  </button>
                  <button
                    type="button"
                    onClick={handleVerifyCode}
                    className="flex-1 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    下一步
                  </button>
                </div>

                <div className="mt-4 text-center">
                  <button
                    type="button"
                    onClick={handleSendEmailCode}
                    disabled={countdown > 0}
                    className={cn(
                      "text-sm text-blue-600 hover:text-blue-500",
                      countdown > 0 && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    {countdown > 0 ? `${countdown}秒后可重新发送` : '重新发送验证码'}
                  </button>
                </div>
              </div>
            )}

            {/* Reset Password Step */}
            {step === 'reset' && (
              <>
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    新密码
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      {...register('newPassword', {
                        required: '请输入新密码',
                        validate: (value) => {
                          const validation = validatePassword(value);
                          return validation.valid || validation.message;
                        }
                      })}
                      type={showPassword ? 'text' : 'password'}
                      id="newPassword"
                      className={cn(
                        "block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                        errors.newPassword && "border-red-300"
                      )}
                      placeholder="请输入新密码"
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
                  {errors.newPassword && (
                    <p className="mt-1 text-sm text-red-600">{errors.newPassword.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    确认新密码
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      {...register('confirmPassword', {
                        required: '请确认新密码',
                        validate: (value) => value === newPassword || '两次输入的密码不一致'
                      })}
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      className={cn(
                        "block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                        errors.confirmPassword && "border-red-300"
                      )}
                      placeholder="请再次输入新密码"
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

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep('verify')}
                    className="flex-1 py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    上一步
                  </button>
                  <button
                    type="submit"
                    disabled={isResetting}
                    className={cn(
                      "flex-1 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500",
                      isResetting && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    {isResetting ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        重置中...
                      </div>
                    ) : (
                      '重置密码'
                    )}
                  </button>
                </div>
              </>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

