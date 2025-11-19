import { useState } from 'react';
import { Shield, Bell, Globe, Palette, Save } from 'lucide-react';
import { useUserStore } from '../store';

export default function Settings() {
  const user = useUserStore(s=>s.user);
  const [notify, setNotify] = useState(true);
  const [language, setLanguage] = useState('zh');
  const [theme, setTheme] = useState('light');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6 space-y-4 md:space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-4 md:p-6">
          <div className="flex items-center space-x-2 text-gray-700 mb-4 text-sm md:text-base"><Shield className="w-4 h-4 flex-shrink-0"/><span>账号安全</span></div>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="text-sm md:text-base text-gray-900">登录账号</div>
                <div className="text-xs md:text-sm text-gray-500 truncate">{user?.username}</div>
              </div>
              <button className="px-3 py-2 rounded-md bg-white border border-gray-200 hover:bg-gray-50 text-sm whitespace-nowrap self-start sm:self-auto">修改密码</button>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="text-sm md:text-base text-gray-900">两步验证</div>
                <div className="text-xs md:text-sm text-gray-500">提升账号安全性</div>
              </div>
              <button className="px-3 py-2 rounded-md bg-white border border-gray-200 hover:bg-gray-50 text-sm whitespace-nowrap self-start sm:self-auto">开启</button>
            </div>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 md:p-6">
          <div className="flex items-center space-x-2 text-gray-700 mb-4 text-sm md:text-base"><Bell className="w-4 h-4 flex-shrink-0"/><span>通知设置</span></div>
          <div className="space-y-3">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm md:text-base text-gray-900">任务完成提醒</span>
              <input type="checkbox" checked={notify} onChange={(e)=>setNotify(e.target.checked)} className="h-4 w-4 md:h-5 md:w-5 flex-shrink-0"/>
            </label>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-4 md:p-6">
          <div className="flex items-center space-x-2 text-gray-700 mb-4 text-sm md:text-base"><Globe className="w-4 h-4 flex-shrink-0"/><span>语言</span></div>
          <select value={language} onChange={(e)=>setLanguage(e.target.value)} className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="zh">简体中文</option>
            <option value="en">English</option>
          </select>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 md:p-6">
          <div className="flex items-center space-x-2 text-gray-700 mb-4 text-sm md:text-base"><Palette className="w-4 h-4 flex-shrink-0"/><span>主题</span></div>
          <select value={theme} onChange={(e)=>setTheme(e.target.value)} className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="light">浅色</option>
            <option value="dark">深色</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end">
        <button className="inline-flex items-center px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 text-sm md:text-base whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"><Save className="w-4 h-4 mr-2"/> 保存设置</button>
      </div>
    </div>
  );
}
