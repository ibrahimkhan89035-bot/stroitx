import React from 'react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { CreditCard, Sparkles } from 'lucide-react';

export const AdminSubscriptionsPage: React.FC = () => {
  return (
    <AdminLayout title="Subscriptions & Partner Memberships">
      <div className="space-y-6">
        <div className="flex justify-between items-center bg-slate-900 text-white p-6 rounded-2xl border border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-orange-600 rounded-xl text-white">
              <CreditCard className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Partner Memberships & Free Trial Ledger</h2>
              <p className="text-xs text-slate-400 mt-0.5">Track contractor yearly subscriptions and 45-day trial conversions</p>
            </div>
          </div>
          <Badge variant="success">Rs 1,299 / Year Plan Active</Badge>
        </div>

        <Card className="p-6 bg-slate-900 border-slate-800 text-slate-300">
          <div className="flex items-center space-x-3 mb-4">
            <Sparkles className="h-5 w-5 text-orange-400" />
            <h3 className="text-sm font-bold text-white">Active Subscription Trials Summary</h3>
          </div>
          <p className="text-xs leading-relaxed text-slate-400">
            All registered contractors are automatically enrolled into the 45-day free trial (Rs 1,299/year billing). Automated webhooks verify status via Razorpay Billing API.
          </p>
        </Card>
      </div>
    </AdminLayout>
  );
};
