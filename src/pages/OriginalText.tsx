import { Search, Edit3, Send, Download } from 'lucide-react';

export default function OriginalText() {
  const text = Array.from({length:20}).map((_,i)=>`第 ${i+1} 段内容 示例文本...`).join('\n');
  return (
    <div className="px-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center bg-white border border-gray-200 rounded-md px-2">
          <Search className="w-4 h-4 text-gray-400"/>
          <input placeholder="搜索原文" className="px-2 py-2 outline-none"/>
        </div>
        <div className="flex items-center space-x-2">
          <button className="px-3 py-2 rounded-md bg-white border border-gray-200 hover:bg-gray-50"><Edit3 className="w-4 h-4 mr-2 inline"/> 编辑</button>
          <button className="px-3 py-2 rounded-md bg-white border border-gray-200 hover:bg-gray-50"><Send className="w-4 h-4 mr-2 inline"/> 发送</button>
          <button className="px-3 py-2 rounded-md bg-white border border-gray-200 hover:bg-gray-50"><Download className="w-4 h-4 mr-2 inline"/> 导出</button>
        </div>
      </div>
      <div className="bg-white border border-gray-200 rounded-lg p-4 whitespace-pre-wrap text-gray-900 text-sm leading-7">{text}</div>
    </div>
  );
}
