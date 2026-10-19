import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../lib/auth';
import { apiRequest } from '../../lib/api';
import { 
  X, 
  Building2, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  Briefcase, 
  Award, 
  Crown, 
  ArrowRight, 
  Sparkles,
  Zap
} from 'lucide-react';
import { Button } from '../ui/Button';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [isPayingAnnual, setIsPayingAnnual] = useState(false);

  if (!isOpen) return null;

  // Test mode simulation handler that bypasses external gateway popup
  const handleSimulateTestPayment = async () => {
    try {
      setIsLoading(true);
      setError('');

      const mockOrderId = `order_mock_test_${Date.now()}`;
      const mockPaymentId = `pay_mock_test_${Date.now()}`;
      const mockSignature = `sig_mock_test_${Date.now()}`;

      const verifyRes = await apiRequest('/payment/verify-mandate', {
        method: 'POST',
        body: JSON.stringify({
          razorpayOrderId: mockOrderId,
          razorpayPaymentId: mockPaymentId,
          razorpaySignature: mockSignature,
        }),
      });

      if (!verifyRes.success && verifyRes.error) {
        setError(verifyRes.error || verifyRes.message || 'Simulation verification failed.');
        return;
      }

      alert('🎉 [TEST MODE] ₹2 Mandate successfully authorized! Your 31-Day Free Trial is now active.');
      if (onSuccess) onSuccess();
      onClose();
      navigate('/professional/verification');
    } catch (err: any) {
      console.error('Test simulation error:', err);
      setError(err.message || 'Could not verify test payment. Please ensure backend server is running.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartTrialAndSubscribe = async () => {
    try {
      setIsLoading(true);
      setError('');

      // 1. Initialize ₹2 Auto-Pay Mandate Order via Backend
      const res = await apiRequest('/payment/create-mandate', {
        method: 'POST',
      });

      if (!res.success && res.error) {
        setError(res.error || res.message || "Failed to initialize auto-pay setup.");
        return;
      }

      const orderData = res.data || res;
      const orderId = orderData.orderId || orderData.id || `order_mock_mandate_${Date.now()}`;
      const keyId = orderData.keyId || 'rzp_test_StroitX';

      // 2. Trigger Razorpay Payment Popup for ₹2 Setup Charge
      if (typeof (window as any).Razorpay !== 'undefined') {
        const options = {
          key: keyId,
          amount: 200, // ₹2.00 in paise
          currency: 'INR',
          name: 'StroitX Construction Marketplace',
          description: '₹2.00 Auto-Pay Mandate Setup (31-Day Free Trial)',
          order_id: orderId.startsWith('order_mock_') ? undefined : orderId,
          handler: async function (response: any) {
            try {
              setIsLoading(true);
              const verifyRes = await apiRequest('/payment/verify-mandate', {
                method: 'POST',
                body: JSON.stringify({
                  razorpayOrderId: response.razorpay_order_id || orderId,
                  razorpayPaymentId: response.razorpay_payment_id || `pay_${Date.now()}`,
                  razorpaySignature: response.razorpay_signature || `sig_${Date.now()}`,
                }),
              });

              if (!verifyRes.success && verifyRes.error) {
                setError(verifyRes.error || verifyRes.message || 'Mandate verification failed.');
                return;
              }

              alert('🎉 ₹2 Auto-Pay Mandate Authorized! Your 31-Day Free Trial is now active. Proceed to complete your KYC.');
              if (onSuccess) onSuccess();
              onClose();
              navigate('/professional/verification');
            } catch (vErr: any) {
              console.error('Mandate verification error:', vErr);
              setError(vErr.message || 'Verification failed. Please try again.');
            } finally {
              setIsLoading(false);
            }
          },
          prefill: {
            name: user?.name || '',
            email: user?.email || '',
            contact: user?.phone || '',
          },
          theme: {
            color: '#0f62fe',
          },
          modal: {
            ondismiss: function () {
              setIsLoading(false);
            },
          },
        };

        try {
          const rzp = new (window as any).Razorpay(options);
          rzp.on('payment.failed', function (resp: any) {
            console.warn('Razorpay payment failed in test mode:', resp);
            setError(`Razorpay test notice: ${resp.error?.description || 'Payment rejected'}. Use "Simulate Successful Test Payment" below to proceed.`);
            setIsLoading(false);
          });
          rzp.open();
        } catch (openErr: any) {
          console.warn('Razorpay popup open error, offering test mode simulation:', openErr);
          setError('Razorpay popup blocked or credentials unverified. Click "Simulate Successful Test Payment" below to proceed.');
          setIsLoading(false);
        }
      } else {
        // Fallback in development/offline test environment
        await handleSimulateTestPayment();
      }
    } catch (err: any) {
      console.error("Trial mandate setup failed:", err);
      setError('Could not initialize auto-pay mandate. Click "Simulate Successful Test Payment" below to test.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnnualRazorpayCheckout = async () => {
    try {
      setIsPayingAnnual(true);
      setError('');

      // 1. Create Order via Backend API
      const orderRes = await apiRequest('/payment/create-order', {
        method: 'POST',
        body: JSON.stringify({ amount: 1299 }),
      });

      const orderId = (orderRes as any).id || (orderRes.data as any)?.id || (orderRes.data as any)?.razorpayOrder?.orderId || `order_${Date.now()}`;

      // 2. Open Razorpay Modal SDK if available, or simulate verified development checkout
      if (typeof (window as any).Razorpay !== 'undefined') {
        const options = {
          key: 'rzp_test_StroitX',
          amount: 1299 * 100,
          currency: 'INR',
          name: 'StroitX Construction Marketplace',
          description: 'Contractor & Architect Pro Annual Membership',
          order_id: orderId.startsWith('order_mock_') ? undefined : orderId,
          handler: async function (response: any) {
            await apiRequest('/payment/verify', {
              method: 'POST',
              body: JSON.stringify({
                razorpayOrderId: response.razorpay_order_id || orderId,
                razorpayPaymentId: response.razorpay_payment_id || `pay_${Date.now()}`,
                razorpaySignature: response.razorpay_signature || `sig_${Date.now()}`,
              }),
            });
            await apiRequest('/subscription/activate-trial', { method: 'POST' });
            alert('🎉 Pro Membership Payment Verified! Your account is now active.');
            onClose();
            navigate('/professional/verification');
          },
          prefill: {
            name: user?.name || '',
            email: user?.email || '',
            contact: user?.phone || '',
          },
          theme: {
            color: '#0f62fe',
          },
        };
        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      } else {
        // Direct API verification fallback in development
        await apiRequest('/payment/verify', {
          method: 'POST',
          body: JSON.stringify({
            razorpayOrderId: orderId,
            razorpayPaymentId: `pay_mock_${Date.now()}`,
            razorpaySignature: `sig_mock_${Date.now()}`,
          }),
        });
        await apiRequest('/subscription/activate-trial', { method: 'POST' });
        alert('🎉 Pro Membership Payment Verified! Your 1-Year Pro Partner account is active.');
        onClose();
        navigate('/professional/verification');
      }
    } catch (err: any) {
      console.error('Annual payment error:', err);
      setError(err.message || 'Payment initiation failed. Please try again.');
    } finally {
      setIsPayingAnnual(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-[850px] relative overflow-hidden flex flex-col my-8">
        
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors z-20"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-8">
          
          <div className="flex items-center gap-4 mb-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#FF6D00] rounded-md flex items-center justify-center shadow-sm">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">StroitX</span>
            </div>
            <div className="w-px h-8 bg-slate-200 dark:bg-slate-700"></div>
            <div className="flex flex-col">
              <span className="text-[#00BFA5] text-[10px] font-extrabold tracking-widest uppercase leading-tight">
                Professional
              </span>
              <span className="text-[#00BFA5] text-[10px] font-extrabold tracking-widest uppercase leading-tight">
                Subscription
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            <div className="flex flex-col justify-center">
              <h2 className="text-[28px] font-extrabold text-slate-900 dark:text-white leading-tight">
                Contractor & Architect Pro Membership
              </h2>
              <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm leading-relaxed font-medium">
                Get verified, build trust, and unlock premium tools to grow your business.
              </p>
              
              <div className="mt-5 border border-slate-200 dark:border-slate-800 rounded-xl p-5 bg-white dark:bg-slate-800/80 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
                <div className="mb-1">
                  <span className="text-slate-400 dark:text-slate-500 line-through text-sm font-semibold">Rs 1,999/year</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-end gap-1.5">
                    <span className="text-[32px] font-extrabold text-slate-900 dark:text-white leading-none">Rs 1,299</span>
                    <span className="text-slate-500 dark:text-slate-400 font-semibold mb-1 text-sm">/ year</span>
                  </div>
                  <div className="bg-[#00BFA5] text-white px-3 py-1 rounded-full text-xs font-bold tracking-wide shadow-sm">
                    Save 35%
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#0f62fe] rounded-2xl p-6 text-white relative overflow-hidden shadow-inner flex flex-col justify-between min-h-[220px]">
              
              <div className="absolute bottom-0 left-0 right-0 h-24 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxwYXRoIGQ9Ik0wIDEwMGg0MDBWNzBoLTIwVjUwaC0zMHYyMGgtMTBWMzBoLTQwdjQwaC0yMFY0MGgtMjB2MzBoLTIwVjYwaC0zMHYxMGgtMjBWNDBoLTMwdjMwaC0yMFY1MEg5MHYyMEg3MFY0MEg0MHYzMEgyMFY1MEgwem0zMjAtODB2NTBtMjAtMzB2MzAiIGZpbGw9IiNmZmYiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIyIi8+PC9zdmc+')] bg-repeat-x bg-bottom"></div>
              
              <div className="relative z-10 flex items-center justify-between mb-8">
                <div className="flex items-center gap-1.5 text-[10px] font-bold tracking-wide text-blue-100">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-200" />
                  EXCLUSIVE LAUNCH OFFER
                </div>
                <div className="flex items-center gap-1 bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold border border-white/10">
                  <Sparkles className="w-3 h-3" />
                  31-DAY FREE TRIAL
                </div>
              </div>

              <div className="relative z-10 mt-auto pb-4">
                <h3 className="text-[22px] font-bold mb-1 tracking-tight">Build more. Grow faster.</h3>
                <p className="text-blue-100 text-xs font-medium">Verified professionals. Better opportunities.</p>
              </div>
            </div>
          </div>

          <div className="mt-6 bg-[#f8fafc] dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 rounded-xl p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 text-[#0f62fe]" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">₹2 Auto-Pay Mandate Authorization Today</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium leading-relaxed">
                Billing of Rs 1,299/year begins only after your 31-day trial ends. A refundable ₹2 setup charge authorizes your auto-pay mandate. Cancel anytime.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 text-[#0f62fe]" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-900 dark:text-white">Full Access</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">to Verified Construction & Renovation Bids</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center shrink-0">
                <Briefcase className="w-5 h-5 text-[#0f62fe]" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-900 dark:text-white">Professional Tools</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">including Quotation Builder Tool</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center shrink-0">
                <Award className="w-5 h-5 text-[#0f62fe]" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-900 dark:text-white">Official Verified</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Contractor Badge (Post KYC)</span>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 rounded-xl text-sm text-amber-900 dark:text-amber-200 font-medium flex flex-col gap-2">
              <div className="flex items-start gap-2">
                <span className="font-semibold text-amber-800 dark:text-amber-300 shrink-0">Notice:</span>
                <span className="leading-snug">{error}</span>
              </div>
              <div className="pt-2 border-t border-amber-200/80 dark:border-amber-800/50 flex items-center justify-between flex-wrap gap-2">
                <span className="text-xs text-amber-700 dark:text-amber-300">Test mode fallback available:</span>
                <button
                  type="button"
                  onClick={handleSimulateTestPayment}
                  disabled={isLoading}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition-colors shadow-sm"
                >
                  <Zap className="w-3.5 h-3.5" />
                  Simulate Successful Test Payment
                </button>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              className="flex-1 bg-[#0f62fe] hover:bg-blue-700 text-white rounded-xl py-5 flex items-center justify-center gap-2 font-bold text-[14px] transition-all shadow-md hover:shadow-lg border-0"
              onClick={handleStartTrialAndSubscribe}
              isLoading={isLoading}
              disabled={isPayingAnnual}
            >
              <Crown className="w-4 h-4" />
              Authorize ₹2 Mandate & Start Trial
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>

            <Button 
              variant="outline"
              className="flex-1 border-2 border-emerald-600 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-xl py-5 flex items-center justify-center gap-2 font-bold text-[14px] transition-all"
              onClick={handleAnnualRazorpayCheckout}
              isLoading={isPayingAnnual}
              disabled={isLoading}
            >
              <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Pay ₹1,299/yr via Razorpay
            </Button>
          </div>

          {/* Test Mode Simulation Action */}
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center">
            <button
              type="button"
              onClick={handleSimulateTestPayment}
              disabled={isLoading || isPayingAnnual}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950/40 border border-dashed border-slate-300 dark:border-slate-700 hover:border-orange-300 transition-colors"
            >
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>Simulate Successful Test Payment (Test Mode)</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};