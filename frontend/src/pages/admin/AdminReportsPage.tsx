import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { apiRequest } from '../../lib/api';
import { AlertTriangle, CheckCircle2, XCircle, Loader2 } from 'lucide-react';

export const AdminReportsPage: React.FC = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadReports = async () => {
    try {
      setIsLoading(true);
      const res = await apiRequest('/admin/reports');
      if (res.data) setReports(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  return (
    <AdminLayout title="Reports & Dispute Resolution">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-md">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-amber-600 rounded-xl text-white">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Disputes & Complaints Center</h2>
              <p className="text-xs text-slate-400 mt-0.5">Manage homeowner and contractor support tickets & dispute reports</p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold bg-slate-800 text-amber-400 px-3 py-1.5 rounded-lg border border-slate-700">
            {reports?.length || 0} Tickets Logged
          </span>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-slate-400 text-xs font-semibold flex items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin mr-2 text-orange-500" /> Loading support tickets & reports...
          </div>
        ) : (
          <Card className="p-0 overflow-hidden">
            {(!reports || reports.length === 0) ? (
              <p className="p-12 text-center text-xs text-slate-400">No support tickets or complaints filed at this moment.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-300 uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="p-3.5">Subject</th>
                      <th className="p-3.5">Reporter User</th>
                      <th className="p-3.5">Type / Category</th>
                      <th className="p-3.5">Details</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5">Date Logged</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {reports?.map((r) => {
                      const reporterName = r?.reporter?.name || r?.reporter?.email?.split('@')[0] || 'Registered User';
                      const reporterEmail = r?.reporter?.email || 'N/A';
                      const reporterPhone = r?.reporter?.phone || '';

                      return (
                        <tr key={r?.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
                          <td className="p-3.5 font-bold text-slate-900 dark:text-white">{r?.subject || 'Support Ticket'}</td>
                          <td className="p-3.5 text-slate-600 dark:text-slate-400 font-mono">
                            <span className="font-semibold text-slate-900 dark:text-white block">{reporterName}</span>
                            <span className="text-[10px] text-slate-500 block">{reporterEmail} {reporterPhone ? `• 📱 ${reporterPhone}` : ''}</span>
                          </td>
                          <td className="p-3.5 font-semibold text-orange-600 dark:text-orange-400">{r?.category || 'SUPPORT'}</td>
                          <td className="p-3.5 text-slate-600 dark:text-slate-300 max-w-sm leading-relaxed">{r?.reason}</td>
                          <td className="p-3.5">
                            <Badge variant={r?.status === 'RESOLVED' ? 'success' : 'warning'}>{r?.status || 'PENDING'}</Badge>
                          </td>
                          <td className="p-3.5 text-slate-400 font-mono">{r?.createdAt ? new Date(r.createdAt).toLocaleDateString() : 'N/A'}</td>
                        </tr>
                      );
                    })}
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
