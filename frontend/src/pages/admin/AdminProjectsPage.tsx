import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { apiRequest } from '../../lib/api';
import { ProjectDetailDrawer } from '../../components/admin/ProjectDetailDrawer';
import { Briefcase, CheckCircle2, XCircle, Eye, MapPin, Loader2 } from 'lucide-react';

export const AdminProjectsPage: React.FC = () => {
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<any | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const loadProjects = async () => {
    try {
      setIsLoading(true);
      const res = await apiRequest('/admin/master-view');
      if (res.data?.projects) setProjects(res.data.projects);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await apiRequest(`/admin/projects/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
      alert(`Project status updated to ${newStatus}!`);
      loadProjects();
    } catch (err: any) {
      alert(err.message || 'Status update failed.');
    }
  };

  const handleRejectStatus = async (id: string) => {
    const reason = prompt('Enter rejection reason:');
    if (reason === null) return; // User cancelled prompt
    try {
      await apiRequest(`/admin/projects/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'REJECTED', reason }),
      });
      alert('Project Submission Rejected.');
      loadProjects();
    } catch (err: any) {
      alert(err.message || 'Rejection failed.');
    }
  };

  const handleRequestChanges = async (id: string) => {
    const reason = prompt('Specify requested changes for homeowner:');
    if (!reason) return;
    try {
      await apiRequest(`/admin/projects/${id}/reject`, { 
        method: 'PATCH', 
        body: JSON.stringify({ reason: `Changes Requested: ${reason}` }) 
      });
      alert('Changes requested. Homeowner notified.');
      loadProjects();
    } catch (err: any) {
      alert(err.message || 'Request changes failed.');
    }
  };

  // Added missing handlers for the ProjectDetailDrawer
  const handleApprove = async (id: string) => {
    await handleUpdateStatus(id, 'POSTED');
    setIsDrawerOpen(false);
  };

  const handleReject = async (id: string) => {
    await handleRejectStatus(id);
    setIsDrawerOpen(false);
  };

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

  return (
    <AdminLayout title="Projects Management & Approval Queue">
      <div className="space-y-6">
        <div className="flex justify-between items-center bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-md">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-orange-600 rounded-xl text-white">
              <Briefcase className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Construction Bids & Approvals</h2>
              <p className="text-xs text-slate-400 mt-0.5">Review, approve, or request changes for homeowner project submissions</p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold bg-slate-800 text-orange-400 px-3 py-1.5 rounded-lg border border-slate-700">
            {projects?.length || 0} Projects Total
          </span>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-slate-400 text-xs font-semibold flex items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin mr-2 text-orange-500" /> Loading project list...
          </div>
        ) : (
          <Card className="p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-300 uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-3.5">Title</th>
                    <th className="p-3.5">Priority</th>
                    <th className="p-3.5">Location</th>
                    <th className="p-3.5">Bids</th>
                    <th className="p-3.5">Budget Range</th>
                    <th className="p-3.5">Approval Status</th>
                    <th className="p-3.5 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {(!projects || projects.length === 0) ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400">No project submissions found.</td>
                    </tr>
                  ) : (
                    projects?.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
                        <td className="p-3.5 font-bold text-slate-900 dark:text-white">{p.name || p.title}</td>
                        <td className="p-3.5">
                          {getPriorityBadge(p.priority || p.urgencyLevel || 'NORMAL')}
                        </td>
                        <td className="p-3.5 text-slate-600 dark:text-slate-300 flex items-center mt-2 sm:mt-0">
                          <MapPin className="h-3.5 w-3.5 mr-1 text-slate-400" />
                          {p.location || p.city || 'India'}
                        </td>
                        <td className="p-3.5 font-mono text-orange-600 dark:text-orange-400 font-bold">
                          {p.bids?.length || p.quotes?.length || 0} Bids
                        </td>
                        <td className="p-3.5 font-mono text-slate-900 dark:text-white font-semibold">
                          {p.budget || 'N/A'}
                        </td>
                        <td className="p-3.5">
                          <Badge
                            variant={
                              p.status === 'COMPLETED'
                                ? 'success'
                                : p.status === 'POSTED' || p.status === 'ACTIVE'
                                ? 'info'
                                : p.status === 'CANCELLED'
                                ? 'danger'
                                : 'warning'
                            }
                          >
                            {p.status === 'DRAFT' ? 'PENDING_REVIEW' : p.status === 'POSTED' ? 'PUBLISHED' : p.status}
                          </Badge>
                        </td>
                        <td className="p-3.5 text-center space-x-2">
                          <Button
                            size="sm"
                            variant="primary"
                            className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setSelectedProject(p);
                              setIsDrawerOpen(true);
                            }}
                          >
                            <Eye className="h-3.5 w-3.5 mr-1 text-orange-400" /> View
                          </Button>

                          {(p.status === 'DRAFT' || p.status === 'PENDING') && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-700 text-xs font-bold"
                              onClick={() => handleUpdateStatus(p.id, 'POSTED')}
                            >
                              <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Approve
                            </Button>
                          )}

                          {p.status === 'ACTIVE' && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-blue-600 dark:text-blue-400 border-blue-300 dark:border-blue-700 text-xs font-bold"
                              onClick={() => handleUpdateStatus(p.id, 'COMPLETED')}
                            >
                              <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Complete
                            </Button>
                          )}

                          {p.status !== 'CANCELLED' && p.status !== 'COMPLETED' && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-rose-600 dark:text-rose-400 border-rose-300 dark:border-rose-700 text-xs font-bold"
                              onClick={() => handleRejectStatus(p.id)}
                            >
                              <XCircle className="h-3.5 w-3.5 mr-1" /> Reject
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* TOP-LEVEL PROJECT DETAIL DRAWER */}
        <ProjectDetailDrawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          project={selectedProject}
          onApprove={handleApprove}
          onReject={handleReject}
          onRequestChanges={handleRequestChanges}
        />
      </div>
    </AdminLayout>
  );
};