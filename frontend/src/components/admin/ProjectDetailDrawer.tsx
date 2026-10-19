import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { X, MapPin, User, CheckCircle2, AlertTriangle, Paperclip, DollarSign, Calendar, Clock, Layers, ShieldCheck, Printer, FileText } from 'lucide-react';
import { QuoteDocumentModal } from '../quote/QuoteDocumentModal';

interface ProjectDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  project: any | null;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onRequestChanges: (id: string) => void;
}

export const ProjectDetailDrawer: React.FC<ProjectDetailDrawerProps> = ({
  isOpen,
  onClose,
  project,
  onApprove,
  onReject,
  onRequestChanges,
}) => {
  const [selectedBid, setSelectedBid] = useState<any | null>(null);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);

  if (!isOpen || !project) return null;

  const homeownerName = project?.owner?.name || project?.owner?.email?.split('@')[0] || project?.homeowner?.email?.split('@')[0] || 'Homeowner Client';
  const bids = project?.bids || project?.quotes || [];

  const getPriorityBadge = (p: string) => {
    switch (p) {
      case 'URGENT':
        return <Badge variant="danger">🔴 URGENT</Badge>;
      case 'HIGH':
        return <Badge variant="orange">🟠 HIGH</Badge>;
      case 'LOW':
        return <Badge variant="neutral">⚪ LOW</Badge>;
      default:
        return <Badge variant="info">🟡 NORMAL</Badge>;
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex justify-end bg-black/70 backdrop-blur-xs transition-opacity duration-200"
      onClick={(e) => {
        e.stopPropagation();
        onClose();
      }}
    >
      {/* Slide-Out Drawer Panel */}
      <div
        className="w-full sm:w-[480px] h-full bg-slate-900 border-l border-slate-800 text-white shadow-2xl flex flex-col justify-between overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-6 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              {getPriorityBadge(project?.priority || project?.urgencyLevel || 'NORMAL')}
              <Badge variant={project?.status === 'ACTIVE' || project?.status === 'POSTED' ? 'success' : 'warning'}>
                {project?.status || 'POSTED'}
              </Badge>
            </div>
            <h3 className="text-lg font-black text-white truncate max-w-xs">{project?.name || project?.title}</h3>
            <p className="text-[10px] text-slate-400 font-mono">ID: #{project?.id?.substring(0, 8)}</p>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="text-slate-400 hover:text-white bg-slate-800 p-2 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Drawer Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-slate-300">
          {/* Location & Homeowner Details */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-medium">Homeowner Client:</span>
              <span className="font-bold text-white flex items-center">
                <span className="w-2 h-2 bg-emerald-500 rounded-full mr-1.5"></span>
                {homeownerName}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-medium">Location:</span>
              <span className="font-semibold text-orange-400 flex items-center">
                <MapPin className="h-3.5 w-3.5 mr-1" />
                {project?.location || (project?.address ? `${project.address}, ${project.city}` : project?.city || 'India')}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-medium">Category:</span>
              <span className="font-bold text-white">{project?.type || project?.projectType || 'General'}</span>
            </div>
          </div>

          {/* Budget */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <span className="block text-[10px] text-slate-400 font-bold uppercase">Client Budget Range</span>
            <span className="text-sm font-black text-white font-mono mt-1 block">
              {project?.budget || (project?.minBudget ? `₹${project.minBudget} - ₹${project.maxBudget}` : 'N/A')}
            </span>
          </div>

          {/* Submitted Bids & Proposals Section */}
          <div>
            <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Submitted Contractor Bids ({bids.length})</span>
            </h4>
            {bids.length === 0 ? (
              <p className="text-[11px] text-slate-500 italic p-3 bg-slate-950 rounded-xl border border-slate-800">
                No bids submitted for this project yet.
              </p>
            ) : (
              <div className="space-y-3">
                {bids.map((bid: any) => {
                  const profName = bid.professional?.professional?.businessName || bid.professional?.name || bid.professional?.email?.split('@')[0] || 'Pro Partner';
                  return (
                    <div key={bid.id} className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-xs">{profName}</span>
                        <span className="font-mono text-orange-400 font-bold">
                          {bid.amount ? `₹${bid.amount.toLocaleString()}` : 'N/A'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-2">{bid.proposal || 'Standard proposal'}</p>
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full text-[11px] border-slate-700 text-orange-400 hover:bg-slate-800 mt-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedBid({
                            ...bid,
                            project: project,
                          });
                          setIsQuoteModalOpen(true);
                        }}
                      >
                        <Printer className="h-3.5 w-3.5 mr-1" /> View Official Quotation PDF
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Detailed Description */}
          <div>
            <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-2">Project Description & Scope</h4>
            <p className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-slate-300 leading-relaxed">
              {project?.description || 'No detailed description provided.'}
            </p>
          </div>
        </div>

        {/* Action Controls Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="flex-1 text-amber-400 border-amber-500/50 hover:bg-amber-950/50 text-xs font-bold"
            onClick={(e) => {
              e.stopPropagation();
              onRequestChanges(project.id);
            }}
          >
            Request Changes
          </Button>

          <Button
            type="button"
            variant="danger"
            size="sm"
            className="flex-1 text-xs font-bold"
            onClick={(e) => {
              e.stopPropagation();
              onReject(project.id);
            }}
          >
            Reject
          </Button>

          <Button
            type="button"
            variant="primary"
            size="sm"
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
            onClick={(e) => {
              e.stopPropagation();
              onApprove(project.id);
            }}
          >
            Approve
          </Button>
        </div>
      </div>

      {/* Formal Quotation PDF Modal */}
      <QuoteDocumentModal
        isOpen={isQuoteModalOpen}
        onClose={() => setIsQuoteModalOpen(false)}
        quote={selectedBid}
      />
    </div>,
    document.body
  );
};
