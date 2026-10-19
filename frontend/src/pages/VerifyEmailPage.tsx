import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { apiRequest } from '../lib/api';
import { HardHat, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const VerifyEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [status, setStatus] = useState<'LOADING' | 'SUCCESS' | 'ERROR'>('LOADING');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('ERROR');
      setMessage('Missing verification token in request URL.');
      return;
    }

    const verifyToken = async () => {
      try {
        await apiRequest(`/auth/email/verify?token=${token}`);
        setStatus('SUCCESS');
        setMessage('Your email address has been successfully verified.');
      } catch (err: any) {
        setStatus('ERROR');
        setMessage(err.message || 'Verification failed or token expired.');
      }
    };

    verifyToken();
  }, [token]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
      <div className="bg-white max-w-md w-full p-8 border border-slate-200 rounded-xl text-center shadow-sm">
        <div className="inline-flex items-center space-x-2 text-2xl font-black mb-6">
          <div className="p-2 bg-orange-600 rounded-lg text-white">
            <HardHat className="h-6 w-6" />
          </div>
          <span>Stroit<span className="text-orange-500">X</span></span>
        </div>

        {status === 'LOADING' && (
          <div>
            <div className="animate-spin h-10 w-10 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <h2 className="text-lg font-bold text-slate-900">Verifying Email Address...</h2>
          </div>
        )}

        {status === 'SUCCESS' && (
          <div>
            <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-900 mb-2">Verification Successful!</h2>
            <p className="text-xs text-slate-500 mb-6">{message}</p>
            <Button className="w-full" onClick={() => navigate('/login')}>
              Continue to Login
            </Button>
          </div>
        )}

        {status === 'ERROR' && (
          <div>
            <XCircle className="h-12 w-12 text-rose-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-900 mb-2">Verification Failed</h2>
            <p className="text-xs text-slate-500 mb-6">{message}</p>
            <Button variant="outline" className="w-full" onClick={() => navigate('/')}>
              Return Home
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
