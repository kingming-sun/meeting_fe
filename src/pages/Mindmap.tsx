import { Network, Download, ZoomIn, ZoomOut } from 'lucide-react';
import { useState } from 'react';

export default function Mindmap() {
  const [scale, setScale] = useState(1);
  const nodes = [
    { id: 'root', label: '会议主题', children: ['结论','行动项','风险','后续'] },
  ];
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6 space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <Network className="w-5 h-5 md:w-6 md:h-6 text-blue-600"/>
          <h2 className="text-xl md:text-2xl font-semibold text-gray-900">思维导图</h2>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto">
          <button onClick={()=>setScale(s=>Math.min(2,s+0.1))} className="p-2 md:px-3 md:py-2 rounded-md bg-white border border-gray-200 hover:bg-gray-50 flex-shrink-0" title="放大"><ZoomIn className="w-4 h-4"/></button>
          <button onClick={()=>setScale(s=>Math.max(0.5,s-0.1))} className="p-2 md:px-3 md:py-2 rounded-md bg-white border border-gray-200 hover:bg-gray-50 flex-shrink-0" title="缩小"><ZoomOut className="w-4 h-4"/></button>
          <button className="px-3 py-2 rounded-md bg-white border border-gray-200 hover:bg-gray-50 text-sm whitespace-nowrap"><Download className="w-4 h-4 mr-2 inline"/> 导出图片</button>
        </div>
      </div>
      <div className="bg-white border border-gray-200 rounded-lg p-4 md:p-6 h-[400px] md:h-[520px] overflow-auto">
        <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}>
          <div className="flex items-start space-x-6 md:space-x-12">
            <div className="px-3 md:px-4 py-1.5 md:py-2 rounded-md bg-blue-50 border border-blue-200 text-blue-900 text-sm md:text-base font-semibold whitespace-nowrap">{nodes[0].label}</div>
            <div className="flex space-x-4 md:space-x-8">
              {nodes[0].children.map((c,i)=> (
                <div key={i} className="space-y-2 md:space-y-3">
                  <div className="px-2 md:px-3 py-1 rounded-md bg-gray-50 border border-gray-200 text-sm md:text-base text-gray-900 whitespace-nowrap">{c}</div>
                  {Array.from({length:3}).map((_,idx)=> (
                    <div key={idx} className="px-2 py-1 rounded bg-white border text-xs md:text-sm text-gray-700 whitespace-nowrap">节点 {i+1}-{idx+1}</div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
