import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Plus, Search, Filter, Calendar, Clock, FileText, Trash2, Eye, Headphones, Video } from 'lucide-react';
import { useUserStore, useTaskStore } from '../store';
import { getTaskList, deleteTask } from '../services/task';
import { formatDate, formatDuration, getTaskStatusColor, getTaskStatusText, cn } from '../utils';

export default function TaskList() {
  const navigate = useNavigate();
  const user = useUserStore((state) => state.user);
  const tasks = useTaskStore((state) => state.tasks);
  const setTasks = useTaskStore((state) => state.setTasks);
  const deleteTaskFromStore = useTaskStore((state) => state.deleteTask);
  
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    if (user) {
      loadTasks();
    }
  }, [user]);

  const loadTasks = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const taskList = await getTaskList(user.userId);
      setTasks(taskList);
    } catch (error) {
      console.error('Failed to load tasks:', error);
      toast.error('加载任务列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!user) return;
    
    if (!window.confirm('确定要删除这个任务吗？')) {
      return;
    }

    try {
      await deleteTask(user.userId, taskId);
      deleteTaskFromStore(taskId);
      toast.success('任务删除成功');
    } catch (error) {
      console.error('Failed to delete task:', error);
      toast.error('删除任务失败');
    }
  };

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.taskName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || task.taskStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getTaskIcon = (task: any) => {
    if (task.fileList && task.fileList.length > 0) {
      const firstFile = task.fileList[0];
      if (firstFile.fileType.startsWith('audio/')) return <Headphones className="w-5 h-5" />;
      if (firstFile.fileType.startsWith('video/')) return <Video className="w-5 h-5" />;
    }
    return <FileText className="w-5 h-5" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 truncate">任务管理</h1>
            <p className="mt-1 md:mt-2 text-sm md:text-base text-gray-600">管理和查看您的转录任务</p>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 whitespace-nowrap"
          >
            <Plus className="w-4 h-4 mr-2" />
            新建任务
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="搜索任务..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="text-gray-400 w-5 h-5" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">全部状态</option>
              <option value="pending">待处理</option>
              <option value="processing">处理中</option>
              <option value="completed">已完成</option>
              <option value="failed">失败</option>
              <option value="expired">已过期</option>
            </select>
          </div>
        </div>
      </div>

      {/* Task Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
          <div className="flex items-center">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <FileText className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
            </div>
            <div className="ml-3 md:ml-4 min-w-0">
              <p className="text-xs md:text-sm font-medium text-gray-600 truncate">总任务数</p>
              <p className="text-xl md:text-2xl font-bold text-gray-900">{tasks.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
          <div className="flex items-center">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5 md:w-6 md:h-6 text-yellow-600" />
            </div>
            <div className="ml-3 md:ml-4 min-w-0">
              <p className="text-xs md:text-sm font-medium text-gray-600 truncate">处理中</p>
              <p className="text-xl md:text-2xl font-bold text-gray-900">
                {tasks.filter(t => t.taskStatus === 'processing').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
          <div className="flex items-center">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <FileText className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
            </div>
            <div className="ml-3 md:ml-4 min-w-0">
              <p className="text-xs md:text-sm font-medium text-gray-600 truncate">已完成</p>
              <p className="text-xl md:text-2xl font-bold text-gray-900">
                {tasks.filter(t => t.taskStatus === 'completed').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
          <div className="flex items-center">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Trash2 className="w-5 h-5 md:w-6 md:h-6 text-red-600" />
            </div>
            <div className="ml-3 md:ml-4 min-w-0">
              <p className="text-xs md:text-sm font-medium text-gray-600 truncate">失败/过期</p>
              <p className="text-xl md:text-2xl font-bold text-gray-900">
                {tasks.filter(t => t.taskStatus === 'failed' || t.taskStatus === 'expired').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Task List */}
      {filteredTasks.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">暂无任务</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm || statusFilter !== 'all' 
              ? '没有找到匹配的任务' 
              : '您还没有创建任何任务'
            }
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            创建新任务
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="divide-y divide-gray-200">
            {filteredTasks.map((task) => (
              <div key={task.taskId} className="p-4 md:p-6 hover:bg-gray-50 transition-colors">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex items-start space-x-3 md:space-x-4 min-w-0 flex-1">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      {getTaskIcon(task)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base md:text-lg font-medium text-gray-900 mb-1 truncate">
                        {task.taskName}
                      </h3>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs md:text-sm text-gray-500">
                        <div className="flex items-center whitespace-nowrap">
                          <Calendar className="w-3 h-3 md:w-4 md:h-4 mr-1 flex-shrink-0" />
                          <span className="truncate">{formatDate(task.createdAt)}</span>
                        </div>
                        <div className="flex items-center whitespace-nowrap">
                          <Clock className="w-3 h-3 md:w-4 md:h-4 mr-1 flex-shrink-0" />
                          <span className="truncate">过期: {new Date(task.expireAt * 1000).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center whitespace-nowrap">
                          <FileText className="w-3 h-3 md:w-4 md:h-4 mr-1 flex-shrink-0" />
                          {task.fileList?.length || 0} 个文件
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap ${getTaskStatusColor(task.taskStatus)}`}>
                          {getTaskStatusText(task.taskStatus)}
                        </span>
                      </div>
                      {task.taskSize > 0 && (
                        <div className="mt-2 text-xs md:text-sm text-gray-500">
                          <span>任务大小: {formatDuration(task.taskSize)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 self-end lg:self-auto flex-shrink-0">
                    <button
                      onClick={() => navigate(`/tasks/${task.taskId}`)}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 text-xs md:text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <Eye className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                      查看
                    </button>
                    <button
                      onClick={() => handleDeleteTask(task.taskId)}
                      className="inline-flex items-center px-3 py-2 border border-red-300 text-xs md:text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50"
                    >
                      <Trash2 className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                      删除
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}