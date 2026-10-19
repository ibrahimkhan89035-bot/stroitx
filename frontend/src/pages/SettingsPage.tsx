import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Badge } from '../components/ui/Badge';
import { useAuth } from '../lib/auth';
import { apiRequest } from '../lib/api';
import { useTheme, ThemeMode } from '../lib/theme';
import { useNavigate } from 'react-router-dom';
import { Settings, Globe, User, CreditCard, Lock, Trash2, CheckCircle2, AlertTriangle, Loader2, Sun, Moon, Monitor, Sparkles, HelpCircle, Send, MessageSquare, Mail, Phone } from 'lucide-react';

import { LiveSupportChatBox } from '../components/messaging/LiveSupportChatBox';

export const SettingsPage: React.FC = () => {
  const { user, logout, isLoading } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  const isProf = user?.role === 'PROFESSIONAL';

  const [activeTab, setActiveTab] = useState<'LANGUAGE' | 'PROFILE' | 'APPEARANCE' | 'SUBSCRIPTION' | 'SECURITY' | 'DANGER' | 'HELP'>('PROFILE');
  const [language, setLanguage] = useState('English');
  const [isUpdatingLanguage, setIsUpdatingLanguage] = useState(false);
  const [langStatus, setLangStatus] = useState('');
  const [themeStatus, setThemeStatus] = useState('');

  // Profile Form State
  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [city, setCity] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileStatus, setProfileStatus] = useState('');

  // Security Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordStatus, setPasswordStatus] = useState('');

  // Danger Zone Action States
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Support Ticket Form State
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');
  const [ticketCategory, setTicketCategory] = useState('TECHNICAL');
  const [isSubmittingTicket, setIsSubmittingTicket] = useState(false);
  const [ticketStatus, setTicketStatus] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(false);

  const handleSupportTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketMessage.trim()) return;

    try {
      setIsSubmittingTicket(true);
      setTicketStatus('');

      // 1. Submit ticket to backend ActivityLog / Admin Reports queue
      await apiRequest('/auth/support', {
        method: 'POST',
        body: JSON.stringify({
          subject: ticketSubject.trim(),
          message: ticketMessage.trim(),
          category: ticketCategory,
        }),
      });

      // 2. Dual-route ticket message to Admin Live Support session
      const text = `[Support Ticket: ${ticketCategory.toUpperCase()}] ${ticketSubject.trim()} - ${ticketMessage.trim()}`;
      try {
        const sessionRes = await apiRequest('/chat/session', { method: 'POST' });
        if (sessionRes.data?.id) {
          await apiRequest('/chat/messages', {
            method: 'POST',
            body: JSON.stringify({
              sessionId: sessionRes.data.id,
              content: text,
            }),
          });
        }
      } catch (chatErr) {
        console.log('Live chat dispatch fallback');
      }

      setTicketStatus('✅ Support ticket submitted successfully! Sent directly to Admin Reports & Disputes queue.');
      alert('🎉 Support ticket submitted! The Admin team has received your ticket in the Reports queue.');
      setTicketSubject('');
      setTicketMessage('');
      setTimeout(() => setTicketStatus(''), 5000);
    } catch (err: any) {
      setTicketStatus(`❌ ${err.message || 'Support ticket submission failed.'}`);
      alert(`❌ Submission failed: ${err.message || 'Error submitting ticket'}`);
    } finally {
      setIsSubmittingTicket(false);
    }
  };

  // Sync user state into form inputs once user profile loads
  useEffect(() => {
    if (user) {
      setFullName(user.homeownerProfile?.fullName || user.professionalProfile?.fullName || '');
      setMobileNumber(user.mobileNumber || '');
      setCity(user.city || '');
      if ((user as any).language) setLanguage((user as any).language);
      if ((user as any).theme) setTheme((user as any).theme as ThemeMode);
    }
  }, [user]);

  const handleSaveProfile = async (e?: React.FormEvent | React.MouseEvent) => {
    if (e) e.preventDefault();
    console.log("Save profile button clicked", { fullName, mobileNumber, city });

    try {
      setIsSavingProfile(true);
      setProfileStatus('');
      await apiRequest('/auth/profile', {
        method: 'PATCH',
        body: JSON.stringify({ fullName, mobileNumber, city }),
      });
      setProfileStatus('✅ Profile details updated successfully!');
      alert('✅ Profile details saved successfully in database!');
      setTimeout(() => setProfileStatus(''), 4000);
    } catch (err: any) {
      console.error("Save profile error:", err);
      setProfileStatus(`❌ ${err.message || 'Profile update failed.'}`);
      alert(`❌ Error saving profile: ${err.message || 'Update failed'}`);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleLanguageUpdate = async () => {
    try {
      setIsUpdatingLanguage(true);
      setLangStatus('');
      await apiRequest('/auth/language', {
        method: 'PATCH',
        body: JSON.stringify({ language }),
      });
      setLangStatus(`✅ Language preference set to ${language} in database!`);
      alert(`✅ Language preference saved as ${language}!`);
      setTimeout(() => setLangStatus(''), 4000);
    } catch (err: any) {
      setLangStatus(`❌ ${err.message || 'Language update failed.'}`);
      alert(`❌ Language update failed: ${err.message || 'Update failed'}`);
    } finally {
      setIsUpdatingLanguage(false);
    }
  };

  const handleThemeSelect = async (mode: ThemeMode) => {
    setTheme(mode);
    setThemeStatus(`✅ ${mode.charAt(0).toUpperCase() + mode.slice(1)} mode active`);
    setTimeout(() => setThemeStatus(''), 3000);

    try {
      await apiRequest('/auth/theme', {
        method: 'PATCH',
        body: JSON.stringify({ theme: mode }),
      });
    } catch (err) {
      console.log('Theme saved locally.');
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordStatus('❌ New passwords do not match.');
      return;
    }

    try {
      setIsUpdatingPassword(true);
      setPasswordStatus('');
      await apiRequest('/auth/password', {
        method: 'PATCH',
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      setPasswordStatus('✅ Password updated successfully!');
      alert('✅ Password updated successfully in database!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordStatus(''), 4000);
    } catch (err: any) {
      setPasswordStatus(`❌ ${err.message || 'Password update failed.'}`);
      alert(`❌ Password update failed: ${err.message || 'Update failed'}`);
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleDeactivate = async () => {
    if (!confirm('Are you sure you want to temporarily deactivate your account? You can log in anytime to reactivate.')) return;

    try {
      setIsDeactivating(true);
      await apiRequest('/auth/deactivate', { method: 'POST' });
      alert('✅ Account temporarily deactivated.');
      logout();
      navigate('/');
    } catch (err: any) {
      alert(`❌ Deactivation failed: ${err.message || 'Action failed'}`);
    } finally {
      setIsDeactivating(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('🚨 PERMANENT ACTION: Are you sure you want to permanently delete your StroitX account and data? This action cannot be undone.')) return;

    try {
      setIsDeleting(true);
      await apiRequest('/auth/account', { method: 'DELETE' });
      alert('✅ Account deletion processed. Your account has been scheduled for deletion.');
      logout();
      navigate('/');
    } catch (err: any) {
      alert(`❌ Account deletion failed: ${err.message || 'Action failed'}`);
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Account Settings & Preferences">
        <div className="flex items-center justify-center py-24 text-slate-400 text-xs font-semibold">
          <Loader2 className="h-5 w-5 animate-spin mr-2 text-orange-500" /> Loading account settings...
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Account Settings & Preferences">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-6">
        {/* Settings Vertical Navigation Menu */}
        <div className="w-full md:w-64 shrink-0 space-y-1 bg-white dark:bg-slate-900 p-3 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm h-fit text-xs font-semibold">
          {[
            { id: 'PROFILE', label: 'My Details & Profile', icon: User },
            { id: 'APPEARANCE', label: 'Appearance & Theme', icon: Sun },
            { id: 'LANGUAGE', label: 'Language Preferences', icon: Globe },
            ...(isProf ? [{ id: 'SUBSCRIPTION', label: 'Manage Subscription', icon: CreditCard }] : []),
            { id: 'SECURITY', label: 'My Account & Security', icon: Lock },
            { id: 'HELP', label: 'Help & Support', icon: HelpCircle },
            { id: 'DANGER', label: 'Delete / Deactivate Account', icon: Trash2, danger: true },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-center space-x-3 px-3.5 py-3 rounded-xl transition-colors ${
                  isActive
                    ? tab.danger
                      ? 'bg-rose-600 text-white shadow-sm font-bold'
                      : 'bg-blue-600 dark:bg-orange-500 text-white shadow-sm font-bold'
                    : tab.danger
                    ? 'text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Dynamic Tab Content Panel */}
        <div className="flex-1 min-w-0">
          {/* PROFILE DETAILS */}
          {activeTab === 'PROFILE' && (
            <Card className="p-6 dark:border-orange-500/30">
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1 flex items-center">
                <User className="h-4 w-4 mr-2 text-orange-500" /> My Details & Profile
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">Manage your contact information and regional location preferences.</p>

              {profileStatus && (
                <div className={`mb-4 p-3 rounded-lg text-xs font-semibold border ${profileStatus.startsWith('✅') ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'}`}>
                  {profileStatus}
                </div>
              )}

              <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
                <Input
                  label="Full Name / Primary Contact"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Rajesh Kumar"
                />
                <Input
                  label="Email Address (Read-Only)"
                  value={user?.email || ''}
                  disabled
                  className="bg-slate-100 dark:bg-slate-800 text-slate-500"
                />
                <Input
                  label="Mobile Phone Number"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  placeholder="+91 9876543210"
                />
                <Input
                  label="Primary City"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Bengaluru"
                />

                <div className="pt-2">
                  <Button type="submit" onClick={handleSaveProfile} isLoading={isSavingProfile}>
                    Save Profile Changes
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {/* APPEARANCE & THEME */}
          {activeTab === 'APPEARANCE' && (
            <Card className="p-6 dark:border-orange-500/30">
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1 flex items-center">
                <Sun className="h-4 w-4 mr-2 text-orange-500" /> Appearance & Theme Mode
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">Customize interface theme. Instantly applies and syncs across sessions.</p>

              {themeStatus && (
                <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-semibold">
                  {themeStatus}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Light Mode Card */}
                <div
                  onClick={() => handleThemeSelect('light')}
                  className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between space-y-3 ${
                    theme === 'light' ? 'border-orange-500 bg-orange-50/20 shadow-md' : 'border-slate-200 dark:border-slate-800 hover:border-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Sun className="h-6 w-6 text-amber-500" />
                    {theme === 'light' && <Badge variant="orange">Active</Badge>}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">Light Mode</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Clean slate background with high-contrast text.</p>
                  </div>
                </div>

                {/* Dark Mode Card */}
                <div
                  onClick={() => handleThemeSelect('dark')}
                  className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between space-y-3 ${
                    theme === 'dark' ? 'border-orange-500 bg-slate-900 text-white shadow-md' : 'border-slate-200 dark:border-slate-800 hover:border-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Moon className="h-6 w-6 text-blue-400" />
                    {theme === 'dark' && <Badge variant="orange">Active</Badge>}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">Dark Mode</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Sleek deep navy aesthetic designed for low light.</p>
                  </div>
                </div>

                {/* System Mode Card */}
                <div
                  onClick={() => handleThemeSelect('system')}
                  className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between space-y-3 ${
                    theme === 'system' ? 'border-orange-500 bg-slate-100 dark:bg-slate-800 shadow-md' : 'border-slate-200 dark:border-slate-800 hover:border-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Monitor className="h-6 w-6 text-slate-500" />
                    {theme === 'system' && <Badge variant="orange">Active</Badge>}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">System Default</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Automatically matches your OS theme settings.</p>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* LANGUAGE */}
          {activeTab === 'LANGUAGE' && (
            <Card className="p-6 dark:border-orange-500/30">
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1 flex items-center">
                <Globe className="h-4 w-4 mr-2 text-orange-500" /> Language Preferences
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">Choose your preferred display language for marketplace notifications and interface.</p>

              {langStatus && (
                <div className={`mb-4 p-3 rounded-lg text-xs font-semibold border ${langStatus.startsWith('✅') ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'}`}>
                  {langStatus}
                </div>
              )}

              <div className="space-y-4 max-w-md">
                <Select
                  label="Display Language"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  options={[
                    { label: 'English (Default)', value: 'English' },
                    { label: 'Hindi (हिंदी)', value: 'Hindi' },
                    { label: 'Marathi (मराठी)', value: 'Marathi' },
                    { label: 'Kannada (कन्नड)', value: 'Kannada' },
                    { label: 'Tamil (தமிழ்)', value: 'Tamil' },
                  ]}
                />

                <p className="text-[11px] text-slate-400">
                  Selected language will be saved to your profile and used across email alerts and marketplace updates.
                </p>

                <Button size="sm" onClick={handleLanguageUpdate} isLoading={isUpdatingLanguage}>
                  Update Language
                </Button>
              </div>
            </Card>
          )}

          {/* SUBSCRIPTION (PROFESSIONAL ONLY) */}
          {activeTab === 'SUBSCRIPTION' && isProf && (
            <Card className="p-6">
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1 flex items-center">
                <CreditCard className="h-4 w-4 mr-2 text-orange-500" /> Manage Subscription
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">View your active partner plan and billing history.</p>

              <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 space-y-4 mb-6">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-orange-400">Current Plan</span>
                    <h4 className="text-lg font-bold text-white mt-0.5">Contractor Partner Membership</h4>
                    <p className="text-xs text-slate-400 mt-1">Rs 1,299 / year (Discounted from Rs 1,499)</p>
                  </div>
                  <Badge variant="success">45-Day Trial Active</Badge>
                </div>

                <div className="pt-3 border-t border-slate-800 flex justify-between items-center text-xs text-slate-300">
                  <span>Billing Cycle: Yearly</span>
                  <Button size="sm" variant="outline" className="border-slate-700 text-white hover:bg-slate-800" onClick={() => navigate('/professional/subscription')}>
                    Change / Upgrade Plan
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* SECURITY */}
          {activeTab === 'SECURITY' && (
            <Card className="p-6 dark:border-orange-500/30">
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1 flex items-center">
                <Lock className="h-4 w-4 mr-2 text-orange-500" /> My Account & Security
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">Update your account password and security credentials.</p>

              {passwordStatus && (
                <div className={`mb-4 p-3 rounded-lg text-xs font-semibold border ${passwordStatus.startsWith('✅') ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'}`}>
                  {passwordStatus}
                </div>
              )}

              <form onSubmit={handlePasswordChange} className="space-y-4 text-xs max-w-md">
                <Input
                  label="Current Password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
                <Input
                  label="New Password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
                <Input
                  label="Confirm New Password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />

                <Button type="submit" size="sm" isLoading={isUpdatingPassword}>
                  Update Password
                </Button>
              </form>
            </Card>
          )}

          {/* HELP & SUPPORT */}
          {activeTab === 'HELP' && (
            <Card className="p-6 dark:border-orange-500/30">
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1 flex items-center">
                <HelpCircle className="h-4 w-4 mr-2 text-orange-500" /> Need Help & Partner Assistance
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">Need support? Connect with live chat agents or submit a ticket directly to the Admin Queue.</p>

              <div className="space-y-6">
                {/* Option 1: Chat with Support Placeholder UI */}
                <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md">
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 bg-orange-600 rounded-xl text-white">
                      <MessageSquare className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Chat with Live Support</h4>
                      <p className="text-xs text-slate-300 mt-0.5">Instant 24/7 assistance for platform bidding & billing queries</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="primary"
                    className="shadow-md shadow-orange-600/30 shrink-0"
                    onClick={() => {
                      setIsChatOpen(true);
                    }}
                  >
                    💬 Start Live Chat
                  </Button>
                </div>

                {isChatOpen && (
                  <LiveSupportChatBox onClose={() => setIsChatOpen(false)} />
                )}

                {/* Option 2: Contact Support Ticket Form */}
                <div className="bg-slate-50 dark:bg-slate-900/60 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">Contact Support & Submit Ticket</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Tickets submitted here save directly to the PostgreSQL database and appear in the Admin Reports & Complaints queue.</p>

                  {ticketStatus && (
                    <div className={`p-3 rounded-lg text-xs font-semibold border ${ticketStatus.startsWith('✅') ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'}`}>
                      {ticketStatus}
                    </div>
                  )}

                  <form onSubmit={handleSupportTicketSubmit} className="space-y-4 text-xs max-w-lg">
                    <Select
                      label="Inquiry / Dispute Category"
                      value={ticketCategory}
                      onChange={(e) => setTicketCategory(e.target.value)}
                      options={[
                        { label: 'Technical Issue', value: 'TECHNICAL' },
                        { label: 'Payment / Billing Dispute', value: 'BILLING' },
                        { label: 'Report a Listing / Contractor', value: 'DISPUTE' },
                        { label: 'General Account Support', value: 'SUPPORT' },
                      ]}
                    />
                    <Input
                      label="Subject"
                      required
                      placeholder="e.g. Issue submitting line-item quotation"
                      value={ticketSubject}
                      onChange={(e) => setTicketSubject(e.target.value)}
                    />
                    <div>
                      <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Message Details</label>
                      <textarea
                        rows={4}
                        className="w-full p-3 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
                        required
                        placeholder="Describe your issue or dispute details..."
                        value={ticketMessage}
                        onChange={(e) => setTicketMessage(e.target.value)}
                      ></textarea>
                    </div>
                    <Button type="submit" size="sm" isLoading={isSubmittingTicket}>
                      <Send className="h-4 w-4 mr-1.5" /> Submit Support Ticket
                    </Button>
                  </form>
                </div>
              </div>
            </Card>
          )}

          {/* DANGER ZONE - DELETE / DEACTIVATE */}
          {activeTab === 'DANGER' && (
            <Card className="p-6 border-2 border-rose-500/40 bg-rose-50/30">
              <h3 className="text-base font-bold text-rose-900 mb-1 flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-rose-600" /> Danger Zone: Deactivate or Delete Account
              </h3>
              <p className="text-xs text-rose-700 mb-6">Manage account deactivation or permanent deletion of your StroitX account data.</p>

              <div className="space-y-6">
                {/* Deactivate */}
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-rose-200 dark:border-rose-900/60 space-y-2">
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">Deactivate Account (Temporary)</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Temporarily hide your profile and active project listings. You can reactivate anytime by logging back in.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-rose-300 text-rose-700 hover:bg-rose-50 mt-2"
                    onClick={handleDeactivate}
                    isLoading={isDeactivating}
                  >
                    Deactivate Account (Temporary)
                  </Button>
                </div>

                {/* Delete */}
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-rose-300 dark:border-rose-900 space-y-2 shadow-sm">
                  <h4 className="font-bold text-rose-900 dark:text-rose-400 text-sm">Delete Account (Permanent)</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Permanently delete your account, quotations, portfolio items, and conversation records. This action cannot be reversed.
                  </p>
                  <Button
                    variant="danger"
                    size="sm"
                    className="mt-2"
                    onClick={handleDelete}
                    isLoading={isDeleting}
                  >
                    <Trash2 className="h-4 w-4 mr-1.5" /> Delete Account (Permanent)
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};
