import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { HardHat, Mail, ArrowLeft, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { MetaSEO } from '../components/seo/MetaSEO';
import { apiRequest } from '../lib/api';

export const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    try {
      setIsLoading(true);
      await apiRequest('/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim() }),
      });
      setIsSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Failed to dispatch reset link. Please check the email and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-colors duration-200">
      <MetaSEO
        title="Forgot Password | StroitX Account Recovery"
        description="Reset your StroitX account password. Enter your registered email to receive a secure, time-limited password recovery link."
        canonical="https://stroitx.com/forgot-password"
      />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Brand Header */}
        <Link to="/" className="inline-flex items-center space-x-2 text-2xl font-black mb-2 group">
          <div className="p-2 bg-orange-600 rounded-lg text-white group-hover:bg-orange-500 transition-colors">
            <HardHat className="h-6 w-6" />
          </div>
          <span className="text-slate-900 dark:text-white">
            Stroit<span className="text-orange-500">X</span>
          </span>
        </Link>
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Recover Your Password</h2>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Enter your registered email address to receive password reset instructions
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-slate-900 py-8 px-4 shadow-sm border border-slate-200 dark:border-slate-800 sm:rounded-2xl sm:px-10 transition-colors">
          {error && (
            <div className="mb-5 p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 rounded-xl text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <span className="leading-relaxed font-medium">{error}</span>
            </div>
          )}

          {isSubmitted ? (
            <div className="text-center space-y-4 py-2">
              <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mx-auto border border-emerald-200 dark:border-emerald-800/60 shadow-sm">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Reset Link Dispatched</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                If an account exists for <strong className="text-slate-900 dark:text-white">{email}</strong>, you will receive an email containing a secure password reset link valid for 1 hour.
              </p>
              <div className="pt-2 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                Didn't receive the email? Check your spam/junk folder or try submitting again below.
              </div>

              <div className="pt-3 space-y-2">
                <Button
                  variant="outline"
                  className="w-full text-xs font-semibold"
                  onClick={() => {
                    setIsSubmitted(false);
                    setEmail('');
                  }}
                >
                  Send Another Reset Link
                </Button>
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center w-full text-xs font-semibold text-orange-600 dark:text-orange-400 hover:underline pt-2 gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Return to Sign In
                </Link>
              </div>
            </div>
          ) : (
            <form className="space-y-5" onSubmit={handleSubmit}>
              <Input
                label="Registered Email Address"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                disabled={isLoading}
                className="bg-slate-50 dark:bg-slate-800 dark:text-white dark:border-slate-700"
              />

              <Button type="submit" className="w-full flex items-center justify-center gap-2" isLoading={isLoading}>
                <span>Send Password Reset Link</span>
                <ArrowRight className="w-4 h-4" />
              </Button>

              <div className="pt-2 text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
