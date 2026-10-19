import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { apiRequest } from '../../lib/api';
import { Users, ShieldCheck, UserCheck, Calendar } from 'lucide-react';

export const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setIsLoading(true);
        const res = await apiRequest('/admin/users');
        if (res.data) setUsers(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    loadUsers();
  }, []);

  return (
    <AdminLayout title="Registered Platform Users Management">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-md">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-orange-600 rounded-xl text-white">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Platform User Directory</h2>
              <p className="text-xs text-slate-400 mt-0.5">Comprehensive view of all registered Homeowners, Professionals & Admins</p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold bg-slate-800 text-orange-400 px-3 py-1.5 rounded-lg border border-slate-700">
            {users?.length || 0} Total Registered Accounts
          </span>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-slate-400">Loading platform user registry...</div>
        ) : (
          <Card className="p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-300 uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-3.5">Name / Company</th>
                    <th className="p-3.5">Email</th>
                    <th className="p-3.5">Phone</th>
                    <th className="p-3.5">Role</th>
                    <th className="p-3.5">Location</th>
                    <th className="p-3.5">Account Status</th>
                    <th className="p-3.5">Date Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {users?.map((u) => {
                    const name =
                      u.professional?.businessName ||
                      u.name ||
                      u.email?.split('@')[0];
                    const location = u.professional?.location || u.homeowner?.location || 'N/A';
                    return (
                      <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
                        <td className="p-3.5 font-bold text-slate-900 dark:text-white">{name}</td>
                        <td className="p-3.5 text-slate-600 dark:text-slate-400 font-mono">{u.email}</td>
                        <td className="p-3.5 text-slate-600 dark:text-slate-300">{u.phone || 'N/A'}</td>
                        <td className="p-3.5">
                          <Badge variant={u.role === 'HOMEOWNER' ? 'info' : u.role === 'PROFESSIONAL' ? 'orange' : 'neutral'}>
                            {u.role}
                          </Badge>
                        </td>
                        <td className="p-3.5 text-slate-600 dark:text-slate-300">{location}</td>
                        <td className="p-3.5">
                          <Badge variant={u.isActive ? 'success' : 'warning'}>
                            {u.isActive ? 'ACTIVE' : 'INACTIVE'}
                          </Badge>
                        </td>
                        <td className="p-3.5 text-slate-400 font-mono">{new Date(u.createdAt).toLocaleDateString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
};
