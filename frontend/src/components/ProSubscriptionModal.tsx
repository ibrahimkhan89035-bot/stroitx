import React from 'react';
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
  Sparkles
} from 'lucide-react';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProSubscriptionModal: React.FC<SubscriptionModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      {/* Modal Container */}
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[850px] relative overflow-hidden flex flex-col">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors z-20"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8">
          
          {/* Header Area */}
          <div className="flex items-center gap-4 mb-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#FF6D00] rounded-md flex items-center justify-center shadow-sm">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-extrabold text-slate-900 tracking-tight">StroitX</span>
            </div>
            <div className="w-px h-8 bg-slate-200"></div>
            <div className="flex flex-col">
              <span className="text-[#00BFA5] text-[10px] font-extrabold tracking-widest uppercase leading-tight">
                Professional
              </span>
              <span className="text-[#00BFA5] text-[10px] font-extrabold tracking-widest uppercase leading-tight">
                Subscription
              </span>
            </div>
          </div>

          {/* Top Split Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Left Column - Pricing Details */}
            <div className="flex flex-col justify-center">
              <h2 className="text-[28px] font-extrabold text-slate-900 leading-tight">
                Contractor & Architect Pro Membership
              </h2>
              <p className="text-slate-500 mt-2 text-sm leading-relaxed font-medium">
                Get verified, build trust, and unlock premium tools to grow your business.
              </p>
              
              {/* Price Box */}
              <div className="mt-5 border border-slate-200 rounded-xl p-5 bg-white shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
                <div className="mb-1">
                  <span className="text-slate-400 line-through text-sm font-semibold">Rs 1,999/year</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-end gap-1.5">
                    <span className="text-[32px] font-extrabold text-slate-900 leading-none">Rs 1,299</span>
                    <span className="text-slate-500 font-semibold mb-1 text-sm">/ year</span>
                  </div>
                  <div className="bg-[#00BFA5] text-white px-3 py-1 rounded-full text-xs font-bold tracking-wide shadow-sm">
                    Save 35%
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Blue Launch Offer Card */}
            <div className="bg-[#0f62fe] rounded-2xl p-6 text-white relative overflow-hidden shadow-inner flex flex-col justify-between min-h-[220px]">
              
              {/* Abstract City Pattern Background */}
              <div className="absolute bottom-0 left-0 right-0 h-24 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxwYXRoIGQ9Ik0wIDEwMGg0MDBWNzBoLTIwVjUwaC0zMHYyMGgtMTBWMzBoLTQwdjQwaC0yMFY0MGgtMjB2MzBoLTIwVjYwaC0zMHYxMGgtMjBWNDBoLTMwdjMwaC0yMFY1MEg5MHYyMEg3MFY0MEg0MHYzMEgyMFY1MEgwem0zMjAtODB2NTBtMjAtMzB2MzAiIGZpbGw9IiNmZmYiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIyIi8+PC9zdmc+')] bg-repeat-x bg-bottom"></div>
              
              <div className="relative z-10 flex items-center justify-between mb-8">
                <div className="flex items-center gap-1.5 text-[10px] font-bold tracking-wide text-blue-100">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-200" />
                  EXCLUSIVE LAUNCH OFFER
                </div>
                <div className="flex items-center gap-1 bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold border border-white/10">
                  <Sparkles className="w-3 h-3" />
                  45-DAY FREE TRIAL
                </div>
              </div>

              <div className="relative z-10 mt-auto pb-4">
                <h3 className="text-[22px] font-bold mb-1 tracking-tight">Build more. Grow faster.</h3>
                <p className="text-blue-100 text-xs font-medium">Verified professionals. Better opportunities.</p>
              </div>
            </div>
          </div>

          {/* Middle Trial Banner */}
          <div className="mt-6 bg-[#f8fafc] border border-slate-100 rounded-xl p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 text-[#0f62fe]" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Zero Upfront Charge Today</h4>
              <p className="text-[11px] text-slate-500 mt-0.5 font-medium leading-relaxed">
                Your 45-day free trial starts immediately. Billing of Rs 1,299/year begins only after 45 days.
              </p>
            </div>
          </div>

          {/* Bottom Features Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 text-[#0f62fe]" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-900">Full Access</span>
                <span className="text-[10px] text-slate-500 font-medium">to Verified Construction & Renovation Bids</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                <Briefcase className="w-5 h-5 text-[#0f62fe]" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-900">Professional Tools</span>
                <span className="text-[10px] text-slate-500 font-medium">including Quotation Builder Tool</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                <Award className="w-5 h-5 text-[#0f62fe]" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-900">Official Verified</span>
                <span className="text-[10px] text-slate-500 font-medium">Contractor Badge (Post KYC)</span>
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <button className="mt-8 w-full bg-[#0f62fe] hover:bg-blue-700 text-white rounded-xl py-3.5 flex items-center justify-center gap-2 font-bold text-[15px] transition-all shadow-md hover:shadow-lg active:scale-[0.99]">
            <Crown className="w-4 h-4" />
            Start 45-Day Free Trial & Proceed
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>

        </div>
      </div>
    </div>
  );
};