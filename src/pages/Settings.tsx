import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Shield, Bell, Globe, Palette, Save, Eye, EyeOff, Lock } from 'lucide-react';
import { useUserStore } from '../store';
import { changePassword, ChangePasswordRequest } from '../services/auth';
import { validatePassword, cn } from '../utils';

interface PasswordForm {
  oriPwd: string;
  newPwd: string;
  confirmPwd: string;
}

export default function Settings() {
  const user = useUserStore((s) => s.user);
  const [notify, setNotify] = useState(true);
  const [language, setLanguage] = useState('zh');
  const [theme, setTheme] = useState('light');
  
  // Password change modal
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<PasswordForm>();

  const newPassword = watch('newPwd');

  const handlePasswordChange = async (data: PasswordForm) => {
    if (data.newPwd !== data.confirmPwd) {
      toast.error('两次输入的新密码不一致');
      return;
    }

    setIsChangingPassword(true);

    try {
      const requestData: ChangePasswordRequest = {
        username: user?.username,
        email: user?.email,
        oriPwd: data.oriPwd,
        newPwd: data.newPwd,
        confirmPwd: data.confirmPwd,
      };

      await changePassword(requestData);
      
      toast.success('密码修改成功，请重新登录');
      setShowPasswordModal(false);
      reset();
      
      // 清除认证信息，跳转到登录页
      setTimeout(() => {
        localStorage.removeItem('user_info');
        window.location.href = '/login';
      }, 1500);
    } catch (error: any) {
      console.error('Password change failed:', error);
      const errorMessage = error.response?.data?.msg || '密码修改失败';
      toast.error(errorMessage);
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleSaveSettings = () => {
    // TODO: 保存其他设置（通知、语言、主题等）
    toast.success('设置已保存');
  };

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6 space-y-4 md:space-y-6">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">系统设置</h1>
          <p className="mt-1 md:mt-2 text-sm md:text-base text-gray-600">管理您的账户设置和偏好</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* Account Security */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 md:p-6">
            <div className="flex items-center space-x-2 text-gray-700 mb-4 text-sm md:text-base">
              <Shield className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium">账号安全</span>
            </div>
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="text-sm md:text-base text-gray-900 font-medium">登录账号</div>
                  <div className="text-xs md:text-sm text-gray-500 truncate">{user?.username}</div>
                </div>
                <button
                  onClick={() => setShowPasswordModal(true)}
                  className="px-4 py-2 rounded-md bg-white border border-gray-300 hover:bg-gray-50 text-sm font-medium whitespace-nowrap self-start sm:self-auto focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  修改密码
                </button>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="text-sm md:text-base text-gray-900 font-medium">邮箱地址</div>
                  <div className="text-xs md:text-sm text-gray-500 truncate">{user?.email || '未设置'}</div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="text-sm md:text-base text-gray-900 font-medium">两步验证</div>
                  <div className="text-xs md:text-sm text-gray-500">提升账号安全性</div>
            </div>
                <button
                  disabled
                  className="px-4 py-2 rounded-md bg-gray-100 border border-gray-300 text-gray-400 text-sm font-medium whitespace-nowrap self-start sm:self-auto cursor-not-allowed"
                >
                  敬请期待
                </button>
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 md:p-6">
            <div className="flex items-center space-x-2 text-gray-700 mb-4 text-sm md:text-base">
              <Bell className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium">通知设置</span>
        </div>
            <div className="space-y-4">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm md:text-base text-gray-900">任务完成提醒</span>
                <input
                  type="checkbox"
                  checked={notify}
                  onChange={(e) => setNotify(e.target.checked)}
                  className="h-4 w-4 md:h-5 md:w-5 flex-shrink-0 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm md:text-base text-gray-900">系统更新通知</span>
                <input
                  type="checkbox"
                  defaultChecked
                  className="h-4 w-4 md:h-5 md:w-5 flex-shrink-0 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm md:text-base text-gray-900">邮件通知</span>
                <input
                  type="checkbox"
                  defaultChecked
                  className="h-4 w-4 md:h-5 md:w-5 flex-shrink-0 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
            </label>
          </div>
        </div>
      </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* Language */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 md:p-6">
            <div className="flex items-center space-x-2 text-gray-700 mb-4 text-sm md:text-base">
              <Globe className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium">语言</span>
            </div>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
            <option value="zh">简体中文</option>
            <option value="en">English</option>
          </select>
        </div>

          {/* Theme */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 md:p-6">
            <div className="flex items-center space-x-2 text-gray-700 mb-4 text-sm md:text-base">
              <Palette className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium">主题</span>
            </div>
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
            <option value="light">浅色</option>
            <option value="dark">深色</option>
              <option value="auto">跟随系统</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end">
          <button
            onClick={handleSaveSettings}
            className="inline-flex items-center px-6 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm md:text-base font-medium whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Save className="w-4 h-4 mr-2" /> 保存设置
          </button>
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div
              className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
              onClick={() => setShowPasswordModal(false)}
            ></div>

            {/* Modal panel */}
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">修改密码</h3>
                <p className="text-sm text-gray-500">请输入您的当前密码和新密码</p>
              </div>

              <form onSubmit={handleSubmit(handlePasswordChange)} className="space-y-4">
                {/* Old Password */}
                <div>
                  <label htmlFor="oriPwd" className="block text-sm font-medium text-gray-700 mb-2">
                    当前密码
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      {...register('oriPwd', {
                        required: '请输入当前密码',
                      })}
                      type={showOldPassword ? 'text' : 'password'}
                      id="oriPwd"
                      className={cn(
                        'block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                        errors.oriPwd && 'border-red-300'
                      )}
                      placeholder="请输入当前密码"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowOldPassword(!showOldPassword)}
                    >
                      {showOldPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                  {errors.oriPwd && (
                    <p className="mt-1 text-sm text-red-600">{errors.oriPwd.message}</p>
                  )}
                </div>

                {/* New Password */}
                <div>
                  <label htmlFor="newPwd" className="block text-sm font-medium text-gray-700 mb-2">
                    新密码
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      {...register('newPwd', {
                        required: '请输入新密码',
                        validate: (value) => {
                          const validation = validatePassword(value);
                          return validation.valid || validation.message;
                        },
                      })}
                      type={showNewPassword ? 'text' : 'password'}
                      id="newPwd"
                      className={cn(
                        'block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                        errors.newPwd && 'border-red-300'
                      )}
                      placeholder="请输入新密码"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                  {errors.newPwd && (
                    <p className="mt-1 text-sm text-red-600">{errors.newPwd.message}</p>
                  )}
                </div>

                {/* Confirm New Password */}
                <div>
                  <label htmlFor="confirmPwd" className="block text-sm font-medium text-gray-700 mb-2">
                    确认新密码
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      {...register('confirmPwd', {
                        required: '请确认新密码',
                        validate: (value) => value === newPassword || '两次输入的密码不一致',
                      })}
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="confirmPwd"
                      className={cn(
                        'block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                        errors.confirmPwd && 'border-red-300'
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
                  {errors.confirmPwd && (
                    <p className="mt-1 text-sm text-red-600">{errors.confirmPwd.message}</p>
                  )}
                </div>

                <div className="mt-6 flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordModal(false);
                      reset();
                    }}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    disabled={isChangingPassword}
                    className={cn(
                      'flex-1 px-4 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
                      isChangingPassword && 'opacity-50 cursor-not-allowed'
                    )}
                  >
                    {isChangingPassword ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        修改中...
                      </div>
                    ) : (
                      '确认修改'
                    )}
                  </button>
                </div>
              </form>
            </div>
      </div>
    </div>
      )}
    </>
  );
}
