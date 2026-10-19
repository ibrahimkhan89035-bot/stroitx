import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { apiRequest } from '../../lib/api';
import { useNavigate } from 'react-router-dom';
import { FileSpreadsheet, MapPin, Loader2, ArrowRight, Lock, AlertTriangle } from 'lucide-react';
import { SubscriptionModal } from '../../components/subscription/SubscriptionModal';

export const ProfessionalLeadsPage: React.FC = () => {
  const [leads, setLeads] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mandateError, setMandateError] = useState(false);
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const navigate = useNavigate();

  const loadLeads = async () => {
    try {
      setIsLoading(true);
      setMandateError(false);
      const res = await apiRequest('/projects/feed');
      if (res.data) {
        setLeads(Array.isArray(res.data) ? res.data : (res.data.feed || []));
      }
    } catch (err: any) {
      if (err.message && (err.message.includes('mandate') || err.message.includes('Mandate') || err.message.includes('trial') || err.message.includes('Trial'))) {
        setMandateError(true);
      }
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLeads();
  }, []);

  return (
    <DashboardLayout title="My Bids & Leads">
      <div className="space-y-6">
        <div className="flex justify-between items-center bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-md">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-orange-600 rounded-xl text-white">
              <FileSpreadsheet className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">My Leads & Submitted Bids</h2>
              <p className="text-xs text-slate-400 mt-0.5">Track quotation statuses, client responses, and bid progress</p>
            </div>
          </div>
          <Badge variant="orange" size="md">{leads.length} Active Leads</Badge>
        </div>

        {mandateError ? (
          <Card className="p-8 text-center max-w-xl mx-auto my-8">
            <div className="w-14 h-14 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Lock className="w-7 h-7" />
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-orange-50 text-orange-700 border border-orange-200 mb-3">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>₹2 Auto-Pay Mandate Required</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Authorize Mandate to View Leads</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
              An authorized ₹2 refundable mandate is required to view incoming homeowner project leads and submit quotations.
            </p>
            <Button onClick={() => setIsSubModalOpen(true)} className="bg-[#0f62fe] hover:bg-blue-700 text-white">
              Authorize ₹2 Mandate & Start 31-Day Trial
            </Button>
            <SubscriptionModal isOpen={isSubModalOpen} onClose={() => { setIsSubModalOpen(false); loadLeads(); }} />
          </Card>
        ) : isLoading ? (
          <div className="text-center py-12 text-slate-400 text-xs flex items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin mr-2 text-orange-500" /> Loading leads...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {leads.map((p) => {
              const hasBid = p.hasSubmittedBid || p.hasSubmittedQuote;
              return (
                <Card key={p.id} className="p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant={hasBid ? 'success' : 'orange'}>
                        {hasBid ? 'Bid Submitted' : 'Active Lead'}
                      </Badge>
                      <span className="text-xs text-slate-400">{p.type || p.projectType || 'General'}</span>
                    </div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base mb-1">{p.name || p.title}</h3>
                    <p className="text-xs text-slate-500 flex items-center mb-3">
                      <MapPin className="h-3.5 w-3.5 mr-1" /> {p.location || (p.city ? `${p.city}, ${p.state || ''}` : 'Location N/A')}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs">
                    <span className="font-mono text-slate-900 dark:text-white font-bold">{p.budget || (p.minBudget ? `₹${p.minBudget} - ₹${p.maxBudget}` : 'N/A')}</span>
                    <Button size="sm" onClick={() => navigate(`/professional/submit-quote/${p.id}`)}>
                      {hasBid ? 'Update Bid' : 'Submit Bid'} <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
