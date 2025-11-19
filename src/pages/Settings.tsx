import { useState } from 'react';
import { Shield, Bell, Globe, Palette, Save } from 'lucide-react';
import { useUserStore } from '../store';

export default function Settings() {
  const user = useUserStore(s=>s.user);
  const [notify, setNotify] = useState(true);
  const [language, setLanguage] = useState('zh');
  const [theme, setTheme] = useState('light');

  return (
    <div className="px-4 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 text-gray-700 mb-4"><Shield className="w-4 h-4"/><span>账号安全</span></div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-gray-900">登录账号</div>
                <div className="text-sm text-gray-500">{user?.username}</div>
              </div>
              <button className="px-3 py-1 rounded-md bg-white border border-gray-200 hover:bg-gray-50">修改密码</button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-gray-900">两步验证</div>
                <div className="text-sm text-gray-500">提升账号安全性</div>
              </div>
              <button className="px-3 py-1 rounded-md bg-white border border-gray-200 hover:bg-gray-50">开启</button>
            </div>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 text-gray-700 mb-4"><Bell className="w-4 h-4"/><span>通知设置</span></div>
          <div className="space-y-3">
            <label className="flex items-center justify-between">
              <span className="text-gray-900">任务完成提醒</span>
              <input type="checkbox" checked={notify} onChange={(e)=>setNotify(e.target.checked)} className="h-4 w-4"/>
            </label>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 text-gray-700 mb-4"><Globe className="w-4 h-4"/><span>语言</span></div>
          <select value={language} onChange={(e)=>setLanguage(e.target.value)} className="w-full border border-gray-200 rounded-md px-3 py-2">
            <option value="zh">简体中文</option>
            <option value="en">English</option>
          </select>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 text-gray-700 mb-4"><Palette className="w-4 h-4"/><span>主题</span></div>
          <select value={theme} onChange={(e)=>setTheme(e.target.value)} className="w-full border border-gray-200 rounded-md px-3 py-2">
            <option value="light">浅色</option>
            <option value="dark">深色</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end">
        <button className="inline-flex items-center px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"><Save className="w-4 h-4 mr-2"/> 保存设置</button>
      </div>
    </div>
  );
}
