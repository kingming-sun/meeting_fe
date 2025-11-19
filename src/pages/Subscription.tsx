import { CheckCircle2, XCircle, Crown, Rocket, Wallet } from 'lucide-react';

export default function Subscription() {
  const plans = [
    { name: '基础版', price: '¥29/月', features: ['10 个任务','5GB 空间','标准转写','基础总结'], negative: ['无实时转写','无团队协作'] },
    { name: '专业版', price: '¥69/月', features: ['不限任务','50GB 空间','高级转写','智能总结','思维导图','文件共享'], negative: ['无企业支持'] },
    { name: '企业版', price: '¥199/月', features: ['自定义配额','无限空间','团队协作','企业支持','私有部署'], negative: [] },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6 space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 md:gap-4">
        <div className="flex items-center space-x-2">
          <Crown className="w-5 h-5 md:w-6 md:h-6 text-blue-600"/>
          <h2 className="text-xl md:text-2xl font-semibold text-gray-900">订阅计划</h2>
        </div>
        <button className="px-3 py-2 rounded-md bg-white border border-gray-200 hover:bg-gray-50 text-sm md:text-base whitespace-nowrap"><Wallet className="w-4 h-4 mr-2 inline"/> 管理账单</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {plans.map((p,i)=> (
          <div key={i} className="bg-white border-2 border-gray-200 rounded-xl p-4 md:p-6 hover:border-blue-400 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="text-base md:text-lg text-gray-900 font-semibold">{p.name}</div>
              <div className="text-lg md:text-xl text-blue-600 font-bold">{p.price}</div>
            </div>
            <div className="space-y-2 md:space-y-3">
              {p.features.map((f,idx)=> (
                <div key={idx} className="flex items-start text-sm md:text-base text-gray-700">
                  <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-emerald-600 mr-2 mt-0.5 flex-shrink-0"/>
                  <span>{f}</span>
                </div>
              ))}
              {p.negative.map((f,idx)=> (
                <div key={idx} className="flex items-start text-sm md:text-base text-gray-500">
                  <XCircle className="w-4 h-4 md:w-5 md:h-5 text-gray-400 mr-2 mt-0.5 flex-shrink-0"/>
                  <span>{f}</span>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 md:mt-6 px-4 py-2.5 md:py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm md:text-base font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              <Rocket className="w-4 h-4 mr-2 inline"/> 选择此方案
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
