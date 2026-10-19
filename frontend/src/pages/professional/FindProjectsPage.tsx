import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../../lib/api';
import { Briefcase, FileSpreadsheet, MapPin, Search, Lock, AlertTriangle } from 'lucide-react';
import { SubscriptionModal } from '../../components/subscription/SubscriptionModal';

export const FindProjectsPage: React.FC = () => {
  const [feed, setFeed] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [category, setCategory] = useState('');
  const [city, setCity] = useState('');
  const [mandateError, setMandateError] = useState(false);
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const navigate = useNavigate();

  const loadFeed = async () => {
    try {
      setIsLoading(true);
      setMandateError(false);
      const params = new URLSearchParams();
      if (category && category !== '' && category !== 'ALL') params.append('category', category);
      if (city && city.trim() !== '') params.append('city', city.trim());

      const res = await apiRequest(`/projects/feed?${params.toString()}`);
      if (res.data) {
        setFeed(Array.isArray(res.data) ? res.data : (res.data.feed || []));
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
    loadFeed();
  }, [category, city]);

  return (
    <DashboardLayout title="Construction Leads Marketplace">
      {/* Filters */}
      <Card className="mb-6 p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            options={[
              { label: 'All Construction Categories', value: '' },
              { label: 'New Construction', value: 'NEW_CONSTRUCTION' },
              { label: 'Renovation & Repair', value: 'RENOVATION' },
              { label: 'Interior Design', value: 'INTERIOR' },
              { label: 'Civil Work', value: 'CIVIL_WORK' },
              { label: 'Electrical', value: 'ELECTRICAL' },
              { label: 'Plumbing', value: 'PLUMBING' },
            ]}
          />
          <Input
            placeholder="City filter (e.g. Bengaluru, Mumbai)"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
        </div>
      </Card>

      {/* Feed Grid */}
      {mandateError ? (
        <Card className="p-8 text-center max-w-xl mx-auto my-8">
          <div className="w-14 h-14 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Lock className="w-7 h-7" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-orange-50 text-orange-700 border border-orange-200 mb-3">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>₹2 Mandate Required</span>
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Authorize Auto-Pay to Access Leads</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
            An authorized ₹2 auto-pay mandate is required to view live homeowner construction projects and submit quotations.
          </p>
          <Button onClick={() => setIsSubModalOpen(true)} className="bg-[#0f62fe] hover:bg-blue-700 text-white">
            Authorize ₹2 Mandate & Start 31-Day Trial
          </Button>
          <SubscriptionModal isOpen={isSubModalOpen} onClose={() => { setIsSubModalOpen(false); loadFeed(); }} />
        </Card>
      ) : isLoading ? (
        <div className="text-center py-12 text-slate-400">Searching active marketplace projects...</div>
      ) : feed.length === 0 ? (
        <EmptyState
          icon={<Briefcase className="h-8 w-8 text-slate-400" />}
          title="No construction projects found"
          description="Try broadening your category or city filters."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {feed.map((proj) => (
            <Card key={proj.id} className="flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Badge variant={proj.hasSubmittedBid ? "success" : "orange"}>{proj.hasSubmittedBid ? "Bid Submitted" : "Active Lead"}</Badge>
                  <span className="text-xs text-slate-400 font-medium">{proj.type || proj.projectType || 'General'}</span>
                </div>
                <h4 className="font-bold text-slate-900 dark:text-white text-base mb-1">{proj.name || proj.title}</h4>
                <p className="text-xs text-slate-500 flex items-center mb-3">
                  <MapPin className="h-3.5 w-3.5 mr-1 text-slate-400" />
                  {proj.location || (proj.city ? `${proj.city}, ${proj.state || ''}` : 'Location N/A')}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 mb-4 bg-slate-50 dark:bg-slate-800 p-3 rounded border border-slate-100 dark:border-slate-700">
                  {proj.description || 'No description provided.'}
                </p>
              </div>

              <div>
                <div className="border-t border-slate-100 dark:border-slate-800 pt-3 flex justify-between text-xs text-slate-700 dark:text-slate-300 mb-4 font-semibold">
                  <span>Budget: {proj.budget || 'N/A'}</span>
                </div>

                {proj.hasSubmittedBid ? (
                  <Badge variant="success" size="md" className="w-full text-center justify-center">
                    Bid Submitted
                  </Badge>
                ) : (
                  <Button size="sm" className="w-full" onClick={() => navigate(`/professional/submit-quote/${proj.id}`)}>
                    <FileSpreadsheet className="h-4 w-4 mr-1.5" /> Submit Bid
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};
