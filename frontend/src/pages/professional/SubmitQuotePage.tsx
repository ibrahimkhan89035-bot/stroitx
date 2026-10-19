import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { apiRequest } from '../../lib/api';
import { QuoteItem } from '../../types';
import { Plus, Trash2, Calculator, ArrowLeft, Send } from 'lucide-react';

export const SubmitQuotePage: React.FC = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState<any>(null);
  const [items, setItems] = useState<QuoteItem[]>([
    { category: 'MATERIAL', description: 'Cement Grade 53 & Steel Rebar (Fe550)', quantity: 500, unit: 'Bags/Tons', unitRate: 420, totalRate: 210000 },
    { category: 'LABOUR', description: 'Masonry & Concrete Structural Team', quantity: 30, unit: 'Days', unitRate: 3500, totalRate: 105000 },
  ]);

  const [professionalFee, setProfessionalFee] = useState(15000);
  const [taxAmount, setTaxAmount] = useState(18000);
  const [discountAmount, setDiscountAmount] = useState(5000);
  const [estimatedDays, setEstimatedDays] = useState(60);
  const [paymentTerms, setPaymentTerms] = useState('20% Advance, 30% Plinth completion, 30% Slab completion, 20% Final Handover.');
  const [notes, setNotes] = useState('Includes material quality test reports and 12-month structural warranty.');
  const [validDays, setValidDays] = useState(30);

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadProject = async () => {
      try {
        const res = await apiRequest(`/projects/${projectId}`);
        if (res.data) setProject(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    loadProject();
  }, [projectId]);

  const handleAddItem = () => {
    setItems([
      ...items,
      { category: 'MATERIAL', description: '', quantity: 1, unit: 'SQFT', unitRate: 0, totalRate: 0 },
    ]);
  };

  const handleItemChange = (index: number, field: keyof QuoteItem, value: any) => {
    const updated = [...items];
    const item = { ...updated[index], [field]: value };

    if (field === 'quantity' || field === 'unitRate') {
      const q = parseFloat(item.quantity as any) || 0;
      const r = parseFloat(item.unitRate as any) || 0;
      item.totalRate = q * r;
    }

    updated[index] = item;
    setItems(updated);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  // Automatic Totals Calculation
  const subtotal = items.reduce((sum, item) => sum + (item.totalRate || 0), 0);
  const finalAmount = subtotal + professionalFee + taxAmount - discountAmount;

  const handleSubmitQuote = async () => {
    try {
      setIsLoading(true);

      // Submit Bid to backend endpoint which saves to Bid model in Prisma schema
      await apiRequest(`/projects/${projectId}/bid`, {
        method: 'POST',
        body: JSON.stringify({
          amount: finalAmount,
          proposal: `Payment Terms: ${paymentTerms}\nEstimated Days: ${estimatedDays}\nNotes: ${notes}`,
        }),
      });

      alert('Bid submitted successfully to homeowner!');
      navigate('/professional/dashboard');
    } catch (err: any) {
      alert(err.message || 'Failed to submit bid.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout title="Quotation Builder Tool">
      <button onClick={() => navigate(-1)} className="text-xs text-slate-500 hover:text-slate-700 flex items-center mb-4">
        <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Back to Leads
      </button>

      {project && (
        <Card className="mb-6 p-4 bg-slate-900 text-white">
          <h3 className="text-sm font-bold text-orange-400 mb-1">Building Quotation For:</h3>
          <p className="text-lg font-extrabold">{project?.name || project?.title || 'Project'}</p>
          <p className="text-xs text-slate-300">
            Client Budget: {project?.budget || (project?.minBudget ? `₹${project.minBudget} - ₹${project.maxBudget}` : 'N/A')} | Location: {project?.location || project?.city || 'N/A'}
          </p>
        </Card>
      )}

      {/* Itemized Line Items Table */}
      <Card className="mb-6 p-4 sm:p-6 overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">1. Line-Item Cost Breakdown</h3>
          <Button size="sm" variant="outline" onClick={handleAddItem}>
            <Plus className="h-4 w-4 mr-1" /> Add Line Item
          </Button>
        </div>

        <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
          <table className="w-full text-xs min-w-[620px]">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
                <th className="p-2.5 text-left w-32">Category</th>
                <th className="p-2.5 text-left">Description</th>
                <th className="p-2.5 text-center w-20">Qty</th>
                <th className="p-2.5 text-center w-24">Unit</th>
                <th className="p-2.5 text-right w-28">Rate (₹)</th>
                <th className="p-2.5 text-right w-32">Total (₹)</th>
                <th className="p-2.5 text-center w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {items.map((item, idx) => (
                <tr key={idx}>
                  <td className="p-2">
                    <Select
                      value={item.category}
                      onChange={(e) => handleItemChange(idx, 'category', e.target.value)}
                      options={[
                        { label: 'Labour', value: 'LABOUR' },
                        { label: 'Materials', value: 'MATERIAL' },
                        { label: 'Equipment', value: 'EQUIPMENT' },
                        { label: 'Transport', value: 'TRANSPORTATION' },
                        { label: 'Subcontractor', value: 'SUBCONTRACTOR' },
                        { label: 'Design', value: 'DESIGN' },
                        { label: 'Other', value: 'OTHER' },
                      ]}
                    />
                  </td>
                  <td className="p-2">
                    <Input
                      value={item.description}
                      onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                      placeholder="Line item scope description..."
                    />
                  </td>
                  <td className="p-2">
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(idx, 'quantity', parseFloat(e.target.value) || 0)}
                      className="text-center"
                    />
                  </td>
                  <td className="p-2">
                    <Input
                      value={item.unit}
                      onChange={(e) => handleItemChange(idx, 'unit', e.target.value)}
                      placeholder="SQFT, Bags"
                      className="text-center"
                    />
                  </td>
                  <td className="p-2">
                    <Input
                      type="number"
                      value={item.unitRate}
                      onChange={(e) => handleItemChange(idx, 'unitRate', parseFloat(e.target.value) || 0)}
                      className="text-right font-mono"
                    />
                  </td>
                  <td className="p-2 text-right font-bold text-slate-900 dark:text-white font-mono">
                    ₹{(item.totalRate || 0).toLocaleString()}
                  </td>
                  <td className="p-2 text-center">
                    <button onClick={() => handleRemoveItem(idx)} className="text-slate-400 hover:text-red-600 transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Automatic Financial Summary Card */}
        <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3 text-xs">
            <Input
              label="Professional Fee / Overhead (₹)"
              type="number"
              value={professionalFee}
              onChange={(e) => setProfessionalFee(parseFloat(e.target.value) || 0)}
            />
            <Input
              label="Taxes / GST (₹)"
              type="number"
              value={taxAmount}
              onChange={(e) => setTaxAmount(parseFloat(e.target.value) || 0)}
            />
            <Input
              label="Discount Amount (₹)"
              type="number"
              value={discountAmount}
              onChange={(e) => setDiscountAmount(parseFloat(e.target.value) || 0)}
            />
          </div>

          <div className="bg-slate-900 text-white p-6 rounded-xl flex flex-col justify-between">
            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex justify-between">
                <span>Items Subtotal:</span>
                <span className="font-mono">₹{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Professional Fee:</span>
                <span className="font-mono">+ ₹{professionalFee.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Taxes & GST:</span>
                <span className="font-mono">+ ₹{taxAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Discount:</span>
                <span className="font-mono text-emerald-400">- ₹{discountAmount.toLocaleString()}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-between mt-4">
              <span className="text-sm font-bold uppercase tracking-wider text-orange-400">Final Amount</span>
              <span className="text-2xl font-black text-white font-mono">₹{finalAmount.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Terms & Timeline Card */}
      <Card className="p-4 sm:p-6 mb-6">
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">2. Schedule, Payment Terms & Guarantee</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <Input
            label="Estimated Days to Complete"
            type="number"
            value={estimatedDays}
            onChange={(e) => setEstimatedDays(parseInt(e.target.value) || 0)}
          />
          <Input
            label="Quotation Validity (Days)"
            type="number"
            value={validDays}
            onChange={(e) => setValidDays(parseInt(e.target.value) || 0)}
          />
        </div>

        <div className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Payment Schedule & Terms</label>
            <textarea
              rows={3}
              className="w-full p-3 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
              value={paymentTerms}
              onChange={(e) => setPaymentTerms(e.target.value)}
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Warranty & Notes</label>
            <textarea
              rows={2}
              className="w-full p-3 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button size="lg" onClick={handleSubmitQuote} isLoading={isLoading}>
          <Send className="h-5 w-5 mr-2" /> Send Quotation to Homeowner
        </Button>
      </div>
    </DashboardLayout>
  );
};
