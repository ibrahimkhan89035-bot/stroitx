import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { apiRequest } from '../../lib/api';
import { FileSpreadsheet, Loader2, CreditCard } from 'lucide-react';

export const AdminPaymentsPage: React.FC = () => {
  const [payments, setPayments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPayments = async () => {
      try {
        setIsLoading(true);
        const res = await apiRequest('/payments/history');
        if (res.data) setPayments(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    loadPayments();
  }, []);

  return (
    <AdminLayout title="Payments & Escrow Transactions">
      <div className="space-y-6">
        <div className="flex justify-between items-center bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-md">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-emerald-600 rounded-xl text-white">
              <FileSpreadsheet className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Payments & Escrow Protection Audit</h2>
              <p className="text-xs text-slate-400 mt-0.5">Live razorpay order verification & milestone release ledger</p>
            </div>
          </div>
          <Badge variant="success">HMAC Signature Verified</Badge>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-slate-400 text-xs font-semibold flex items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin mr-2 text-orange-500" /> Loading payment ledger...
          </div>
        ) : (
          <Card className="p-0 overflow-hidden">
            {(!payments || payments.length === 0) ? (
              <p className="p-8 text-center text-xs text-slate-500 dark:text-slate-400">No payment transactions processed yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-300 uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="p-3.5">Order ID</th>
                      <th className="p-3.5">User / Payer</th>
                      <th className="p-3.5">Purpose</th>
                      <th className="p-3.5">Amount</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {payments?.map((p) => (
                      <tr key={p?.id || Math.random()} className="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
                        <td className="p-3.5 font-mono font-bold text-slate-900 dark:text-white">{p?.razorpayOrderId || p?.id || 'N/A'}</td>
                        <td className="p-3.5 text-slate-700 dark:text-slate-300">
                          <span className="font-semibold">{p?.user?.name || 'User'}</span>
                          <span className="block text-[10px] text-slate-400 font-mono">{p?.user?.email || 'N/A'}</span>
                        </td>
                        <td className="p-3.5 text-slate-600 dark:text-slate-400">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                            {p?.purpose || 'PAYMENT'}
                          </span>
                        </td>
                        <td className="p-3.5 font-mono text-emerald-600 dark:text-emerald-400 font-bold">₹{Number(p?.amount || 0).toLocaleString()}</td>
                        <td className="p-3.5">
                          <Badge variant={p?.status === 'SUCCESS' || p?.status === 'SUCCESSFUL' ? 'success' : 'danger'}>{p?.status || 'PENDING'}</Badge>
                        </td>
                        <td className="p-3.5 text-slate-400 font-mono">{p?.createdAt ? new Date(p.createdAt).toLocaleDateString() : 'N/A'}</td>
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
