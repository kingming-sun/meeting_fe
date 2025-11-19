import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { 
  ArrowLeft, 
  Download, 
  Eye, 
  FileText, 
  Headphones, 
  Video, 
  RefreshCw,
  Play,
  Pause,
  Edit,
  Save,
  Share
} from 'lucide-react';
import { useUserStore, useTaskStore } from '../store';
import { getTaskById, downloadFile } from '../services/task';
import { transcribeFile, repairText, generateSummary, generateMindmap } from '../services/transcription';
import { formatFileSize, formatDate, getFileIcon, cn } from '../utils';

export default function TaskDetail() {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const user = useUserStore((state) => state.user);
  const currentTask = useTaskStore((state) => state.currentTask);
  const setCurrentTask = useTaskStore((state) => state.setCurrentTask);
  
  const [loading, setLoading] = useState(true);
  const [transcription, setTranscription] = useState<string>('');
  const [repairedText, setRepairedText] = useState<string>('');
  const [summary, setSummary] = useState<string>('');
  const [mindmap, setMindmap] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<any>(null);

  useEffect(() => {
    if (taskId && user) {
      loadTask();
    }
  }, [taskId, user]);

  const loadTask = async () => {
    if (!taskId || !user) return;
    
    try {
      setLoading(true);
      const task = await getTaskById(user.userId, taskId);
      setCurrentTask(task);
    } catch (error) {
      console.error('Failed to load task:', error);
      toast.error('加载任务失败');
    } finally {
      setLoading(false);
    }
  };

  const handleTranscribe = async (file: any) => {
    if (!file) return;
    
    setIsProcessing(true);
    setSelectedFile(file);
    
    try {
      // Note: In a real app, you'd need to get the actual file blob from the server
      // For now, we'll simulate the transcription process
      const mockFile = new File([''], file.fileName, { type: file.fileType });
      
      const response = await transcribeFile({
        file: mockFile,
        lang: 'zh',
      });
      
      setTranscription(response.text);
      toast.success('转录完成');
    } catch (error) {
      console.error('Transcription failed:', error);
      toast.error('转录失败');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRepairText = async () => {
    if (!transcription) {
      toast.error('请先进行转录');
      return;
    }
    
    setIsProcessing(true);
    
    try {
      const response = await repairText({
        transcript: transcription,
      });
      
      setRepairedText(response.text);
      toast.success('文本修复完成');
    } catch (error) {
      console.error('Text repair failed:', error);
      toast.error('文本修复失败');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGenerateSummary = async () => {
    const textToSummarize = repairedText || transcription;
    if (!textToSummarize) {
      toast.error('请先进行转录和文本修复');
      return;
    }
    
    setIsProcessing(true);
    
    try {
      const response = await generateSummary({
        transcript: textToSummarize,
        mode: 'meeting',
      });
      
      setSummary(response.summary);
      setMindmap(response.outline_md);
      toast.success('总结生成完成');
    } catch (error) {
      console.error('Summary generation failed:', error);
      toast.error('总结生成失败');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadFile = async (file: any) => {
    try {
      const blob = await downloadFile(currentTask?.taskId || '', file.fileId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('文件下载开始');
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('文件下载失败');
    }
  };

  const getFileIconComponent = (fileType: string) => {
    if (fileType.startsWith('audio/')) return <Headphones className="w-6 h-6 text-blue-500" />;
    if (fileType.startsWith('video/')) return <Video className="w-6 h-6 text-purple-500" />;
    return <FileText className="w-6 h-6 text-green-500" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!currentTask) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">任务未找到</h3>
        <button
          onClick={() => navigate('/tasks')}
          className="text-blue-600 hover:text-blue-500 font-medium"
        >
          返回任务列表
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => navigate('/tasks')}
              className="mr-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{currentTask.taskName}</h1>
              <p className="text-gray-600 mt-1">
                创建于 {formatDate(currentTask.createdAt)} · 
                {currentTask.fileList?.length || 0} 个文件
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={loadTask}
              className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              刷新
            </button>
            <button
              onClick={() => {/* Handle share */}}
              className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <Share className="w-4 h-4 mr-1" />
              分享
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Files Section */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">文件列表</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {currentTask.fileList?.map((file) => (
                <div key={file.fileId} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {getFileIconComponent(file.fileType)}
                      <div className="ml-3">
                        <h4 className="text-sm font-medium text-gray-900">{file.fileName}</h4>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(file.fileSize)} · {file.fileType}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleTranscribe(file)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                        title="开始转录"
                      >
                        <Play className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDownloadFile(file)}
                        className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg"
                        title="下载文件"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Transcription Results */}
        <div className="lg:col-span-2 space-y-6">
          {/* Original Transcription */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">原始转录</h2>
                <button
                  onClick={handleRepairText}
                  disabled={!transcription || isProcessing}
                  className="inline-flex items-center px-3 py-2 border border-blue-300 text-sm font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50 disabled:opacity-50"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  修复文本
                </button>
              </div>
            </div>
            <div className="p-6">
              {isProcessing && !repairedText ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-2"></div>
                  <span>处理中...</span>
                </div>
              ) : transcription ? (
                <div className="prose max-w-none">
                  <pre className="whitespace-pre-wrap text-sm text-gray-700 bg-gray-50 p-4 rounded-lg">
                    {transcription}
                  </pre>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p>请先选择文件并开始转录</p>
                </div>
              )}
            </div>
          </div>

          {/* Repaired Text */}
          {repairedText && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">修复后的文本</h2>
                  <button
                    onClick={handleGenerateSummary}
                    disabled={isProcessing}
                    className="inline-flex items-center px-3 py-2 border border-green-300 text-sm font-medium rounded-md text-green-700 bg-white hover:bg-green-50 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4 mr-1" />
                    生成总结
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="prose max-w-none">
                  <pre className="whitespace-pre-wrap text-sm text-gray-700 bg-gray-50 p-4 rounded-lg">
                    {repairedText}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* Summary */}
          {summary && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">会议总结</h2>
              </div>
              <div className="p-6">
                <div className="prose max-w-none">
                  <div 
                    className="text-gray-700"
                    dangerouslySetInnerHTML={{ __html: summary }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Mindmap */}
          {mindmap && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">思维导图</h2>
              </div>
              <div className="p-6">
                <div className="prose max-w-none">
                  <pre className="whitespace-pre-wrap text-sm text-gray-700 bg-gray-50 p-4 rounded-lg">
                    {mindmap}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}