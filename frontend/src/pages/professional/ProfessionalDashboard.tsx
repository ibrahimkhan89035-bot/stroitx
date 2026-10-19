import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../../lib/api';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { QuoteDocumentModal } from '../../components/quote/QuoteDocumentModal';
import { SubscriptionModal } from '../../components/subscription/SubscriptionModal';
import { 
  Target, Briefcase, MessageSquare, 
  ShieldAlert, MessageCircle, Shield, Star, FileSpreadsheet, FileText, Printer,
  RefreshCw, X, Check, Lock, AlertTriangle, Crown
} from 'lucide-react';

export const ProfessionalDashboard: React.FC = () => {
  const [profile, setProfile] = useState<any>(null);
  const [feed, setFeed] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedBid, setSelectedBid] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [declinedLeadIds, setDeclinedLeadIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('stroitx_declined_leads') || '[]');
    } catch {
      return [];
    }
  });
  const navigate = useNavigate();

  const loadData = async (silent = false) => {
    try {
      if (!silent) setIsLoading(true);
      else setIsRefreshing(true);

      const profRes = await apiRequest('/professionals/me');
      if (profRes.data) setProfile(profRes.data);

      const feedRes = await apiRequest('/projects/feed');
      if (feedRes.data) {
        setFeed(Array.isArray(feedRes.data) ? feedRes.data : (feedRes.data.feed || []));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
    // Real-time polling for incoming homeowner project leads every 15 seconds
    const interval = setInterval(() => loadData(true), 15000);
    return () => clearInterval(interval);
  }, []);

  const handleDeclineLead = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const updated = [...declinedLeadIds, id];
    setDeclinedLeadIds(updated);
    try {
      localStorage.setItem('stroitx_declined_leads', JSON.stringify(updated));
    } catch (e) {}
  };

  const submittedBids = profile?.bids || [];
  const inquiries = profile?.inquiries || [];

  // ==========================================
  // ==========================================
  // MANDATE & FREE TRIAL STRICT GATEKEEPER UI
  // ==========================================
  const isMandateActive = Boolean(profile?.isMandateActive);
  const isTrialActive = Boolean(profile?.isTrialActive);
  const isTrialExpired = profile?.trialEndsAt ? new Date(profile.trialEndsAt) < new Date() : false;
  const isGated = !isMandateActive || !isTrialActive || isTrialExpired;

  if (!isLoading && profile && isGated) {
    return (
      <>
        <DashboardLayout title="Professional Portal Dashboard">
          <div className="flex flex-col items-center justify-center p-8 sm:p-12 mt-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm max-w-3xl mx-auto text-center">
            <div className="w-16 h-16 rounded-2xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800/50 flex items-center justify-center mb-6 shadow-sm">
              <Lock className="w-8 h-8 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-orange-100 dark:bg-orange-950/60 text-orange-800 dark:text-orange-300 border border-orange-200 dark:border-orange-800/60 mb-3">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>₹2 Auto-Pay Mandate Required</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold mb-3 text-slate-900 dark:text-white">
              Authorize Mandate to Unlock Your Dashboard
            </h2>
            <p className="mb-6 text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-xl leading-relaxed">
              To browse live homeowner projects, submit bids, and access professional tools, authorize your refundable ₹2 auto-pay mandate. Your 31-day free trial starts immediately upon authorization.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg mb-8 text-left text-xs font-semibold text-slate-700 dark:text-slate-300">
              <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Zero Upfront Platform Fees</span>
              </div>
              <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>31-Day Unrestricted Free Trial</span>
              </div>
              <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Direct Homeowner Lead Pipeline</span>
              </div>
              <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Quotation Builder & Export Tool</span>
              </div>
            </div>

            <button 
              onClick={() => setIsSubModalOpen(true)} 
              className="w-full sm:w-auto px-8 py-3.5 bg-[#0f62fe] text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20 text-sm flex items-center justify-center gap-2"
            >
              <Crown className="w-4 h-4" />
              Authorize ₹2 Mandate & Start 31-Day Trial
            </button>
          </div>
        </DashboardLayout>
        <SubscriptionModal 
          isOpen={isSubModalOpen} 
          onClose={() => {
            setIsSubModalOpen(false);
            loadData(true);
          }} 
        />
      </>
    );
  }
  // ==========================================

  return (
    <>
      <DashboardLayout title="Professional Portal Dashboard">
        {/* Dynamic Premium Banner */}
        {profile && (
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-slate-900 via-slate-800 to-[#1e1b4b] flex flex-col sm:flex-row items-center justify-between p-6 sm:p-8 shadow-lg shadow-slate-900/10 mb-6">
            <div className="flex items-center gap-5 z-10 w-full sm:w-auto">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-orange-500/30">
                <Target className="w-7 h-7 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1 flex-wrap">
                  <h2 className="text-xl font-bold text-white">Pro Partner Plan: Rs 1,299/year</h2>
                  <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide">
                    {profile.isMandateActive ? '₹2 Mandate Active • 31-Day Trial' : 'Trial Active'}
                  </span>
                </div>
                <p className="text-sm text-slate-400">
                  Trial active until {profile.trialEndsAt ? new Date(profile.trialEndsAt).toLocaleDateString() : '31 days from registration'}.
                </p>
              </div>
            </div>
            <button 
              className="mt-4 sm:mt-0 w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white border border-white/20 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all backdrop-blur-md flex items-center justify-center gap-2"
              onClick={() => setIsSubModalOpen(true)}
            >
              Manage Membership
            </button>
          </div>
        )}

        {/* Dynamic Alert Card */}
        {profile && (!profile.verified || profile.verificationStatus !== 'VERIFIED') && (
          <div className="bg-amber-50 dark:bg-yellow-900/30 border border-amber-200 dark:border-yellow-700/40 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm mb-6">
            <div className="flex items-start sm:items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-yellow-800/50 text-amber-600 dark:text-yellow-400 flex items-center justify-center flex-shrink-0 border border-amber-200 dark:border-yellow-700/50">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-amber-900 dark:text-yellow-200 mb-0.5">KYC Verification Required</h3>
                <p className="text-sm text-amber-700/80 dark:text-yellow-300/80 font-medium">Submit your government ID, GST and business documents to unlock the verified badge and client phone contacts.</p>
              </div>
            </div>
            <button 
              className="w-full sm:w-auto bg-white dark:bg-yellow-950/80 hover:bg-amber-100 dark:hover:bg-yellow-900/80 text-amber-700 dark:text-yellow-200 border border-amber-300 dark:border-yellow-600/50 px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors whitespace-nowrap shadow-sm"
              onClick={() => navigate('/professional/verification')}
            >
              Submit Documents
            </button>
          </div>
        )}

        {/* Dynamic Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
          <StatCard 
            bgGradient="bg-gradient-to-br from-blue-50 to-white border-blue-100 dark:from-slate-800 dark:to-slate-800/90 dark:border-slate-700"
            icon={<MessageCircle className="w-6 h-6 text-blue-500 dark:text-blue-400" />} iconBg="bg-blue-100/50 border-blue-200 dark:bg-blue-950/60 dark:border-blue-800/50"
            title="HOMEOWNER INQUIRIES" value={inquiries.length} textColor="text-blue-950 dark:text-blue-200"
          />
          <StatCard 
            bgGradient="bg-gradient-to-br from-indigo-50 to-white border-indigo-100 dark:from-slate-800 dark:to-slate-800/90 dark:border-slate-700"
            icon={<Briefcase className="w-6 h-6 text-indigo-500 dark:text-indigo-400" />} iconBg="bg-indigo-100/50 border-indigo-200 dark:bg-indigo-950/60 dark:border-indigo-800/50"
            title="AVAILABLE PROJECTS" value={feed.length} textColor="text-indigo-950 dark:text-indigo-200"
          />
          <StatCard 
            bgGradient="bg-gradient-to-br from-emerald-50 to-white border-emerald-100 dark:from-slate-800 dark:to-slate-800/90 dark:border-slate-700"
            icon={<Shield className="w-6 h-6 text-emerald-500 dark:text-emerald-400" />} iconBg="bg-emerald-100/50 border-emerald-200 dark:bg-emerald-950/60 dark:border-emerald-800/50"
            title="VERIFICATION STATUS" value={profile?.verified ? 'VERIFIED' : 'PENDING'} textColor="text-emerald-950 dark:text-emerald-200" valueSize="text-xl"
          />
          <StatCard 
            bgGradient="bg-gradient-to-br from-orange-50 to-white border-orange-100 dark:from-slate-800 dark:to-slate-800/90 dark:border-slate-700"
            icon={<Star className="w-6 h-6 text-orange-500 dark:text-orange-400" />} iconBg="bg-orange-100/50 border-orange-200 dark:bg-orange-950/60 dark:border-orange-800/50"
            title="PROFILE RATING" value={`${profile?.rating || 0.0}`} textColor="text-orange-950 dark:text-orange-200"
            suffix={<Star className="w-6 h-6 ml-1 text-orange-400 fill-orange-400 inline-block -mt-1" />}
          />
        </div>

        {/* Dynamic Inquiries */}
        <div className="pt-4 mb-6">
          <div className="flex items-end justify-between mb-5">
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Direct Homeowner Inquiries & Leads</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Homeowners who have initiated contact with your business</p>
            </div>
            <span className="bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-xs font-bold px-3 py-1.5 rounded-full border border-blue-200 dark:border-blue-800/60 hidden sm:block">
              {inquiries.length} Direct Inquiries
            </span>
          </div>

          {inquiries.length === 0 ? (
            <div className="text-center py-12 text-sm text-slate-400 dark:text-slate-500 border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl bg-white/50 dark:bg-slate-800/40">
              <MessageSquare className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="font-semibold text-slate-600 dark:text-slate-300">No homeowner inquiries yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {inquiries.map((inq: any) => (
                <div key={inq.id} className="bg-white dark:bg-slate-800 rounded-2xl p-6 border-l-4 border-l-emerald-400 border-y border-r border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all flex flex-col h-full">
                  <div className="flex justify-between items-start mb-4">
                    <span className="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                      Homeowner Inquiry
                    </span>
                    <span className="text-xs font-medium text-slate-400 dark:text-slate-400">{new Date(inq.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="mb-4">
                    <h4 className="text-base font-bold text-slate-900 dark:text-white leading-tight">{inq.homeownerName}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                      {inq.homeownerEmail} <span className="mx-1 text-slate-300 dark:text-slate-600">•</span> {inq.projectName}
                    </p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900/60 rounded-xl p-4 border border-slate-100 dark:border-slate-700/60 mb-5 flex-1">
                    <p className="text-sm text-slate-600 dark:text-slate-300 italic">"{inq.message}"</p>
                  </div>
                  <div className="flex justify-end mt-auto">
                    <button 
                      className="bg-[#0A132B] dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 shadow-sm"
                      onClick={() => navigate(`/messages?userId=${inq.homeownerId}&projectId=${inq.projectId}`)}
                    >
                      <MessageCircle className="w-4 h-4" /> Reply to Inquiry
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Dynamic Leads */}
        <div className="pt-6 mb-6">
          <div className="flex items-end justify-between mb-5">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Recommended Project Leads</h3>
                <button 
                  onClick={() => loadData(true)} 
                  disabled={isRefreshing}
                  className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                  title="Refresh leads in real time"
                >
                  <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-blue-600 dark:text-blue-400' : ''}`} />
                </button>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Matched to your category & experience score • Live real-time stream</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-400 dark:text-slate-400 hidden sm:inline-block">
                {feed.filter((p) => !declinedLeadIds.includes(p.id)).length} Active Leads
              </span>
              <button className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors" onClick={() => navigate('/professional/find-projects')}>
                Explore All Leads →
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-12 text-slate-400 dark:text-slate-500">Loading recommended construction leads...</div>
          ) : feed.filter((p) => !declinedLeadIds.includes(p.id)).length === 0 ? (
            <div className="text-center py-12 text-sm text-slate-400 dark:text-slate-500 border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl bg-white/50 dark:bg-slate-800/40">
              <Briefcase className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="font-semibold text-slate-600 dark:text-slate-300">No active project leads available right now.</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">We'll alert you as soon as homeowners post matching construction or interior requirements.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {feed.filter((p) => !declinedLeadIds.includes(p.id)).slice(0, 6).map((proj) => (
                <div key={proj.id} className="bg-white dark:bg-slate-800 flex flex-col rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                     <span className={`text-xs font-bold px-3 py-1 rounded-full border ${proj.hasSubmittedBid ? 'bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 border-orange-100 dark:border-orange-800/60' : 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-800/60'}`}>
                       {proj.hasSubmittedBid ? 'Bid Submitted' : 'Active Lead'}
                     </span>
                     <span className="text-xs font-bold text-slate-400 dark:text-slate-400 tracking-wider uppercase">{proj.type || proj.projectType || 'General'}</span>
                  </div>
                  <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{proj.name || proj.title}</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 flex items-center gap-1">
                     <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400 dark:text-slate-500"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                     {proj.location || (proj.city ? `${proj.city}, ${proj.state || ''}` : 'Location N/A')}
                  </p>
                  <div className="bg-slate-50 dark:bg-slate-900/60 rounded-xl p-4 border border-slate-100 dark:border-slate-700/60 mb-5 flex-1">
                    <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2">{proj.description || 'No description provided.'}</p>
                  </div>
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-700/60 flex flex-col gap-3 mt-auto">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 dark:text-slate-400 font-semibold uppercase">Estimated Budget</span>
                      <span className="font-extrabold text-blue-600 dark:text-blue-400 font-mono text-sm">{proj.budget || 'Custom'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => handleDeclineLead(proj.id, e)}
                        className="flex-1 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-200 py-2.5 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                        title="Decline / Dismiss this lead"
                      >
                        <X className="w-3.5 h-3.5" /> Decline
                      </button>
                      <button 
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm whitespace-nowrap"
                        onClick={() => navigate(`/professional/submit-quote/${proj.id}`)}
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5" /> {proj.hasSubmittedBid ? 'Update Bid' : 'Accept & Bid'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Dynamic Submitted Bids */}
        <div className="pt-6 pb-10">
          <div className="flex items-end justify-between mb-5">
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">My Submitted Quotes & Bids</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Track and view formal quotation proposals</p>
            </div>
            <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 hidden sm:block">
              {submittedBids.length} Submitted Bids
            </span>
          </div>

          {submittedBids.length === 0 ? (
            <div className="text-center py-12 text-sm text-slate-400 dark:text-slate-500 border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl bg-white/50 dark:bg-slate-800/40">
              <FileText className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="font-semibold text-slate-600 dark:text-slate-300">No quotes submitted yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {submittedBids.map((bid: any) => (
                <div key={bid.id} className="bg-white dark:bg-slate-800 rounded-2xl p-6 border-l-4 border-l-blue-500 border-y border-r border-slate-200 dark:border-slate-700 shadow-sm flex flex-col h-full">
                  <div className="flex justify-between items-start mb-4">
                    <span className="bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                      {bid.status || 'PENDING'}
                    </span>
                    <span className="text-xs font-medium text-slate-400 dark:text-slate-400">{new Date(bid.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="mb-4">
                    <h4 className="text-base font-bold text-slate-900 dark:text-white leading-tight">{bid.project?.name || 'Project Bid'}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">{bid.project?.location || 'Location N/A'}</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900/60 rounded-xl p-4 border border-slate-100 dark:border-slate-700/60 mb-5 flex-1">
                    <p className="text-sm text-slate-600 dark:text-slate-300 italic line-clamp-2">"{bid.proposal || 'No description'}"</p>
                  </div>
                  <div className="flex justify-between items-center mt-auto border-t border-slate-100 dark:border-slate-700/60 pt-4">
                    <div>
                      <span className="block text-[10px] text-slate-400 uppercase font-bold mb-0.5">Quoted Amount</span>
                      <span className="font-bold text-blue-600 dark:text-blue-400 text-sm">
                        {bid.amount ? `₹${bid.amount.toLocaleString()}` : 'N/A'}
                      </span>
                    </div>
                    <button 
                      className="bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-slate-600 px-4 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2"
                      onClick={() => {
                        setSelectedBid({ ...bid, professional: profile?.user ? { professional: profile, ...profile.user } : profile });
                        setIsModalOpen(true);
                      }}
                    >
                      <Printer className="w-4 h-4" /> PDF Quote
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DashboardLayout>

      {/* Render Sub-Modals */}
      <QuoteDocumentModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} quote={selectedBid} />
      <SubscriptionModal isOpen={isSubModalOpen} onClose={() => setIsSubModalOpen(false)} />
    </>
  );
};

// Extracted UI Component for Stats
function StatCard({ bgGradient, icon, iconBg, title, value, textColor, valueSize = "text-4xl", suffix }: any) {
  return (
    <div className={`p-6 rounded-2xl shadow-sm border flex flex-col justify-between group hover:shadow-md transition-all dark:bg-slate-800 dark:border-slate-700/70 ${bgGradient}`}>
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 tracking-wider mb-2 uppercase">{title}</p>
          <div className="flex items-baseline">
            <h4 className={`${valueSize} font-extrabold ${textColor} dark:text-slate-100`}>{value}</h4>
            {suffix}
          </div>
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${iconBg}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}