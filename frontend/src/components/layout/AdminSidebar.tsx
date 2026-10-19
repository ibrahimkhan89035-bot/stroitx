import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../lib/auth';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  ShieldCheck,
  CreditCard,
  FileSpreadsheet,
  AlertTriangle,
  Bell,
  CheckSquare,
  UserCheck,
  FileText,
  Settings,
  LogOut,
  HardHat,
  ChevronDown,
  ChevronRight,
  Shield,
} from 'lucide-react';

export const AdminSidebar: React.FC = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isProfSubOpen, setIsProfSubOpen] = useState(
    location.pathname.startsWith('/admin/professionals') || location.pathname.startsWith('/admin/verification')
  );

  return (
    <aside className="w-64 bg-slate-950 dark:bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col justify-between shrink-0 min-h-screen transition-colors duration-200">
      <div>
        {/* Brand Header */}
        <div className="h-16 flex items-center px-6 border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 bg-orange-600 rounded-lg text-white shadow-md">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <span className="text-base font-black text-white tracking-tight">Stroit<span className="text-orange-500">X</span></span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block -mt-1">ADMIN CONSOLE</span>
            </div>
          </div>
          <span className="ml-auto text-[9px] font-bold uppercase tracking-wider bg-orange-600/20 text-orange-400 px-2 py-0.5 rounded border border-orange-500/30">
            {user?.role || 'ADMIN'}
          </span>
        </div>

        {/* Admin User Profile Info */}
        <div className="p-3.5 mx-3 my-4 bg-slate-900/90 dark:bg-slate-800/80 border border-slate-800 dark:border-slate-700/60 rounded-xl">
          <p className="text-[10px] uppercase text-slate-400 font-bold">Admin Mobile & Email</p>
          <p className="text-xs font-bold text-white truncate">{user?.email || 'admin@stroitx.com'}</p>
          <p className="text-[11px] font-mono text-orange-400 font-medium">📱 8767962622</p>
        </div>

        {/* Navigation List */}
        <nav className="px-3 space-y-1 text-xs font-medium">
          {/* Dashboard */}
          <NavLink
            to="/admin/dashboard"
            className={({ isActive }) =>
              `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl transition-all ${
                isActive ? 'bg-orange-600 text-white font-bold shadow-md shadow-orange-600/20' : 'hover:bg-slate-900 hover:text-white text-slate-300'
              }`
            }
          >
            <LayoutDashboard className="h-4 w-4" />
            <span>Dashboard</span>
          </NavLink>

          {/* Homeowners */}
          <NavLink
            to="/admin/homeowners"
            className={({ isActive }) =>
              `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl transition-all ${
                isActive ? 'bg-orange-600 text-white font-bold shadow-md shadow-orange-600/20' : 'hover:bg-slate-900 hover:text-white text-slate-300'
              }`
            }
          >
            <Users className="h-4 w-4" />
            <span>Homeowners</span>
          </NavLink>

          {/* Professionals (Tree Dropdown with Verification Sub-item) */}
          <div>
            <div
              onClick={() => setIsProfSubOpen(!isProfSubOpen)}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl cursor-pointer transition-all ${
                location.pathname.startsWith('/admin/professionals') || location.pathname.startsWith('/admin/verification')
                  ? 'bg-slate-900 text-white font-bold border-l-2 border-orange-500'
                  : 'hover:bg-slate-900 hover:text-white text-slate-300'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Briefcase className="h-4 w-4" />
                <span>Professionals</span>
              </div>
              {isProfSubOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
            </div>

            {isProfSubOpen && (
              <div className="ml-7 mt-1 pl-3 border-l border-slate-800 space-y-1">
                <NavLink
                  to="/admin/professionals"
                  className={({ isActive }) =>
                    `block py-1.5 px-3 rounded-lg text-[11px] ${
                      isActive ? 'text-orange-400 font-bold bg-slate-900' : 'text-slate-400 hover:text-white'
                    }`
                  }
                >
                  All Professionals
                </NavLink>
                <NavLink
                  to="/admin/verification-queue"
                  className={({ isActive }) =>
                    `flex items-center space-x-2 py-1.5 px-3 rounded-lg text-[11px] ${
                      isActive ? 'text-orange-400 font-bold bg-slate-900' : 'text-slate-400 hover:text-white'
                    }`
                  }
                >
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                  <span>└── Verification Queue</span>
                </NavLink>
              </div>
            )}
          </div>

          {/* Projects */}
          <NavLink
            to="/admin/projects"
            className={({ isActive }) =>
              `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl transition-all ${
                isActive ? 'bg-orange-600 text-white font-bold shadow-md shadow-orange-600/20' : 'hover:bg-slate-900 hover:text-white text-slate-300'
              }`
            }
          >
            <Briefcase className="h-4 w-4" />
            <span>Projects</span>
          </NavLink>

          {/* Subscriptions */}
          <NavLink
            to="/admin/subscriptions"
            className={({ isActive }) =>
              `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl transition-all ${
                isActive ? 'bg-orange-600 text-white font-bold shadow-md shadow-orange-600/20' : 'hover:bg-slate-900 hover:text-white text-slate-300'
              }`
            }
          >
            <CreditCard className="h-4 w-4" />
            <span>Subscriptions</span>
          </NavLink>

          {/* Payments */}
          <NavLink
            to="/admin/payments"
            className={({ isActive }) =>
              `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl transition-all ${
                isActive ? 'bg-orange-600 text-white font-bold shadow-md shadow-orange-600/20' : 'hover:bg-slate-900 hover:text-white text-slate-300'
              }`
            }
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span>Payments</span>
          </NavLink>

          {/* Reports & Complaints */}
          <NavLink
            to="/admin/reports"
            className={({ isActive }) =>
              `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl transition-all ${
                isActive ? 'bg-orange-600 text-white font-bold shadow-md shadow-orange-600/20' : 'hover:bg-slate-900 hover:text-white text-slate-300'
              }`
            }
          >
            <AlertTriangle className="h-4 w-4 text-amber-400" />
            <span>Reports & Complaints</span>
          </NavLink>

          {/* Notifications */}
          <NavLink
            to="/admin/notifications"
            className={({ isActive }) =>
              `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl transition-all ${
                isActive ? 'bg-orange-600 text-white font-bold shadow-md shadow-orange-600/20' : 'hover:bg-slate-900 hover:text-white text-slate-300'
              }`
            }
          >
            <Bell className="h-4 w-4" />
            <span>Notifications</span>
          </NavLink>

          {/* Content Moderation */}
          <NavLink
            to="/admin/moderation"
            className={({ isActive }) =>
              `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl transition-all ${
                isActive ? 'bg-orange-600 text-white font-bold shadow-md shadow-orange-600/20' : 'hover:bg-slate-900 hover:text-white text-slate-300'
              }`
            }
          >
            <CheckSquare className="h-4 w-4" />
            <span>Content Moderation</span>
          </NavLink>

          {/* Admin Users & Roles */}
          <NavLink
            to="/admin/users"
            className={({ isActive }) =>
              `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl transition-all ${
                isActive ? 'bg-orange-600 text-white font-bold shadow-md shadow-orange-600/20' : 'hover:bg-slate-900 hover:text-white text-slate-300'
              }`
            }
          >
            <UserCheck className="h-4 w-4" />
            <span>Admin Users & Roles</span>
          </NavLink>

          {/* Activity Logs */}
          <NavLink
            to="/admin/audit-logs"
            className={({ isActive }) =>
              `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl transition-all ${
                isActive ? 'bg-orange-600 text-white font-bold shadow-md shadow-orange-600/20' : 'hover:bg-slate-900 hover:text-white text-slate-300'
              }`
            }
          >
            <FileText className="h-4 w-4" />
            <span>Activity Logs</span>
          </NavLink>

          {/* Settings */}
          <NavLink
            to="/admin/settings"
            className={({ isActive }) =>
              `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl transition-all ${
                isActive ? 'bg-orange-600 text-white font-bold shadow-md shadow-orange-600/20' : 'hover:bg-slate-900 hover:text-white text-slate-300'
              }`
            }
          >
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </NavLink>
        </nav>
      </div>

      {/* Logout */}
      <div className="p-3 border-t border-slate-800">
        <button
          onClick={() => {
            logout();
            navigate('/admin/login');
          }}
          className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};
