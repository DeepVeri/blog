"use client";

import { Users, FileText, Activity, TrendingUp } from "lucide-react";

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
        控制台概览
      </h1>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="总用户数" 
          value="12" 
          trend="+20%" 
          icon={Users} 
          color="bg-blue-500"
        />
        <StatCard 
          title="文章总数" 
          value="45" 
          trend="+5" 
          icon={FileText} 
          color="bg-purple-500"
        />
        <StatCard 
          title="今日访问" 
          value="1,204" 
          trend="+12%" 
          icon={Activity} 
          color="bg-green-500"
        />
        <StatCard 
          title="总阅读量" 
          value="89.2k" 
          trend="+8%" 
          icon={TrendingUp} 
          color="bg-orange-500"
        />
      </div>

      {/* 欢迎区域 */}
      <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl p-8 border border-gray-100 dark:border-gray-800 shadow-sm">
        <h2 className="text-xl font-semibold mb-4">欢迎回来，管理员</h2>
        <p className="text-gray-500 dark:text-gray-400">
          这是您的 DeepVeir 博客管理后台。您可以在这里管理用户、文章和系统设置。
          <br />
          左侧导航栏可以快速切换不同模块。
        </p>
      </div>
    </div>
  );
}

function StatCard({ title, value, trend, icon: Icon, color }: any) {
  return (
    <div className="bg-white dark:bg-[#1a1a1a] p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${color} bg-opacity-10 text-white`}>
          <Icon size={24} className={`text-${color.replace('bg-', '')}`} style={{ color: 'inherit' }} />
        </div>
        <span className="text-sm font-medium text-green-500 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-lg">
          {trend}
        </span>
      </div>
      <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">{title}</h3>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
    </div>
  );
}

