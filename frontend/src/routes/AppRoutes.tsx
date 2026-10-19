import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';

// Public Pages
import { LandingPage } from '../pages/LandingPage';
import { GatewayPage } from '../pages/GatewayPage';
import { LoginPage } from '../pages/LoginPage';
import { SignupPage } from '../pages/SignupPage';
import { VerifyEmailPage } from '../pages/VerifyEmailPage';
import { LegalPolicy } from '../pages/LegalPolicy'; // <-- Added Import
import { HowItWorksPage } from '../pages/HowItWorksPage';
import { ContractorVsArchitectPage } from '../pages/ContractorVsArchitectPage';
import { ConstructionCostGuidePage } from '../pages/ConstructionCostGuidePage';
import { PublicDirectoryPage } from '../pages/PublicDirectoryPage';
import { ForgotPassword } from '../pages/ForgotPassword';
import { ResetPassword } from '../pages/ResetPassword';

// Homeowner Pages
import { HomeownerDashboard } from '../pages/homeowner/HomeownerDashboard';
import { PostProjectWizard } from '../pages/homeowner/PostProjectWizard';
import { MyProjectsPage } from '../pages/homeowner/MyProjectsPage';
import { ProjectDetailsPage } from '../pages/homeowner/ProjectDetailsPage';
import { FindProfessionalsPage } from '../pages/homeowner/FindProfessionalsPage';
import { QuoteComparisonPage } from '../pages/homeowner/QuoteComparisonPage';
import { HomeownerPaymentsPage } from '../pages/homeowner/HomeownerPaymentsPage';
import { HomeownerQuotesPage } from '../pages/homeowner/HomeownerQuotesPage';

// Professional Pages
import { ProfessionalDashboard } from '../pages/professional/ProfessionalDashboard';
import { FindProjectsPage } from '../pages/professional/FindProjectsPage';
import { SubmitQuotePage } from '../pages/professional/SubmitQuotePage';
import { VerificationPage } from '../pages/professional/VerificationPage';
import { SubscriptionPage } from '../pages/professional/SubscriptionPage';
import { ProfessionalLeadsPage } from '../pages/professional/ProfessionalLeadsPage';
import { ProfessionalWorkPage } from '../pages/professional/ProfessionalWorkPage';
import { ProfessionalPortfolioPage } from '../pages/professional/ProfessionalPortfolioPage';
import { ProfessionalHelpPage } from '../pages/professional/ProfessionalHelpPage';
import { ProfilePage } from '../pages/ProfilePage';
import { NotificationsPage } from '../pages/NotificationsPage';
import { PublicProfessionalProfile } from '../pages/PublicProfessionalProfile';
import { MessagesPage } from '../pages/MessagesPage';
import { SettingsPage } from '../pages/SettingsPage';

// Workspace & Communications
import { ProjectWorkspacePage } from '../pages/workspace/ProjectWorkspacePage';

