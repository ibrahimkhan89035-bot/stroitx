import React from 'react';
import { useParams } from 'react-router-dom';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Shield, FileText, RefreshCcw, AlertCircle, CheckSquare, Scale, Cookie, AlertTriangle } from 'lucide-react';

const policies: Record<string, { title: string; icon: any; content: React.ReactNode }> = {
  'terms': {
    title: 'Terms & Conditions',
    icon: FileText,
    content: (
      <div className="space-y-4 text-slate-600 leading-relaxed text-sm">
        <p><strong>1. Platform Role:</strong> StroitX is a technology marketplace connecting homeowners with independent construction professionals. StroitX does not execute construction projects, employ the professionals, or guarantee the quality, safety, or legality of the work performed.</p>
        <p><strong>2. Homeowner Accounts:</strong> Registration and directory access for homeowners are 100% free.</p>
        <p><strong>3. Professional Subscriptions:</strong> Construction professionals are required to pay a non-refundable Platform Maintenance Fee of ₹1,299 per year to list their services, display portfolios, and receive inquiries.</p>
        <p><strong>4. Liability:</strong> Any contracts, payments, or disputes arising from construction work are strictly between the homeowner and the professional. StroitX is not a party to these agreements.</p>
      </div>
    )
  },
  'refunds': {
    title: 'Refund & Cancellation Policy',
    icon: RefreshCcw,
    content: (
      <div className="space-y-4 text-slate-600 leading-relaxed text-sm">
        <p><strong>1. Maintenance Fee:</strong> The ₹1,299 annual Platform Maintenance Fee is applied toward profile hosting, portfolio storage, and platform access.</p>
        <p><strong>2. Refunds:</strong> Refunds are only issued if a professional's profile is rejected during our initial verification process. Once a profile is approved and live, the annual fee is strictly non-refundable.</p>
        <p><strong>3. Auto-Renewal:</strong> Subscriptions will automatically renew annually. Professionals may cancel their auto-renewal at any time via their Dashboard settings. Cancellation ensures no future charges will occur, but partial refunds for the current billing cycle will not be provided.</p>
      </div>
    )
  },
  'privacy': {
    title: 'Privacy & Data Retention Policy',
    icon: Shield,
    content: (
      <div className="space-y-4 text-slate-600 leading-relaxed text-sm">
        <p><strong>1. Data Collection:</strong> StroitX collects personal and business details, including phone numbers, project addresses, and professional portfolios, solely to facilitate marketplace connections.</p>
        <p><strong>2. Professional Verification:</strong> StroitX conducts basic credential checks on professionals. However, homeowners remain responsible for independently verifying licenses and insurance before hiring.</p>
        <p><strong>3. Data Retention & Deletion:</strong> We retain active account data to provide our services. Users may request complete account and data deletion by contacting our Grievance Officer. Deletion requests are processed within 30 days.</p>
      </div>
    )
  },
  'disclaimer': {
    title: 'Platform Disclaimer',
    icon: AlertTriangle,
    content: (
      <div className="space-y-4 text-slate-600 leading-relaxed text-sm">
        <p><strong>1. No Endorsement:</strong> The listing of a construction professional on StroitX does not constitute an endorsement, guarantee, or warranty of their services, financial stability, or structural engineering capabilities.</p>
        <p><strong>2. Financial & Structural Liability:</strong> StroitX shall not be held liable for any financial losses, property damage, structural failures, construction delays, or contractual breaches resulting from engagements formed through this platform.</p>
        <p><strong>3. Independent Verification:</strong> Homeowners are strongly advised to independently verify the credentials, past work, and active insurance policies of any professional before making payments or signing construction contracts.</p>
      </div>
    )
  },
  'acceptable-use': {
    title: 'Acceptable Use Policy',
    icon: CheckSquare,
    content: (
      <div className="space-y-4 text-slate-600 leading-relaxed text-sm">
        <p><strong>1. Prohibited Conduct:</strong> Users must not harass, abuse, or spam other members of the platform. Submission of fraudulent project inquiries or deceptive portfolios is strictly forbidden.</p>
        <p><strong>2. Review Integrity:</strong> Professionals are prohibited from artificially inflating their ratings by submitting fake reviews or offering financial incentives for positive feedback. Homeowners must submit honest reviews based strictly on factual project experiences.</p>
        <p><strong>3. Enforcement:</strong> Violation of these rules may result in immediate account suspension without refund of the annual maintenance fee.</p>
      </div>
    )
  },
  'grievance': {
    title: 'Grievance & Complaints Policy',
    icon: Scale,
    content: (
      <div className="space-y-4 text-slate-600 leading-relaxed text-sm">
        <p><strong>1. Dispute Resolution:</strong> While StroitX is not a party to contracts between homeowners and professionals, we provide a mechanism to report platform abuse or fraudulent profiles.</p>
        <p><strong>2. Grievance Officer:</strong> In compliance with the Consumer Protection (E-Commerce) Rules, 2020, users may submit official complaints regarding platform operations, payments, or privacy violations by emailing our designated Grievance Officer at grievances@stroitx.com.</p>
        <p><strong>3. Response Time:</strong> We acknowledge complaints within 48 hours and strive to resolve platform-related issues within 30 days.</p>
      </div>
    )
  },
  'cookies': {
    title: 'Cookie Policy',
    icon: Cookie,
    content: (
      <div className="space-y-4 text-slate-600 leading-relaxed text-sm">
        <p><strong>1. Usage:</strong> StroitX uses essential cookies to maintain secure login sessions and process payments safely.</p>
        <p><strong>2. Analytics:</strong> We utilize basic analytical cookies to understand website traffic patterns and improve platform performance. We do not sell cookie data to third-party advertising networks.</p>
        <p><strong>3. Consent:</strong> By continuing to use StroitX, you consent to our deployment of strictly necessary cookies. You may disable non-essential cookies through your browser settings.</p>
      </div>
    )
  }
};

