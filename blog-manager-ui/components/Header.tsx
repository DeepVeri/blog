"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Moon, Sun, User, LogOut, Loader2, Languages, LayoutDashboard } from 'lucide-react';
import AuthModal from './AuthModal';
import { useTranslations, useLocale } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';

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

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);

    const email = localStorage.getItem('user_email');
    if (email) {
      setUserEmail(email);
    }
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
      // 调用后端退出接口
      await fetch('http://localhost:8080/api/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // 无论后端成功与否，前端都要清除状态
      setTimeout(() => {
        localStorage.removeItem('user_token');
        localStorage.removeItem('user_email');
        setUserEmail(null);
        setIsLoggingOut(false);
        setIsLogoutConfirmOpen(false);
        window.location.reload();
      }, 500); // 稍微延迟一下，让用户看到 loading 结束
    }
  };

  return (
    <>
      <header className="wrapper header">
        <Link href="/" className="logo">DeepVeir</Link>
        <nav className="nav">
          <Link href="/">{t('home')}</Link>
          <Link href="#">{t('category')}</Link>
          <Link href="#">{t('about')}</Link>

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
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#2a2a2a] rounded-xl shadow-lg border border-gray-100 dark:border-gray-800 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right z-50">
                <div className="p-2">
                  <div className="px-4 py-2 text-xs text-gray-400 dark:text-gray-500 border-b border-gray-100 dark:border-gray-700 mb-1">
                    {userEmail}
                  </div>
                  <Link 
                    href="/admin"
                    className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20 dark:hover:text-blue-400 rounded-lg transition-colors mb-1"
                  >
                    <LayoutDashboard size={16} />
                    <span>{t('dashboard')}</span>
                  </Link>
                  <button 
                    onClick={handleLogoutClick}
                    className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
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
