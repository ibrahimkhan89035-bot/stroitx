import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { apiRequest } from '../../lib/api';
import { Home, Loader2 } from 'lucide-react';

export const AdminHomeownersPage: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setIsLoading(true);
        const res = await apiRequest('/admin/homeowners');
        if (res.data) {
          setUsers(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    loadUsers();
  }, []);

  return (
    <AdminLayout title="Homeowners Management">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-md">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-blue-600 rounded-xl text-white">
              <Home className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Registered Homeowners Directory</h2>
              <p className="text-xs text-slate-400 mt-0.5">Manage homeowner accounts, posted projects, and relational usage data</p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold bg-slate-800 text-blue-400 px-3 py-1.5 rounded-lg border border-slate-700">
            {users?.length || 0} Homeowners
          </span>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-slate-400 text-xs font-semibold flex items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin mr-2 text-orange-500" /> Loading homeowners list...
          </div>
        ) : (
          <Card className="p-0 overflow-hidden">
            {(!users || users.length === 0) ? (
              <p className="p-8 text-center text-xs text-slate-400">No homeowners registered yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-300 uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="p-3.5">Name</th>
                      <th className="p-3.5">Email</th>
                      <th className="p-3.5">Phone</th>
                      <th className="p-3.5">Location</th>
                      <th className="p-3.5">Posted Projects</th>
                      <th className="p-3.5">Account Status</th>
                      <th className="p-3.5">Date Joined</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {users?.map((u) => (
                      <tr key={u?.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
                        <td className="p-3.5 font-bold text-slate-900 dark:text-white">{u?.name || u?.email?.split('@')[0]}</td>
                        <td className="p-3.5 text-slate-600 dark:text-slate-400 font-mono">{u?.email}</td>
                        <td className="p-3.5 text-slate-600 dark:text-slate-300">{u?.phone || 'N/A'}</td>
                        <td className="p-3.5 text-slate-600 dark:text-slate-300">{u?.homeowner?.location || 'N/A'}</td>
                        <td className="p-3.5 font-bold text-orange-600 dark:text-orange-400">
                          {u?.projects?.length || 0} Projects Posted
                        </td>
                        <td className="p-3.5">
                          <Badge variant={u?.isActive ? 'success' : 'warning'}>{u?.isActive ? 'ACTIVE' : 'INACTIVE'}</Badge>
                        </td>
                        <td className="p-3.5 text-slate-400 font-mono">{u?.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        )}
      </div>
    </AdminLayout>
  );
};
