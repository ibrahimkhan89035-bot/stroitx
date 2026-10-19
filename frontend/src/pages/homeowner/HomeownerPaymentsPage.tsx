import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { apiRequest } from '../../lib/api';
import { CreditCard, ShieldCheck, Lock, CheckCircle2 } from 'lucide-react';

export const HomeownerPaymentsPage: React.FC = () => {
  const [payments, setPayments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const res = await apiRequest('/payments/history');
        if (res.data) setPayments(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    loadHistory();
  }, []);

  return (
    <DashboardLayout title="Payments & Payment Protection">
      {/* Escrow Banner */}
      <Card className="mb-8 p-6 bg-slate-900 text-white">
        <div className="flex items-start space-x-4">
          <div className="p-3 bg-orange-600 rounded-xl">
            <Lock className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-base text-white">Payment Protection Architecture</h3>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Payment Protection workflow will be available once the supported payment/escrow provider is configured. All milestone releases are verified on-chain and in PostgreSQL ledger.
            </p>
          </div>
        </div>
      </Card>

      <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">Transaction History</h3>

      {isLoading ? (
        <div className="text-center py-12 text-slate-400">Loading payment ledger...</div>
      ) : payments.length === 0 ? (
        <p className="text-center py-12 text-slate-500 dark:text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
          No payment transactions executed yet.
        </p>
      ) : (
        <Card className="p-0 overflow-hidden">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-900 text-white uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-3.5">Order ID</th>
                <th className="p-3.5">Project / Purpose</th>
                <th className="p-3.5">Amount</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {payments.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/60 font-mono transition-colors">
                  <td className="p-3.5 font-bold text-slate-900 dark:text-white">{p.razorpayOrderId || p.id}</td>
                  <td className="p-3.5 text-slate-700 dark:text-slate-300">{p.project?.name || p.project?.title || p.purpose || 'Milestone Payment'}</td>
                  <td className="p-3.5 font-bold text-orange-600 dark:text-orange-400">₹{Number(p.amount || 0).toLocaleString()}</td>
                  <td className="p-3.5">
                    <Badge variant={p.status === 'SUCCESS' || p.status === 'SUCCESSFUL' ? 'success' : 'danger'}>{p.status}</Badge>
                  </td>
                  <td className="p-3.5 text-slate-400 dark:text-slate-500">{new Date(p.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </DashboardLayout>
  );
};
