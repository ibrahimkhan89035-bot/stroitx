import React from 'react';
import { AdminSidebar } from './AdminSidebar';
import { useAuth } from '../../lib/auth';
import { useTheme } from '../../lib/theme';
import { useNavigate } from 'react-router-dom';
import { Bell, Sun, Moon, Shield } from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children, title }) => {
  const { user } = useAuth();
  const { isDark, setTheme } = useTheme();
  const navigate = useNavigate();

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden transition-colors duration-200">
      {/* Admin Dedicated Sidebar */}
      <AdminSidebar />

      {/* Main Admin Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar */}
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 flex items-center justify-between shrink-0 transition-colors duration-200">
          <div className="flex items-center space-x-3">
            <h1 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">{title || 'Admin Console'}</h1>
            <span className="text-[10px] bg-orange-600/10 dark:bg-orange-600/20 text-orange-600 dark:text-orange-400 border border-orange-500/30 px-2.5 py-0.5 rounded-full font-mono font-semibold">
              Live Production Database
            </span>
          </div>

          <div className="flex items-center space-x-4">
            {/* Quick Theme Toggle */}
            <button
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              className="p-2 text-slate-400 hover:text-amber-500 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              title="Toggle Light/Dark Theme"
            >
              {isDark ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5 text-slate-600" />}
            </button>

            {/* Notifications */}
            <button
              onClick={() => navigate('/admin/notifications')}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors relative"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-500 rounded-full"></span>
            </button>

            <div className="h-6 w-px bg-slate-200 dark:bg-slate-800"></div>

            {/* Admin Info */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-orange-600 text-white font-black flex items-center justify-center text-xs shadow-md">
                A
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-slate-900 dark:text-white">{user?.email || 'admin@stroitx.com'}</p>
                <p className="text-[10px] text-orange-600 dark:text-orange-400 font-mono font-semibold">Mobile: 8767962622</p>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Admin Page Content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
};
