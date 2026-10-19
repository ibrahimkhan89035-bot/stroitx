import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { apiRequest } from '../../lib/api';
import { Briefcase, Plus, Eye, ArrowRight, FolderKanban } from 'lucide-react';

export const MyProjectsPage: React.FC = () => {
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await apiRequest('/projects/my-projects');
        if (res.data) {
          setProjects(Array.isArray(res.data) ? res.data : (res.data.projects || []));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProjects();
  }, []);

  return (
    <DashboardLayout title="My Construction Projects">
      
      {/* Top Action Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">All Projects</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Track status, compare quotations, and manage contractors</p>
        </div>
        <button 
          onClick={() => navigate('/homeowner/post-project')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-colors flex items-center gap-2 shadow-sm whitespace-nowrap"
        >
          <Plus className="w-4 h-4" /> Post New Project
        </button>
      </div>

      {/* Content Area */}
      {isLoading ? (
        <div className="text-center py-16 text-slate-400 font-medium">Loading your projects...</div>
      ) : projects.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 p-16 text-center shadow-sm">
          <div className="w-16 h-16 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-100 dark:border-blue-900/50">
            <FolderKanban className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">No active projects</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">You haven't posted any projects yet. Click above to start building your dream project!</p>
          <button 
            onClick={() => navigate('/homeowner/post-project')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl text-sm font-bold transition-colors inline-flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" /> Post New Project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {projects.map((proj: any) => (
            <div key={proj.id} className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-3">
                  <span className="bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    {proj.status || 'ACTIVE'}
                  </span>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{proj.type || proj.projectType || 'General'}</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{proj.name || proj.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1 font-medium">
                  <MapPinIcon className="w-4 h-4 text-slate-400" /> {proj.location || proj.city || 'Location N/A'}
                </p>
                <div className="flex items-center gap-6 pt-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span>Budget: <span className="text-blue-600 dark:text-blue-400">{proj.budget || 'N/A'}</span></span>
                  <span>Bids Received: <span className="text-emerald-600 dark:text-emerald-400">{proj.bidsCount || proj.bids?.length || 0} Bids</span></span>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                <button 
                  onClick={() => navigate(`/homeowner/projects/${proj.id}`)}
                  className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-5 py-2.5 rounded-xl text-sm font-bold transition-colors flex items-center gap-2"
                >
                  <Eye className="w-4 h-4" /> Manage
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

function MapPinIcon({ className }: { className?: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
      <circle cx="12" cy="10" r="3"></circle>
    </svg>
  );
}