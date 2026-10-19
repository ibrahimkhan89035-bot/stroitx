import React, { useEffect, useState, useRef } from 'react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { apiRequest } from '../../lib/api';
import { Bell, Send, Search, MessageSquare, Megaphone, Users, Loader2, Clock } from 'lucide-react';

export const AdminNotificationsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'BROADCAST' | 'LIVE_CHAT'>('BROADCAST');

  // Section B: Broadcast State
  const [title, setTitle] = useState('');
  const [targetAudience, setTargetAudience] = useState('ALL');
  const [messageBody, setMessageBody] = useState('');
  const [isSendingBroadcast, setIsSendingBroadcast] = useState(false);
  const [broadcasts, setBroadcasts] = useState<any[]>([]);

  // Section A: Live Chat Management State
  const [chatSessions, setChatSessions] = useState<any[]>([]);
  const [activeSession, setActiveSession] = useState<any>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [adminReply, setAdminReply] = useState('');
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [isLoadingChats, setIsLoadingChats] = useState(false);
  const [isSendingReply, setIsSendingReply] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadBroadcasts = async () => {
    try {
      const res = await apiRequest('/admin/broadcasts');
      if (res.data) setBroadcasts(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadLiveChats = async (silent = false) => {
    try {
      if (!silent) setIsLoadingChats(true);
      const res = await apiRequest('/chat/admin/sessions');
      if (res.data) {
        setChatSessions(res.data);
        if (res.data.length > 0 && !activeSession) {
          setActiveSession(res.data[0]);
          setChatMessages(res.data[0].messages || []);
        } else if (activeSession) {
          const updatedCurrent = res.data.find((s: any) => s.id === activeSession.id);
          if (updatedCurrent) {
            setChatMessages(updatedCurrent.messages || []);
          }
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      if (!silent) setIsLoadingChats(false);
    }
  };

  const handleSearchUser = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!userSearchQuery.trim()) {
      loadLiveChats();
      return;
    }

    try {
      setIsLoadingChats(true);
      const res = await apiRequest(`/chat/admin/search?query=${encodeURIComponent(userSearchQuery.trim())}`);
      if (res.data) {
        setChatSessions(res.data);
        if (res.data.length > 0) {
          setActiveSession(res.data[0]);
          setChatMessages(res.data[0].messages || []);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingChats(false);
    }
  };

  useEffect(() => {
    loadBroadcasts();
    loadLiveChats();

    const interval = setInterval(() => {
      loadLiveChats(true);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !messageBody.trim()) return;

    try {
      setIsSendingBroadcast(true);
      await apiRequest('/admin/broadcasts', {
        method: 'POST',
        body: JSON.stringify({
          title,
          targetAudience,
          messageBody,
        }),
      });

      alert(`📢 Broadcast message sent to audience: [${targetAudience}]!`);
      setTitle('');
      setMessageBody('');
      loadBroadcasts();
    } catch (err: any) {
      alert(err.message || 'Failed to dispatch broadcast.');
    } finally {
      setIsSendingBroadcast(false);
    }
  };

  const handleSendAdminReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminReply.trim() || !activeSession || isSendingReply) return;

    try {
      setIsSendingReply(true);
      const res = await apiRequest('/chat/messages', {
        method: 'POST',
        body: JSON.stringify({
          sessionId: activeSession.id,
          content: adminReply.trim(),
        }),
      });

      setChatMessages((prev) => [...prev, res.data]);
      setAdminReply('');
    } catch (err: any) {
      alert(err.message || 'Failed to send reply.');
    } finally {
      setIsSendingReply(false);
    }
  };

  const filteredSessions = chatSessions.filter((s) => {
    const email = s.user?.email || '';
    const name = s.user?.homeownerProfile?.fullName || s.user?.professionalProfile?.companyName || '';
    const search = userSearchQuery.toLowerCase();
    return email.toLowerCase().includes(search) || name.toLowerCase().includes(search);
  });

  return (
    <AdminLayout title="System Broadcasts & Live Chat Management">
      <div className="space-y-6">
        {/* Header & Tab Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-md">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-orange-600 rounded-xl text-white">
              <Megaphone className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Broadcasts & Live Support Hub</h2>
              <p className="text-xs text-slate-400 mt-0.5">Send mass audience announcements and respond to 24-hour live chat sessions</p>
            </div>
          </div>

          <div className="flex bg-slate-800 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setActiveTab('BROADCAST')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'BROADCAST' ? 'bg-orange-600 text-white shadow-sm font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              📢 Mass Broadcast System
            </button>
            <button
              onClick={() => setActiveTab('LIVE_CHAT')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'LIVE_CHAT' ? 'bg-orange-600 text-white shadow-sm font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              💬 Live Chat Management
            </button>
          </div>
        </div>

        {/* SECTION B: MASS BROADCAST SYSTEM */}
        {activeTab === 'BROADCAST' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6 bg-slate-900 border-slate-800 text-white">
              <h3 className="text-base font-bold text-white mb-4 flex items-center">
                <Megaphone className="h-4 w-4 mr-2 text-orange-500" /> Create System Broadcast Announcement
              </h3>

              <form onSubmit={handleSendBroadcast} className="space-y-4 text-xs">
                <Select
                  label="Target Audience"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  options={[
                    { label: 'Send to All Users (Homeowners + Professionals)', value: 'ALL' },
                    { label: 'Homeowners Only', value: 'HOMEOWNER' },
                    { label: 'Professionals Only', value: 'PROFESSIONAL' },
                  ]}
                  className="bg-slate-950 border-slate-800 text-white"
                />

                <Input
                  label="Broadcast Title / Headline"
                  placeholder="e.g. Platform Maintenance Notice or Monsoon Bidding Bonus"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="bg-slate-950 border-slate-800 text-white"
                />

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Broadcast Message Body</label>
                  <textarea
                    rows={4}
                    className="w-full p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    placeholder="Enter announcement details..."
                    value={messageBody}
                    onChange={(e) => setMessageBody(e.target.value)}
                    required
                  ></textarea>
                </div>

                <Button type="submit" isLoading={isSendingBroadcast} className="w-full py-2.5 font-bold">
                  <Send className="h-4 w-4 mr-2" /> Dispatch Mass Broadcast
                </Button>
              </form>
            </Card>

            {/* Broadcast History */}
            <Card className="p-6 bg-slate-900 border-slate-800 text-white">
              <h3 className="text-base font-bold text-white mb-4 flex items-center">
                <Clock className="h-4 w-4 mr-2 text-orange-500" /> Dispatched Broadcast History
              </h3>

              {broadcasts.length === 0 ? (
                <p className="text-xs text-slate-400 py-12 text-center border border-dashed border-slate-800 rounded-xl">
                  No system broadcasts sent yet.
                </p>
              ) : (
                <div className="space-y-3 max-h-[360px] overflow-y-auto">
                  {broadcasts.map((b) => (
                    <div key={b.id} className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-xs space-y-1">
                      <div className="flex justify-between items-center">
                        <h4 className="font-bold text-orange-400">{b.title}</h4>
                        <Badge variant="orange">{b.targetAudience}</Badge>
                      </div>
                      <p className="text-slate-300 leading-relaxed">{b.messageBody}</p>
                      <span className="block text-[10px] text-slate-500 font-mono mt-1">
                        Dispatched: {new Date(b.createdAt).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        )}

        {/* SECTION A: LIVE CHAT MANAGEMENT */}
        {activeTab === 'LIVE_CHAT' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden h-[540px] flex">
            {/* User Search & Sessions Sidebar */}
            <div className="w-80 border-r border-slate-800 bg-slate-950 flex flex-col">
              <form onSubmit={handleSearchUser} className="p-4 border-b border-slate-800">
                <h3 className="font-bold text-white text-xs mb-2">Look Up User Chat Session</h3>
                <div className="flex space-x-1">
                  <Input
                    placeholder="Search email, phone, or name..."
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    className="text-xs bg-slate-900 border-slate-800 text-white flex-1"
                  />
                  <Button type="submit" size="sm" className="px-2.5 py-1.5 text-xs">
                    <Search className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </form>

              <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60">
                {isLoadingChats ? (
                  <div className="p-6 text-center text-slate-500 text-xs">Loading live chats...</div>
                ) : filteredSessions.length === 0 ? (
                  <div className="p-6 text-center text-slate-500 text-xs">No active chat sessions found. Press Enter to search database.</div>
                ) : (
                  filteredSessions.map((s) => {
                    const email = s.user?.email || 'User';
                    const name = s.user?.name || s.user?.professional?.businessName || email.split('@')[0];
                    const phone = s.user?.phone || '';
                    const isSelected = activeSession?.id === s.id;
                    const lastMsg = s.messages?.[s.messages.length - 1]?.content || s.messages?.[s.messages.length - 1]?.body || 'Live Support Session';

                    return (
                      <div
                        key={s.id}
                        onClick={() => {
                          setActiveSession(s);
                          setChatMessages(s.messages || []);
                        }}
                        className={`p-4 cursor-pointer transition-colors space-y-1 ${
                          isSelected ? 'bg-orange-600/20 border-l-4 border-l-orange-500' : 'hover:bg-slate-900'
                        }`}
                      >
                        <div className="flex justify-between items-baseline">
                          <h4 className="text-xs font-bold text-white truncate">{name}</h4>
                          <Badge variant={s.user?.role === 'HOMEOWNER' ? 'info' : 'orange'} size="sm">{s.user?.role || 'USER'}</Badge>
                        </div>
                        <p className="text-[10px] text-slate-400 font-mono truncate">{email} {phone ? `• 📱 ${phone}` : ''}</p>
                        <p className="text-[11px] text-slate-300 truncate italic mt-1">{lastMsg}</p>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Active Chat Conversation Feed & Reply Interface */}
            <div className="flex-1 flex flex-col bg-slate-900">
              {activeSession ? (
                <>
                  <div className="px-6 py-3.5 bg-slate-950 border-b border-slate-800 flex justify-between items-center text-xs">
                    <div>
                      <h4 className="font-bold text-white">
                        Chatting with: {activeSession.user?.email}
                      </h4>
                      <span className="text-[10px] text-emerald-400 font-mono">
                        ● 24-Hour Active Session ID: #{activeSession.id.substring(0, 8)}
                      </span>
                    </div>
                  </div>

                  {/* Messages Feed */}
                  <div className="flex-1 p-6 overflow-y-auto space-y-3 bg-slate-950/40 text-xs">
                    {chatMessages.map((m) => {
                      const isAdmin = m.sender?.role === 'ADMIN' || m.sender?.role === 'FOUNDER';
                      return (
                        <div key={m.id} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                          <div
                            className={`max-w-xs sm:max-w-md p-3 rounded-xl text-xs leading-relaxed ${
                              isAdmin
                                ? 'bg-orange-600 text-white rounded-br-none font-semibold'
                                : 'bg-slate-800 border border-slate-700 text-slate-100 rounded-bl-none'
                            }`}
                          >
                            <p>{m.content}</p>
                            <span className="block text-[9px] mt-1 text-right text-slate-400 font-mono">
                              {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Admin Reply Form */}
                  <form onSubmit={handleSendAdminReply} className="p-3 bg-slate-950 border-t border-slate-800 flex space-x-2">
                    <Input
                      placeholder="Type admin reply..."
                      value={adminReply}
                      onChange={(e) => setAdminReply(e.target.value)}
                      className="flex-1 bg-slate-900 border-slate-800 text-white text-xs"
                    />
                    <Button type="submit" isLoading={isSendingReply} disabled={!adminReply.trim() || isSendingReply}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-500 text-xs">
                  <MessageSquare className="h-10 w-10 text-slate-600 mb-2" />
                  <p className="font-bold text-slate-300">Select a user chat session to respond</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
