import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { apiRequest } from '../../lib/api';
import { ShieldAlert, ShieldCheck, Upload, FileCheck, CheckCircle2, Clock, Loader2, FileText } from 'lucide-react';

export const VerificationPage: React.FC = () => {
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [documentType, setDocumentType] = useState('GST_REGISTRATION');
  const [documentNumber, setDocumentNumber] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const loadStatus = async () => {
    try {
      const res = await apiRequest('/verification/status');
      if (res.data) setProfile(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStatus();
  }, []);

  const handleSubmitDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!documentNumber.trim()) {
      alert('Please enter document / license identification number.');
      return;
    }

    try {
      setIsSubmitting(true);
      setStatusMessage('');

      const formData = new FormData();
      formData.append('documentType', documentType);
      formData.append('documentNumber', documentNumber);
      if (file) {
        formData.append('kycDoc', file);
      }

      // Submit file & KYC record to API
      const token = localStorage.getItem('stroitx_token');
      const response = await fetch('/api/verification/upload', {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });

      const res = await response.json();

      if (!response.ok) {
        throw new Error(res.message || 'Upload failed.');
      }

      setStatusMessage('🎉 KYC document uploaded and submitted for Admin review!');
      alert('🎉 Verification document uploaded successfully! Admin will review your KYC document.');
      setDocumentNumber('');
      setFile(null);
      loadStatus();
    } catch (err: any) {
      alert(err.message || 'Upload failed.');
      setStatusMessage(`❌ Upload error: ${err.message || 'Failed'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout title="Professional Verification Portal">
      {/* Current Status Header */}
      <Card className="mb-8 p-6 bg-slate-900 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-slate-800 rounded-xl">
              {profile?.verificationStatus === 'VERIFIED' ? (
                <ShieldCheck className="h-8 w-8 text-emerald-500" />
              ) : (
                <ShieldAlert className="h-8 w-8 text-orange-500" />
              )}
            </div>
            <div>
              <span className="text-xs text-slate-400 uppercase font-semibold">KYC Verification Status</span>
              <h2 className="text-xl font-bold text-white flex items-center mt-0.5">
                {profile?.verificationStatus || 'NOT_SUBMITTED'}
              </h2>
            </div>
          </div>
          <Badge variant={profile?.verificationStatus === 'VERIFIED' ? 'success' : 'warning'}>
            {profile?.verificationStatus || 'PENDING'}
          </Badge>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Document Upload Form */}
        <Card className="p-6">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">Upload KYC Verification Document</h3>

          {statusMessage && (
            <div className={`mb-4 p-3 rounded-lg text-xs font-semibold border ${statusMessage.startsWith('🎉') ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'}`}>
              {statusMessage}
            </div>
          )}

          <form onSubmit={handleSubmitDoc} className="space-y-4">
            <Select
              label="Document Type"
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              options={[
                { label: 'GST Registration Certificate', value: 'GST_REGISTRATION' },
                { label: 'Business Registration / MSME / Trade License', value: 'BUSINESS_LICENSE' },
                { label: 'Identity Proof (Aadhaar / PAN)', value: 'IDENTITY_PROOF' },
                { label: 'Professional Trade Certification', value: 'TRADE_CERTIFICATE' },
              ]}
            />

            <Input
              label="Document / License Identification Number"
              placeholder="e.g. 29ABCDE1234F1Z5"
              value={documentNumber}
              onChange={(e) => setDocumentNumber(e.target.value)}
              required
            />

            <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-6 text-center bg-slate-50 dark:bg-slate-950">
              <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Upload Image (JPG, PNG) or PDF Document</p>
              <input
                type="file"
                accept="image/*,.pdf"
                className="mt-3 text-xs w-full max-w-xs mx-auto text-slate-600 dark:text-slate-400"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                required
              />
              {file && (
                <p className="mt-2 text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center justify-center">
                  <FileText className="h-4 w-4 mr-1" /> {file.name} ready for upload
                </p>
              )}
            </div>

            <Button type="submit" className="w-full" isLoading={isSubmitting}>
              {isSubmitting ? 'Uploading KYC Document...' : 'Submit Verification Document'}
            </Button>
          </form>
        </Card>

        {/* Verification History & Audit Log */}
        <Card className="p-6">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">Submitted Verification History</h3>
          {!profile?.verifications || profile.verifications.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
              No verification documents submitted yet.
            </p>
          ) : (
            <div className="space-y-3">
              {profile.verifications.map((doc: any) => (
                <div key={doc.id} className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white">{doc.documentType}</span>
                    <p className="text-[10px] text-slate-500 font-mono">ID: {doc.documentNumber || 'No Doc Number'}</p>
                    {doc.documentUrl && (
                      <a href={doc.documentUrl} target="_blank" rel="noreferrer" className="text-[10px] text-orange-500 hover:underline font-semibold block mt-0.5">
                        View Uploaded Image →
                      </a>
                    )}
                    {doc.adminNotes && <p className="text-[10px] text-orange-600 mt-1">Note: {doc.adminNotes}</p>}
                  </div>
                  <Badge variant={doc.status === 'VERIFIED' ? 'success' : doc.status === 'REJECTED' ? 'danger' : 'warning'}>
                    {doc.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
};
