import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Upload, File, Video, Headphones, FileText, Plus, FolderPlus } from 'lucide-react';
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

  const getFileType = (mimeType: string): 'audio' | 'video' | 'document' => {
    if (mimeType.startsWith('audio/')) return 'audio';
    if (mimeType.startsWith('video/')) return 'video';
    return 'document';
  };

  const handleFileUpload = async (fileId: string, file: File, fileType: 'audio' | 'video' | 'document') => {
    try {
      setUploadedFiles((prev) =>
        prev.map((f) => (f.id === fileId ? { ...f, status: 'uploading' } : f))
      );

      // Calculate file MD5
      const fileMd5 = await calculateMD5(file);

      // Initialize upload
      const initResponse = await initFileUpload('temp-task', {
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
        
        await uploadChunk('temp-task', initResponse.uploadId, i, chunk, chunkMd5);
        
        // Update progress
        const progress = ((i + 1) / chunks.length) * 100;
        setUploadedFiles((prev) =>
          prev.map((f) => (f.id === fileId ? { ...f, uploadProgress: progress } : f))
        );
      }

      // Complete upload
      await completeFileUpload('temp-task', initResponse.uploadId, fileMd5, chunks.length);

      setUploadedFiles((prev) =>
        prev.map((f) => (f.id === fileId ? { ...f, status: 'completed', uploadProgress: 100 } : f))
      );

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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">TransNote AI</h1>
              <span className="ml-3 text-sm text-gray-500">智能语音识别平台</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">欢迎，{user?.username}</span>
              <button
                onClick={() => navigate('/tasks')}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                我的任务
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">快速开始</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => document.getElementById('file-input')?.click()}
              className="flex items-center justify-center p-6 bg-white rounded-lg shadow-sm border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 transition-colors"
            >
              <Upload className="w-8 h-8 text-gray-400 mr-3" />
              <div className="text-left">
                <h3 className="font-medium text-gray-900">上传文件</h3>
                <p className="text-sm text-gray-500">支持音频、视频、文档</p>
              </div>
            </button>
            
            <button
              onClick={() => navigate('/tasks/new')}
              className="flex items-center justify-center p-6 bg-white rounded-lg shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <Plus className="w-8 h-8 text-blue-500 mr-3" />
              <div className="text-left">
                <h3 className="font-medium text-gray-900">新建任务</h3>
                <p className="text-sm text-gray-500">创建转录任务</p>
              </div>
            </button>
            
            <button
              onClick={() => navigate('/folders/new')}
              className="flex items-center justify-center p-6 bg-white rounded-lg shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <FolderPlus className="w-8 h-8 text-green-500 mr-3" />
              <div className="text-left">
                <h3 className="font-medium text-gray-900">新建文件夹</h3>
                <p className="text-sm text-gray-500">整理您的文件</p>
              </div>
            </button>
          </div>
        </div>

        {/* File Upload Area */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">文件上传</h2>
          <div
            {...getRootProps()}
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
              isDragActive ? "border-blue-400 bg-blue-50" : "border-gray-300 hover:border-blue-400"
            )}
          >
            <input {...getInputProps()} />
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            {isDragActive ? (
              <p className="text-blue-600 font-medium">释放文件以上传</p>
            ) : (
              <div>
                <p className="text-gray-600 mb-2">拖拽文件到此处，或</p>
                <button
                  type="button"
                  className="text-blue-600 font-medium hover:text-blue-500"
                >
                  点击选择文件
                </button>
                <p className="text-sm text-gray-500 mt-2">
                  支持音频、视频、PDF、文本文件，最大3GB
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Uploaded Files */}
        {uploadedFiles.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">上传的文件</h2>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              {uploadedFiles.map((file) => (
                <div key={file.id} className="p-4 border-b border-gray-200 last:border-b-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {getFileIconComponent(file.type)}
                      <div className="ml-4">
                        <h4 className="text-sm font-medium text-gray-900">{file.file.name}</h4>
                        <p className="text-sm text-gray-500">{file.size}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(file.status)}`}>
                        {file.status === 'completed' && '已完成'}
                        {file.status === 'uploading' && '上传中'}
                        {file.status === 'error' && '上传失败'}
                        {file.status === 'pending' && '等待中'}
                      </span>
                      {file.status === 'uploading' && (
                        <div className="w-24 bg-gray-200 rounded-full h-2">
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
          <h2 className="text-xl font-semibold text-gray-900 mb-4">快速创建任务</h2>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-4">
              <input
                type="text"
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
                placeholder="输入任务名称"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={handleCreateTask}
                disabled={isCreatingTask || !taskName.trim()}
                className={cn(
                  "px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500",
                  (isCreatingTask || !taskName.trim()) && "opacity-50 cursor-not-allowed"
                )}
              >
                {isCreatingTask ? (
                  <div className="flex items-center">
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