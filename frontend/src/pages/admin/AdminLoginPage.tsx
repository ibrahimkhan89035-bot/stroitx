import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../lib/auth';
import { ShieldCheck, Lock, HardHat } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

export const AdminLoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      setIsLoading(true);
      const user = await login(email, password);
      if (user.role !== 'ADMIN' && user.role !== 'FOUNDER') {
        setError('Access Denied. Account does not possess Administrative privileges.');
        return;
      }
      navigate('/admin/dashboard');
    } catch (err: any) {
      setError(err.message || 'Administrative login failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-white">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center space-x-2 text-2xl font-black mb-2">
          <div className="p-2 bg-orange-600 rounded-lg text-white">
            <Lock className="h-6 w-6" />
          </div>
          <span>Stroit<span className="text-orange-500">X</span></span>
        </div>
        <h2 className="text-xl font-bold text-white uppercase tracking-wider">Administrative Console</h2>
        <p className="mt-1 text-xs text-slate-400">Authorized Personnel Only</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-slate-900 py-8 px-4 border border-slate-800 rounded-xl sm:px-10 shadow-2xl">
          {error && (
            <div className="mb-4 p-3 bg-red-950/50 border border-red-800 rounded-lg text-xs text-red-300">
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input
              label="Admin Email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@stroitx.com"
              className="bg-slate-800 border-slate-700 text-white"
            />
            <Input
              label="Admin Secret Password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="bg-slate-800 border-slate-700 text-white"
            />
            <Button type="submit" variant="primary" className="w-full mt-2" isLoading={isLoading}>
              Authorize Session Access
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};
