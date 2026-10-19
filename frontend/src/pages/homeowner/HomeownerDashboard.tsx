import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { apiRequest } from '../../lib/api';
import { 
  Plus, 
  FolderKanban, 
  Eye, 
  MapPin, 
  FileSpreadsheet, 
  CheckCircle2, 
  Clock, 
  Star, 
  Briefcase, 
  ArrowRight, 
  Layers, 
  MessageSquare,
  ShieldCheck,
  Building
} from 'lucide-react';

export const HomeownerDashboard: React.FC = () => {
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      const res = await apiRequest('/projects/my-projects');
      if (res.data) {
        setProjects(Array.isArray(res.data) ? res.data : (res.data.projects || []));
      }
    } catch (err) {
      console.error('Error loading homeowner projects:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
    const interval = setInterval(fetchProjects, 20000);
    return () => clearInterval(interval);
  }, []);

  // Aggregated proposal calculations across all projects
  const allBids: any[] = [];
  projects.forEach((p) => {
    if (p.bids && Array.isArray(p.bids)) {
      p.bids.forEach((b: any) => {
        allBids.push({ ...b, projectName: p.name, projectId: p.id });
      });
    }
  });

  const totalBidsCount = allBids.length;
  const activeProjectsCount = projects.filter((p) => p.status === 'ACTIVE' || p.status === 'POSTED' || p.status === 'MATCHING').length;
  const completedProjectsCount = projects.filter((p) => p.status === 'COMPLETED').length;

  return (
    <DashboardLayout title="Homeowner Dashboard & Project Hub">
      <div className="space-y-6">

        {/* Action Header Banner */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-800 to-[#1e1b4b] text-white p-6 sm:p-8 rounded-2xl border border-slate-800 shadow-md">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-orange-500/30">
              <Building className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold">Welcome to Your Construction Hub</h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                Post construction requirements, compare verified contractor proposals, and track milestone builds with escrow protection.
              </p>
            </div>
          </div>
          <Button 
            onClick={() => navigate('/homeowner/post-project')}
            className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-5 py-3 rounded-xl shadow-md whitespace-nowrap flex items-center gap-2 border-0"
          >
            <Plus className="w-4 h-4" /> Post New Project
          </Button>
        </div>

        {/* KPI Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">TOTAL PROJECTS</span>
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{projects.length}</span>
            </div>
            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-950/60 text-blue-600 rounded-xl flex items-center justify-center border border-blue-100 dark:border-blue-900">
              <FolderKanban className="w-6 h-6" />
            </div>
          </div>

          <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">CONTRACTOR PROPOSALS</span>
              <span className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">{totalBidsCount}</span>
            </div>
            <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 rounded-xl flex items-center justify-center border border-emerald-100 dark:border-emerald-900">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
          </div>

          <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">ACTIVE / IN MATCHING</span>
              <span className="text-3xl font-extrabold text-blue-600 dark:text-blue-400">{activeProjectsCount}</span>
            </div>
            <div className="w-12 h-12 bg-amber-50 dark:bg-amber-950/60 text-amber-600 rounded-xl flex items-center justify-center border border-amber-100 dark:border-amber-900">
              <Clock className="w-6 h-6" />
            </div>
          </div>

          <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">COMPLETED PROJECTS</span>
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{completedProjectsCount}</span>
            </div>
            <div className="w-12 h-12 bg-purple-50 dark:bg-purple-950/60 text-purple-600 rounded-xl flex items-center justify-center border border-purple-100 dark:border-purple-900">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Section 1: Contractor Proposals & Bid Comparisons */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Active Contractor Proposals</h3>
              <p className="text-xs text-slate-500">Live quotations submitted by verified construction professionals</p>
            </div>
            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold px-3 py-1 rounded-full">
              {allBids.length} Proposals Received
            </span>
          </div>

          {allBids.length === 0 ? (
            <Card className="p-8 text-center border-dashed">
              <FileSpreadsheet className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="font-bold text-slate-700 dark:text-slate-300 text-sm">No proposals submitted yet</p>
              <p className="text-xs text-slate-500 mt-1">Verified contractors review your posted requirements and will submit line-by-line quotes soon.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {allBids.slice(0, 6).map((bid) => {
                const proProfile = bid.professional?.professional;
                const proName = proProfile?.businessName || bid.professional?.name || 'Verified Contractor';
                const rating = proProfile?.rating || 5.0;
                return (
                  <Card key={bid.id} className="p-5 flex flex-col justify-between hover:shadow-md transition-shadow border-l-4 border-l-emerald-500">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide truncate max-w-[150px]">
                          {bid.projectName}
                        </span>
                        <Badge variant={bid.status === 'ACCEPTED' ? 'success' : 'neutral'}>
                          {bid.status || 'PENDING'}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-bold text-slate-900 dark:text-white text-base">{proName}</h4>
                        {proProfile?.verified && (
                          <span title="KYC Verified Contractor">
                            <ShieldCheck className="w-4 h-4 text-emerald-500 inline shrink-0" />
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1 text-xs text-amber-500 font-bold mb-3">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span>{rating.toFixed(1)} Rating</span>
                        <span className="text-slate-400 mx-1">•</span>
                        <span className="text-slate-500 font-medium">{proProfile?.profession || 'General Contractor'}</span>
                      </div>

                      <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-slate-800 mb-4 text-xs">
                        <p className="text-slate-600 dark:text-slate-400 italic line-clamp-2">
                          "{bid.proposal || 'Quotation submitted for architectural & construction phases.'}"
                        </p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between mt-auto">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase block font-semibold">Quoted Amount</span>
                        <span className="text-base font-extrabold text-blue-600 dark:text-blue-400 font-mono">
                          {bid.amount ? `₹${Number(bid.amount).toLocaleString()}` : 'Custom Scope'}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => navigate(`/homeowner/projects/${bid.projectId}/compare`)}
                        >
                          Compare Quotes
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Section 2: Projects & Milestone Tracking */}
        <div className="pt-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">My Projects & Milestone Execution</h3>
              <p className="text-xs text-slate-500">Track structural completion phases and release verified milestone payments</p>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-12 text-slate-400">Loading projects...</div>
          ) : projects.length === 0 ? (
            <Card className="p-12 text-center border-dashed">
              <FolderKanban className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">No active projects yet</h4>
              <p className="text-xs text-slate-500 mt-1 mb-5">Post your project requirements to start receiving verified contractor bids.</p>
              <Button onClick={() => navigate('/homeowner/post-project')} className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="w-4 h-4 mr-1.5" /> Post Your First Project
              </Button>
            </Card>
          ) : (
            <div className="space-y-4">
              {projects.map((proj) => {
                const milestones = proj.milestones || [];
                const doneMilestones = milestones.filter((m: any) => m.status === 'DONE' || m.progress === 100).length;
                const progressPct = milestones.length > 0 ? Math.round((doneMilestones / milestones.length) * 100) : 0;
                const bidsCount = proj.bids?.length || 0;

                return (
                  <Card key={proj.id} className="p-6 hover:shadow-md transition-shadow">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                      
                      {/* Left: Project Info */}
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-3">
                          <Badge variant={proj.status === 'ACTIVE' ? 'success' : proj.status === 'POSTED' ? 'orange' : 'neutral'}>
                            {proj.status || 'POSTED'}
                          </Badge>
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                            {proj.type || proj.projectType || 'Construction'}
                          </span>
                        </div>

                        <h4 className="text-lg font-bold text-slate-900 dark:text-white">{proj.name}</h4>

                        <p className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {proj.location || (proj.city ? `${proj.city}, ${proj.state || ''}` : 'Location N/A')}
                        </p>

                        <div className="flex flex-wrap items-center gap-4 pt-1 text-xs font-semibold text-slate-700 dark:text-slate-300">
                          <span>Budget: <span className="text-blue-600 font-bold">{proj.budget || 'Custom'}</span></span>
                          <span>Bids Received: <span className="text-emerald-600 font-bold">{bidsCount} Bids</span></span>
                          {milestones.length > 0 && (
                            <span>Milestones: <span className="text-purple-600 font-bold">{doneMilestones}/{milestones.length} Completed</span></span>
                          )}
                        </div>

                        {/* Progress Bar */}
                        {milestones.length > 0 && (
                          <div className="pt-2 max-w-md">
                            <div className="flex justify-between text-[11px] font-bold mb-1">
                              <span className="text-slate-500">Overall Progress</span>
                              <span className="text-emerald-600">{progressPct}%</span>
                            </div>
                            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                              <div className="bg-emerald-500 h-full transition-all duration-500" style={{ width: `${progressPct}%` }}></div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Right: Actions */}
                      <div className="flex flex-wrap items-center gap-3">
                        {bidsCount > 0 && (
                          <Button 
                            variant="primary" 
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                            onClick={() => navigate(`/homeowner/projects/${proj.id}/compare`)}
                          >
                            <FileSpreadsheet className="w-4 h-4 mr-1.5" /> Compare Quotes ({bidsCount})
                          </Button>
                        )}

                        <Button 
                          variant="outline"
                          onClick={() => navigate(`/homeowner/projects/${proj.id}`)}
                        >
                          <Eye className="w-4 h-4 mr-1.5" /> Project Details
                        </Button>

                        <Button 
                          variant="outline"
                          onClick={() => navigate(`/workspace/${proj.id}`)}
                        >
                          <Layers className="w-4 h-4 mr-1.5" /> Workspace
                        </Button>
                      </div>

                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </DashboardLayout>
  );
};