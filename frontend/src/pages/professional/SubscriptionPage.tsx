import React from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { SubscriptionModal } from '../../components/subscription/SubscriptionModal';

export const SubscriptionPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <DashboardLayout title="Subscription & Pro Membership">
      <div className="py-12 text-center text-slate-400 text-xs">
        Opening Pro Partner Membership Modal...
      </div>
      <SubscriptionModal
        isOpen={true}
        onClose={() => navigate('/professional/dashboard')}
      />
    </DashboardLayout>
  );
};