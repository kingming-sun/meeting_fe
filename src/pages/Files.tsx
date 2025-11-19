import { useState } from 'react';
import { UploadCloud, FolderPlus, Search, Filter, Grid, List, MoreHorizontal, Folder, FileText, Video, Headphones } from 'lucide-react';
import { cn } from '../utils';

export default function Files() {
  const [view, setView] = useState<'grid'|'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const files = [
    { id: '1', name: '会议录音.mp3', type: 'audio', size: 128, updatedAt: Date.now() - 3600_000 },
    { id: '2', name: '产品演示.mp4', type: 'video', size: 1024, updatedAt: Date.now() - 7200_000 },
    { id: '3', name: '需求文档.pdf', type: 'doc', size: 3, updatedAt: Date.now() - 1800_000 },
  ];
  const filtered = files.filter(f => f.name.includes(searchTerm));

  const Icon = (t: string) => {
    if (t === 'audio') return <Headphones className="w-5 h-5 text-blue-600"/>;
    if (t === 'video') return <Video className="w-5 h-5 text-purple-600"/>;
    return <FileText className="w-5 h-5 text-emerald-600"/>;
  };

  return (
    <div className="px-4 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button className="inline-flex items-center px-3 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700">
            <UploadCloud className="w-4 h-4 mr-2"/> 上传文件
          </button>
          <button className="inline-flex items-center px-3 py-2 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200">
            <FolderPlus className="w-4 h-4 mr-2"/> 新建文件夹
          </button>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center bg-white border border-gray-200 rounded-md px-2">
            <Search className="w-4 h-4 text-gray-400"/>
            <input value={searchTerm} onChange={(e)=>setSearchTerm(e.target.value)} placeholder="搜索文件" className="px-2 py-2 outline-none"/>
          </div>
          <button className="p-2 rounded-md bg-white border border-gray-200 hover:bg-gray-50"><Filter className="w-4 h-4"/></button>
          <button onClick={()=>setView('grid')} className={cn('p-2 rounded-md border', view==='grid'?'bg-blue-50 border-blue-200':'bg-white border-gray-200')}><Grid className="w-4 h-4"/></button>
          <button onClick={()=>setView('list')} className={cn('p-2 rounded-md border', view==='list'?'bg-blue-50 border-blue-200':'bg-white border-gray-200')}><List className="w-4 h-4"/></button>
        </div>
      </div>

      {view==='grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(f=> (
            <div key={f.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  {Icon(f.type)}
                  <span className="font-medium text-gray-900">{f.name}</span>
                </div>
                <button className="p-2 rounded-md hover:bg-gray-100"><MoreHorizontal className="w-4 h-4"/></button>
              </div>
              <div className="text-xs text-gray-500">大小 {f.size}MB · 更新于 {new Date(f.updatedAt).toLocaleString()}</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="grid grid-cols-12 px-4 py-2 text-xs text-gray-500 border-b"> 
            <div className="col-span-6">名称</div>
            <div className="col-span-2">类型</div>
            <div className="col-span-2">大小</div>
            <div className="col-span-2">更新时间</div>
          </div>
          {filtered.map(f=> (
            <div key={f.id} className="grid grid-cols-12 px-4 py-3 border-b last:border-b-0">
              <div className="col-span-6 flex items-center space-x-2">
                {Icon(f.type)}
                <span className="text-gray-900">{f.name}</span>
              </div>
              <div className="col-span-2 text-gray-600">{f.type}</div>
              <div className="col-span-2 text-gray-600">{f.size}MB</div>
              <div className="col-span-2 text-gray-600">{new Date(f.updatedAt).toLocaleDateString()}</div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6">
        <div className="flex items-center space-x-2 text-gray-700 mb-3"><Folder className="w-4 h-4"/><span>文件夹</span></div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {['产品文档','会议记录','视频素材','音频素材','AI生成','导出结果'].map((n,i)=> (
            <div key={i} className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-sm">
              <div className="flex items-center space-x-2"><Folder className="w-4 h-4 text-gray-600"/><span className="text-gray-900">{n}</span></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
