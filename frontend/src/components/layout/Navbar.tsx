import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../lib/auth';
import { HardHat, User, LogOut, LayoutDashboard } from 'lucide-react';
import { Button } from '../ui/Button';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const getDashboardPath = () => {
    if (!user) return '/gateway';
    if (user.role === 'HOMEOWNER') return '/homeowner/dashboard';
    if (user.role === 'PROFESSIONAL') return '/professional/dashboard';
    if (user.role === 'ADMIN' || user.role === 'FOUNDER') return '/admin/dashboard';
    return '/gateway';
  };

  return (
    <nav className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center space-x-2.5">
          <div className="p-2 bg-orange-600 rounded-lg text-white font-bold">
            <HardHat className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xl font-extrabold tracking-tight text-white">Stroit<span className="text-orange-500">X</span></span>
            <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-widest text-slate-400 ml-2 border-l border-slate-700 pl-2">Construction Marketplace</span>
          </div>
        </Link>

        {/* Public Nav Items */}
        <div className="hidden md:flex items-center space-x-6 text-sm font-medium text-slate-300">
          <Link to="/how-it-works" className="hover:text-orange-400 transition-colors">How It Works</Link>
          <Link to="/construction-cost-guide" className="hover:text-orange-400 transition-colors">Cost Guide</Link>
          <Link to="/contractor-vs-architect" className="hover:text-orange-400 transition-colors">Compare Roles</Link>
          <Link to="/verified-professionals" className="hover:text-orange-400 transition-colors">Directory</Link>
          <Link to="/#trust" className="hover:text-orange-400 transition-colors">Trust & Safety</Link>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3">
          {user ? (
            <div className="flex items-center space-x-3">
              <Button variant="primary" size="sm" onClick={() => navigate(getDashboardPath())}>
                <LayoutDashboard className="h-4 w-4 mr-1.5" />
                <span>Dashboard</span>
              </Button>
              <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white" onClick={logout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <>
              <Link to="/gateway" className="text-sm font-medium text-slate-300 hover:text-white px-3 py-2">
                Log In
              </Link>
              <Button variant="primary" size="sm" onClick={() => navigate('/gateway')}>
                Get Started
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};
