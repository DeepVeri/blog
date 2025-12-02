"use client";

import { useState } from 'react';
import { X, Mail, Lock, Loader2, Check } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { API_BASE } from '@/lib/apiConfig';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const tAuth = useTranslations('Auth');
  const tCommon = useTranslations('Common');

  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      // 指向 Spring Boot 后端
      const endpoint = isLogin ? `${API_BASE}/api/auth/login` : `${API_BASE}/api/auth/register`;
      
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      // 检查是否为 JSON 响应
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("服务器响应异常 (非 JSON)");
      }

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || '操作失败，请重试');
      }

      // 成功后处理
      const token = data.token || 'demo-token'; // 兼容注册接口可能没返回 token 的情况
      
      // 将用户信息保存到本地
      localStorage.setItem('user_token', token);
      localStorage.setItem('user_email', email);
      
      // CRITICAL: 保存 Token 到 Cookie，以便 blog-manager-ui 可以读取 (实现简单 SSO)
      // 设置 domain 为 localhost 或不设置 (默认为当前域)，path 为 /，这样不同端口的 localhost 服务都能访问
      document.cookie = `auth_token=${token}; path=/; domain=.deepveir.com; max-age=86400`; // 1天过期，跨子域共享

      // 显示成功状态
      setIsSuccess(true);
      
      // 1秒后关闭并更新
      setTimeout(() => {
        window.dispatchEvent(new Event('auth-change'));
        onClose();
        // window.location.reload(); 
      }, 1000);
      
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false); // 只有出错时才在这里取消 loading，成功时保持 loading 直到切换界面
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#1a1a1a] w-full max-w-md rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden animate-in zoom-in-95 duration-200">
        
        <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-white/5 z-10"
        >
            <X size={20} />
        </button>

        {isSuccess ? (
          <div className="py-16 px-8 flex flex-col items-center justify-center text-center animate-in zoom-in duration-300">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/20 text-green-500 rounded-full flex items-center justify-center mb-6">
              <Check size={40} strokeWidth={3} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {tAuth('success')}
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              {tCommon('loading')}
            </p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="relative px-8 pt-8 pb-6 text-center">
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-white/5"
                >
                    <X size={20} />
                </button>
                <h2 className="text-2xl font-bold mb-2">
                    {isLogin ? tAuth('welcome') : tAuth('createAccount')}
                </h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                    {isLogin ? '登录以发表评论并同步您的阅读进度' : '加入 DeepVeir，开启您的技术探索之旅'}
                </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-4">
                {error && (
                  <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/50 rounded-lg text-center">
                    {error}
                  </div>
                )}

                <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {tAuth('email')}
                    </label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                            type="email" 
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="name@example.com"
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition-all"
                        />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {tAuth('password')}
                    </label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                            type="password" 
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition-all"
                        />
                    </div>
                </div>

                <button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full py-3 bg-black dark:bg-white text-white dark:text-black rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2 mt-6"
                >
                    {isLoading && <Loader2 className="animate-spin" size={18} />}
                    {isLogin ? tAuth('loginButton') : tAuth('registerButton')}
                </button>

                <div className="text-center mt-6">
                    <button
                        type="button"
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-sm text-gray-500 hover:text-black dark:hover:text-white transition-colors"
                    >
                        {isLogin ? tAuth('toRegister') : tAuth('toLogin')}
                    </button>
                </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
