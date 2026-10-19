import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../lib/auth';
import {
  LayoutDashboard,
  FolderPlus,
  Briefcase,
  Users,
  FileText,
  MessageSquare,
  CreditCard,
  Bell,
  Settings,
  ShieldAlert,
  LogOut,
  HardHat,
  Layers,
  CheckCircle2,
  FileSpreadsheet,
  HelpCircle,
  ChevronRight,
} from 'lucide-react';

interface SidebarProps {
  role: 'HOMEOWNER' | 'PROFESSIONAL' | 'ADMIN' | 'FOUNDER';
}

export const Sidebar: React.FC<SidebarProps> = ({ role }) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const homeownerLinks = [
    { label: 'Dashboard', icon: LayoutDashboard, to: '/homeowner/dashboard' },
    { label: 'Create Project', icon: FolderPlus, to: '/homeowner/post-project' },
    { label: 'Find Professionals', icon: Users, to: '/homeowner/find-professionals' },
    { label: 'My Projects', icon: Briefcase, to: '/homeowner/projects' },
    { label: 'Messages', icon: MessageSquare, to: '/homeowner/messages' },
    { label: 'Notifications', icon: Bell, to: '/homeowner/notifications' },
    { label: 'My Profile', icon: Users, to: '/profile' },
    { label: 'Settings', icon: Settings, to: '/homeowner/settings' },
  ];

  const professionalLinks = [
    { label: 'Dashboard', icon: LayoutDashboard, to: '/professional/dashboard' },
    { label: 'Find Projects', icon: Briefcase, to: '/professional/find-projects' },
    { label: 'My Leads', icon: FileSpreadsheet, to: '/professional/leads' },
    { label: 'My Work', icon: Layers, to: '/professional/work' },
    { label: 'Messages', icon: MessageSquare, to: '/professional/messages' },
    { label: 'My Portfolio', icon: Layers, to: '/professional/portfolio' },
    { label: 'My Profile', icon: Users, to: '/profile' },
    { label: 'Subscription', icon: CreditCard, to: '/professional/subscription' },
    { label: 'Notifications', icon: Bell, to: '/professional/notifications' },
    { label: 'Settings', icon: Settings, to: '/professional/settings' },
  ];

  const adminLinks = [
    { label: 'Overview Metrics', icon: LayoutDashboard, to: '/admin/dashboard' },
    { label: 'Users Management', icon: Users, to: '/admin/users' },
    { label: 'Verification Queue', icon: CheckCircle2, to: '/admin/verification-queue' },
    { label: 'Transactions', icon: CreditCard, to: '/admin/transactions' },
    { label: 'Audit Logs', icon: FileText, to: '/admin/audit-logs' },
  ];

  const navItems =
    role === 'HOMEOWNER'
      ? homeownerLinks
      : role === 'PROFESSIONAL'
      ? professionalLinks
      : adminLinks;

  return (
    <aside className="w-64 bg-gradient-to-b from-[#071A3D] to-[#0B2452] dark:from-slate-950 dark:to-slate-900 border-r border-slate-800 text-slate-300 flex flex-col justify-between shrink-0 min-h-screen relative overflow-hidden transition-colors duration-200">
      <div className="z-20 relative">
        {/* Brand Header */}
        <div className="h-16 flex items-center px-6 border-b border-slate-800/80">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 bg-[#126BFF] dark:bg-orange-500 rounded-lg text-white shadow-md shadow-blue-500/30">
              <HardHat className="h-5 w-5" />
            </div>
            <span className="text-lg font-black text-white tracking-tight">
              Stroit<span className="text-[#126BFF] dark:text-orange-500">X</span>
            </span>
          </div>
          <span className="ml-auto text-[10px] font-bold uppercase tracking-wider border border-blue-400/50 dark:border-orange-500 text-blue-300 dark:text-orange-400 bg-transparent px-2.5 py-0.5 rounded-full">
            {role}
          </span>
        </div>

        {/* User Card */}
        <div className="p-3.5 mx-3 my-4 bg-white/5 dark:bg-slate-900/80 border border-white/10 dark:border-slate-800 rounded-xl backdrop-blur-xs">
          <p className="text-[10px] uppercase font-bold text-slate-400">Logged in as</p>
          <p className="text-xs font-semibold text-white truncate">{user?.email}</p>
        </div>

        {/* Navigation List */}
        <nav className="px-3 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-[#126BFF] dark:bg-orange-500 text-white shadow-md shadow-blue-500/25 dark:shadow-orange-500/20 font-bold'
                      : 'hover:bg-white/10 dark:hover:bg-slate-900 text-slate-300 dark:text-slate-400 hover:text-white dark:hover:text-slate-100'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center space-x-3">
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </div>
                    {isActive && <ChevronRight className="h-3.5 w-3.5 text-white ml-auto" />}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer Controls & Promotional Card */}
      <div className="z-20 relative p-3 border-t border-slate-800/80 space-y-3">
        <div className="p-3 bg-white/5 dark:bg-slate-900/60 rounded-xl border border-white/10 dark:border-slate-800 text-center">
          <p className="text-[11px] font-bold text-white">Build Your Dream</p>
          <p className="text-[10px] text-slate-400 mt-0.5">With Confidence & Verified Pros</p>
        </div>

        <button
          onClick={() => {
            logout();
            navigate('/');
          }}
          className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:bg-rose-950/40 hover:text-rose-400 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span>Logout</span>
        </button>
      </div>

      {/* Sidebar Line-Art Crane & City Skyline SVG Graphic */}
      <div className="absolute bottom-0 inset-x-0 pointer-events-none z-10 opacity-30">
        <div className="h-28 bg-gradient-to-t from-[#0B2452] dark:from-slate-950 via-[#0B2452]/80 dark:via-slate-950/80 to-transparent absolute inset-0 z-10" />
        <svg
          className="w-full h-28 stroke-blue-400/40 dark:stroke-orange-500/50 fill-none"
          viewBox="0 0 200 100"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Construction Crane */}
          <path d="M 40 100 L 40 15 L 140 15 M 40 25 L 140 25 M 40 15 L 15 35 M 110 15 L 110 65 L 105 70 H 115 L 110 65" strokeWidth="1.5" />
          <path d="M 40 100 L 55 15 M 40 100 L 25 15" strokeWidth="1" strokeDasharray="2 2" />
          {/* City Skyline */}
          <path d="M 0 100 V 70 H 15 V 100 M 15 100 V 50 H 30 V 100 M 60 100 V 65 H 85 V 100 M 85 100 V 40 H 105 V 100 M 115 100 V 75 H 135 V 100 M 135 100 V 45 H 160 V 100 M 160 100 V 70 H 200 V 100" strokeWidth="1.2" />
        </svg>
      </div>
    </aside>
  );
};
