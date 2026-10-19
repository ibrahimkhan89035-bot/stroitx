import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HardHat, Home, Briefcase, ArrowRight, ShieldCheck } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { MetaSEO } from '../components/seo/MetaSEO';

export const GatewayPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <MetaSEO
        title="Choose Your Workspace | StroitX Construction Portal"
        description="Access your StroitX workspace as a verified homeowner or construction professional. Post projects, compare bids, or find local jobs across India."
        canonical="https://stroitx.com/gateway"
      />
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#f97316_1px,transparent_1px)] [background-size:24px_24px]"></div>

      <div className="max-w-4xl w-full z-10 text-center">
        {/* Brand */}
        <div className="inline-flex items-center space-x-2 text-2xl font-black mb-8">
          <div className="p-2 bg-orange-600 rounded-lg text-white">
            <HardHat className="h-6 w-6" />
          </div>
          <span>Stroit<span className="text-orange-500">X</span></span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4">
          Select Your StroitX Workspace
        </h1>
        <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto mb-12">
          Choose how you would like to use StroitX today. Each workspace is tailored to your specific role and permissions.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {/* Homeowner Option */}
          <div
            onClick={() => navigate('/signup/homeowner')}
            className="bg-slate-800/80 border border-slate-700 hover:border-orange-500 rounded-2xl p-8 text-left transition-all hover:shadow-2xl cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="w-14 h-14 bg-orange-500/10 text-orange-500 rounded-xl flex items-center justify-center mb-6 group-hover:bg-orange-600 group-hover:text-white transition-colors">
                <Home className="h-7 w-7" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">I'm a Homeowner</h2>
              <p className="text-xs text-slate-400 leading-relaxed mb-6">
                Post new construction or renovation projects, receive competitive quotes, compare contractors, manage milestones, and track construction progress.
              </p>
            </div>
            <div className="flex items-center text-orange-400 font-semibold text-sm group-hover:translate-x-1 transition-transform">
              <span>Continue as Homeowner</span>
              <ArrowRight className="h-4 w-4 ml-2" />
            </div>
          </div>

          {/* Professional Option */}
          <div
            onClick={() => navigate('/signup/professional')}
            className="bg-slate-800/80 border border-slate-700 hover:border-orange-500 rounded-2xl p-8 text-left transition-all hover:shadow-2xl cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="w-14 h-14 bg-blue-500/10 text-blue-400 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <Briefcase className="h-7 w-7" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">I'm a Professional</h2>
              <p className="text-xs text-slate-400 leading-relaxed mb-6">
                Discover verified construction leads, build detailed itemized quotations, submit verification credentials, grow your reputation, and manage clients.
              </p>
            </div>
            <div className="flex items-center text-blue-400 font-semibold text-sm group-hover:translate-x-1 transition-transform">
              <span>Continue as Professional</span>
              <ArrowRight className="h-4 w-4 ml-2" />
            </div>
          </div>
        </div>

        <div className="mt-12 text-xs text-slate-500">
          Already have an account?{' '}
          <button onClick={() => navigate('/login')} className="text-orange-400 font-semibold hover:underline">
            Sign In Here
          </button>
        </div>
      </div>
    </div>
  );
};
