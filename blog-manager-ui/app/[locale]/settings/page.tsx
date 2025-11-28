"use client";

import { useState, useEffect } from 'react';
import { User, Mail, Lock, Save, Loader2, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  // 可读 userId（如 admin），用于查询；dbUserId 为数据库中的 UUID，更新时使用
  const [userId, setUserId] = useState<string | null>(null);
  const [dbUserId, setDbUserId] = useState<string | null>(null);
  
  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    // Load user data from localStorage first
    const storedId = localStorage.getItem('user_id');
    const storedEmail = localStorage.getItem('user_email');
    
    if (storedEmail) setEmail(storedEmail);
    
    if (storedId) {
      setUserId(storedId);
      
      // Fetch latest user data from backend using readable userId
      fetch(`http://localhost:8080/api/users/by-user-id/${storedId}`)
        .then(res => {
          if (res.ok) return res.json();
          throw new Error('Failed to fetch user data');
        })
        .then(data => {
          if (data.id) setDbUserId(data.id);
          if (data.email) setEmail(data.email);
          if (data.name) setName(data.name);
          // Update local storage to match backend
          if (data.email) localStorage.setItem('user_email', data.email);
        })
        .catch(err => console.error('Error loading user details:', err));
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dbUserId) {
      setMessage({ type: 'error', text: '无法获取用户ID，请重新登录' });
      return;
    }

    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const updateData: any = {};
      if (email) updateData.email = email;
      if (password) updateData.password = password;
      if (name) updateData.name = name;

      const res = await fetch(`http://localhost:8080/api/users/${dbUserId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${localStorage.getItem('user_token')}` // Include if backend requires it
        },
        body: JSON.stringify(updateData),
      });

      if (!res.ok) {
        throw new Error('更新失败');
      }

      const data = await res.json();
      
      // Update local storage if email changed
      if (email) localStorage.setItem('user_email', email);
      
      setMessage({ type: 'success', text: '个人信息更新成功！' });
      
      // Clear password field
      setPassword('');
      
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || '发生错误，请重试' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 mb-6 transition-colors"
      >
        <ArrowLeft size={20} />
        <span>返回</span>
      </button>

      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">个人设置</h1>
      
      <div className="bg-white dark:bg-[#1a1a1a] rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
          <h2 className="font-semibold text-gray-900 dark:text-white">基本信息</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            修改您的账户信息和密码
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {message.text && (
            <div className={`p-4 rounded-lg text-sm ${
              message.type === 'success' 
                ? 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400' 
                : 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'
            }`}>
              {message.text}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              昵称
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="设置一个昵称"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              邮箱地址
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="your@email.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              新密码
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="不修改请留空"
              />
            </div>
            <p className="text-xs text-gray-500">仅在需要修改密码时填写</p>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
              <span>保存修改</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