// Aliases
policies['refund'] = policies['refunds'];
policies['terms-of-service'] = policies['terms'];
policies['privacy-policy'] = policies['privacy'];

import { MetaSEO } from '../components/seo/MetaSEO';
import { BreadcrumbNav } from '../components/seo/BreadcrumbNav';

export const LegalPolicy: React.FC = () => {
  const { policyType } = useParams<{ policyType: string }>();
  const normalizedKey = (policyType || 'terms').toLowerCase();
  const policy = policies[normalizedKey] || policies['terms'];
  const Icon = policy.icon;

  const titleText = `${policy.title} | StroitX Legal & Compliance`;
  const descText = `Read StroitX's ${policy.title}. Transparent terms, privacy protection, and fair dispute policies for homeowners and construction contractors in India.`;

  return (
    <DashboardLayout title={policy.title}>
      <MetaSEO
        title={titleText}
        description={descText}
        canonicalPath={`/legal/${policyType || 'terms'}`}
        dateModified="2026-10-17"
        breadcrumbs={[
          { name: 'Legal & Policies', url: `/legal/${policyType || 'terms'}` },
          { name: policy.title, url: `/legal/${policyType || 'terms'}` },
        ]}
      />
      <div className="max-w-4xl mx-auto mb-4">
        <BreadcrumbNav
          items={[
            { label: 'Legal Policies', path: '/legal/terms' },
            { label: policy.title, path: `/legal/${policyType || 'terms'}` },
          ]}
        />
      </div>
      <div className="max-w-4xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-sm p-8 md:p-12 mb-10">
        <div className="flex items-center gap-4 mb-8 border-b border-slate-100 pb-6">
          <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
            <Icon className="w-8 h-8" />
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">{policy.title}</h1>
        </div>
        
        <div className="prose prose-slate max-w-none">
          {policy.content}
        </div>
        
        <div className="mt-12 bg-slate-50 border border-slate-200 rounded-xl p-5 flex gap-4 items-start">
          <AlertCircle className="w-6 h-6 text-slate-400 shrink-0 mt-0.5" />
          <p className="text-xs text-slate-500">
            These terms are compliant with India's Consumer Protection (E-Commerce) Rules and Digital Personal Data Protection Act. By using StroitX, you agree to these conditions. Last updated: October 17, 2026.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};