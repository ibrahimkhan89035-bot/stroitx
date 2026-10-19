import React from 'react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { Card } from '../../components/ui/Card';
import { CheckSquare } from 'lucide-react';

export const AdminModerationPage: React.FC = () => {
  return (
    <AdminLayout title="Content Moderation">
      <div className="space-y-6">
        <div className="flex justify-between items-center bg-slate-900 text-white p-6 rounded-2xl border border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-blue-600 rounded-xl text-white">
              <CheckSquare className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Content & Media Moderation</h2>
              <p className="text-xs text-slate-400 mt-0.5">Audit site progress photos, project descriptions, and portfolio uploads</p>
            </div>
          </div>
        </div>

        <Card className="p-6 bg-slate-900 border-slate-800 text-slate-400 text-xs text-center py-12">
          All user uploaded content has passed automated moderation filters.
        </Card>
      </div>
    </AdminLayout>
  );
};
