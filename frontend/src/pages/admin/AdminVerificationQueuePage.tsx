import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { apiRequest } from '../../lib/api';
import { DocumentViewerModal } from '../../components/admin/DocumentViewerModal';
import { CheckCircle2, XCircle, RefreshCw, FileText, Eye, ExternalLink, Loader2, ShieldCheck } from 'lucide-react';

export const AdminVerificationQueuePage: React.FC = () => {
  const [queue, setQueue] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadQueue = async () => {
    try {
      setIsLoading(true);
      const res = await apiRequest('/admin/verifications');
      if (res.data) setQueue(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadQueue();
  }, []);

  const handleReview = async (id: string, status: 'VERIFIED' | 'REJECTED' | 'RESUBMIT_REQUIRED') => {
    const notes = prompt(`Enter internal admin review notes for status [${status}]:`);
    try {
      await apiRequest(`/verification/admin/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status, adminNotes: notes }),
      });
      alert(`Verification document status updated to ${status}.`);
      loadQueue();
    } catch (err: any) {
      alert(err.message || 'Action failed.');
    }
  };

  const handleInspect = (e: React.MouseEvent, item: any) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  return (
    <AdminLayout title="Professional Verification Queue & Document Inspection">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-md">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-emerald-600 rounded-xl text-white">
              <Eye className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">KYC Document Inspection & Review Queue</h2>
              <p className="text-xs text-slate-400 mt-0.5">Inspect uploaded GST registration, trade licenses, and identity documents before approval</p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold bg-slate-800 text-emerald-400 px-3 py-1.5 rounded-lg border border-slate-700">
            {queue?.length || 0} Submissions
          </span>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-slate-400 text-xs font-semibold flex items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin mr-2 text-orange-500" /> Loading verification queue...
          </div>
        ) : (!queue || queue.length === 0) ? (
          <Card className="p-8 text-center text-xs text-slate-400">
            No verification documents submitted in queue.
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {queue.map((item) => {
              const docUrl = item.documentUrl || item.professionalProfile?.kycDocumentUrl;
              const company = item.professionalProfile?.companyName || 'Contractor Partner';

              return (
                <Card key={item.id} className="p-6 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant={item.status === 'VERIFIED' ? 'success' : item.status === 'REJECTED' ? 'danger' : 'warning'}>
                        {item.status || 'PENDING'}
                      </Badge>
                      <span className="text-[10px] font-mono text-slate-400">{new Date(item.createdAt).toLocaleDateString()}</span>
                    </div>

                    {/* Clickable Name Link */}
                    <h4
                      onClick={(e) => handleInspect(e, item)}
                      className="text-base font-bold text-orange-400 hover:underline cursor-pointer flex items-center"
                    >
                      {company} <ExternalLink className="h-3.5 w-3.5 ml-1.5 text-slate-400" />
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Owner: {item.professionalProfile?.fullName} • {item.professionalProfile?.user?.email}
                    </p>

                    <div className="mt-3 p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs space-y-1">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Document Type:</span>
                        <span className="font-bold text-slate-900 dark:text-white">{item.documentType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">ID / License No:</span>
                        <span className="font-mono text-orange-500 font-bold">{item.documentNumber || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Document Trigger & Action Bar */}
                  <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <Button
                      size="sm"
                      variant="primary"
                      className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold"
                      onClick={(e) => handleInspect(e, item)}
                    >
                      <Eye className="h-4 w-4 mr-1.5 text-orange-400" /> View Document & Inspect Image
                    </Button>

                    <div className="flex items-center justify-between gap-2">
                      <Button size="sm" variant="outline" className="flex-1 text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950" onClick={() => handleReview(item.id, 'VERIFIED')}>
                        <CheckCircle2 className="h-4 w-4 mr-1" /> Approve
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1 text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950" onClick={() => handleReview(item.id, 'RESUBMIT_REQUIRED')}>
                        <RefreshCw className="h-4 w-4 mr-1" /> Resubmit
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1 text-rose-600 dark:text-rose-400 border-rose-300 dark:border-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950" onClick={() => handleReview(item.id, 'REJECTED')}>
                        <XCircle className="h-4 w-4 mr-1" /> Reject
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* FULLSCREEN DOCUMENT VIEWER MODAL */}
        <DocumentViewerModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          item={selectedItem}
          onReview={handleReview}
        />
      </div>
    </AdminLayout>
  );
};
