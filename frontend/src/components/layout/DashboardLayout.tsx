import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../lib/auth';
import { useTheme } from '../../lib/theme';
import { apiRequest } from '../../lib/api';
import { 
  Building2, LayoutDashboard, Search, Target, Briefcase, MessageSquare, 
  FolderOpen, CreditCard, Bell, Settings, Moon, Sun, LogOut, Menu, X, User,
  FolderKanban, PlusCircle, Users, FileText
} from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, title = 'Dashboard' }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { setTheme, isDark } = useTheme();
  
  const role = user?.role || 'HOMEOWNER';
  const userEmail = user?.email || 'Loading...';

  const toggleThemeMode = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  // Notification polling logic
  useEffect(() => {
    if (!user?.id) return;
    const fetchUnread = async () => {
      try {
        const res = await apiRequest('/notifications');
        const list = Array.isArray(res.data) ? res.data : (res.data?.notifications || []);
        const count = (res as any).unreadCount ?? (res.data as any)?.unreadCount ?? list.filter((n: any) => !n.read && !n.isRead).length;
        setUnreadCount(typeof count === 'number' ? count : 0);
      } catch (err) {
        // quiet error
      }
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 15000);
    return () => clearInterval(interval);
  }, [user?.id]);

  // Define Homeowner Navigation Items (My Projects removed!)
  const homeownerNavItems = [
    { icon: <LayoutDashboard />, label: 'Dashboard', path: '/homeowner/dashboard' },
    { icon: <PlusCircle />, label: 'Post New Project', path: '/homeowner/post-project' },
    { icon: <Users />, label: 'Find Professionals', path: '/homeowner/find-professionals' },
    { icon: <FileText />, label: 'Quotes & Proposals', path: '/homeowner/quotes' },
    { icon: <MessageSquare />, label: 'Messages & Chat', path: '/messages' },
    { icon: <Bell />, label: 'Notifications', path: '/homeowner/notifications' },
    { icon: <Settings />, label: 'Settings', path: '/homeowner/settings' },
  ];

  // Define Professional Navigation Items
  const professionalNavItems = [
    { icon: <LayoutDashboard />, label: 'Dashboard', path: '/professional/dashboard' },
    { icon: <Search />, label: 'Find Projects', path: '/professional/find-projects' },
    { icon: <Target />, label: 'My Leads', path: '/professional/leads' },
    { icon: <Briefcase />, label: 'My Work', path: '/professional/work' },
    { icon: <MessageSquare />, label: 'Messages', path: '/messages' },
    { icon: <FolderOpen />, label: 'My Portfolio', path: '/professional/portfolio' },
    { icon: <CreditCard />, label: 'Subscription', path: '/professional/subscription' },
    { icon: <Bell />, label: 'Notifications', path: '/professional/notifications' },
    { icon: <User />, label: 'My Profile', path: '/professional/profile' },
    { icon: <Settings />, label: 'Settings', path: '/professional/settings' },
  ];

  // Select nav items based on user role
  const navItems = role === 'HOMEOWNER' ? homeownerNavItems : professionalNavItems;
  const dashboardPath = role === 'HOMEOWNER' ? '/homeowner/dashboard' : '/professional/dashboard';

  return (
    <div className="flex h-screen bg-[#F4F7FE] dark:bg-slate-950 font-sans overflow-hidden text-slate-800 dark:text-slate-100 transition-colors duration-200">
      
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Custom Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-[#0A132B] text-white flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 border-r border-slate-800/50 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-7 cursor-pointer" onClick={() => navigate(dashboardPath)}>
          <div className="bg-blue-600 p-2 rounded-xl bg-gradient-to-br from-blue-400 to-blue-700 shadow-lg shadow-blue-500/20">
            <Building2 className="w-6 h-6 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-2xl font-bold tracking-wide">StroitX</span>
          <span className="text-[9px] font-bold bg-[#1E293B] text-blue-400 px-2 py-1 rounded-md ml-1 border border-blue-900/50 tracking-wider">
            {role === 'HOMEOWNER' ? 'HOMEOWNER' : 'PRO'}
          </span>
          <button className="lg:hidden ml-auto p-1 hover:bg-white/10 rounded-lg" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* User Info */}
        <div className="px-6 mb-4">
          <div className="bg-[#112240] border border-slate-700/50 rounded-xl p-3 flex flex-col">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Logged in as</span>
            <span className="text-sm font-medium text-slate-200 truncate" title={userEmail}>{userEmail}</span>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto pb-4 custom-scrollbar relative z-10">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== dashboardPath && location.pathname.startsWith(item.path));
            return (
              <button 
                key={item.path} 
                onClick={() => { navigate(item.path); setSidebarOpen(false); }} 
                className={`w-full flex items-center px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                }`}
              >
                <div className={`mr-3 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'} transition-colors`}>
                  {React.cloneElement(item.icon as React.ReactElement, { size: 18 })}
                </div>
                <span className={`text-sm font-medium ${isActive ? 'font-semibold' : ''}`}>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Bottom Section with Logout and City Graphic */}
        <div className="relative mt-auto border-t border-slate-800/50 pt-2">
          <div className="px-4 pb-2 relative z-10">
            <button onClick={() => { logout(); navigate('/login'); }} className="flex items-center gap-3 text-slate-400 hover:text-white px-4 py-3 w-full transition-colors rounded-xl hover:bg-white/5">
              <LogOut size={18} />
              <span className="font-medium text-sm">Logout</span>
            </button>
          </div>

          {/* Construction Skyline Graphic */}
          <div className="px-4 pb-4 opacity-40 pointer-events-none mt-2">
            <svg viewBox="0 0 240 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full text-blue-500">
              <path d="M0 95 H240" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M40 95 V20 M40 20 L110 20 M40 20 L20 20 M40 35 L20 20 M40 20 L60 35 M60 35 H40 M100 20 V80" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M50 95 V50 H75 V95 M60 50 V40 H75 V50 M85 95 V60 H105 V95 M115 95 V30 H140 V95 M125 30 V20 H135 V30 M150 95 V55 H175 V95 M185 95 V70 H210 V95" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M55 60 H70 M55 70 H70 M55 80 H70 M55 90 H70" stroke="currentColor" strokeWidth="1"/>
              <path d="M120 40 H135 M120 50 H135 M120 60 H135 M120 70 H135 M120 80 H135 M120 90 H135" stroke="currentColor" strokeWidth="1"/>
              <path d="M155 65 H170 M155 75 H170 M155 85 H170" stroke="currentColor" strokeWidth="1"/>
              <path d="M90 70 H100 M90 80 H100 M90 90 H100" stroke="currentColor" strokeWidth="1"/>
              <path d="M190 80 H205 M190 90 H205" stroke="currentColor" strokeWidth="1"/>
              <path d="M150 55 Q 162.5 40 175 55" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Top Header */}
        <header className="h-16 lg:h-20 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-6 flex items-center justify-between shrink-0 transition-colors duration-200 z-30">
          <div className="flex items-center gap-4">
            <button className="lg:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors" onClick={() => setSidebarOpen(true)}>
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white tracking-tight">{title}</h1>
          </div>

          <div className="flex items-center space-x-3 md:space-x-4">
            <button
              onClick={toggleThemeMode}
              className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDark ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5" />}
            </button>

            <button
              onClick={() => {
                if (role === 'PROFESSIONAL') navigate('/professional/notifications');
                else if (role === 'HOMEOWNER') navigate('/homeowner/notifications');
                else navigate('/notifications');
              }}
              className="relative p-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
              title={`${unreadCount} Unread Notifications`}
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-slate-950 shadow-sm animate-pulse">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>

            <div className="hidden md:block h-6 w-px bg-slate-200 dark:bg-slate-800"></div>

            {/* User Profile Chip */}
            <div
              className="flex items-center gap-3 cursor-pointer bg-white dark:bg-slate-900 py-1.5 px-2 md:pr-4 rounded-full shadow-sm border border-slate-200 dark:border-slate-700 transition-all hover:shadow-md"
              onClick={() => navigate(role === 'HOMEOWNER' ? '/homeowner/settings' : '/profile')}
            >
              <div className="w-8 h-8 rounded-full bg-blue-600 dark:bg-orange-500 text-white flex items-center justify-center font-bold text-xs uppercase shadow-inner">
                {userEmail !== 'Loading...' ? userEmail.charAt(0) : 'U'}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-tight w-24 truncate">{userEmail}</p>
                <p className="text-[9px] font-bold text-blue-600 dark:text-orange-400 uppercase tracking-wider">{role}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-transparent">
          <div className="max-w-[1400px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};