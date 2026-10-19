import React, { useEffect, useState, useRef } from 'react';
import { apiRequest } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { Send, Loader2, MessageSquare, AlertCircle, Headphones, X } from 'lucide-react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

interface LiveSupportChatBoxProps {
  onClose: () => void;
}

export const LiveSupportChatBox: React.FC<LiveSupportChatBoxProps> = ({ onClose }) => {
  const { user } = useAuth();
  const [session, setSession] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Step 1: Initialize or fetch active 24-hour live chat session in Prisma
  const initSession = async () => {
    try {
      setIsLoading(true);
      setError('');
      const res = await apiRequest('/chat/session', { method: 'POST' });
      if (res.data) {
        setSession(res.data);
        setMessages(res.data.messages || []);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to initialize live chat session.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Poll latest live chat messages every 3 seconds
  const fetchMessages = async () => {
    if (!session?.id) return;
    try {
      const res = await apiRequest(`/chat/messages/${session.id}`);
      if (res.data) {
        setMessages(res.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    initSession();
  }, []);

  useEffect(() => {
    if (session?.id) {
      const interval = setInterval(() => {
        fetchMessages();
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [session?.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = content.trim();
    if (!trimmed || !session?.id || isSending) return;

    try {
      setIsSending(true);
      setError('');

      const res = await apiRequest('/chat/messages', {
        method: 'POST',
        body: JSON.stringify({
          sessionId: session.id,
          content: trimmed,
        }),
      });

      setMessages((prev) => [...prev, res.data]);
      setContent('');
      scrollToBottom();
    } catch (err: any) {
      setError(err.message || 'Failed to send message.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="bg-slate-900 border-2 border-orange-500/60 rounded-2xl shadow-2xl overflow-hidden text-white flex flex-col h-[460px]">
      {/* Top Header */}
      <div className="px-5 py-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-orange-600 rounded-lg text-white">
            <Headphones className="h-4 w-4" />
          </div>
          <div>
            <h4 className="font-bold text-white text-sm">StroitX Live Support Agent</h4>
            <p className="text-[10px] text-emerald-400 font-mono flex items-center">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse mr-1.5"></span>
              24-Hour Active Session #{session?.id ? session.id.substring(0, 8) : '...'}
            </p>
          </div>
        </div>

        <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
          <X className="h-4 w-4" />
        </button>
      </div>

      {error && (
        <div className="bg-rose-950/80 border-b border-rose-800 px-4 py-2 text-xs text-rose-300 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError('')} className="text-rose-400 font-bold hover:underline">Dismiss</button>
        </div>
      )}

      {/* Messages Feed */}
      <div className="flex-1 p-5 overflow-y-auto space-y-3 bg-slate-950/50 text-xs">
        {isLoading ? (
          <div className="flex items-center justify-center h-full text-slate-400">
            <Loader2 className="h-5 w-5 animate-spin mr-2 text-orange-500" /> Initializing 24-hour live support session...
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 text-xs">
            <MessageSquare className="h-8 w-8 text-slate-600 mb-2" />
            <p className="font-bold text-white text-sm">Welcome to StroitX Live Support</p>
            <p className="text-slate-400 text-[11px] mt-1 text-center max-w-xs">
              Type your query below. Our 24-hour support representatives and admin team are standing by.
            </p>
          </div>
        ) : (
          messages.map((m) => {
            const isAdmin = m.sender?.role === 'ADMIN' || m.sender?.role === 'FOUNDER';
            return (
              <div key={m.id} className={`flex ${isAdmin ? 'justify-start' : 'justify-end'}`}>
                <div
                  className={`max-w-xs sm:max-w-md p-3 rounded-2xl text-xs leading-relaxed ${
                    isAdmin
                      ? 'bg-slate-800 border border-slate-700 text-slate-100 rounded-bl-none'
                      : 'bg-orange-600 text-white rounded-br-none font-medium'
                  }`}
                >
                  {isAdmin && <span className="block text-[9px] font-bold text-orange-400 uppercase mb-0.5">Admin Support Agent</span>}
                  <p>{m.content}</p>
                  <span className="block text-[9px] mt-1 text-right text-slate-400 font-mono">
                    {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="p-3 bg-slate-950 border-t border-slate-800 flex items-center space-x-2">
        <Input
          type="text"
          placeholder="Type message to live support agent..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={isSending || isLoading}
          className="flex-1 bg-slate-900 border-slate-800 text-white text-xs"
        />
        <Button type="submit" disabled={!content.trim() || isSending || isLoading} isLoading={isSending} className="px-4 py-2">
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
};
