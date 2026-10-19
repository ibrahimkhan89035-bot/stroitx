import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { apiRequest } from '../../lib/api';
import { Project } from '../../types';
import { MapPin, Calendar, FileSpreadsheet, Layers, MessageSquare, ArrowLeft, CheckCircle2, FileText, Clock, Award, ShieldCheck } from 'lucide-react';
import { QuoteDocumentModal } from '../../components/quote/QuoteDocumentModal';

export const ProjectDetailsPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadDetails = async () => {
    try {
      const res = await apiRequest(`/projects/${id}`);
      if (res.data) setProject(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDetails();
  }, [id]);

  const handleAcceptBid = async (bidId: string) => {
    const confirmAccept = window.confirm(
      'Are you sure you want to accept this bid? The project will be locked from further bidding and sent for Admin Verification.'
    );
    if (!confirmAccept) return;

    try {
      setIsProcessing(true);
      await apiRequest(`/projects/${id}/accept-bid`, {
        method: 'POST',
        body: JSON.stringify({ bidId }),
      });
      alert('Bid accepted! Project status updated to PENDING_AWARD for Admin verification.');
      loadDetails();
    } catch (err: any) {
      alert(err.message || 'Failed to accept bid.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRequestCompletion = async () => {
    const confirmComplete = window.confirm(
      'Are you sure you want to request project completion? This will be submitted to Admin for final verification.'
    );
    if (!confirmComplete) return;

    try {
      setIsProcessing(true);
      await apiRequest(`/projects/${id}/request-completion`, {
        method: 'POST',
      });
      alert('Completion requested! Submitted to Admin for final verification.');
      loadDetails();
    } catch (err: any) {
      alert(err.message || 'Failed to request completion.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Project Details">
        <div className="text-center py-12 text-slate-400">Loading project details...</div>
      </DashboardLayout>
    );
  }

  if (!project) {
    return (
      <DashboardLayout title="Project Details">
        <div className="text-center py-12 text-red-500">Project not found or access denied.</div>
      </DashboardLayout>
    );
  }

  const projStatus = project.status;
  const isPendingAward = projStatus === 'MATCHING';
  const isActiveAwarded = projStatus === 'ACTIVE';
  const isCompleted = projStatus === 'COMPLETED';

  return (
    <DashboardLayout title={`Project: ${(project as any).name || (project as any).title}`}>
      <button onClick={() => navigate('/homeowner/projects')} className="text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 flex items-center mb-4">
        <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Back to My Projects
      </button>

      {/* Status Warning Banner */}
      {isPendingAward && (
        <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 rounded-xl text-xs flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0" />
            <div>
              <p className="font-bold">Pending Admin Verification (Award)</p>
              <p className="text-[11px] text-amber-700 dark:text-amber-300">You have selected a contractor. Awaiting Admin verification to finalize contract award.</p>
            </div>
          </div>
          <Badge variant="warning">PENDING_AWARD</Badge>
        </div>
      )}

      {/* Overview Card */}
      <Card className="mb-8 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-6 mb-6">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <Badge variant={isCompleted ? 'success' : isActiveAwarded ? 'success' : isPendingAward ? 'warning' : 'info'}>
                {isPendingAward ? 'PENDING_AWARD' : projStatus}
              </Badge>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{(project as any).type || (project as any).projectType || 'General'}</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">{(project as any).name || (project as any).title}</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center mt-1">
              <MapPin className="h-3.5 w-3.5 mr-1 text-slate-400" />
              {(project as any).location || (project as any).city || 'Location N/A'}
            </p>
          </div>

          <div className="flex items-center space-x-3">
            {isActiveAwarded && (
              <Button variant="primary" size="sm" onClick={handleRequestCompletion} isLoading={isProcessing}>
                <CheckCircle2 className="h-4 w-4 mr-1.5" /> Request Project Completion
              </Button>
            )}
            <Button variant="outline" onClick={() => navigate(`/workspace/${project.id}`)}>
              <Layers className="h-4 w-4 mr-2" /> Workspace
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs text-slate-600 dark:text-slate-300">
          <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
            <span className="block text-[10px] text-slate-400 font-bold uppercase">Budget Range</span>
            <span className="font-bold text-slate-900 dark:text-white text-sm">{(project as any).budget || 'N/A'}</span>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
            <span className="block text-[10px] text-slate-400 font-bold uppercase">Category / Type</span>
            <span className="font-bold text-slate-900 dark:text-white text-sm">{(project as any).type || 'General'}</span>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
            <span className="block text-[10px] text-slate-400 font-bold uppercase">Bids Received</span>
            <span className="font-bold text-orange-600 dark:text-orange-400 text-sm">{(project as any).bids?.length || (project as any).quotes?.length || 0}</span>
          </div>
        </div>

        <div className="mt-6">
          <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">Scope & Description</h4>
          <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed bg-slate-50 dark:bg-slate-800/60 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
            {project.description || 'No description provided.'}
          </p>
        </div>
      </Card>

      {/* Submitted Quotes & Bids Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
          Submitted Bids & Proposals ({(project as any).bids?.length || (project as any).quotes?.length || 0})
        </h3>
        {!((project as any).bids?.length || (project as any).quotes?.length) ? (
          <p className="text-xs text-slate-500 dark:text-slate-400 py-6 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
            No bids or proposals submitted yet for this project.
          </p>
        ) : (
          <div className="space-y-4">
            {((project as any).bids || (project as any).quotes || []).map((b: any) => {
              const profId = b.professionalId || b.professional?.id;
              const isAccepted = b.status === 'ACCEPTED';

              return (
                <Card key={b.id} className={`p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${isAccepted ? 'border-2 border-emerald-500 bg-emerald-50/10 dark:bg-emerald-950/20' : ''}`}>
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                        {b.professional?.name || b.professional?.professional?.businessName || b.professional?.email || 'Verified Contractor'}
                      </h4>
                      {isAccepted && <Badge variant="success">Winning Bid</Badge>}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{b.proposal || 'No proposal notes'}</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5">
                    <div className="text-right mr-2">
                      <span className="block text-[10px] text-slate-400 font-bold uppercase">Bid Amount</span>
                      <span className="font-extrabold text-orange-600 dark:text-orange-400 text-base font-mono">
                        {b.amount ? `₹${b.amount.toLocaleString()}` : 'N/A'}
                      </span>
                    </div>

                    <Button
                      size="sm"
                      variant="primary"
                      className="text-xs bg-slate-900 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 text-white"
                      onClick={() => navigate(`/messages?userId=${profId}&projectId=${project.id}`)}
                    >
                      <MessageSquare className="h-3.5 w-3.5 mr-1 text-orange-400" /> Message Contractor
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs border-orange-200 dark:border-orange-800 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950/30"
                      onClick={() => {
                        setSelectedQuote({
                          ...b,
                          project,
                        });
                        setIsModalOpen(true);
                      }}
                    >
                      <FileText className="h-3.5 w-3.5 mr-1" /> View Official Quotation
                    </Button>

                    {!isAccepted && projStatus === 'POSTED' && (
                      <Button
                        size="sm"
                        variant="primary"
                        className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                        onClick={() => handleAcceptBid(b.id)}
                        isLoading={isProcessing}
                      >
                        <Award className="h-3.5 w-3.5 mr-1" /> Accept Bid & Award
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Formal Quote Proposal Document Modal */}
      <QuoteDocumentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        quote={selectedQuote}
      />
    </DashboardLayout>
  );
};
