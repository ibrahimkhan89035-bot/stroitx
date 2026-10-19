import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { apiRequest } from '../lib/api';
import { useAuth } from '../lib/auth';
import { ChatWindow } from '../components/messaging/ChatWindow';
import { MessageSquare, Search, User, Briefcase, ChevronRight } from 'lucide-react';

export const MessagesPage: React.FC = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const targetUserIdFromUrl = searchParams.get('userId');
  const projectIdFromUrl = searchParams.get('projectId');

  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConv, setActiveConv] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [isLoading, setIsLoading] = useState(true);

  const [accessError, setAccessError] = useState('');

  // Load conversations list & auto-initiate thread if targetUserId URL param is present
  const loadConversations = async () => {
    try {
      setIsLoading(true);
      setAccessError('');
      const res = await apiRequest('/messages/conversations');
      let convs = res.data || [];

      // If URL contains targetUserId, open or create direct conversation
      if (targetUserIdFromUrl) {
        try {
          const initRes = await apiRequest('/messages/conversations', {
            method: 'POST',
            body: JSON.stringify({
              targetUserId: targetUserIdFromUrl,
              projectId: projectIdFromUrl || null,
            }),
          });

          if (initRes.data) {
            const created = initRes.data;
            if (!convs.some((c: any) => c.id === created.id)) {
              convs = [created, ...convs];
            }
            setActiveConv(created);
          }
        } catch (initErr: any) {
          setAccessError(initErr.message || 'Access denied to initiate conversation.');
        }
      } else if (convs.length > 0 && !activeConv) {
        setActiveConv(convs[0]);
      }

      setConversations(convs);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadConversations();
  }, [targetUserIdFromUrl]);

  const getContactInfo = (conv: any) => {
    if (!conv) return { name: 'Chat Thread', role: '', email: '' };
    const other = conv.initiatorUserId === user?.id ? conv.participant : conv.initiator;
    const name =
      other?.name ||
      other?.professional?.businessName ||
      other?.professionalProfile?.companyName ||
      other?.homeownerProfile?.fullName ||
      other?.email?.split('@')[0] ||
      'Contact User';
    const role = other?.role || '';
    return { name, role, email: other?.email || '' };
  };

  const filteredConvs = conversations.filter((c) => {
    const contact = getContactInfo(c);
    return contact.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <DashboardLayout title="Messages & Chat Portal">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm h-[600px] flex overflow-hidden">
        {/* Inbox Sidebar List */}
        <div className="w-80 sm:w-96 border-r border-slate-200 dark:border-slate-800 flex flex-col bg-slate-50/50 dark:bg-slate-900/60">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-3 flex items-center justify-between">
              <span>Inbox Threads</span>
              <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full font-mono">{conversations.length} Active</span>
            </h3>
            <Input
              placeholder="Search contacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-xs bg-slate-50 dark:bg-slate-800 dark:text-white dark:border-slate-700"
            />
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
            {isLoading ? (
              <div className="p-6 text-center text-slate-400 dark:text-slate-500 text-xs">Loading chat inbox...</div>
            ) : filteredConvs.length === 0 ? (
              <div className="p-6 text-center text-slate-400 dark:text-slate-500 text-xs">No active conversations found.</div>
            ) : (
              filteredConvs.map((conv) => {
                const contact = getContactInfo(conv);
                const isSelected = activeConv?.id === conv.id;
                const lastMsg = conv.messages?.[0]?.content || conv.messages?.[0]?.body || 'Click to communicate';
                const projectName = conv.project?.name || conv.project?.title || 'Direct Chat Thread';

                return (
                  <div
                    key={conv.id}
                    onClick={() => setActiveConv(conv)}
                    className={`p-4 cursor-pointer transition-colors space-y-2 ${
                      isSelected ? 'bg-orange-50/90 dark:bg-orange-950/40 border-l-4 border-l-orange-500' : 'hover:bg-slate-100/70 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2.5">
                        <div className="relative">
                          <div className="w-9 h-9 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">
                            {(contact.name || 'U').charAt(0).toUpperCase()}
                          </div>
                          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full"></span>
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">{contact.name}</h4>
                          <span className="text-[10px] text-orange-600 dark:text-orange-400 font-semibold flex items-center mt-0.5">
                            <Briefcase className="h-3 w-3 mr-1 inline" /> {projectName}
                          </span>
                        </div>
                      </div>
                      <Badge variant={contact.role === 'HOMEOWNER' ? 'info' : 'orange'} size="sm">
                        {contact.role || 'USER'}
                      </Badge>
                    </div>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 italic">{lastMsg}</p>

                    <div className="pt-1 flex justify-end">
                      <button className="px-2.5 py-1 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white text-[10px] font-bold rounded flex items-center shadow-sm border border-transparent dark:border-slate-700">
                        [Open Chat] <ChevronRight className="h-3 w-3 ml-0.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Main Messenger Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-slate-900">
          {accessError ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-rose-50/40 dark:bg-rose-950/20">
              <div className="p-3 bg-rose-100 dark:bg-rose-900/50 rounded-full text-rose-600 dark:text-rose-400 mb-3">
                <MessageSquare className="h-8 w-8" />
              </div>
              <h4 className="text-base font-bold text-rose-900 dark:text-rose-200 mb-1">Access Restricted</h4>
              <p className="text-xs text-rose-700 dark:text-rose-300 max-w-md">{accessError}</p>
            </div>
          ) : activeConv ? (
            <ChatWindow
              conversationId={activeConv.id}
              projectTitle={activeConv.project?.name || activeConv.project?.title}
              contactName={getContactInfo(activeConv).name}
              contactRole={getContactInfo(activeConv).role}
              isSupport={activeConv.project?.type === 'SUPPORT'}
              isOnline={true}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-500 text-xs">
              <MessageSquare className="h-10 w-10 text-slate-300 dark:text-slate-600 mb-2" />
              <p className="font-semibold text-slate-600 dark:text-slate-300 text-sm">Select a chat thread from inbox</p>
              <p className="text-slate-400 dark:text-slate-500 text-xs mt-1">Or click 'Send Homeowner Inquiry' from contractor profiles.</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};
