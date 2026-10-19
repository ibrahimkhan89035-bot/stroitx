import React from 'react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { Card } from '../../components/ui/Card';
import { Settings, Shield } from 'lucide-react';

export const AdminSettingsPage: React.FC = () => {
  return (
    <AdminLayout title="Admin System Configuration">
      <div className="space-y-6">
        <div className="flex justify-between items-center bg-slate-900 text-white p-6 rounded-2xl border border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-orange-600 rounded-xl text-white">
              <Settings className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Admin Platform Configuration</h2>
              <p className="text-xs text-slate-400 mt-0.5">Manage system environment variables, secrets, and API keys</p>
            </div>
          </div>
        </div>

        <Card className="p-6 bg-slate-900 border-slate-800 text-slate-300 text-xs space-y-3">
          <div className="flex justify-between py-2 border-b border-slate-800">
            <span className="text-slate-400">Admin Contact Mobile</span>
            <span className="font-mono text-orange-400 font-bold">8767962622</span>
          </div>
          <div className="flex justify-between py-2 border-b border-slate-800">
            <span className="text-slate-400">Founder Account</span>
            <span className="font-mono text-white font-bold">admin@stroitx.com</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-slate-400">Database Connection</span>
            <span className="font-mono text-emerald-400 font-bold">PostgreSQL via Prisma ORM</span>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
};
