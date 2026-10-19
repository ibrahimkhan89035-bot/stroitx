import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { HardHat, Lock, CheckCircle2, AlertCircle, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { MetaSEO } from '../components/seo/MetaSEO';
import { apiRequest } from '../lib/api';

export const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Missing or invalid reset token. Please request a new password reset link.');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please ensure both fields are identical.');
      return;
    }

    try {
      setIsLoading(true);
      await apiRequest('/reset-password', {
        method: 'POST',
        body: JSON.stringify({
          token,
          newPassword,
        }),
      });
      setIsSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Password reset failed. The token may be invalid or expired.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-colors duration-200">
      <MetaSEO
        title="Reset Password | StroitX Account Security"
        description="Set a new secure password for your StroitX account. Enter and confirm your new credentials to regain access."
        canonical="https://stroitx.com/reset-password"
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
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Create New Password</h2>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Enter your new account password below to finish resetting your access
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-slate-900 py-8 px-4 shadow-sm border border-slate-200 dark:border-slate-800 sm:rounded-2xl sm:px-10 transition-colors">
          {!token ? (
            <div className="text-center space-y-4 py-4">
              <div className="w-14 h-14 bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 rounded-2xl flex items-center justify-center mx-auto border border-rose-200 dark:border-rose-800/60 shadow-sm">
                <AlertCircle className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Invalid Reset Link</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                This password reset link is invalid or incomplete. Password reset tokens are time-sensitive and single-use only.
              </p>
              <div className="pt-3">
                <Link to="/forgot-password">
                  <Button className="w-full text-xs font-semibold">Request a New Reset Link</Button>
                </Link>
              </div>
            </div>
          ) : isSuccess ? (
            <div className="text-center space-y-4 py-2">
              <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mx-auto border border-emerald-200 dark:border-emerald-800/60 shadow-sm">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Password Reset Successfully</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Your password has been securely updated. You can now sign in to your StroitX workspace with your new credentials.
              </p>
              <div className="pt-3">
                <Button
                  className="w-full flex items-center justify-center gap-2"
                  onClick={() => navigate('/login')}
                >
                  <span>Sign In Now</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit}>
              {error && (
                <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 rounded-xl text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed font-medium">{error}</span>
                </div>
              )}

              <div className="relative">
                <Input
                  label="New Password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  disabled={isLoading}
                  className="bg-slate-50 dark:bg-slate-800 dark:text-white dark:border-slate-700 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-8 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <Input
                label="Confirm New Password"
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your new password"
                disabled={isLoading}
                className="bg-slate-50 dark:bg-slate-800 dark:text-white dark:border-slate-700"
              />

              <div className="text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                Tip: Choose a strong password containing letters, numbers, and special characters.
              </div>

              <Button type="submit" className="w-full flex items-center justify-center gap-2" isLoading={isLoading}>
                <span>Reset Password & Update</span>
                <ArrowRight className="w-4 h-4" />
              </Button>

              <div className="pt-2 text-center">
                <Link
                  to="/login"
                  className="text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                >
                  Cancel and Return to Sign In
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
