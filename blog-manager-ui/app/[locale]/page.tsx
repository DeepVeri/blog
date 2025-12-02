"use client";

import { useEffect, useState } from "react";
import { Users, FileText, Activity, TrendingUp, Eye } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

interface StatsData {
  todayPV: number;
  todayUV: number;
  totalPV: number;
  totalUV: number;
  totalUsers?: number;
  totalArticles?: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<StatsData>({
    todayPV: 0,
    todayUV: 0,
    totalPV: 0,
    totalUV: 0,
    totalUsers: 0,
    totalArticles: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // 获取访问统计
        const statsRes = await fetch(`${API_BASE}/api/stats/overview`);
        const statsData = await statsRes.json();

        // 获取用户总数
        const usersRes = await fetch(`${API_BASE}/api/users?page=0&size=1`);
        const usersData = await usersRes.json();

        // 获取文章总数
        const articlesRes = await fetch(`${API_BASE}/api/articles?page=0&size=1`);
        const articlesData = await articlesRes.json();

        setStats({
          todayPV: statsData.todayPV || 0,
          todayUV: statsData.todayUV || 0,
          totalPV: statsData.totalPV || 0,
          totalUV: statsData.totalUV || 0,
          totalUsers: usersData.totalElements || 0,
          totalArticles: articlesData.totalElements || 0,
        });
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const formatNumber = (num: number) => {
    if (num >= 10000) return (num / 10000).toFixed(1) + 'w';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return num.toString();
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
        控制台概览
      </h1>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="总用户数" 
          value={loading ? "-" : formatNumber(stats.totalUsers || 0)} 
          icon={Users} 
          color="bg-blue-500"
        />
        <StatCard 
          title="文章总数" 
          value={loading ? "-" : formatNumber(stats.totalArticles || 0)} 
          icon={FileText} 
          color="bg-purple-500"
        />
        <StatCard 
          title="今日访问 (PV/UV)" 
          value={loading ? "-" : `${formatNumber(stats.todayPV)} / ${formatNumber(stats.todayUV)}`} 
          icon={Activity} 
          color="bg-green-500"
        />
        <StatCard 
          title="总访问量 (PV)" 
          value={loading ? "-" : formatNumber(stats.totalPV)} 
          icon={Eye} 
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

function StatCard({ title, value, icon: Icon, color }: any) {
  return (
    <div className="bg-white dark:bg-[#1a1a1a] p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${color} bg-opacity-10`}>
          <Icon size={24} className={color.replace('bg-', 'text-')} />
        </div>
      </div>
      <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">{title}</h3>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
    </div>
  );
}

