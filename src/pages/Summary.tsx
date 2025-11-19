import { FileText, Download, UserCheck, Search } from 'lucide-react';

export default function Summary() {
  const sections = [
    { title: '会议主题', content: '示例会议主题内容...' },
    { title: '关键结论', content: '示例关键结论列表...' },
    { title: '行动项', content: '示例行动项列表...' },
  ];
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6 space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 md:gap-4">
        <div className="flex items-center space-x-2">
          <FileText className="w-5 h-5 md:w-6 md:h-6 text-blue-600"/>
          <h2 className="text-xl md:text-2xl font-semibold text-gray-900">会议总结</h2>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center bg-white border border-gray-200 rounded-md px-2 flex-1 sm:flex-initial">
            <Search className="w-4 h-4 text-gray-400 flex-shrink-0"/>
            <input placeholder="搜索总结" className="px-2 py-2 outline-none text-sm min-w-0 flex-1"/>
          </div>
          <button className="px-3 py-2 rounded-md bg-white border border-gray-200 hover:bg-gray-50 text-sm whitespace-nowrap"><Download className="w-4 h-4 mr-2 inline"/> 导出</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        {sections.map((s,i)=> (
          <div key={i} className="bg-white border border-gray-200 rounded-lg p-4 md:p-6">
            <div className="text-sm md:text-base text-gray-900 font-semibold mb-2">{s.title}</div>
            <div className="text-xs md:text-sm text-gray-700">{s.content}</div>
          </div>
        ))}
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4 md:p-6">
        <div className="flex items-center space-x-2 text-gray-700 mb-3 text-sm md:text-base"><UserCheck className="w-4 h-4 flex-shrink-0"/><span>说话人分离</span></div>
        <div className="space-y-2">
          {Array.from({length:6}).map((_,i)=> (
            <div key={i} className="px-3 py-2.5 rounded-md border border-gray-200 flex items-center justify-between hover:bg-gray-50 transition-colors">
              <div className="text-sm md:text-base text-gray-900">说话人 {i+1}</div>
              <div className="text-xs md:text-sm text-gray-500">片段 {i+1}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
