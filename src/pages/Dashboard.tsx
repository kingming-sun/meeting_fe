import { useState, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Upload, File, Video, Headphones, FileText, Plus, FolderPlus } from 'lucide-react';
import uploadPng from '../../上传.png';
import newFolderPng from '../../新建文件夹.png';
import { useUserStore, useTaskStore } from '../store';
import { createTask } from '../services/task';
import { initFileUpload, uploadChunk, completeFileUpload, calculateMD5, splitFileIntoChunks } from '../services/upload';
import { formatFileSize, getFileIcon, cn } from '../utils';

interface UploadedFile {
  id: string;
  file: File;
  type: 'audio' | 'video' | 'document';
  size: string;
  uploadProgress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
}

export default function Dashboard() {
  const navigate = useNavigate();
  const user = useUserStore((state) => state.user);
  const addTask = useTaskStore((state) => state.addTask);
  
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [taskName, setTaskName] = useState('');

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!user) {
      toast.error('请先登录');
      return;
    }

    for (const file of acceptedFiles) {
      const fileId = Math.random().toString(36).substr(2, 9);
      const fileType = getFileType(file.type);
      
      const newFile: UploadedFile = {
        id: fileId,
        file,
        type: fileType,
        size: formatFileSize(file.size),
        uploadProgress: 0,
        status: 'pending',
      };

      setUploadedFiles((prev) => [...prev, newFile]);
      
      // Start upload process
      await handleFileUpload(fileId, file, fileType);
    }
  }, [user]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'audio/*': ['.mp3', '.wav', '.m4a', '.webm'],
      'video/*': ['.mp4', '.avi', '.mov', '.webm'],
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt'],
    },
    maxSize: 3 * 1024 * 1024 * 1024, // 3GB
  });

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const getFileType = (mimeType: string): 'audio' | 'video' | 'document' => {
    if (mimeType.startsWith('audio/')) return 'audio';
    if (mimeType.startsWith('video/')) return 'video';
    return 'document';
  };

  const handleFileUpload = async (fileId: string, file: File, fileType: 'audio' | 'video' | 'document') => {
    // 如果没有登录或没有用户信息，不允许上传
    if (!user) {
      toast.error('请先登录后再上传文件');
      setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId));
      return;
    }

    try {
      setUploadedFiles((prev) =>
        prev.map((f) => (f.id === fileId ? { ...f, status: 'uploading' } : f))
      );

      // 先创建任务（如果还没有任务）
      // 这里我们为每个文件创建一个任务，或者用户可以手动创建任务后上传
      // 为了简化，这里先创建一个以文件名命名的任务
      const newTask = await createTask(user.userId, {
        taskName: file.name.replace(/\.[^/.]+$/, ''), // 移除文件扩展名
      });

      // Calculate file MD5
      toast.info('正在计算文件MD5...');
      const fileMd5 = await calculateMD5(file);

      // Initialize upload
      const initResponse = await initFileUpload(newTask.taskId, {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        fileTag: '0', // Original file
        fileMd5,
      });

      // Split file into chunks
      const chunks = splitFileIntoChunks(file, initResponse.chunkSize);
      
      // Upload chunks
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        const chunkMd5 = await calculateMD5(chunk as File);
        
        await uploadChunk(newTask.taskId, initResponse.uploadId, i, chunk, chunkMd5);
        
        // Update progress
        const progress = ((i + 1) / chunks.length) * 100;
        setUploadedFiles((prev) =>
          prev.map((f) => (f.id === fileId ? { ...f, uploadProgress: progress } : f))
        );
      }

      // Complete upload
      await completeFileUpload(newTask.taskId, initResponse.uploadId, fileMd5, chunks.length);

      setUploadedFiles((prev) =>
        prev.map((f) => (f.id === fileId ? { ...f, status: 'completed', uploadProgress: 100 } : f))
      );

      // 更新任务列表
      addTask(newTask);
      
      toast.success(`${file.name} 上传成功`);
    } catch (error) {
      console.error('File upload failed:', error);
      setUploadedFiles((prev) =>
        prev.map((f) => (f.id === fileId ? { ...f, status: 'error' } : f))
      );
      toast.error(`${file.name} 上传失败`);
    }
  };

  const handleCreateTask = async () => {
    if (!user) {
      toast.error('请先登录');
      return;
    }

    if (!taskName.trim()) {
      toast.error('请输入任务名称');
      return;
    }

    setIsCreatingTask(true);
    
    try {
      const newTask = await createTask(user.userId, {
        taskName: taskName.trim(),
      });

      addTask(newTask);
      toast.success('任务创建成功');
      navigate(`/tasks/${newTask.taskId}`);
    } catch (error) {
      console.error('Failed to create task:', error);
      toast.error('任务创建失败');
    } finally {
      setIsCreatingTask(false);
    }
  };

  const getFileIconComponent = (type: 'audio' | 'video' | 'document') => {
    switch (type) {
      case 'audio':
        return <Headphones className="w-8 h-8 text-blue-500" />;
      case 'video':
        return <Video className="w-8 h-8 text-purple-500" />;
      case 'document':
        return <FileText className="w-8 h-8 text-green-500" />;
      default:
        return <File className="w-8 h-8 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'uploading':
        return 'bg-blue-100 text-blue-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="w-full">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {/* Quick Actions */}
        <div className="mb-6 md:mb-8">
          <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-4">快速开始</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            <button
              onClick={() => document.getElementById('file-input')?.click()}
              className="flex items-center justify-center p-4 md:p-6 bg-white rounded-xl shadow-sm border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 transition-colors"
            >
              <img src={uploadPng} alt="上传" className="w-6 h-6 md:w-8 md:h-8 mr-3 flex-shrink-0" />
              <div className="text-left">
                <h3 className="text-sm md:text-base font-medium text-gray-900">上传文件</h3>
                <p className="text-xs md:text-sm text-gray-500">支持音频、视频、文档</p>
              </div>
            </button>
            
            <button
              onClick={() => navigate('/tasks/new')}
              className="flex items-center justify-center p-4 md:p-6 bg-white rounded-xl shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <Plus className="w-6 h-6 md:w-8 md:h-8 text-blue-500 mr-3 flex-shrink-0" />
              <div className="text-left">
                <h3 className="text-sm md:text-base font-medium text-gray-900">新建任务</h3>
                <p className="text-xs md:text-sm text-gray-500">创建转录任务</p>
              </div>
            </button>
            
            <button
              onClick={() => navigate('/folders/new')}
              className="flex items-center justify-center p-4 md:p-6 bg-white rounded-xl shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <img src={newFolderPng} alt="新建文件夹" className="w-6 h-6 md:w-8 md:h-8 mr-3 flex-shrink-0" />
              <div className="text-left">
                <h3 className="text-sm md:text-base font-medium text-gray-900">新建文件夹</h3>
                <p className="text-xs md:text-sm text-gray-500">整理您的文件</p>
              </div>
            </button>
          </div>
        </div>

        {/* File Upload Area */}
        <div className="mb-6 md:mb-8">
          <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-4">文件上传</h2>
          <div
            {...getRootProps()}
            className={cn(
              "border-2 border-dashed rounded-lg p-6 md:p-8 text-center cursor-pointer transition-colors",
              isDragActive ? "border-blue-400 bg-blue-50" : "border-gray-300 hover:border-blue-400"
            )}
          >
            <input {...getInputProps()} ref={fileInputRef} id="file-input" />
            <Upload className="w-10 h-10 md:w-12 md:h-12 text-gray-400 mx-auto mb-3 md:mb-4" />
            {isDragActive ? (
              <p className="text-sm md:text-base text-blue-600 font-medium">释放文件以上传</p>
            ) : (
              <div>
                <p className="text-sm md:text-base text-gray-600 mb-2">拖拽文件到此处，或</p>
                <button
                  type="button"
                  className="text-sm md:text-base text-blue-600 font-medium hover:text-blue-500"
                >
                  点击选择文件
                </button>
                <p className="text-xs md:text-sm text-gray-500 mt-2">
                  支持音频、视频、PDF、文本文件，最大3GB
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Uploaded Files */}
        {uploadedFiles.length > 0 && (
          <div className="mb-6 md:mb-8">
            <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-4">上传的文件</h2>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              {uploadedFiles.map((file) => (
                <div key={file.id} className="p-3 md:p-4 border-b border-gray-200 last:border-b-0">
                  <div className="flex items-start md:items-center justify-between flex-col md:flex-row gap-3 md:gap-0">
                    <div className="flex items-center min-w-0 flex-1">
                      <div className="flex-shrink-0">
                        {getFileIconComponent(file.type)}
                      </div>
                      <div className="ml-3 md:ml-4 min-w-0 flex-1">
                        <h4 className="text-sm font-medium text-gray-900 truncate">{file.file.name}</h4>
                        <p className="text-xs md:text-sm text-gray-500">{file.size}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 md:space-x-4 self-end md:self-auto">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap ${getStatusColor(file.status)}`}>
                        {file.status === 'completed' && '已完成'}
                        {file.status === 'uploading' && '上传中'}
                        {file.status === 'error' && '上传失败'}
                        {file.status === 'pending' && '等待中'}
                      </span>
                      {file.status === 'uploading' && (
                        <div className="w-20 md:w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${file.uploadProgress}%` }}
                          ></div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Task Creation */}
        <div>
          <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-4">快速创建任务</h2>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
              <input
                type="text"
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
                placeholder="输入任务名称"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base"
              />
              <button
                onClick={handleCreateTask}
                disabled={isCreatingTask || !taskName.trim()}
                className={cn(
                  "px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 whitespace-nowrap text-sm md:text-base",
                  (isCreatingTask || !taskName.trim()) && "opacity-50 cursor-not-allowed"
                )}
              >
                {isCreatingTask ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    创建中...
                  </div>
                ) : (
                  '创建任务'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
