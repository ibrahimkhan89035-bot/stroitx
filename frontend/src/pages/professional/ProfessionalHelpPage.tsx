import React, { useEffect, useState, useRef } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { apiRequest } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { HelpCircle, Send, MessageSquare, Loader2, CheckCircle2, ShieldCheck, Clock } from 'lucide-react';

export const ProfessionalHelpPage: React.FC = () => {
  const { user } = useAuth();
  const [session, setSession] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [subject, setSubject] = useState('');
  const [messageDetails, setMessageDetails] = useState('');
  const [inquiryType, setInquiryType] = useState('lead');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [chatMessage, setChatMessage] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const sessionIdRef = useRef<string | null>(null);

  const initSession = async () => {
    try {
      setIsLoading(true);
      const sessionRes = await apiRequest('/chat/session', { method: 'POST' });
      if (sessionRes.data) {
        setSession(sessionRes.data);
        sessionIdRef.current = sessionRes.data.id;
        fetchMessages(sessionRes.data.id, true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMessages = async (sessId?: string, silent = false) => {
    const targetId = sessId || sessionIdRef.current;
    if (!targetId) return;
    try {
      const msgRes = await apiRequest(`/chat/messages/${targetId}`);
      if (msgRes.data) setMessages(msgRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    initSession();
    const interval = setInterval(() => {
      fetchMessages(undefined, true);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !messageDetails.trim() || isSending) return;

    try {
      setIsSending(true);

      // 1. Submit support ticket to backend ActivityLog / Admin Reports queue
      await apiRequest('/professionals/support', {
        method: 'POST',
        body: JSON.stringify({
          subject: subject.trim(),
          messageDetails: messageDetails.trim(),
          category: inquiryType,
        }),
      });

      // 2. Dispatch message to Live Support Chat Session
      const text = `[Support Ticket: ${inquiryType.toUpperCase()}] ${subject.trim()} - ${messageDetails.trim()}`;
      const targetSessionId = session?.id || 'session';
      await apiRequest('/chat/messages', {
        method: 'POST',
        body: JSON.stringify({
          sessionId: targetSessionId,
          content: text,
        }),
      });

      alert('Support ticket submitted successfully! Live Admin support has been notified.');
      setSubject('');
      setMessageDetails('');
      fetchMessages(undefined, true);
    } catch (err: any) {
      alert(err.message || 'Failed to submit support ticket.');
    } finally {
      setIsSending(false);
    }
  };

  const handleSendLiveChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim() || !session || isSending) return;

    try {
      setIsSending(true);
      await apiRequest('/chat/messages', {
        method: 'POST',
        body: JSON.stringify({
          sessionId: session.id,
          content: chatMessage.trim(),
        }),
      });

      setChatMessage('');
      fetchMessages(undefined, true);
    } catch (err: any) {
      alert(err.message || 'Failed to send chat message.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <DashboardLayout title="Help & Support Hub">
      <div className="space-y-8 max-w-4xl mx-auto">
        <div className="flex justify-between items-center bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-md">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-orange-600 rounded-xl text-white">
              <HelpCircle className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Partner Assistance & Live Support</h2>
              <p className="text-xs text-slate-400 mt-0.5">Submit support tickets and chat in real-time with StroitX Platform Admins</p>
            </div>
          </div>
          <Badge variant="success" size="md">
            ● Live Support Online
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Submit Support Ticket Card */}
          <Card className="p-6">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center">
              <HelpCircle className="h-4 w-4 mr-2 text-orange-600" /> Submit Ticket / Inquiry
            </h3>
            <form onSubmit={handleSubmitTicket} className="space-y-4 text-xs">
              <Select
                label="Inquiry Type"
                value={inquiryType}
                onChange={(e) => setInquiryType(e.target.value)}
                options={[
                  { label: 'Bidding / Lead Inquiry', value: 'lead' },
                  { label: 'Subscription / Billing Query', value: 'subscription' },
                  { label: 'KYC & Verification Help', value: 'kyc' },
                  { label: 'Technical Issue', value: 'tech' },
                ]}
              />
              <Input
                label="Subject"
                required
                placeholder="e.g. Issue submitting line-item quotation"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Message Details</label>
                <textarea
                  rows={4}
                  className="w-full p-2.5 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs"
                  required
                  placeholder="Describe your inquiry in detail..."
                  value={messageDetails}
                  onChange={(e) => setMessageDetails(e.target.value)}
                ></textarea>
              </div>
              <Button type="submit" size="sm" isLoading={isSending}>
                <Send className="h-4 w-4 mr-1.5" /> Submit Support Ticket
              </Button>
            </form>
          </Card>

          {/* Real-time Support Chat Console */}
          <Card className="p-0 overflow-hidden flex flex-col h-[460px]">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <h3 className="text-xs font-bold flex items-center">
                <MessageSquare className="h-4 w-4 mr-2 text-orange-500" /> 24/7 Live Support Messenger
              </h3>
              <span className="text-[10px] text-emerald-400 font-mono">Real-time Admin Thread</span>
            </div>

            {/* Chat Feed */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50 dark:bg-slate-950 text-xs">
              {isLoading ? (
                <div className="flex items-center justify-center h-full text-slate-400 text-xs">
                  <Loader2 className="h-5 w-5 animate-spin mr-2 text-orange-500" /> Connecting to Live Support...
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 text-xs text-center p-4">
                  <MessageSquare className="h-8 w-8 text-slate-300 dark:text-slate-700 mb-2" />
                  <p className="font-semibold text-slate-600 dark:text-slate-400">No support messages yet</p>
                  <p className="text-[11px] text-slate-400 mt-1">Send a message below to chat with an Admin in real-time.</p>
                </div>
              ) : (
                messages.map((m) => {
                  const isAdmin = m.sender?.role === 'ADMIN' || m.sender?.role === 'FOUNDER';
                  return (
                    <div key={m.id} className={`flex ${isAdmin ? 'justify-start' : 'justify-end'}`}>
                      <div
                        className={`max-w-xs p-3 rounded-xl text-xs leading-relaxed ${
                          isAdmin
                            ? 'bg-slate-900 dark:bg-slate-800 text-white rounded-bl-none border border-slate-700'
                            : 'bg-orange-600 text-white rounded-br-none font-medium'
                        }`}
                      >
                        <span className="block text-[9px] opacity-75 font-bold uppercase tracking-wider mb-1">
                          {isAdmin ? '🛡️ Admin Support' : 'You'}
                        </span>
                        <p>{m.content}</p>
                        <span className="block text-[9px] mt-1 text-right opacity-70 font-mono">
                          {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Live Chat Form */}
            <form onSubmit={handleSendLiveChatMessage} className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex space-x-2">
              <Input
                placeholder="Type your live support message..."
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                className="flex-1 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-xs"
                disabled={isSending}
              />
              <Button type="submit" size="sm" isLoading={isSending} disabled={!chatMessage.trim() || isSending}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};
