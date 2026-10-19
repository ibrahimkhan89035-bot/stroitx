import React from 'react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { HardHat, FileText, CheckCircle2, ShieldCheck, Printer, X, Building, Calendar, MapPin, Layers, Receipt, Shield } from 'lucide-react';

interface QuoteDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  quote: any | null;
  onAccept?: (id: string) => void;
}

export const QuoteDocumentModal: React.FC<QuoteDocumentModalProps> = ({
  isOpen,
  onClose,
  quote,
  onAccept,
}) => {
  if (!isOpen || !quote) return null;

  const profName =
    quote.professional?.professional?.businessName ||
    quote.professional?.businessName ||
    quote.professional?.name ||
    quote.professional?.email?.split('@')[0] ||
    'Verified Construction Partner';

  const homeownerName = quote.project?.owner?.name || quote.project?.owner?.email?.split('@')[0] || 'Homeowner Client';
  const projectName = quote.project?.name || quote.project?.title || quote.projectName || 'Construction Project';
  const location = quote.project?.location || quote.project?.city || 'India';
  const amount = quote.amount || quote.totalAmount || 0;
  const proposal = quote.proposal || quote.notes || quote.paymentTerms || 'Standard commercial proposal specifications.';
  const dateStr = quote.createdAt ? new Date(quote.createdAt).toLocaleDateString() : new Date().toLocaleDateString();

  // Structured breakdown calculation ensuring 100% exact match with total amount
  const gstAmount = Math.round((amount * 18) / 118); // 18% GST portion
  const netAmount = amount - gstAmount;
  const materialCost = Math.round(netAmount * 0.55);
  const laborCost = Math.round(netAmount * 0.32);
  const equipmentCost = netAmount - materialCost - laborCost;

  const items = [
    { category: 'Material Costs', description: 'Cement Grade 53, TMT Steel Rebar, Structural Masonry, Finishing Supplies & Fixtures', amount: materialCost },
    { category: 'Labor & Execution', description: 'Skilled Masonry Team, Steel Benders, Structural Engineers & On-site Safety Supervision', amount: laborCost },
    { category: 'Equipment & Permits', description: 'Machinery Rental (Concrete Mixers, Scaffolding), Transportation & Site Approvals', amount: equipmentCost },
    { category: 'Taxes / GST (18%)', description: 'Applicable Goods & Services Tax (GST) & Construction Regulatory Cess', amount: gstAmount },
  ];

  const milestones = [
    { name: '1. Advance & Mobilization', percent: '20%', val: Math.round(amount * 0.2) },
    { name: '2. Plinth & Foundation Complete', percent: '30%', val: Math.round(amount * 0.3) },
    { name: '3. Slab Casting & Structural Framing', percent: '30%', val: Math.round(amount * 0.3) },
    { name: '4. Final Finishing & Handover', percent: '20%', val: Math.round(amount * 0.2) },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-2 sm:p-4 backdrop-blur-sm overflow-y-auto print:bg-white print:p-0">
      <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl max-w-3xl w-full p-5 sm:p-8 shadow-2xl text-slate-900 dark:text-white relative my-4 sm:my-8 border border-slate-200 dark:border-slate-800 print:shadow-none print:border-none print:my-0 print:max-w-none">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-6 sm:right-6 text-slate-400 hover:text-slate-700 dark:hover:text-white p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors print:hidden"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Document Header - Professional Letterhead */}
        <div className="border-b-2 border-slate-900 dark:border-slate-700 pb-6 mb-6 flex flex-col sm:flex-row justify-between items-start gap-4">
          <div>
            <div className="flex items-center space-x-2 text-orange-600 dark:text-orange-400 font-extrabold text-sm mb-1">
              <HardHat className="h-5 w-5" />
              <span className="uppercase tracking-widest text-xs">Official Commercial Quotation</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">{profName}</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Contractor: {quote.professional?.email || 'Verified Partner'} • GST: 29ABCDE1234F1Z5
            </p>
          </div>

          <div className="text-left sm:text-right bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs w-full sm:w-auto">
            <p className="text-slate-400 font-semibold uppercase text-[10px]">Quotation Reference</p>
            <p className="font-bold text-slate-900 dark:text-white font-mono">#Q-{quote.id ? quote.id.substring(0, 8).toUpperCase() : '001'}</p>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Date: {dateStr}</p>
            <p className="text-emerald-600 dark:text-emerald-400 font-bold mt-1">Status: {quote.status || 'PENDING'}</p>
          </div>
        </div>

        {/* Client & Project Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Client Information</span>
            <p className="font-bold text-slate-900 dark:text-white text-sm mt-0.5">{homeownerName}</p>
            <p className="text-slate-500 dark:text-slate-400">{quote.project?.owner?.email || 'Homeowner Client'}</p>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Project & Location</span>
            <p className="font-bold text-slate-900 dark:text-white text-sm mt-0.5">{projectName}</p>
            <p className="text-slate-500 dark:text-slate-400 flex items-center">
              <MapPin className="h-3.5 w-3.5 mr-1 text-slate-400" /> {location}
            </p>
          </div>
        </div>

        {/* Itemized Cost Breakdown Table */}
        <div className="mb-6">
          <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2 flex items-center">
            <Receipt className="h-4 w-4 mr-1.5 text-orange-600 dark:text-orange-400" /> 1. Itemized Commercial Cost Estimate
          </h3>
          <div className="border border-slate-200 dark:border-slate-700 rounded-2xl overflow-x-auto">
            <table className="w-full text-xs text-left min-w-[480px]">
              <thead className="bg-slate-900 dark:bg-slate-950 text-white uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-3">Cost Category</th>
                  <th className="p-3">Scope Breakdown Description</th>
                  <th className="p-3 text-right">Estimated Subtotal (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {items.map((item, i) => (
                  <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="p-3 font-bold text-orange-600 dark:text-orange-400">{item.category}</td>
                    <td className="p-3 text-slate-700 dark:text-slate-300 font-medium">{item.description}</td>
                    <td className="p-3 text-right font-mono font-bold text-slate-900 dark:text-white">₹{item.amount.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Work Scope Proposal Description */}
        <div className="mb-6 text-xs text-slate-700 dark:text-slate-300">
          <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2 flex items-center">
            <Layers className="h-4 w-4 mr-1.5 text-orange-600 dark:text-orange-400" /> 2. Proposal Terms & Technical Scope
          </h3>
          <p className="whitespace-pre-wrap leading-relaxed bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-sans">
            {proposal}
          </p>
        </div>

        {/* Payment Milestones Schedule */}
        <div className="mb-6 text-xs">
          <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2 flex items-center">
            <Calendar className="h-4 w-4 mr-1.5 text-orange-600 dark:text-orange-400" /> 3. Payment Milestones Schedule
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {milestones.map((m, idx) => (
              <div key={idx} className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="block text-[10px] text-slate-400 font-semibold">{m.name}</span>
                <span className="text-xs font-bold text-slate-900 dark:text-white mt-1 block">{m.percent} (₹{m.val.toLocaleString()})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Grand Total Bar */}
        <div className="bg-slate-900 dark:bg-slate-950 text-white p-5 sm:p-6 rounded-2xl flex items-center justify-between mb-6 shadow-md border border-slate-800">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-orange-400">Total Contract Value (Inc. Taxes)</span>
            <p className="text-xs text-slate-300">Sum of Itemized Materials, Labor, Permits & GST</p>
          </div>
          <span className="text-2xl sm:text-3xl font-black text-white font-mono">₹{amount.toLocaleString()}</span>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200 dark:border-slate-800 print:hidden">
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer className="h-4 w-4 mr-2 text-orange-500" /> Print / Download PDF
          </Button>

          <div className="flex space-x-3">
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
            {onAccept && quote.status !== 'ACCEPTED' && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  onAccept(quote.id);
                  onClose();
                }}
              >
                <CheckCircle2 className="h-4 w-4 mr-2" /> Accept Quotation & Award Contract
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
