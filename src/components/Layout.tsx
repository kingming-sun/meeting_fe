import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Menu, 
  X, 
  Home, 
  FileText, 
  User, 
  Settings, 
  LogOut,
  Folder,
  BarChart3,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useUserStore } from '../store';
import { logout } from '../services/auth';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const user = useUserStore((state) => state.user);
  const setUser = useUserStore((state) => state.setUser);
  const setAuth = useUserStore((state) => state.setAuth);

  const navigation = [
    { name: '首页', href: '/dashboard', icon: Home },
    { name: '任务管理', href: '/tasks', icon: FileText },
    { name: '文件管理', href: '/files', icon: Folder },
    { name: '统计分析', href: '/analytics', icon: BarChart3 },
    { name: '个人中心', href: '/profile', icon: User },
    { name: '设置', href: '/settings', icon: Settings },
    { name: '订阅计划', href: '/subscription', icon: BarChart3 },
    { name: '原文', href: '/original', icon: FileText },
    { name: '总结', href: '/summary', icon: FileText },
    { name: '思维导图', href: '/mindmap', icon: FileText },
  ];

  const handleLogout = async () => {
    try {
      logout();
      setUser(null);
      setAuth(false);
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div 
            className="fixed inset-0 bg-gray-600 bg-opacity-75" 
            onClick={() => setSidebarOpen(false)} 
          />
        </div>
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 ${collapsed ? 'lg:w-16' : 'w-64'} bg-white shadow-lg transform transition-all duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:inset-0
        flex flex-col
      `}>
        <div className="flex items-center justify-between h-14 md:h-16 px-3 md:px-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center overflow-hidden min-w-0">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-sm">TN</span>
            </div>
            {!collapsed && (
              <span className="ml-3 text-base md:text-lg font-semibold text-gray-900 truncate">TransNote AI</span>
            )}
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 flex-shrink-0"
          >
            <X className="h-5 w-5 md:h-6 md:w-6" />
          </button>
        </div>

        <nav className="mt-3 md:mt-5 px-2 flex-1 overflow-y-auto">
          <div className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`
                    group flex items-center ${collapsed ? 'lg:justify-center px-2' : 'px-3'} py-2.5 text-sm font-medium rounded-lg transition-colors
                    ${active
                      ? 'bg-blue-50 text-blue-900 border-l-4 border-blue-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className={`${collapsed ? 'lg:mr-0' : 'mr-3'} h-5 w-5 flex-shrink-0`} />
                  <span className={`${collapsed ? 'lg:hidden' : ''} truncate`}>{item.name}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* User info and logout */}
        <div className="border-t border-gray-200 p-3 md:p-4 bg-white">
          <div className={`${collapsed ? 'lg:hidden' : ''} mb-3`}>
            <div className="flex items-center min-w-0">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="h-4 w-4 text-gray-600" />
              </div>
              <div className="ml-3 min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 truncate">{user?.username}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
            </div>
          </div>
          <div className={`flex ${collapsed ? 'lg:justify-center' : 'justify-between'} items-center gap-2`}>
            <button
              onClick={() => setCollapsed((c) => !c)}
              className={`hidden lg:flex items-center px-2 py-2 text-xs md:text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900 transition-colors ${collapsed ? 'justify-center' : ''}`}
              title={collapsed ? '展开侧边栏' : '收起侧边栏'}
            >
              {collapsed ? <ChevronRight className="h-4 w-4"/> : <><ChevronLeft className="h-4 w-4 mr-2"/>收起侧边栏</>}
            </button>
            <button
              onClick={handleLogout}
              className={`flex items-center px-2 py-2 text-xs md:text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900 transition-colors ${collapsed ? 'lg:justify-center w-full' : ''}`}
              title="退出登录"
            >
              <LogOut className={`h-4 w-4 ${collapsed ? 'lg:mr-0' : 'mr-2'}`} />
              <span className={collapsed ? 'lg:hidden' : ''}>退出登录</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col transition-all duration-300">
        {/* Top bar */}
        <div className="sticky top-0 z-30 bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-12 md:h-14 px-3 md:px-4">
            <div className="flex items-center min-w-0 flex-1">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-1.5 md:p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 flex-shrink-0"
              >
                <Menu className="h-5 w-5 md:h-6 md:w-6" />
              </button>
              <button
                onClick={() => setCollapsed((c) => !c)}
                className="hidden lg:inline-flex p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 flex-shrink-0"
              >
                {collapsed ? <ChevronRight className="h-5 w-5"/> : <ChevronLeft className="h-5 w-5"/>}
              </button>
              <h1 className="ml-2 text-base md:text-xl font-semibold text-gray-900 truncate">
                {navigation.find(item => isActive(item.href))?.name || 'TransNote AI'}
              </h1>
            </div>
            
            <div className="flex items-center space-x-2 md:space-x-4 flex-shrink-0">
              {/* User info */}
              <div className="hidden md:flex items-center space-x-2">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900 truncate max-w-[120px]">{user?.username}</p>
                  <p className="text-xs text-gray-500 whitespace-nowrap">
                    剩余: {user?.remainSpace}MB
                  </p>
                </div>
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="h-4 w-4 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
