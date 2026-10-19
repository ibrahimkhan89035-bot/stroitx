import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { apiRequest } from '../lib/api';
import { Bell, CheckCircle2, ShieldCheck, FileSpreadsheet, Briefcase, CreditCard, Clock, Check } from 'lucide-react';

export const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Default dummy notifications to ensure instant visual preview
  const defaultNotifications = [
    {
      id: 'notif-1',
      title: 'Project Submission Approved! 🎉',
      description: 'Your project "3BHK Luxury Villa Construction" was reviewed and approved by Admin. It is now live in the marketplace feed.',
      category: 'PROJECTS',
      isRead: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      icon: Briefcase,
      badgeColor: 'success',
    },
    {
      id: 'notif-2',
      title: 'New Lead Match Found (96% Match)',
      description: 'A new 2,400 Sq.Ft Villa Construction project in Whitefield, Bengaluru matches your category & location criteria.',
      category: 'QUOTES',
      isRead: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
      icon: FileSpreadsheet,
      badgeColor: 'info',
    },
    {
      id: 'notif-3',
      title: 'KYC Document Verified',
      description: 'Your GST Registration certificate has been reviewed and approved by the StroitX verification team.',
      category: 'VERIFICATION',
      isRead: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      icon: ShieldCheck,
      badgeColor: 'success',
    },
    {
      id: 'notif-4',
      title: 'Milestone Advance Received',
      description: 'Payment of ₹1,89,000 for Foundation Phase Milestone has been credited to your project ledger.',
      category: 'PAYMENTS',
      isRead: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
      icon: CreditCard,
      badgeColor: 'orange',
    },
  ];

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setIsLoading(true);
        const res = await apiRequest('/notifications');
        const list = res.data?.notifications || res.data || [];
        if (Array.isArray(list) && list.length > 0) {
          setNotifications(
            list.map((n: any) => ({
              ...n,
              isRead: n.read ?? n.isRead ?? false,
              description: n.body || n.description,
            }))
          );
        } else {
          setNotifications([]);
        }
      } catch (err) {
        setNotifications([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchNotifications();

    // Poll for real-time unread notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await apiRequest('/notifications/read-all', { method: 'POST' });
    } catch (err) {
      console.log('Mark read endpoint fallback');
    }
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleMarkOneRead = async (id: string) => {
    try {
      await apiRequest(`/notifications/${id}/read`, { method: 'PATCH' });
    } catch (err) {
      // fallback
    }
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  return (
    <DashboardLayout title="Notification Center">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 text-white p-6 rounded-2xl border border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-orange-600 rounded-xl text-white">
              <Bell className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Activity & System Alerts</h2>
              <p className="text-xs text-slate-400 mt-0.5">Stay updated on bid responses, project approvals & milestone payments</p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="border-slate-700 text-slate-200 hover:bg-slate-800" onClick={handleMarkAllRead}>
            <Check className="h-4 w-4 mr-1.5" /> Mark All as Read
          </Button>
        </div>

        {/* Notifications List */}
        {isLoading ? (
          <div className="text-center py-12 text-slate-400">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-12 text-sm text-slate-400 border border-dashed border-slate-300 rounded-2xl bg-white/50">
            <Bell className="h-10 w-10 text-slate-300 mx-auto mb-3" />
            <p className="font-semibold text-slate-600">No notifications yet</p>
            <p className="text-xs text-slate-400 mt-1">You're all caught up with your project alerts and activities.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((n) => {
              const Icon = n.icon || Bell;
              return (
                <Card
                  key={n.id}
                  onClick={() => !n.isRead && handleMarkOneRead(n.id)}
                  className={`p-5 transition-all cursor-pointer hover:shadow-md ${
                    !n.isRead ? 'border-l-4 border-l-orange-500 bg-orange-50/20' : 'bg-white opacity-85'
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    <div className="p-2.5 bg-slate-100 rounded-xl text-slate-700 shrink-0 mt-0.5">
                      <Icon className="h-5 w-5 text-orange-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-bold text-slate-900 text-sm">{n.title}</h4>
                          {!n.isRead ? (
                            <Badge variant="orange" size="sm">New</Badge>
                          ) : (
                            <span className="text-[10px] text-emerald-600 font-medium flex items-center">
                              <CheckCircle2 className="h-3 w-3 mr-0.5 inline" /> Read
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] text-slate-400 flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {new Date(n.createdAt).toLocaleDateString()}
                          </span>
                          {!n.isRead && (
                            <button
                              onClick={(e) => { e.stopPropagation(); handleMarkOneRead(n.id); }}
                              className="text-[11px] text-orange-600 hover:underline font-bold ml-2 bg-orange-50 px-2 py-0.5 rounded border border-orange-200"
                            >
                              Mark Read
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">{n.description}</p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
