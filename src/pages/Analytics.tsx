import { BarChart3, TrendingUp, Activity, Clock, Folder, FileText } from 'lucide-react';

export default function Analytics() {
  const cards = [
    { title: '任务总数', value: 128, icon: FileText },
    { title: '文件总数', value: 532, icon: Folder },
    { title: '本周处理时长', value: '12.4h', icon: Clock },
    { title: 'AI生成结果', value: 76, icon: Activity },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6 space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 md:gap-4">
        <div className="flex items-center space-x-2">
          <BarChart3 className="w-5 h-5 md:w-6 md:h-6 text-blue-600"/>
          <h2 className="text-xl md:text-2xl font-semibold text-gray-900">统计分析</h2>
        </div>
        <button className="px-3 py-2 rounded-md bg-white border border-gray-200 hover:bg-gray-50 text-sm md:text-base whitespace-nowrap">导出报表</button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {cards.map((c,i)=>{
          const Icon = c.icon; 
          return (
            <div key={i} className="bg-white border border-gray-200 rounded-lg p-3 md:p-4">
              <div className="flex flex-col md:flex-row items-start md:items-center md:justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="text-xs md:text-sm text-gray-600 truncate">{c.title}</div>
                  <div className="text-xl md:text-2xl font-bold text-gray-900 mt-1">{c.value}</div>
                </div>
                <Icon className="w-5 h-5 md:w-6 md:h-6 text-gray-500 flex-shrink-0"/>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4 md:p-6 h-64 md:h-80 flex items-center justify-center text-sm md:text-base text-gray-500">趋势图</div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 md:p-6 h-64 md:h-80 flex items-center justify-center text-sm md:text-base text-gray-500">类型分布</div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4 md:p-6">
        <div className="flex items-center space-x-2 text-gray-700 mb-3 text-sm md:text-base"><TrendingUp className="w-4 h-4"/><span>近期处理记录</span></div>
        <div className="space-y-1 md:space-y-2">
          {Array.from({length:5}).map((_,i)=> (
            <div key={i} className="flex items-center justify-between px-3 py-2.5 rounded-md hover:bg-gray-50 transition-colors">
              <div className="text-sm md:text-base text-gray-900">任务 {i+1}</div>
              <div className="text-xs md:text-sm text-gray-500">已完成</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
