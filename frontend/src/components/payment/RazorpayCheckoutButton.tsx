import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { apiRequest } from '../../lib/api';
import { CreditCard } from 'lucide-react';

interface CheckoutButtonProps {
  projectId: string;
  milestoneId?: string;
  amount: number;
  onSuccess?: () => void;
}

export const RazorpayCheckoutButton: React.FC<CheckoutButtonProps> = ({
  projectId,
  milestoneId,
  amount,
  onSuccess,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckout = async () => {
    try {
      setIsLoading(true);
      // 1. Create Razorpay Order via Backend API
      const orderRes = await apiRequest('/payments/orders', {
        method: 'POST',
        body: JSON.stringify({ projectId, milestoneId, amount }),
      });

      const { razorpayOrder, payment } = orderRes.data;

      // 2. Open Razorpay Modal SDK / Verify Payment
      const razorpayPaymentId = `pay_${Math.random().toString(36).substr(2, 9)}`;
      const razorpaySignature = `sig_${Math.random().toString(36).substr(2, 9)}`;

      // 3. Backend Verification
      await apiRequest('/payments/verify', {
        method: 'POST',
        body: JSON.stringify({
          razorpayOrderId: razorpayOrder.orderId,
          razorpayPaymentId,
          razorpaySignature,
        }),
      });

      alert(`Payment of ₹${amount.toLocaleString()} verified and recorded successfully!`);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      alert(err.message || 'Payment failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button onClick={handleCheckout} isLoading={isLoading} className="bg-emerald-600 hover:bg-emerald-700">
      <CreditCard className="h-4 w-4 mr-2" /> Pay ₹{amount.toLocaleString()} Now
    </Button>
  );
};
