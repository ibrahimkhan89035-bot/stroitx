import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { HardHat, Phone, Mail, ShieldAlert, ArrowRight } from 'lucide-react';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { apiRequest } from '../lib/api';
import { MetaSEO } from '../components/seo/MetaSEO';

export const LoginPage: React.FC = () => {
  const { login, verifyOtp, sendOtp } = useAuth();
  const navigate = useNavigate();

  const [authMode, setAuthMode] = useState<'OTP' | 'PASSWORD'>('OTP');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [otpStep, setOtpStep] = useState<'REQUEST' | 'VERIFY'>('REQUEST');
  const [countdown, setCountdown] = useState(60);
  const [timerActive, setTimerActive] = useState(false);

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let interval: any = null;
    if (timerActive && countdown > 0) {
      interval = setInterval(() => setCountdown((c) => c - 1), 1000);
    } else if (countdown === 0) {
      setTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [timerActive, countdown]);

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      setIsLoading(true);
      const user = await login(email, password);
      redirectUserByRole(user.role);
    } catch (err: any) {
      setError(err.message || 'Login failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      setIsLoading(true);
      await sendOtp(mobileNumber);
      setOtpStep('VERIFY');
      setCountdown(60);
      setTimerActive(true);
    } catch (err: any) {
      setError(err.message || 'OTP dispatch failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      setIsLoading(true);
      const result = await verifyOtp(mobileNumber, otp);
      if (result.isExistingUser && result.user) {
        redirectUserByRole(result.user.role);
      } else {
        navigate('/gateway');
      }
    } catch (err: any) {
      setError(err.message || 'OTP verification failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const redirectUserByRole = (role: string) => {
    if (role === 'HOMEOWNER') navigate('/homeowner/dashboard');
    else if (role === 'PROFESSIONAL') navigate('/professional/dashboard');
    else if (role === 'ADMIN' || role === 'FOUNDER') navigate('/admin/dashboard');
    else navigate('/gateway');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <MetaSEO
        title="Sign In to StroitX | Construction Portal Login"
        description="Log in to your StroitX account to manage projects, verify bids, view milestone escrow payments, and connect with verified construction contractors."
        canonical="https://stroitx.com/login"
      />
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center space-x-2 text-2xl font-black mb-2">
          <div className="p-2 bg-orange-600 rounded-lg text-white">
            <HardHat className="h-6 w-6" />
          </div>
          <span>Stroit<span className="text-orange-500">X</span></span>
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900">Sign in to StroitX</h2>
        <p className="mt-1 text-xs text-slate-500">Access your construction management portal</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm border border-slate-200 sm:rounded-xl sm:px-10">
          {/* Tab Selection */}
          <div className="flex border-b border-slate-200 mb-6">
            <button
              className={`flex-1 py-2 text-xs font-semibold border-b-2 text-center transition-colors ${
                authMode === 'OTP' ? 'border-orange-500 text-orange-600' : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
              onClick={() => {
                setAuthMode('OTP');
                setError('');
              }}
            >
              <Phone className="h-3.5 w-3.5 inline mr-1.5" /> Mobile OTP Login
            </button>
            <button
              className={`flex-1 py-2 text-xs font-semibold border-b-2 text-center transition-colors ${
                authMode === 'PASSWORD' ? 'border-orange-500 text-orange-600' : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
              onClick={() => {
                setAuthMode('PASSWORD');
                setError('');
              }}
            >
              <Mail className="h-3.5 w-3.5 inline mr-1.5" /> Email & Password
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
              {error}
            </div>
          )}

          {authMode === 'OTP' ? (
            otpStep === 'REQUEST' ? (
              <form className="space-y-4" onSubmit={handleRequestOtp}>
                <Input
                  label="Mobile Phone Number"
                  type="tel"
                  required
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  placeholder="+91 9876543210"
                />
                <Button type="submit" className="w-full" isLoading={isLoading}>
                  Send 6-Digit OTP <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>
            ) : (
              <form className="space-y-4" onSubmit={handleVerifyOtp}>
                <div className="flex items-center justify-between text-xs text-slate-600 mb-2">
                  <span>OTP sent to <strong>{mobileNumber}</strong></span>
                  <button type="button" onClick={() => setOtpStep('REQUEST')} className="text-orange-600 font-semibold hover:underline">
                    Change
                  </button>
                </div>
                <Input
                  label="Enter 6-Digit OTP"
                  type="text"
                  required
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="123456"
                  className="text-center tracking-widest text-lg font-bold"
                />

                <div className="flex items-center justify-between text-xs">
                  {timerActive ? (
                    <span className="text-slate-400">Resend OTP in {countdown}s</span>
                  ) : (
                    <button type="button" onClick={handleRequestOtp} className="text-orange-600 font-semibold hover:underline">
                      Resend OTP
                    </button>
                  )}
                </div>

                <Button type="submit" className="w-full" isLoading={isLoading}>
                  Verify & Continue
                </Button>
              </form>
            )
          ) : (
            <form className="space-y-4" onSubmit={handlePasswordLogin}>
              <Input
                label="Email Address"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
              />
              <div className="space-y-1">
                <Input
                  label="Password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
                <div className="flex justify-end pt-1">
                  <Link
                    to="/forgot-password"
                    className="text-xs text-orange-600 dark:text-orange-400 hover:underline font-medium"
                  >
                    Forgot password?
                  </Link>
                </div>
              </div>
              <Button type="submit" className="w-full" isLoading={isLoading}>
                Sign In
              </Button>
            </form>
          )}

          <div className="mt-6 text-center text-xs text-slate-500">
            Don't have an account yet?{' '}
            <button onClick={() => navigate('/gateway')} className="text-orange-600 font-semibold hover:underline">
              Create an Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
