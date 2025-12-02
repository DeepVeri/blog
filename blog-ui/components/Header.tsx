"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Moon, Sun, User, LogOut, Loader2, Languages, LayoutDashboard } from 'lucide-react';
import AuthModal from './AuthModal';
import { useTranslations, useLocale } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { API_BASE } from '@/lib/apiConfig';

export default function Header() {
  const t = useTranslations('Navigation');
  const tCommon = useTranslations('Common');
  const tAuth = useTranslations('Auth');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  
  const [theme, setTheme] = useState('light');
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  
  // 退出登录相关的状态
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // 从 Cookie 获取值的辅助函数
  const getCookie = (name: string): string | null => {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? match[2] : null;
  };

  // 验证 Token 并获取用户信息
  const verifyToken = async () => {
    const token = getCookie('auth_token') || localStorage.getItem('user_token');
    if (!token) {
      setUserEmail(null);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (res.ok) {
        const data = await res.json();
        setUserEmail(data.email);
        // 同步到 localStorage
        localStorage.setItem('user_email', data.email);
        localStorage.setItem('user_token', token);
      } else {
        // Token 无效，清除登录状态
        setUserEmail(null);
        localStorage.removeItem('user_token');
        localStorage.removeItem('user_email');
        document.cookie = 'auth_token=; path=/; domain=.deepveir.com; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      }
    } catch (error) {
      console.error('Token verification failed:', error);
      // 网络错误时保持现有状态
      const email = localStorage.getItem('user_email');
      setUserEmail(email);
    }
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);

    // 验证 Token
    verifyToken();

    // Listen for auth changes
    const handleAuthChange = () => verifyToken();
    window.addEventListener('auth-change', handleAuthChange);
    window.addEventListener('storage', handleAuthChange);

    return () => {
      window.removeEventListener('auth-change', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
    };
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const toggleLanguage = () => {
    const nextLocale = locale === 'zh' ? 'en' : 'zh';
    // 简单的路径替换逻辑：把 /zh/xxx 换成 /en/xxx
    let newPath = pathname;
    if (newPath.startsWith(`/${locale}`)) {
      newPath = newPath.replace(`/${locale}`, `/${nextLocale}`);
    } else {
      newPath = `/${nextLocale}${newPath}`;
    }
    router.push(newPath);
  };

  const handleLogoutClick = () => {
    setIsLogoutConfirmOpen(true);
  };

  const confirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      // 调用后端退出接口（带 Token，让后端使 Token 失效）
      const token = getCookie('auth_token') || localStorage.getItem('user_token');
      await fetch(`${API_BASE}/api/auth/logout`, { 
        method: 'POST',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // 无论后端成功与否，前端都要清除状态
      setTimeout(() => {
        localStorage.removeItem('user_token');
        localStorage.removeItem('user_email');
        // 清除跨子域 Cookie
        document.cookie = 'auth_token=; path=/; domain=.deepveir.com; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        // Trigger update
        window.dispatchEvent(new Event('auth-change'));
        
        setIsLoggingOut(false);
        setIsLogoutConfirmOpen(false);
        // window.location.reload(); // No longer needed
      }, 500);
    }
  };

  return (
    <>
      <header className="wrapper header">
        <Link href="/" className="logo">DeepVeir</Link>
        <nav className="nav">
          <Link href={`/${locale}`}>{t('home')}</Link>
          <Link href={`/${locale}/categories`}>{t('category')}</Link>
          <Link href={`/${locale}/about`}>{t('about')}</Link>

          <div className="h-5 w-[1px] bg-gray-200 dark:bg-gray-700 mx-2"></div> {/* Divider */}

          {userEmail ? (
            <div className="relative group">
              <button 
                className="flex items-center space-x-2 py-2 px-4 bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-gray-700 dark:text-gray-200 rounded-full transition-all duration-300"
              >
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {userEmail[0].toUpperCase()}
                </div>
                <span className="text-sm font-medium max-w-[100px] truncate">{userEmail.split('@')[0]}</span>
              </button>
              {/* Dropdown for Logout */}
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#2a2a2a] rounded-xl shadow-lg border border-gray-100 dark:border-gray-800 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right z-50 overflow-hidden">
                <div className="p-2 space-y-1">
                  <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400 rounded-lg mb-1 cursor-default">
                    <div className="flex items-center gap-2">
                      <User size={16} />
                      <span className="truncate">{userEmail}</span>
                    </div>
                  </div>
                  <a 
                    href="https://admin.deepveir.com"
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg transition-colors !ml-0"
                  >
                    <LayoutDashboard size={16} />
                    <span>{t('dashboard')}</span>
                  </a>
                  <button 
                    onClick={handleLogoutClick}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <LogOut size={16} />
                    <span>{t('logout')}</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <button 
              onClick={() => setIsAuthOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-white/10 transition-all"
            >
              <User size={18} />
              <span>{t('login')}</span>
            </button>
          )}

          <button 
            onClick={toggleLanguage} 
            className="ml-2 p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-black dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-white transition-colors"
            title={locale === 'zh' ? 'Switch to English' : '切换到中文'}
          >
            <Languages size={20} />
          </button>

          <button 
            onClick={toggleTheme} 
            className="ml-2 p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-black dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-white transition-colors"
            title={t('theme')}
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </nav>
      </header>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />

      {/* 退出登录确认弹窗 */}
      {isLogoutConfirmOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-gray-100 dark:border-gray-800 animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{t('logout')}</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">
              {tCommon('confirm')} {t('logout')}?
            </p>
            <div className="flex space-x-3">
              <button 
                onClick={() => setIsLogoutConfirmOpen(false)} 
                disabled={isLoggingOut}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50"
              >
                {tCommon('cancel')}
              </button>
              <button 
                onClick={confirmLogout} 
                disabled={isLoggingOut}
                className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50"
              >
                {isLoggingOut ? <Loader2 className="animate-spin" size={16} /> : <span>{tCommon('confirm')}</span>}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
