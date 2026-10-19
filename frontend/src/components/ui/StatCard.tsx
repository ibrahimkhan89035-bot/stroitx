import React from 'react';
import { ArrowRight } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  color?: 'blue' | 'purple' | 'green' | 'orange' | string;
  onViewAll?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, icon, trend, color = 'blue', onViewAll }) => {
  const accentClasses = {
    blue: {
      border: 'border-l-4 border-l-[#126BFF]',
      iconBg: 'bg-blue-50 dark:bg-blue-950/50 text-[#126BFF] dark:text-blue-400 border border-blue-100 dark:border-blue-900/50',
      accentBar: 'bg-[#126BFF]',
    },
    purple: {
      border: 'border-l-4 border-l-purple-600',
      iconBg: 'bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-900/50',
      accentBar: 'bg-purple-600',
    },
    green: {
      border: 'border-l-4 border-l-emerald-500',
      iconBg: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50',
      accentBar: 'bg-emerald-500',
    },
    orange: {
      border: 'border-l-4 border-l-orange-500',
      iconBg: 'bg-orange-50 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400 border border-orange-100 dark:border-orange-900/50',
      accentBar: 'bg-orange-500',
    },
  };

  const selectedAccent = (accentClasses as any)[color] || accentClasses.blue;

  return (
    <div className={`bg-white dark:bg-slate-900 p-5 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg ${selectedAccent.border}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">{title}</p>
          <h3 className="text-3xl font-black text-slate-900 dark:text-slate-100 mt-1 font-mono tracking-tight">{value}</h3>
          {trend && <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-semibold">{trend}</p>}
        </div>
        <div className={`p-3 rounded-2xl ${selectedAccent.iconBg}`}>
          {icon}
        </div>
      </div>

      {onViewAll && (
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
          <button onClick={onViewAll} className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white font-medium flex items-center transition-colors">
            View details <ArrowRight className="h-3 w-3 ml-1" />
          </button>
        </div>
      )}
    </div>
  );
};