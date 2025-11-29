"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Users, FileText, Settings, Home, LogOut, ChevronLeft, ChevronRight, Bell, User, ChevronDown, Shield, List } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { API_BASE } from "@/lib/apiConfig";

// Helper to dynamically get icon component
const DynamicIcon = ({ name, size = 20, className }: { name: string; size?: number; className?: string }) => {
  // @ts-ignore
  const IconComponent = LucideIcons[name];
  if (!IconComponent) return <LucideIcons.Circle size={size} className={className} />; // Fallback icon
  return <IconComponent size={size} className={className} />;
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  
  const [menuItems, setMenuItems] = useState<any[]>([]);

  useEffect(() => {
    const email = localStorage.getItem('user_email');
    const userId = localStorage.getItem('user_id');
    
    if (email) setUserEmail(email);
    
    if (userId) {
      fetch(`${API_BASE}/api/menus/user/${userId}`)
        .then(res => res.json())
        .then(data => {
          // 如果后端返回空或者出错，我们至少保留一个控制台入口防止完全空白
          if (Array.isArray(data) && data.length > 0) {
            setMenuItems(data);
          } else {
            // Fallback
            setMenuItems([{ name: "控制台", path: "/", icon: "Home" }]);
          }
        })
        .catch(err => {
          console.error("Failed to load menus:", err);
          setMenuItems([{ name: "控制台", path: "/", icon: "Home" }]);
        });
    } else {
        // No user ID, maybe show default public menus or nothing
    }

    // Click outside to close menu
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE}/api/auth/logout`, { method: 'POST' });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.clear();
      document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      router.push('/login');
    }
  };

  // 如果是登录页，不显示侧边栏布局
  if (pathname.includes('/login')) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-[#111]">
      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 bg-white dark:bg-[#1a1a1a] border-r border-gray-200 dark:border-gray-800 transition-all duration-300 overflow-hidden ${
          isSidebarOpen ? "w-64" : "w-20"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="h-16 flex items-center justify-center border-b border-gray-200 dark:border-gray-800">
            <span className={`font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent transition-all duration-300 whitespace-nowrap ${
              isSidebarOpen ? "opacity-100" : "opacity-0 w-0 overflow-hidden"
            }`}>
              DeepVeir Admin
            </span>
            {!isSidebarOpen && <span className="font-bold text-blue-600 text-xl">D</span>}
          </div>

          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {menuItems.map((item) => {
              // 简单的激活判断
              const isActive = pathname === item.path || (item.path !== "/" && pathname.startsWith(item.path));
              return (
                <Link
                  key={item.id || item.path} // Use ID if available, fallback to path
                  href={item.path || '#'}
                  className={`flex items-center py-3 rounded-lg transition-colors whitespace-nowrap ${
                    isSidebarOpen ? "px-4" : "justify-center px-0"
                  } ${
                    isActive
                      ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5"
                  }`}
                  title={!isSidebarOpen ? item.name : ""}
                >
                  <DynamicIcon name={item.icon} size={20} className="flex-shrink-0" />
                  <span className={`font-medium transition-all duration-300 overflow-hidden ${
                    isSidebarOpen ? "ml-3 opacity-100 w-auto" : "w-0 opacity-0"
                  }`}>
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-gray-200 dark:border-gray-800">
            <Link 
                href="http://localhost:3000"
                className={`flex items-center py-3 text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 transition-colors whitespace-nowrap ${
                    isSidebarOpen ? "px-4" : "justify-center px-0"
                }`}
                title={!isSidebarOpen ? "返回前台" : ""}
                target="_blank"
            >
                <LogOut size={20} className="rotate-180 flex-shrink-0" />
                <span className={`font-medium transition-all duration-300 overflow-hidden ${
                    isSidebarOpen ? "ml-3 opacity-100 w-auto" : "w-0 opacity-0"
                }`}>
                    返回前台
                </span>
            </Link>
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="w-full mt-2 flex items-center justify-center p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors"
            >
              {isSidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div 
        className={`flex-1 flex flex-col transition-all duration-300 ${
          isSidebarOpen ? "ml-64" : "ml-20"
        }`}
      >
        {/* Top Header */}
        <header className="h-16 bg-white dark:bg-[#1a1a1a] border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-8 sticky top-0 z-40">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
            {menuItems.find(item => pathname === item.path || (item.path !== "/" && pathname.startsWith(item.path)))?.name || "管理后台"}
          </h2>

          <div className="flex items-center space-x-4">
            <button className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-[#1a1a1a]"></span>
            </button>
            
            <div className="h-6 w-[1px] bg-gray-200 dark:bg-gray-700"></div>
            
            <div className="relative" ref={userMenuRef}>
              <button 
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center space-x-3 hover:bg-gray-50 dark:hover:bg-white/5 p-2 rounded-lg transition-colors"
              >
                <div className="text-right hidden md:block">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {userEmail?.split('@')[0] || 'Admin'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    管理员
                  </p>
                </div>
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-blue-500/20">
                  {userEmail ? userEmail[0].toUpperCase() : <User size={14} />}
                </div>
                <ChevronDown size={16} className={`text-gray-400 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#1a1a1a] rounded-xl shadow-xl border border-gray-100 dark:border-gray-800 py-1 animate-in fade-in zoom-in-95 duration-200 z-50">
                  <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-800">
                    <p className="text-xs text-gray-500 truncate">{userEmail}</p>
                  </div>
                  
                  <Link 
                    href="/settings" 
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    <Settings size={16} />
                    <span>个人设置</span>
                  </Link>
                  
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <LogOut size={16} />
                    <span>退出登录</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

