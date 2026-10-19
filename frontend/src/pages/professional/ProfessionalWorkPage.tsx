import React from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Layers, Clock, CheckCircle2 } from 'lucide-react';

export const ProfessionalWorkPage: React.FC = () => {
  return (
    <DashboardLayout title="My Active Work & Execution">
      <div className="space-y-6">
        <div className="flex justify-between items-center bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-md">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-orange-600 rounded-xl text-white">
              <Layers className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Active Construction Contracts</h2>
              <p className="text-xs text-slate-400 mt-0.5">Manage active work execution, milestone tasks & site updates</p>
            </div>
          </div>
          <Badge variant="success">1 Active Contract</Badge>
        </div>

        <Card className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <Badge variant="success">IN_PROGRESS</Badge>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1">Full Interior & Structural Remodel</h3>
              <p className="text-xs text-slate-500">Location: Indiranagar, Bengaluru • Client: Priya Sharma</p>
            </div>
            <span className="font-mono font-bold text-orange-600 text-sm">₹15,00,000 Contract</span>
          </div>
          <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-xl text-xs space-y-2">
            <div className="flex justify-between font-bold">
              <span>Execution Progress</span>
              <span className="text-emerald-600 dark:text-emerald-400">65% Completed</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full w-[65%]"></div>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};
