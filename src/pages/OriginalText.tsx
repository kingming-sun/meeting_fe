import { Search, Edit3, Send, Download } from 'lucide-react';

export default function OriginalText() {
  const text = Array.from({length:20}).map((_,i)=>`第 ${i+1} 段内容 示例文本...`).join('\n');
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6 space-y-4">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center bg-white border border-gray-200 rounded-md px-2 flex-1 sm:flex-initial sm:min-w-[240px]">
          <Search className="w-4 h-4 text-gray-400 flex-shrink-0"/>
          <input placeholder="搜索原文" className="px-2 py-2 outline-none text-sm min-w-0 flex-1"/>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto">
          <button className="px-3 py-2 rounded-md bg-white border border-gray-200 hover:bg-gray-50 text-sm whitespace-nowrap"><Edit3 className="w-4 h-4 mr-2 inline"/> 编辑</button>
          <button className="px-3 py-2 rounded-md bg-white border border-gray-200 hover:bg-gray-50 text-sm whitespace-nowrap"><Send className="w-4 h-4 mr-2 inline"/> 发送</button>
          <button className="px-3 py-2 rounded-md bg-white border border-gray-200 hover:bg-gray-50 text-sm whitespace-nowrap"><Download className="w-4 h-4 mr-2 inline"/> 导出</button>
        </div>
      </div>
      <div className="bg-white border border-gray-200 rounded-lg p-4 md:p-6 whitespace-pre-wrap text-gray-900 text-sm md:text-base leading-6 md:leading-7">{text}</div>
    </div>
  );
}
