import React, { useEffect, useState, useRef } from 'react';
import { apiRequest } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { Send, Paperclip, Loader2, MessageSquare, AlertCircle, FileText, Image as ImageIcon, X } from 'lucide-react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

interface ChatWindowProps {
  conversationId: string;
  projectTitle?: string;
  contactName?: string;
  contactRole?: string;
  isSupport?: boolean;
  isOnline?: boolean;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  conversationId,
  projectTitle,
  contactName,
  contactRole,
  isSupport = false,
  isOnline = true,
}) => {
  const { user } = useAuth();

  const isSupportThread =
    isSupport ||
    projectTitle?.toLowerCase().includes('support') ||
    projectTitle?.toLowerCase().includes('help') ||
    contactName?.toLowerCase().includes('admin') ||
    contactName?.toLowerCase().includes('support') ||
    contactRole === 'ADMIN' ||
    contactRole === 'FOUNDER';
  const [messages, setMessages] = useState<any[]>([]);
  const [content, setContent] = useState('');
  const [fileData, setFileData] = useState<{ fileName: string; fileUrl: string; fileType: string; fileSize?: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const [isClosed, setIsClosed] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isResuming, setIsResuming] = useState(false);

  const isClosedThread = isClosed && !isSupportThread;

  const fetchMessages = async (silent = false) => {
    if (!conversationId) return;
    try {
      if (!silent) setIsLoading(true);
      const res = await apiRequest(`/messages/conversations/${conversationId}/messages`);
      if (res.data) {
        setMessages(res.data);
        const hasClosedTag = res.data.some((m: any) => m.content === '__THREAD_CLOSED__' || m.body === '__THREAD_CLOSED__');
        setIsClosed(hasClosedTag);
      }
      setError('');
    } catch (err: any) {
      if (!silent) setError(err.message || 'Failed to fetch messages.');
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  const handleCloseThread = async () => {
    const confirmClose = window.confirm(
      'Are you sure you want to end this conversation thread? The contractor will no longer be able to send messages.'
    );
    if (!confirmClose) return;

    try {
      setIsClosing(true);
      await apiRequest(`/messages/conversations/${conversationId}/close`, { method: 'POST' });
      setIsClosed(true);
      fetchMessages(true);
    } catch (err: any) {
      alert(err.message || 'Failed to close conversation.');
    } finally {
      setIsClosing(false);
    }
  };

  const handleResumeThread = async () => {
    try {
      setIsResuming(true);
      await apiRequest(`/messages/conversations/${conversationId}/resume`, { method: 'POST' });
      setIsClosed(false);
      fetchMessages(true);
    } catch (err: any) {
      alert(err.message || 'Failed to resume conversation.');
    } finally {
      setIsResuming(false);
    }
  };

  useEffect(() => {
    fetchMessages(false);
    const interval = setInterval(() => {
      fetchMessages(true);
    }, 3000);
    return () => clearInterval(interval);
  }, [conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Generate local preview URL
    const fileUrl = URL.createObjectURL(file);
    setFileData({
      fileName: file.name,
      fileUrl,
      fileType: file.type.startsWith('image/') ? 'IMAGE' : 'DOCUMENT',
      fileSize: file.size,
    });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = content.trim();
    if ((!trimmed && !fileData) || isSending) return;

    try {
      setIsSending(true);
      setError('');

      const res = await apiRequest('/messages/messages', {
        method: 'POST',
        body: JSON.stringify({
          conversationId,
          content: trimmed || (fileData?.fileType === 'IMAGE' ? 'Sent a photo attachment' : `Sent attachment: ${fileData?.fileName}`),
          fileData: fileData || undefined,
        }),
      });

      if (res.data) {
        setMessages((prev) => [...prev, res.data]);
      }
      setContent('');
      setFileData(null);
      scrollToBottom();
    } catch (err: any) {
      setError(err.message || 'Failed to send message.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 bg-slate-900 dark:bg-slate-950 text-white flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="p-2 bg-orange-600 rounded-lg text-white font-bold text-xs">
              {contactName?.charAt(0).toUpperCase() || 'C'}
            </div>
            {isOnline && (
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-slate-900 rounded-full"></span>
            )}
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">{contactName || 'Contact User'}</h3>
            <p className="text-[10px] text-slate-400">
              {projectTitle ? `Project: ${projectTitle}` : 'Direct Communication Thread'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {user?.role === 'HOMEOWNER' && !isClosedThread && !isSupportThread && (
            <Button
              size="sm"
              variant="danger"
              onClick={handleCloseThread}
              isLoading={isClosing}
              className="text-[11px] py-1 px-3 bg-rose-600 hover:bg-rose-700 font-bold"
            >
              End Conversation
            </Button>
          )}

          {user?.role === 'HOMEOWNER' && isClosedThread && (
            <Button
              size="sm"
              variant="primary"
              onClick={handleResumeThread}
              isLoading={isResuming}
              className="text-[11px] py-1 px-3 bg-emerald-600 hover:bg-emerald-700 font-bold text-white"
            >
              Resume Conversation
            </Button>
          )}

          {isClosedThread ? (
            <span className="text-[10px] bg-rose-950 text-rose-300 border border-rose-800 font-bold px-2.5 py-1 rounded-full">
              🔒 Closed
            </span>
          ) : (
            <div className="flex items-center space-x-2 text-[10px] text-emerald-400 font-semibold bg-slate-800 px-2.5 py-1 rounded-full border border-slate-700">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              <span>Online Now</span>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 dark:bg-rose-950/40 border-b border-rose-200 dark:border-rose-800/50 px-4 py-2 text-xs text-rose-700 dark:text-rose-300 flex items-center justify-between">
          <span className="flex items-center"><AlertCircle className="h-4 w-4 mr-1.5 shrink-0" /> {error}</span>
          <button onClick={() => setError('')} className="text-rose-500 dark:text-rose-400 font-bold hover:underline">Dismiss</button>
        </div>
      )}

      {/* Messages List Feed */}
      <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/50 dark:bg-slate-950/40">
        {isLoading ? (
          <div className="flex items-center justify-center h-full text-slate-400 dark:text-slate-500 text-xs">
            <Loader2 className="h-5 w-5 animate-spin mr-2 text-orange-500" /> Loading messages...
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-500 text-xs">
            <MessageSquare className="h-8 w-8 text-slate-300 dark:text-slate-600 mb-2" />
            <p className="font-semibold text-slate-600 dark:text-slate-300">No messages in this thread yet</p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">Send a text message or attach a blueprint/photo below.</p>
          </div>
        ) : (
          messages.map((m) => {
            if ((m.content === '__THREAD_CLOSED__' || m.body === '__THREAD_CLOSED__') && !isSupportThread) {
              return (
                <div key={m.id} className="flex justify-center my-3">
                  <span className="text-[11px] bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60 font-semibold px-3 py-1 rounded-full shadow-xs flex items-center">
                    <AlertCircle className="h-3.5 w-3.5 mr-1 text-rose-600 dark:text-rose-400" />
                    Conversation closed by Homeowner
                  </span>
                </div>
              );
            }

            const isMe = m.senderUserId === user?.id;
            const file = m.fileUrl || (m.attachments && m.attachments[0]?.fileUrl);
            const fileName = m.fileName || (m.attachments && m.attachments[0]?.fileName);
            const fileType = m.fileType || (m.attachments && m.attachments[0]?.fileType);

            return (
              <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-xs sm:max-w-md p-3.5 rounded-2xl shadow-sm text-xs leading-relaxed space-y-2 ${
                    isMe
                      ? 'bg-orange-600 text-white rounded-br-none font-medium'
                      : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-bl-none'
                  }`}
                >
                  {/* Text Content */}
                  {m.content && <p>{m.content}</p>}

                  {/* Render File Attachment Preview */}
                  {file && (
                    <div className="mt-2">
                      {fileType === 'IMAGE' || file.match(/\.(jpeg|jpg|gif|png|webp)$/i) ? (
                        <div className="rounded-lg overflow-hidden border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5">
                          <img src={file} alt={fileName || 'Photo Attachment'} className="w-full h-40 object-cover" />
                        </div>
                      ) : (
                        <a
                          href={file}
                          target="_blank"
                          rel="noreferrer"
                          className={`flex items-center space-x-2.5 p-2.5 rounded-xl border transition-colors ${
                            isMe ? 'bg-orange-700/60 border-orange-500/50 text-white' : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100'
                          }`}
                        >
                          <FileText className="h-5 w-5 shrink-0 text-orange-400" />
                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-xs truncate">{fileName || 'Attachment Document'}</p>
                            <span className="text-[10px] opacity-75">Click to view / download</span>
                          </div>
                        </a>
                      )}
                    </div>
                  )}

                  <span className={`block text-[9px] mt-1.5 text-right font-mono ${isMe ? 'text-orange-200' : 'text-slate-400 dark:text-slate-500'}`}>
                    {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {fileData && (
        <div className="px-4 py-2 bg-orange-50 dark:bg-orange-950/40 border-t border-orange-200 dark:border-orange-800/50 flex items-center justify-between text-xs text-orange-900 dark:text-orange-200">
          <div className="flex items-center space-x-2 truncate">
            {fileData.fileType === 'IMAGE' ? <ImageIcon className="h-4 w-4 text-orange-600" /> : <FileText className="h-4 w-4 text-orange-600" />}
            <span className="font-semibold truncate">{fileData.fileName}</span>
          </div>
          <button onClick={() => setFileData(null)} className="text-orange-600 hover:text-orange-900 dark:hover:text-orange-300 p-1">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Message Bar Form or Closed Banner */}
      {isClosedThread ? (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border-t border-rose-200 dark:border-rose-800/50 text-center text-xs text-rose-800 dark:text-rose-200 font-bold flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
            <span>This conversation was closed by the Homeowner.</span>
          </div>
          {user?.role === 'HOMEOWNER' && (
            <Button
              size="sm"
              variant="primary"
              onClick={handleResumeThread}
              isLoading={isResuming}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
            >
              Resume Conversation
            </Button>
          )}
        </div>
      ) : (
        <form onSubmit={handleSendMessage} className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center space-x-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/*,.pdf,.doc,.docx,.cad,.dwg"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-slate-400 dark:text-slate-400 hover:text-orange-600 dark:hover:text-orange-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Attach photo, PDF blueprint, invoice or site document"
          >
            <Paperclip className="h-5 w-5" />
          </button>

          <Input
            type="text"
            placeholder="Type your message here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={isSending}
            className="flex-1 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs"
          />
          <Button type="submit" disabled={(!content.trim() && !fileData) || isSending} isLoading={isSending} className="px-4 py-2">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      )}
    </div>
  );
};
