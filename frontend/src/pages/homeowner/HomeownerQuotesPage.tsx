import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { apiRequest } from '../../lib/api';
import { QuoteDocumentModal } from '../../components/quote/QuoteDocumentModal';
import { 
  FileText, FileSpreadsheet, PlusCircle, MessageSquare, ArrowRight, 
  Clock, ShieldCheck, CheckCircle2, ChevronRight, Layers, Eye
} from 'lucide-react';

export const HomeownerQuotesPage: React.FC = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedQuote, setSelectedQuote] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchProjectsAndQuotes = async () => {
    try {
      setIsLoading(true);
      const res = await apiRequest('/projects/my-projects');
      if (res.data) {
        const list = Array.isArray(res.data) ? res.data : (res.data.projects || []);
        setProjects(list);
      }
    } catch (err) {
      console.error('Failed to fetch projects and quotes:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectsAndQuotes();
  }, []);

  const handleAcceptQuote = async (quoteId: string) => {
    if (!confirm('Are you sure you want to accept this quotation and award the contract?')) return;
    try {
      await apiRequest(`/quotes/${quoteId}/accept`, { method: 'POST' });
      alert('Quotation accepted! Contract draft generated.');
      fetchProjectsAndQuotes();
    } catch (err: any) {
      alert(err.message || 'Failed to accept quote.');
    }
  };

  // Extract all quotes across projects
  const allQuotes: Array<{ quote: any; project: any }> = [];
  projects.forEach((proj) => {
    const bids = proj.bids || proj.quotes || [];
    bids.forEach((b: any) => {
      allQuotes.push({ quote: b, project: proj });
    });
  });

  const filteredQuotes = selectedProjectId === 'ALL'
    ? allQuotes
    : allQuotes.filter((item) => item.project.id === selectedProjectId);

  const activeProjectsWithBids = projects.filter((p) => (p.bids?.length || p.quotes?.length || 0) > 0);

  return (
    <DashboardLayout title="Quotations & Proposals">
      <div className="space-y-6">
        {/* Header Banner */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="h-6 w-6 text-orange-500" />
              Contractor Quotations & Proposals
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Review line-item proposals, compare price breakdowns, and award verified contracts.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {activeProjectsWithBids.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const targetProj = selectedProjectId !== 'ALL' 
                    ? selectedProjectId 
                    : activeProjectsWithBids[0].id;
                  navigate(`/homeowner/projects/${targetProj}/compare`);
                }}
                className="text-xs border-orange-200 dark:border-orange-800 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950/30"
              >
                <FileSpreadsheet className="h-4 w-4 mr-1.5" />
                Side-by-Side Matrix View
              </Button>
            )}

            <Button
              size="sm"
              onClick={() => navigate('/homeowner/post-project')}
              className="text-xs"
            >
              <PlusCircle className="h-4 w-4 mr-1.5" /> Post New Project
            </Button>
          </div>
        </div>

        {/* Project Selector Pills */}
        {projects.length > 1 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setSelectedProjectId('ALL')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedProjectId === 'ALL'
                  ? 'bg-slate-900 text-white dark:bg-orange-600'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
              }`}
            >
              All Projects ({allQuotes.length})
            </button>
            {projects.map((proj) => {
              const count = proj.bids?.length || proj.quotes?.length || 0;
              const isSelected = selectedProjectId === proj.id;
              return (
                <button
                  key={proj.id}
                  onClick={() => setSelectedProjectId(proj.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-slate-900 text-white dark:bg-orange-600'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <span>{proj.title || proj.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${isSelected ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-800'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Main Content */}
        {isLoading ? (
          <div className="text-center py-16 text-slate-400 text-xs">
            Loading quotations...
          </div>
        ) : projects.length === 0 ? (
          <EmptyState
            icon={<FileSpreadsheet className="h-10 w-10 text-slate-400" />}
            title="No projects posted yet"
            description="Post your first construction or renovation project to start receiving itemized quotations from verified contractors."
            action={
              <Button onClick={() => navigate('/homeowner/post-project')}>
                Post New Project
              </Button>
            }
          />
        ) : filteredQuotes.length === 0 ? (
          <Card className="p-12 text-center text-xs text-slate-400 dark:text-slate-500">
            <Clock className="h-10 w-10 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
            <p className="font-bold text-slate-700 dark:text-slate-300 text-sm">No quotations received yet</p>
            <p className="mt-1 max-w-sm mx-auto">
              Verified professionals are reviewing your project. You will receive notifications as bids are submitted.
            </p>
            <div className="mt-4 flex justify-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/homeowner/find-professionals')}
              >
                Find & Invite Contractors
              </Button>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredQuotes.map(({ quote, project }) => {
              const profName =
                quote.professional?.professional?.businessName ||
                quote.professional?.businessName ||
                quote.professional?.name ||
                quote.professional?.email?.split('@')[0] ||
                'Verified Contractor';
              const profId = quote.professionalId || quote.professional?.id;
              const isAccepted = quote.status === 'ACCEPTED';
              const amount = quote.amount || quote.totalAmount || 0;

              return (
                <Card
                  key={quote.id}
                  className={`p-6 transition-all hover:shadow-md ${
                    isAccepted ? 'border-2 border-emerald-500 bg-emerald-50/10 dark:bg-emerald-950/20' : ''
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    {/* Contractor & Project Summary */}
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-base text-slate-900 dark:text-white">
                          {profName}
                        </h3>
                        <Badge variant="success" size="sm">
                          <ShieldCheck className="h-3 w-3 mr-1 inline" /> Verified
                        </Badge>
                        {isAccepted && (
                          <Badge variant="success" size="sm">
                            <CheckCircle2 className="h-3 w-3 mr-1 inline" /> Winning Contract
                          </Badge>
                        )}
                      </div>

                      <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">Project:</span>
                        <span>{project.title || project.name}</span>
                        <span>•</span>
                        <span>{project.city || project.location || 'India'}</span>
                      </p>

                      <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 mt-1">
                        {quote.proposal || quote.notes || quote.paymentTerms || 'Standard proposal specifications.'}
                      </p>
                    </div>

                    {/* Financials & Quick Actions */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 shrink-0">
                      <div className="sm:text-right">
                        <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                          Quote Amount
                        </span>
                        <span className="text-xl font-black text-orange-600 font-mono">
                          ₹{amount.toLocaleString()}
                        </span>
                        {quote.estimatedDays && (
                          <span className="block text-[11px] text-slate-500 dark:text-slate-400">
                            Est. {quote.estimatedDays} days
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs border-orange-200 dark:border-orange-800 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950/30"
                          onClick={() => {
                            setSelectedQuote({ ...quote, project });
                            setIsModalOpen(true);
                          }}
                        >
                          <Eye className="h-3.5 w-3.5 mr-1" /> View Quote
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs"
                          onClick={() => navigate(`/messages?userId=${profId}&projectId=${project.id}`)}
                        >
                          <MessageSquare className="h-3.5 w-3.5 mr-1" /> Chat
                        </Button>

                        {!isAccepted && project.status === 'POSTED' && (
                          <Button
                            size="sm"
                            variant="primary"
                            className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                            onClick={() => handleAcceptQuote(quote.id)}
                          >
                            Accept & Award
                          </Button>
                        )}

                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs"
                          onClick={() => navigate(`/homeowner/projects/${project.id}/compare`)}
                          title="Open full comparison matrix for this project"
                        >
                          <FileSpreadsheet className="h-3.5 w-3.5 mr-1" /> Compare All
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Formal Quote Proposal Document Modal */}
        <QuoteDocumentModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          quote={selectedQuote}
          onAccept={handleAcceptQuote}
        />
      </div>
    </DashboardLayout>
  );
};
