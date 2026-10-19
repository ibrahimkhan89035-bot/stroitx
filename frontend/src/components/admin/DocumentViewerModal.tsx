import React from 'react';
import { createPortal } from 'react-dom';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { CheckCircle2, XCircle, RefreshCw, Eye, X, ExternalLink, FileText, ShieldAlert } from 'lucide-react';

interface DocumentViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: any | null;
  onReview: (id: string, status: 'VERIFIED' | 'REJECTED' | 'RESUBMIT_REQUIRED') => void;
}

export const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({
  isOpen,
  onClose,
  item,
  onReview,
}) => {
  if (!isOpen || !item) return null;

  const docUrl = item.documentUrl || item.professionalProfile?.kycDocumentUrl || item.kycDocumentUrl;
  const isPdf = docUrl && docUrl.toLowerCase().endsWith('.pdf');
  const prof = item.professionalProfile || item;

  // Explicit Backend Base URL to bypass Vite SPA Router navigation to "/"
  const BACKEND_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000';
  const cleanDocPath = docUrl ? docUrl.replace(/^\//, '') : '';

  const token = localStorage.getItem('stroitx_token') || '';
  const tokenQuery = token ? `token=${encodeURIComponent(token)}` : '';

  const rawUrl = docUrl
    ? docUrl.startsWith('http')
      ? docUrl
      : `${BACKEND_URL.replace(/\/$/, '')}/${cleanDocPath}`
    : '';

  const fullDocUrl = rawUrl
    ? tokenQuery
      ? `${rawUrl}${rawUrl.includes('?') ? '&' : '?'}${tokenQuery}`
      : rawUrl
    : '';

  const handleOpenStrictInNewTab = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (fullDocUrl) {
      window.open(fullDocUrl, '_blank', 'noopener,noreferrer');
    } else {
      alert('Document URL is missing');
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto"
      onClick={(e) => {
        e.stopPropagation();
        onClose();
      }}
    >
      {/* Main Modal Container Card */}
      <div
        className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full p-6 sm:p-8 text-white shadow-2xl relative my-8 space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="absolute top-6 right-6 text-slate-400 hover:text-white bg-slate-800 p-2 rounded-full transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-2 mb-1">
            <Badge variant={item.status === 'VERIFIED' ? 'success' : item.status === 'REJECTED' ? 'danger' : 'warning'}>
              {item.status || 'PENDING'}
            </Badge>
            <span className="text-xs font-bold text-orange-400 uppercase tracking-wider">{item.documentType || 'KYC DOCUMENT'}</span>
          </div>
          <h2 className="text-xl font-extrabold text-white">{prof?.companyName || prof?.fullName || 'Contractor Partner'}</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Owner: {prof?.fullName} • {prof?.user?.email || item.email} • ID: {item.documentNumber || 'N/A'}
          </p>
        </div>

        {/* Document Viewer Screen */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-center min-h-[300px] flex flex-col items-center justify-center relative">
          {!docUrl ? (
            <div className="text-center py-12 text-slate-400 space-y-2">
              <ShieldAlert className="h-10 w-10 text-amber-500 mx-auto" />
              <p className="text-sm font-bold text-white">No KYC Document Uploaded.</p>
              <p className="text-xs text-slate-500">This professional registered without attaching a scanned document.</p>
            </div>
          ) : isPdf ? (
            <div className="py-8 text-center space-y-3">
              <FileText className="h-12 w-12 text-orange-500 mx-auto" />
              <p className="text-sm font-bold text-white truncate max-w-md mx-auto">{docUrl.split('/').pop()}</p>
              <button
                type="button"
                onClick={handleOpenStrictInNewTab}
                className="inline-flex items-center px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                <ExternalLink className="h-4 w-4 mr-1.5" /> Open Full PDF Document
              </button>
            </div>
          ) : (
            <div className="w-full flex flex-col items-center justify-center space-y-3">
              <img
                src={fullDocUrl}
                alt="Uploaded KYC Document"
                className="max-h-[55vh] w-auto object-contain rounded-xl border border-slate-800 shadow-lg"
              />
              <button
                type="button"
                onClick={handleOpenStrictInNewTab}
                className="inline-flex items-center px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-orange-400 font-bold rounded-lg text-xs border border-slate-700 transition-colors cursor-pointer"
              >
                <ExternalLink className="h-3.5 w-3.5 mr-1.5" /> Open Document Image in New Tab
              </button>
            </div>
          )}
        </div>

        {/* Action Buttons Directly Inside Modal */}
        <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full sm:w-auto border-slate-700 text-slate-300 hover:bg-slate-800"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
          >
            Close Inspection
          </Button>

          <div className="flex w-full sm:w-auto space-x-2">
            <Button
              type="button"
              size="sm"
              className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
              onClick={(e) => {
                e.stopPropagation();
                onReview(item.id, 'VERIFIED');
                onClose();
              }}
            >
              <CheckCircle2 className="h-4 w-4 mr-1.5" /> Approve KYC
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              className="flex-1 sm:flex-none text-amber-400 border-amber-500/50 hover:bg-amber-950/50 font-bold"
              onClick={(e) => {
                e.stopPropagation();
                onReview(item.id, 'RESUBMIT_REQUIRED');
                onClose();
              }}
            >
              <RefreshCw className="h-4 w-4 mr-1.5" /> Request Resubmit
            </Button>

            <Button
              type="button"
              variant="danger"
              size="sm"
              className="flex-1 sm:flex-none font-bold"
              onClick={(e) => {
                e.stopPropagation();
                onReview(item.id, 'REJECTED');
                onClose();
              }}
            >
              <XCircle className="h-4 w-4 mr-1.5" /> Reject KYC
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
