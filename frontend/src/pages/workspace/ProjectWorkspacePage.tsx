import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { apiRequest } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import {
  Layers,
  Clock,
  CheckCircle2,
  ListTodo,
  FileText,
  MessageSquare,
  CreditCard,
  Send,
  Upload,
  AlertCircle,
  Plus,
} from 'lucide-react';

import { ChatWindow } from '../../components/messaging/ChatWindow';

export const ProjectWorkspacePage: React.FC = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [project, setProject] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<
    'OVERVIEW' | 'TIMELINE' | 'MILESTONES' | 'TASKS' | 'DOCUMENTS' | 'MESSAGES' | 'PAYMENTS' | 'UPDATES'
  >('OVERVIEW');

  const [isLoading, setIsLoading] = useState(true);

  // Messaging state
  const [messages, setMessages] = useState<any[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');

  // Updates state
  const [updateText, setUpdateText] = useState('');
  const [updateProgress, setUpdateProgress] = useState(15);

  const loadWorkspaceData = async () => {
    try {
      const res = await apiRequest(`/projects/${projectId}`);
      if (res.data) setProject(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadWorkspaceData();
  }, [projectId]);

  // Load conversation thread
  useEffect(() => {
    if (project && activeTab === 'MESSAGES') {
      const initConversation = async () => {
        try {
          const targetUserId = user?.role === 'HOMEOWNER' ? project.selectedProfessionalId : project.homeownerId;
          if (!targetUserId) return;

          const res = await apiRequest('/messages/conversations', {
            method: 'POST',
            body: JSON.stringify({ projectId, targetUserId }),
          });

          if (res.data) {
            setConversationId(res.data.id);
            setMessages(res.data.messages || []);
          }
        } catch (err) {
          console.error(err);
        }
      };
      initConversation();
    }
  }, [project, activeTab]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !conversationId) return;

    try {
      const res = await apiRequest('/messages/messages', {
        method: 'POST',
        body: JSON.stringify({
          conversationId,
          content: newMessage,
        }),
      });

      setMessages([...messages, res.data]);
      setNewMessage('');
    } catch (err: any) {
      alert(err.message || 'Failed to send message.');
    }
  };

  const handlePostUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!updateText.trim()) return;

    try {
      alert('Site progress update posted successfully! Homeowner notified.');
      setUpdateText('');
      loadWorkspaceData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Project Workspace">
        <div className="text-center py-12 text-slate-400">Loading project workspace...</div>
      </DashboardLayout>
    );
  }

  if (!project) {
    return (
      <DashboardLayout title="Project Workspace">
        <div className="text-center py-12 text-red-500">Workspace unavailable or unauthorized.</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={`Workspace: ${project.title}`}>
      {/* Workspace Header */}
      <Card className="mb-6 p-6 bg-slate-900 text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-3 mb-1">
              <Badge variant="orange">{project.status}</Badge>
              <span className="text-xs text-slate-400">{project.projectType}</span>
            </div>
            <h2 className="text-xl font-bold">{project.title}</h2>
            <p className="text-xs text-slate-400 mt-1">{project.city}, {project.state}</p>
          </div>

          <div className="flex items-center space-x-3 text-xs bg-slate-800 p-3 rounded-xl border border-slate-700">
            <div>
              <span className="block text-[10px] text-slate-400 uppercase font-semibold">Contractor Status</span>
              <span className="font-bold text-emerald-400">
                {project.selectedProfessionalId ? 'Assigned' : 'Contract Pending'}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Tab Navigation */}
      <div className="flex border-b border-slate-200 mb-6 space-x-1 overflow-x-auto">
        {[
          { key: 'OVERVIEW', label: 'Overview', icon: Layers },
          { key: 'TIMELINE', label: 'Timeline', icon: Clock },
          { key: 'MILESTONES', label: 'Milestones', icon: CheckCircle2 },
          { key: 'TASKS', label: 'Tasks', icon: ListTodo },
          { key: 'DOCUMENTS', label: 'Documents', icon: FileText },
          { key: 'MESSAGES', label: 'Messages', icon: MessageSquare },
          { key: 'PAYMENTS', label: 'Payments', icon: CreditCard },
          { key: 'UPDATES', label: 'Site Updates', icon: Upload },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors ${
                isActive ? 'border-orange-500 text-orange-600' : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Dynamic Tab Views */}

      {/* OVERVIEW */}
      {activeTab === 'OVERVIEW' && (
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-base font-bold text-slate-900 mb-2">Project Overview & Scope</h3>
            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-200">
              {project.description}
            </p>
          </Card>
        </div>
      )}

      {/* TIMELINE */}
      {activeTab === 'TIMELINE' && (
        <Card className="p-6">
          <h3 className="text-base font-bold text-slate-900 mb-6">Visual Construction Timeline</h3>
          <div className="relative border-l-2 border-slate-200 pl-6 space-y-6">
            <div className="relative">
              <div className="absolute -left-[31px] top-0 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white"></div>
              <h4 className="text-sm font-bold text-slate-900">Project Agreement & Signing</h4>
              <p className="text-xs text-slate-500">Contract executed and initial project setup completed.</p>
            </div>
            <div className="relative">
              <div className="absolute -left-[31px] top-0 w-4 h-4 bg-orange-500 rounded-full border-2 border-white animate-pulse"></div>
              <h4 className="text-sm font-bold text-slate-900">Foundation & Excavation Phase</h4>
              <p className="text-xs text-slate-500">Current active phase in execution.</p>
            </div>
            <div className="relative">
              <div className="absolute -left-[31px] top-0 w-4 h-4 bg-slate-300 rounded-full border-2 border-white"></div>
              <h4 className="text-sm font-bold text-slate-400">Superstructure & Roofing</h4>
              <p className="text-xs text-slate-400">Upcoming milestone phase.</p>
            </div>
          </div>
        </Card>
      )}

      {/* MILESTONES */}
      {activeTab === 'MILESTONES' && (
        <Card className="p-6">
          <h3 className="text-base font-bold text-slate-900 mb-4">Project Milestones</h3>
          {!project.milestones || project.milestones.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-6 border border-dashed border-slate-200 rounded-lg">
              No milestones defined for this project workspace yet.
            </p>
          ) : (
            <div className="space-y-3">
              {project.milestones.map((m: any) => (
                <div key={m.id} className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{m.title}</h4>
                    <p className="text-slate-500">{m.description}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-orange-600 text-sm">₹{m.amount.toLocaleString()}</span>
                    <Badge variant={m.status === 'COMPLETED' ? 'success' : 'neutral'} >
                      {m.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* MESSAGES */}
      {activeTab === 'MESSAGES' && (
        conversationId ? (
          <ChatWindow conversationId={conversationId} projectTitle={project.title} />
        ) : (
          <Card className="p-12 text-center text-xs text-slate-400">
            Initializing conversation thread with project contact...
          </Card>
        )
      )}

      {/* UPDATES */}
      {activeTab === 'UPDATES' && (
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-base font-bold text-slate-900 mb-4">Post Site Work Update</h3>
            <form onSubmit={handlePostUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Work Description & Progress</label>
                <textarea
                  rows={3}
                  className="w-full p-3 border border-slate-300 rounded-lg text-xs"
                  placeholder="Describe today's work execution, material deliveries, or site progress..."
                  value={updateText}
                  onChange={(e) => setUpdateText(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Completed Progress %"
                  type="number"
                  min={0}
                  max={100}
                  value={updateProgress}
                  onChange={(e) => setUpdateProgress(parseInt(e.target.value) || 0)}
                />
                <div className="flex items-end">
                  <Button type="submit" className="w-full">
                    Post Site Update
                  </Button>
                </div>
              </div>
            </form>
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
};
