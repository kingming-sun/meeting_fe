import { CheckCircle2, XCircle, Crown, Rocket, Wallet } from 'lucide-react';

export default function Subscription() {
  const plans = [
    { name: '基础版', price: '¥29/月', features: ['10 个任务','5GB 空间','标准转写','基础总结'], negative: ['无实时转写','无团队协作'] },
    { name: '专业版', price: '¥69/月', features: ['不限任务','50GB 空间','高级转写','智能总结','思维导图','文件共享'], negative: ['无企业支持'] },
    { name: '企业版', price: '¥199/月', features: ['自定义配额','无限空间','团队协作','企业支持','私有部署'], negative: [] },
  ];

  return (
    <div className="px-4 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Crown className="w-5 h-5 text-blue-600"/>
          <h2 className="text-lg font-semibold text-gray-900">订阅计划</h2>
        </div>
        <button className="px-3 py-2 rounded-md bg-white border border-gray-200 hover:bg-gray-50"><Wallet className="w-4 h-4 mr-2 inline"/> 管理账单</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {plans.map((p,i)=> (
          <div key={i} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="text-gray-900 font-semibold">{p.name}</div>
              <div className="text-blue-600 font-bold">{p.price}</div>
            </div>
            <div className="mt-4 space-y-2">
              {p.features.map((f,idx)=> (
                <div key={idx} className="flex items-center text-gray-700"><CheckCircle2 className="w-4 h-4 text-emerald-600 mr-2"/>{f}</div>
              ))}
              {p.negative.map((f,idx)=> (
                <div key={idx} className="flex items-center text-gray-500"><XCircle className="w-4 h-4 text-gray-400 mr-2"/>{f}</div>
              ))}
            </div>
            <button className="w-full mt-4 px-3 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"><Rocket className="w-4 h-4 mr-2 inline"/> 选择此方案</button>
          </div>
        ))}
      </div>
    </div>
  );
}
