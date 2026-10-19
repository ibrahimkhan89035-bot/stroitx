import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { StatCard } from '../../components/ui/StatCard';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { apiRequest } from '../../lib/api';
import { Users, ShieldCheck, Briefcase, CreditCard, DollarSign, CheckCircle2, XCircle, FileSpreadsheet, Printer } from 'lucide-react';
import { QuoteDocumentModal } from '../../components/quote/QuoteDocumentModal';

export const AdminDashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'APPROVALS' | 'MASTER' | 'BIDS' | 'INQUIRIES' | 'OVERVIEW'>('APPROVALS');
  const [metrics, setMetrics] = useState<any>(null);
  const [masterData, setMasterData] = useState<{ users: any[]; projects: any[]; bids: any[]; inquiries: any[] }>({
    users: [],
    projects: [],
    bids: [],
    inquiries: [],
  });
  const [approvalQueue, setApprovalQueue] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBid, setSelectedBid] = useState<any | null>(null);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);

  const loadAdminData = async () => {
    try {
      setIsLoading(true);
      const [overviewRes, masterRes, approvalsRes] = await Promise.all([
        apiRequest('/admin/overview'),
        apiRequest('/admin/master-view'),
        apiRequest('/admin/approvals'),
      ]);

      if (overviewRes.data) setMetrics(overviewRes.data);
      if (masterRes.data) {
        setMasterData({
          users: masterRes.data.users || [],
          projects: masterRes.data.projects || [],
          bids: masterRes.data.bids || [],
          inquiries: masterRes.data.inquiries || [],
        });
      }
      if (approvalsRes.data) setApprovalQueue(approvalsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleLifecycleAction = async (projectId: string, actionType: string) => {
    let reason: string | null = null;
    if (actionType.startsWith('REJECT')) {
      reason = prompt('Enter rejection reason for homeowner notification:') || 'Admin verification check failed';
    }

    try {
      await apiRequest(`/admin/projects/${projectId}/lifecycle`, {
        method: 'POST',
        body: JSON.stringify({ actionType, reason }),
      });
      alert(`Project status updated: [${actionType}] successfully.`);
      loadAdminData();
    } catch (err: any) {
      alert(err.message || 'Lifecycle action failed.');
    }
  };

  const handleApproveProject = async (projectId: string) => {
    try {
      await apiRequest(`/admin/projects/${projectId}/approve`, { method: 'PATCH' });
      alert('Project approved! Pushed live to contractor marketplace feed.');
      loadAdminData();
    } catch (err: any) {
      alert(err.message || 'Approval failed.');
    }
  };

  const handleRejectProject = async (projectId: string) => {
    const reason = prompt('Enter rejection reason:');
    try {
      await apiRequest(`/admin/projects/${projectId}/reject`, {
        method: 'PATCH',
        body: JSON.stringify({ reason }),
      });
      alert('Project rejected.');
      loadAdminData();
    } catch (err: any) {
      alert(err.message || 'Rejection failed.');
    }
  };

  return (
    <AdminLayout title="Admin Master Portal">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-black text-slate-900">Platform Control Console</h2>
          <p className="text-xs text-slate-500">Live Master View table, project approval queue & metrics</p>
        </div>

        <div className="flex bg-slate-200 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => setActiveTab('APPROVALS')}
            className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'APPROVALS' ? 'bg-slate-900 dark:bg-orange-600 text-white shadow-sm font-bold' : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            ⏳ Project Approvals ({approvalQueue.length})
          </button>
          <button
            onClick={() => setActiveTab('MASTER')}
            className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'MASTER' ? 'bg-slate-900 dark:bg-orange-600 text-white shadow-sm font-bold' : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            📊 Master Overview
          </button>
          <button
            onClick={() => setActiveTab('BIDS')}
            className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'BIDS' ? 'bg-slate-900 dark:bg-orange-600 text-white shadow-sm font-bold' : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            📑 Bids ({masterData.bids.length})
          </button>
          <button
            onClick={() => setActiveTab('INQUIRIES')}
            className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'INQUIRIES' ? 'bg-slate-900 dark:bg-orange-600 text-white shadow-sm font-bold' : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            💬 Inquiries ({masterData.inquiries.length})
          </button>
          <button
            onClick={() => setActiveTab('OVERVIEW')}
            className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'OVERVIEW' ? 'bg-slate-900 dark:bg-orange-600 text-white shadow-sm font-bold' : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            📈 Financial Metrics
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-slate-400">Loading master dataset...</div>
      ) : activeTab === 'APPROVALS' ? (
        <div className="space-y-8">
          {/* Admin Mediated Project Approvals Queue Table */}
          <Card className="p-0 overflow-hidden">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <h3 className="text-sm font-bold flex items-center">
                <Briefcase className="h-4 w-4 mr-2 text-orange-500" /> Admin-Mediated Project Approvals & Verification Queue
              </h3>
              <span className="text-xs text-slate-400 font-mono">{approvalQueue.length} Projects Pending Review</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-300 uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-3">Project Title</th>
                    <th className="p-3">Homeowner Client</th>
                    <th className="p-3">Accepted Contractor Bid</th>
                    <th className="p-3">Quoted Amount</th>
                    <th className="p-3">Lifecycle State</th>
                    <th className="p-3 text-center">Admin Verification Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {approvalQueue.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400">No project approvals or state transitions pending review at this moment.</td>
                    </tr>
                  ) : (
                    approvalQueue.map((p) => {
                      const acceptedBid = p.bids?.find((b: any) => b.status === 'ACCEPTED') || p.bids?.[0];
                      const contractorName = acceptedBid?.professional?.professional?.businessName || acceptedBid?.professional?.name || acceptedBid?.professional?.email || 'N/A';
                      const isPendingAward = p.status === 'MATCHING';

                      return (
                        <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
                          <td className="p-3 font-bold text-slate-900 dark:text-white">{p.name || p.title}</td>
                          <td className="p-3 font-semibold text-slate-700 dark:text-slate-300">{p.owner?.name || p.owner?.email}</td>
                          <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">{contractorName}</td>
                          <td className="p-3 font-mono font-bold text-orange-600 dark:text-orange-400">
                            {acceptedBid?.amount ? `₹${acceptedBid.amount.toLocaleString()}` : p.budget || 'N/A'}
                          </td>
                          <td className="p-3">
                            <Badge variant={isPendingAward ? 'warning' : p.status === 'ACTIVE' ? 'success' : 'info'}>
                              {isPendingAward ? 'PENDING_AWARD' : p.status}
                            </Badge>
                          </td>
                          <td className="p-3 text-center space-x-2">
                            <Button
                              size="sm"
                              variant="primary"
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                              onClick={() => handleLifecycleAction(p.id, isPendingAward ? 'APPROVE_AWARD' : 'APPROVE_COMPLETION')}
                            >
                              <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="danger"
                              className="font-bold"
                              onClick={() => handleLifecycleAction(p.id, isPendingAward ? 'REJECT_AWARD' : 'REJECT_COMPLETION')}
                            >
                              <XCircle className="h-3.5 w-3.5 mr-1" /> Reject
                            </Button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      ) : activeTab === 'OVERVIEW' ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <StatCard title="Total Users" value={metrics?.totalUsers || 0} icon={<Users className="h-5 w-5" />} />
            <StatCard title="Homeowners" value={metrics?.homeownersCount || 0} icon={<Users className="h-5 w-5" />} />
            <StatCard title="Professionals" value={metrics?.professionalsCount || 0} icon={<Users className="h-5 w-5" />} />
            <StatCard title="Verified Pros" value={metrics?.verifiedProfessionals || 0} icon={<ShieldCheck className="h-5 w-5" />} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
            <StatCard title="Total Projects" value={metrics?.totalProjects || 0} icon={<Briefcase className="h-5 w-5" />} />
            <StatCard title="Total Bids" value={masterData.bids.length || 0} icon={<FileSpreadsheet className="h-5 w-5" />} />
            <StatCard title="Direct Inquiries" value={masterData.inquiries.length || 0} icon={<FileSpreadsheet className="h-5 w-5" />} />
            <StatCard title="Processed Revenue" value={`₹${(metrics?.totalRevenue || 0).toLocaleString()}`} icon={<DollarSign className="h-5 w-5" />} />
          </div>
        </div>
      ) : activeTab === 'INQUIRIES' ? (
        <div className="space-y-8">
          {/* Inquiry & Lead Analytics Table */}
          <Card className="p-0 overflow-hidden">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <h3 className="text-sm font-bold flex items-center">
                <FileSpreadsheet className="h-4 w-4 mr-2 text-orange-500" /> Inquiry & Lead Analytics (Homeowner → Professional)
              </h3>
              <span className="text-xs text-slate-400 font-mono">{masterData.inquiries.length} Total Inquiries Logged</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-300 uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-3">Homeowner Client</th>
                    <th className="p-3">Target Business Name</th>
                    <th className="p-3">Professional Contact (Name, Email & Phone)</th>
                    <th className="p-3">Project / Context</th>
                    <th className="p-3">Inquiry Message</th>
                    <th className="p-3">Date Sent</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {masterData.inquiries.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400">No homeowner inquiries logged yet.</td>
                    </tr>
                  ) : (
                    masterData.inquiries.map((inq) => {
                      const proBusiness = inq.receiver?.professional?.businessName || 'Independent Contractor';
                      const proPersonName = inq.receiver?.name || 'Pro Partner';
                      const proEmail = inq.receiver?.email || 'N/A';
                      const proPhone = inq.receiver?.phone || 'N/A';
                      const homeownerName = inq.sender?.name || inq.sender?.email?.split('@')[0] || 'Homeowner Client';

                      return (
                        <tr key={inq.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
                          <td className="p-3 font-bold text-slate-900 dark:text-white">
                            {homeownerName}
                            <span className="block text-[10px] text-slate-400 font-mono font-normal">{inq.sender?.email}</span>
                          </td>
                          <td className="p-3 font-bold text-emerald-600 dark:text-emerald-400">{proBusiness}</td>
                          <td className="p-3 text-slate-700 dark:text-slate-300">
                            <span className="font-semibold block text-slate-900 dark:text-white">{proPersonName}</span>
                            <span className="text-[10px] text-slate-500 font-mono block">{proEmail} • 📱 {proPhone}</span>
                          </td>
                          <td className="p-3 font-medium text-slate-700 dark:text-slate-300">{inq.project?.name || 'Direct Discussion'}</td>
                          <td className="p-3 text-slate-600 dark:text-slate-400 italic line-clamp-2 max-w-xs">{inq.body}</td>
                          <td className="p-3 text-slate-400 font-mono">{new Date(inq.createdAt).toLocaleDateString()}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      ) : activeTab === 'BIDS' ? (
        <div className="space-y-8">
          {/* Dedicated Bids & Quotations Table */}
          <Card className="p-0 overflow-hidden">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <h3 className="text-sm font-bold flex items-center">
                <FileSpreadsheet className="h-4 w-4 mr-2 text-orange-500" /> Platform Submitted Bids & Formal Quotations
              </h3>
              <span className="text-xs text-slate-400 font-mono">{masterData.bids.length} Total Bids Submitted</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-300 uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-3">Project Name</th>
                    <th className="p-3">Professional / Business Name</th>
                    <th className="p-3">Quoted Amount</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Submitted Date</th>
                    <th className="p-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {masterData.bids.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400">No bids submitted across the platform yet.</td>
                    </tr>
                  ) : (
                    masterData.bids.map((b) => {
                      const profName = b.professional?.professional?.businessName || b.professional?.name || b.professional?.email?.split('@')[0] || 'Pro Partner';
                      return (
                        <tr key={b.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
                          <td className="p-3 font-bold text-slate-900 dark:text-white">{b.project?.name || 'Project'}</td>
                          <td className="p-3 font-semibold text-slate-700 dark:text-slate-300">{profName}</td>
                          <td className="p-3 font-mono font-bold text-orange-600 dark:text-orange-400">
                            {b.amount ? `₹${b.amount.toLocaleString()}` : 'N/A'}
                          </td>
                          <td className="p-3">
                            <Badge variant={b.status === 'ACCEPTED' ? 'success' : 'info'}>
                              {b.status || 'PENDING'}
                            </Badge>
                          </td>
                          <td className="p-3 text-slate-400 font-mono">{new Date(b.createdAt).toLocaleDateString()}</td>
                          <td className="p-3 text-center">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedBid(b);
                                setIsQuoteModalOpen(true);
                              }}
                            >
                              <Printer className="h-3.5 w-3.5 mr-1 text-orange-500" /> View Formal PDF Quote
                            </Button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Master Projects & Approval Table */}
          <Card className="p-0 overflow-hidden">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <h3 className="text-sm font-bold flex items-center">
                <Briefcase className="h-4 w-4 mr-2 text-orange-500" /> Project Submissions & Approval Workflow Queue
              </h3>
              <span className="text-xs text-slate-400 font-mono">{masterData.projects.length} Total Projects</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-300 uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-3">Project Title</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Homeowner</th>
                    <th className="p-3">Budget</th>
                    <th className="p-3">Approval Status</th>
                    <th className="p-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {masterData.projects.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
                      <td className="p-3 font-bold text-slate-900 dark:text-white">{p.name || p.title}</td>
                      <td className="p-3 text-slate-600 dark:text-slate-400">{p.type || p.projectType}</td>
                      <td className="p-3 text-slate-600 dark:text-slate-400 font-mono">{p.owner?.email || p.homeowner?.email}</td>
                      <td className="p-3 font-mono text-slate-900 dark:text-white font-semibold">{p.budget || 'N/A'}</td>
                      <td className="p-3">
                        <Badge variant={p.status === 'ACTIVE' || p.status === 'POSTED' ? 'success' : p.status === 'CANCELLED' ? 'danger' : 'warning'}>
                          {p.status || 'POSTED'}
                        </Badge>
                      </td>
                      <td className="p-3 text-center space-x-2">
                        {p.status !== 'ACTIVE' && (
                          <Button size="sm" variant="outline" className="text-emerald-600 hover:bg-emerald-50 border-emerald-300" onClick={() => handleApproveProject(p.id)}>
                            <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Approve
                          </Button>
                        )}
                        {p.status !== 'CANCELLED' && (
                          <Button size="sm" variant="outline" className="text-rose-600 hover:bg-rose-50 border-rose-300" onClick={() => handleRejectProject(p.id)}>
                            <XCircle className="h-3.5 w-3.5 mr-1" /> Cancel
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Master Users & Subscriptions Table */}
          <Card className="p-0 overflow-hidden">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <h3 className="text-sm font-bold flex items-center">
                <Users className="h-4 w-4 mr-2 text-orange-500" /> Platform Users, Subscriptions & KYC Status
              </h3>
              <span className="text-xs text-slate-400 font-mono">{masterData.users.length} Registered Accounts</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-300 uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-3">User Email</th>
                    <th className="p-3">Name</th>
                    <th className="p-3">Role</th>
                    <th className="p-3">Business / Profession</th>
                    <th className="p-3">Verification</th>
                    <th className="p-3">Joined Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {masterData.users.map((u) => {
                    const prof = u.professional;
                    return (
                      <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
                        <td className="p-3 font-bold text-slate-900 dark:text-white font-mono">{u.email}</td>
                        <td className="p-3 font-semibold text-slate-700 dark:text-slate-300">{u.name || 'N/A'}</td>
                        <td className="p-3">
                          <Badge variant={u.role === 'HOMEOWNER' ? 'info' : u.role === 'PROFESSIONAL' ? 'orange' : 'neutral'}>
                            {u.role}
                          </Badge>
                        </td>
                        <td className="p-3 font-semibold text-slate-700 dark:text-slate-300">
                          {u.role === 'PROFESSIONAL' ? (
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold">{prof?.businessName || prof?.profession || 'General'}</span>
                          ) : (
                            'N/A'
                          )}
                        </td>
                        <td className="p-3">
                          {u.role === 'PROFESSIONAL' ? (
                            <Badge variant={prof?.verified ? 'success' : 'warning'}>
                              {prof?.verified ? 'VERIFIED' : 'UNVERIFIED'}
                            </Badge>
                          ) : (
                            'N/A'
                          )}
                        </td>
                        <td className="p-3 text-slate-400 font-mono">{new Date(u.createdAt).toLocaleDateString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Master Bids & Formal Quotations Table */}
          <Card className="p-0 overflow-hidden">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <h3 className="text-sm font-bold flex items-center">
                <FileSpreadsheet className="h-4 w-4 mr-2 text-orange-500" /> Platform Submitted Bids & Formal Quotations
              </h3>
              <span className="text-xs text-slate-400 font-mono">{masterData.bids.length} Total Bids Submitted</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-300 uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-3">Project Name</th>
                    <th className="p-3">Professional / Business Name</th>
                    <th className="p-3">Quoted Amount</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Submitted Date</th>
                    <th className="p-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {masterData.bids.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400">No bids submitted across the platform yet.</td>
                    </tr>
                  ) : (
                    masterData.bids.map((b) => {
                      const profName = b.professional?.professional?.businessName || b.professional?.name || b.professional?.email?.split('@')[0] || 'Pro Partner';
                      return (
                        <tr key={b.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
                          <td className="p-3 font-bold text-slate-900 dark:text-white">{b.project?.name || 'Project'}</td>
                          <td className="p-3 font-semibold text-slate-700 dark:text-slate-300">{profName}</td>
                          <td className="p-3 font-mono font-bold text-orange-600 dark:text-orange-400">
                            {b.amount ? `₹${b.amount.toLocaleString()}` : 'N/A'}
                          </td>
                          <td className="p-3">
                            <Badge variant={b.status === 'ACCEPTED' ? 'success' : 'info'}>
                              {b.status || 'PENDING'}
                            </Badge>
                          </td>
                          <td className="p-3 text-slate-400 font-mono">{new Date(b.createdAt).toLocaleDateString()}</td>
                          <td className="p-3 text-center">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedBid(b);
                                setIsQuoteModalOpen(true);
                              }}
                            >
                              <Printer className="h-3.5 w-3.5 mr-1 text-orange-500" /> View Formal PDF Quote
                            </Button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* Formal PDF Quotation Document Modal */}
      <QuoteDocumentModal
        isOpen={isQuoteModalOpen}
        onClose={() => setIsQuoteModalOpen(false)}
        quote={selectedBid}
      />
    </AdminLayout>
  );
};