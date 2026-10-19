import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { apiRequest } from '../../lib/api';
import { Quote, Project } from '../../types';
import { QuoteDocumentModal } from '../../components/quote/QuoteDocumentModal';
import { CheckCircle2, ShieldCheck, Clock, FileSpreadsheet, ArrowLeft, FileText } from 'lucide-react';

export const QuoteComparisonPage: React.FC = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState<Project | null>(null);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const loadComparison = async () => {
      if (!projectId) {
        navigate('/homeowner/quotes', { replace: true });
        return;
      }
      try {
        const res = await apiRequest(`/quotes/project/${projectId}/compare`);
        if (res.data) {
          setProject(res.data.project);
          setQuotes(res.data.quotes);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    loadComparison();
  }, [projectId]);

  const handleAcceptQuote = async (quoteId: string) => {
    if (!confirm('Are you sure you want to accept this quotation and award the project contract?')) return;
    try {
      await apiRequest(`/quotes/${quoteId}/accept`, { method: 'POST' });
      alert('Quotation accepted! Contract draft generated.');
      navigate(`/homeowner/projects/${projectId}`);
    } catch (err: any) {
      alert(err.message || 'Failed to accept quote.');
    }
  };

  return (
    <DashboardLayout title="Quotation Comparison Matrix">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <button onClick={() => navigate(-1)} className="text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 flex items-center mb-1">
            <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Back
          </button>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">{project?.title || 'Project Quotations'}</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Side-by-side cost breakdown & timeline comparison</p>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-slate-400 dark:text-slate-500 text-xs">Loading quotation matrix...</div>
      ) : quotes.length === 0 ? (
        <EmptyState
          icon={<FileSpreadsheet className="h-8 w-8 text-slate-400" />}
          title="No quotes received yet"
          description="Interested professionals will submit itemized quotations here for your review."
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm text-xs">
            <thead>
              <tr className="bg-slate-900 dark:bg-slate-950 text-white divide-x divide-slate-800 dark:divide-slate-800">
                <th className="p-4 text-left w-48 font-semibold">Comparison Attribute</th>
                {quotes.map((q) => (
                  <th key={q.id} className="p-4 text-left min-w-[240px] font-semibold">
                    <div>
                      <p className="text-sm font-bold text-orange-400">{q.professional?.professionalProfile?.companyName || 'Contractor'}</p>
                      <p className="text-[10px] text-slate-400">{q.professional?.email}</p>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              <tr className="divide-x divide-slate-200 dark:divide-slate-800 bg-slate-50 dark:bg-slate-800/60 font-bold">
                <td className="p-4 text-slate-900 dark:text-white">Total Quotation Amount</td>
                {quotes.map((q) => (
                  <td key={q.id} className="p-4 text-orange-600 dark:text-orange-400 text-base font-extrabold font-mono">
                    ₹{q.totalAmount.toLocaleString()}
                  </td>
                ))}
              </tr>
              <tr className="divide-x divide-slate-200 dark:divide-slate-800">
                <td className="p-4 text-slate-600 dark:text-slate-400 font-semibold">Estimated Duration</td>
                {quotes.map((q) => (
                  <td key={q.id} className="p-4 font-semibold text-slate-900 dark:text-slate-200">
                    <Clock className="h-3.5 w-3.5 inline mr-1 text-slate-400" />
                    {q.estimatedDays} Days
                  </td>
                ))}
              </tr>
              <tr className="divide-x divide-slate-200 dark:divide-slate-800">
                <td className="p-4 text-slate-600 dark:text-slate-400 font-semibold">Verification Badge</td>
                {quotes.map((q) => (
                  <td key={q.id} className="p-4">
                    <Badge variant="success">
                      <ShieldCheck className="h-3 w-3 mr-1 inline" /> Verified Professional
                    </Badge>
                  </td>
                ))}
              </tr>
              <tr className="divide-x divide-slate-200 dark:divide-slate-800">
                <td className="p-4 text-slate-600 dark:text-slate-400 font-semibold">Subtotal (Items)</td>
                {quotes.map((q) => (
                  <td key={q.id} className="p-4 text-slate-700 dark:text-slate-300 font-mono">₹{q.subtotal.toLocaleString()}</td>
                ))}
              </tr>
              <tr className="divide-x divide-slate-200 dark:divide-slate-800">
                <td className="p-4 text-slate-600 dark:text-slate-400 font-semibold">Professional Fee</td>
                {quotes.map((q) => (
                  <td key={q.id} className="p-4 text-slate-700 dark:text-slate-300 font-mono">₹{q.professionalFee.toLocaleString()}</td>
                ))}
              </tr>
              <tr className="divide-x divide-slate-200 dark:divide-slate-800">
                <td className="p-4 text-slate-600 dark:text-slate-400 font-semibold">Payment Terms</td>
                {quotes.map((q) => (
                  <td key={q.id} className="p-4 text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{q.paymentTerms}</td>
                ))}
              </tr>
              <tr className="divide-x divide-slate-200 dark:divide-slate-800 bg-slate-50 dark:bg-slate-800/60">
                <td className="p-4 text-slate-900 dark:text-white font-bold">Action</td>
                {quotes.map((q) => (
                  <td key={q.id} className="p-4">
                    <div className="space-y-2">
                      <Button
                        size="sm"
                        variant="primary"
                        className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 text-xs"
                        onClick={() => {
                          setSelectedQuote(q);
                          setIsModalOpen(true);
                        }}
                      >
                        <FileText className="h-3.5 w-3.5 mr-1 text-orange-400" /> View Detailed Quote Document
                      </Button>
                      {q.status === 'ACCEPTED' ? (
                        <Badge variant="success" size="md" className="w-full justify-center">Contract Awarded</Badge>
                      ) : (
                        <Button size="sm" className="w-full" onClick={() => handleAcceptQuote(q.id)}>
                          Accept Quotation
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full text-xs"
                        onClick={() => navigate(`/messages?userId=${q.professionalId}&projectId=${projectId}`)}
                      >
                        Message Contractor
                      </Button>
                    </div>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Formal Quote Proposal Document Modal */}
      <QuoteDocumentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        quote={selectedQuote}
        onAccept={handleAcceptQuote}
      />
    </DashboardLayout>
  );
};
