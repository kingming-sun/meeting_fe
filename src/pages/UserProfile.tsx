import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { User, Mail, Globe, Calendar, Save, Edit3 } from 'lucide-react';
import { useUserStore } from '../store';
import { formatDate, cn } from '../utils';

interface ProfileForm {
  username: string;
  email: string;
  zone: string;
  birthday: string;
  gender: string;
  des: string;
}

export default function UserProfile() {
  const user = useUserStore((state) => state.user);
  const setUser = useUserStore((state) => state.setUser);
  
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileForm>();

  useEffect(() => {
    if (user) {
      reset({
        username: user.username || '',
        email: user.email || '',
        zone: user.zone || '',
        birthday: user.birthday || '',
        gender: user.gender || '',
        des: user.des || '',
      });
    }
  }, [user, reset]);

  const onSubmit = async (data: ProfileForm) => {
    if (!user) return;
    
    setIsLoading(true);
    
    try {
      // API call to update profile would go here
      // For now, we'll just update the local store
      const updatedUser = {
        ...user,
        ...data,
      };
      
      setUser(updatedUser);
      setIsEditing(false);
      toast.success('个人信息更新成功');
    } catch (error) {
      console.error('Profile update failed:', error);
      toast.error('个人信息更新失败');
    } finally {
      setIsLoading(false);
    }
  };

  const getUserTagText = (tag: number) => {
    switch (tag) {
      case 0: return '管理员';
      case 1: return '普通用户';
      case 2: return 'VIP用户';
      case 3: return '内测用户';
      case 9: return '黑名单用户';
      default: return '未知';
    }
  };

  if (!user) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">请先登录</h3>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">个人中心</h1>
        <p className="mt-2 text-gray-600">管理您的个人信息和账户设置</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* User Info Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">{user.username}</h3>
              <p className="text-sm text-gray-500 mb-4">{getUserTagText(user.tag)}</p>
              
              <div className="space-y-3 text-left">
                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="w-4 h-4 mr-2" />
                  {user.email}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="w-4 h-4 mr-2" />
                  注册时间: {formatDate(user.createdAt)}
                </div>
              </div>
            </div>
          </div>

          {/* Usage Statistics */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">使用统计</h4>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>存储空间</span>
                  <span>{user.remainSpace}MB / {user.totalSpace}MB</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${((user.totalSpace - user.remainSpace) / user.totalSpace) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>使用时长</span>
                  <span>{Math.floor(user.remainDur / 60)}分 / {Math.floor(user.totalDur / 60)}分</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{ width: `${((user.totalDur - user.remainDur) / user.totalDur) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">个人信息</h3>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  {isEditing ? (
                    <>
                      <Save className="w-4 h-4 mr-1" />
                      保存
                    </>
                  ) : (
                    <>
                      <Edit3 className="w-4 h-4 mr-1" />
                      编辑
                    </>
                  )}
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                    用户名
                  </label>
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
                    disabled={!isEditing || isLoading}
                    className={cn(
                      "block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                      (!isEditing || isLoading) && "bg-gray-50 cursor-not-allowed"
                    )}
                  />
                  {errors.username && (
                    <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    邮箱地址
                  </label>
                  <input
                    {...register('email', {
                      required: '请输入邮箱地址',
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: '请输入有效的邮箱地址'
                      }
                    })}
                    type="email"
                    id="email"
                    disabled={!isEditing || isLoading}
                    className={cn(
                      "block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                      (!isEditing || isLoading) && "bg-gray-50 cursor-not-allowed"
                    )}
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="zone" className="block text-sm font-medium text-gray-700 mb-2">
                    国家/地区
                  </label>
                  <input
                    {...register('zone')}
                    type="text"
                    id="zone"
                    disabled={!isEditing || isLoading}
                    className={cn(
                      "block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                      (!isEditing || isLoading) && "bg-gray-50 cursor-not-allowed"
                    )}
                  />
                </div>

                <div>
                  <label htmlFor="birthday" className="block text-sm font-medium text-gray-700 mb-2">
                    生日
                  </label>
                  <input
                    {...register('birthday')}
                    type="date"
                    id="birthday"
                    disabled={!isEditing || isLoading}
                    className={cn(
                      "block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                      (!isEditing || isLoading) && "bg-gray-50 cursor-not-allowed"
                    )}
                  />
                </div>

                <div>
                  <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-2">
                    性别
                  </label>
                  <select
                    {...register('gender')}
                    id="gender"
                    disabled={!isEditing || isLoading}
                    className={cn(
                      "block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                      (!isEditing || isLoading) && "bg-gray-50 cursor-not-allowed"
                    )}
                  >
                    <option value="">请选择</option>
                    <option value="male">男</option>
                    <option value="female">女</option>
                    <option value="other">其他</option>
                  </select>
                </div>
              </div>

              <div className="mt-6">
                <label htmlFor="des" className="block text-sm font-medium text-gray-700 mb-2">
                  个人简介
                </label>
                <textarea
                  {...register('des')}
                  id="des"
                  rows={4}
                  disabled={!isEditing || isLoading}
                  className={cn(
                    "block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                    (!isEditing || isLoading) && "bg-gray-50 cursor-not-allowed"
                  )}
                  placeholder="介绍一下自己..."
                />
              </div>

              {isEditing && (
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      // Reset form to original values
                      reset({
                        username: user.username || '',
                        email: user.email || '',
                        zone: user.zone || '',
                        birthday: user.birthday || '',
                        gender: user.gender || '',
                        des: user.des || '',
                      });
                    }}
                    className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={cn(
                      "px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700",
                      isLoading && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></div>
                        保存中...
                      </>
                    ) : (
                      '保存更改'
                    )}
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}