// Admin Pages
import { AdminLoginPage } from '../pages/admin/AdminLoginPage';
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage';
import { AdminHomeownersPage } from '../pages/admin/AdminHomeownersPage';
import { AdminProfessionalsPage } from '../pages/admin/AdminProfessionalsPage';
import { AdminProjectsPage } from '../pages/admin/AdminProjectsPage';
import { AdminSubscriptionsPage } from '../pages/admin/AdminSubscriptionsPage';
import { AdminPaymentsPage } from '../pages/admin/AdminPaymentsPage';
import { AdminReportsPage } from '../pages/admin/AdminReportsPage';
import { AdminNotificationsPage } from '../pages/admin/AdminNotificationsPage';
import { AdminModerationPage } from '../pages/admin/AdminModerationPage';
import { AdminUsersPage } from '../pages/admin/AdminUsersPage';
import { AdminVerificationQueuePage } from '../pages/admin/AdminVerificationQueuePage';
import { AdminAuditLogsPage } from '../pages/admin/AdminAuditLogsPage';
import { AdminSettingsPage } from '../pages/admin/AdminSettingsPage';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/gateway" element={<GatewayPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage defaultRole="HOMEOWNER" />} />
      <Route path="/signup/:role" element={<SignupPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route path="/legal/:policyType" element={<LegalPolicy />} /> {/* <-- Added Route */}
      <Route path="/how-it-works" element={<HowItWorksPage />} />
      <Route path="/contractor-vs-architect" element={<ContractorVsArchitectPage />} />
      <Route path="/construction-cost-guide" element={<ConstructionCostGuidePage />} />
      <Route path="/verified-professionals" element={<PublicDirectoryPage />} />
      <Route path="/professional/:id" element={<PublicProfessionalProfile />} />

      {/* Homeowner Routes */}
      <Route element={<ProtectedRoute allowedRoles={['HOMEOWNER']} />}>
        <Route path="/homeowner/dashboard" element={<HomeownerDashboard />} />
        <Route path="/homeowner/post-project" element={<PostProjectWizard />} />
        <Route path="/homeowner/projects" element={<MyProjectsPage />} />
        <Route path="/homeowner/projects/:id" element={<ProjectDetailsPage />} />
        <Route path="/homeowner/find-professionals" element={<FindProfessionalsPage />} />
        <Route path="/homeowner/projects/:projectId/compare" element={<QuoteComparisonPage />} />
        <Route path="/homeowner/payments" element={<HomeownerPaymentsPage />} />
        <Route path="/homeowner/quotes" element={<HomeownerQuotesPage />} />
        <Route path="/homeowner/messages" element={<MessagesPage />} />
        <Route path="/homeowner/notifications" element={<NotificationsPage />} />
        <Route path="/homeowner/settings" element={<SettingsPage />} />
      </Route>

      {/* Professional Routes */}
      <Route element={<ProtectedRoute allowedRoles={['PROFESSIONAL']} />}>
        <Route path="/professional/dashboard" element={<ProfessionalDashboard />} />
        <Route path="/professional/find-projects" element={<FindProjectsPage />} />
        <Route path="/professional/leads" element={<ProfessionalLeadsPage />} />
        <Route path="/professional/work" element={<ProfessionalWorkPage />} />
        <Route path="/professional/messages" element={<MessagesPage />} />
        <Route path="/professional/portfolio" element={<ProfessionalPortfolioPage />} />
        <Route path="/professional/subscription" element={<SubscriptionPage />} />
        <Route path="/professional/verification" element={<VerificationPage />} />
        <Route path="/professional/submit-quote/:projectId" element={<SubmitQuotePage />} />
        <Route path="/professional/notifications" element={<NotificationsPage />} />
        <Route path="/professional/help" element={<ProfessionalHelpPage />} />
        <Route path="/professional/settings" element={<SettingsPage />} />
        <Route path="/professional/quotes" element={<ProfessionalLeadsPage />} />
        <Route path="/professional/earnings" element={<ProfessionalDashboard />} />
      </Route>

      {/* Shared Workspace & Profile Routes */}
      <Route element={<ProtectedRoute allowedRoles={['HOMEOWNER', 'PROFESSIONAL', 'ADMIN', 'FOUNDER']} />}>
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/messages" element={<MessagesPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/workspace/:projectId" element={<ProjectWorkspacePage />} />
      </Route>

      {/* Admin / Founder Protected Routes */}
      <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'FOUNDER']} />}>
        <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
        <Route path="/admin/homeowners" element={<AdminHomeownersPage />} />
        <Route path="/admin/professionals" element={<AdminProfessionalsPage />} />
        <Route path="/admin/verification-queue" element={<AdminVerificationQueuePage />} />
        <Route path="/admin/projects" element={<AdminProjectsPage />} />
        <Route path="/admin/subscriptions" element={<AdminSubscriptionsPage />} />
        <Route path="/admin/payments" element={<AdminPaymentsPage />} />
        <Route path="/admin/reports" element={<AdminReportsPage />} />
        <Route path="/admin/notifications" element={<AdminNotificationsPage />} />
        <Route path="/admin/moderation" element={<AdminModerationPage />} />
        <Route path="/admin/users" element={<AdminUsersPage />} />
        <Route path="/admin/transactions" element={<AdminPaymentsPage />} />
        <Route path="/admin/audit-logs" element={<AdminAuditLogsPage />} />
        <Route path="/admin/settings" element={<AdminSettingsPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};