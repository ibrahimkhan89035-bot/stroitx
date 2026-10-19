import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { apiRequest } from '../../lib/api';
import { FileText, Shield, Loader2 } from 'lucide-react';

export const AdminAuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadLogs = async () => {
      try {
        setIsLoading(true);
        const res = await apiRequest('/admin/audit-logs');
        if (res.data) setLogs(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    loadLogs();
  }, []);

  return (
    <AdminLayout title="System Activity & Audit Logs">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 text-white p-6 rounded-2xl border border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-orange-600 rounded-xl text-white">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Immutable System Audit Trail</h2>
              <p className="text-xs text-slate-400 mt-0.5">Real-time audit log tracking user authentication, approvals, and state changes</p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold bg-slate-800 text-orange-400 px-3 py-1.5 rounded-lg border border-slate-700">
            {logs?.length || 0} Audit Records Logged
          </span>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-slate-400 text-xs font-semibold flex items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin mr-2 text-orange-500" /> Loading system audit trail...
          </div>
        ) : (
          <Card className="p-0 overflow-hidden bg-slate-900 border-slate-800">
            {(!logs || logs.length === 0) ? (
              <p className="p-8 text-center text-xs text-slate-400">No activity logs recorded yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left font-mono">
                  <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="p-3.5">Timestamp</th>
                      <th className="p-3.5">Action</th>
                      <th className="p-3.5">Entity</th>
                      <th className="p-3.5">User</th>
                      <th className="p-3.5">IP Address</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    {logs?.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-950">
                        <td className="p-3.5 text-slate-400">{new Date(log.createdAt).toLocaleString()}</td>
                        <td className="p-3.5 font-bold text-orange-400">{log.action}</td>
                        <td className="p-3.5 text-slate-300">{log.entity}</td>
                        <td className="p-3.5 text-slate-300">{log.user?.email || 'System / Anonymous'}</td>
                        <td className="p-3.5 text-slate-400">{log.ipAddress || '127.0.0.1'}</td>
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
