import React, { useState } from 'react';
import { Navbar } from '../components/layout/Navbar';
import { useNavigate } from 'react-router-dom';
import { MetaSEO } from '../components/seo/MetaSEO';
import { BreadcrumbNav } from '../components/seo/BreadcrumbNav';
import { AuthorBio } from '../components/seo/AuthorBio';
import { Button } from '../components/ui/Button';
import {
  FileText,
  SlidersHorizontal,
  ShieldCheck,
  CreditCard,
  CheckCircle2,
  HelpCircle,
  ChevronDown,
  ArrowRight,
  HardHat,
  Building2,
  Lock,
  Layers,
} from 'lucide-react';

export const HowItWorksPage: React.FC = () => {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How does StroitX protect homeowner payments?',
      a: 'StroitX utilizes a milestone-linked escrow payment framework. Homeowners fund only the active milestone (e.g. Foundation, Framing, MEP, Finishing). Funds are never released until the homeowner inspects the work and verifies quality compliance against the agreed specifications.',
    },
    {
      q: 'How are contractors and architects vetted on StroitX?',
      a: 'Every professional undergoes a 4-point verification check: 1) Active GST registration and business license verification; 2) PAN & Aadhaar identity checks; 3) Prior project portfolio audit; and 4) Mandatory ₹2 auto-pay mandate authorization to ensure verified banking details.',
    },
    {
      q: 'Is StroitX free for homeowners?',
      a: 'Yes, 100% free. Homeowners can post unlimited construction and renovation requirements, receive transparent line-by-line quotes, compare bids, and communicate directly with verified professionals with zero platform commissions.',
    },
    {
      q: 'How does quote comparison work on StroitX?',
      a: 'Unlike generic classifieds, StroitX mandates standardized line-item bidding. You receive detailed itemized breakdowns for structural labour, cement, steel, sand, MEP fittings, architectural fees, and timelines, enabling side-by-side apples-to-apples comparison.',
    },
    {
      q: 'Can I hire an architect and a general contractor separately?',
      a: 'Absolutely. You can hire an architect for 2D/3D blueprints and structural design first, and subsequently post your finalized bill of quantities (BOQ) to invite tenders from vetted general contractors.',
    },
  ];

  const faqSchema = {
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.a,
      },
    })),
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <MetaSEO
        title="How StroitX Works — Transparent Construction & Bidding"
        description="Learn how StroitX connects homeowners with KYC-verified contractors. Post projects, compare line-item quotes, and build with milestone payment protection."
        canonicalPath="/how-it-works"
        keywords="how stroitx works, construction marketplace process, verified contractor hiring, milestone payment protection, construction quotation comparison"
        breadcrumbs={[
          { name: 'How It Works', url: '/how-it-works' },
        ]}
        schemaData={faqSchema}
      />

      <Navbar />

      <main className="flex-1">
        {/* Hero Header */}
        <header className="bg-slate-900 text-white py-16 lg:py-20 border-b border-slate-800 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#f97316_1px,transparent_1px)] [background-size:16px_16px]"></div>
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <BreadcrumbNav
              items={[{ label: 'How It Works', path: '/how-it-works' }]}
              className="justify-center text-slate-400 mb-4"
            />
            <div className="inline-flex items-center gap-2 bg-slate-800 border border-slate-700 px-3.5 py-1.5 rounded-full text-xs font-semibold text-orange-400 mb-4">
              <Layers className="w-4 h-4" />
              <span>Step-by-Step Construction Ecosystem</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
              How StroitX Works: <span className="text-orange-500">From Vision to Handover</span>
            </h1>
            <p className="mt-4 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto font-light leading-relaxed">
              Eliminate construction guesswork with verified contractors, standardized quote comparisons, and milestone-backed payment protection.
            </p>
          </div>
        </header>

        {/* 4 Core Pillars */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16" aria-labelledby="process-heading">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 id="process-heading" className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              A 4-Stage Protected Construction Journey
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Built by certified civil engineers to resolve delays, cost overruns, and contractor disputes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Step 1 */}
            <article className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center font-extrabold text-lg">
                  1
                </div>
                <div>
                  <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">Step 1 • Requirements</span>
                  <h3 className="text-lg font-bold text-slate-900">Post Detailed Project Scope</h3>
                </div>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                Use our guided 10-step wizard to define your site location, built-up area (sq ft), target timeline, structural requirements, and budget expectations. Upload CAD/PDF blueprints and 3D architectural elevations.
              </p>
              <ul className="space-y-2 text-xs text-slate-700 font-medium">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> New construction, interior redesign, or civil extension</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Direct notification to verified contractors in your pin code</li>
              </ul>
            </article>

            {/* Step 2 */}
            <article className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center font-extrabold text-lg">
                  2
                </div>
                <div>
                  <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Step 2 • Line-by-Line Bidding</span>
                  <h3 className="text-lg font-bold text-slate-900">Receive Standardized Quotes</h3>
                </div>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                Vetted professionals review your requirements and submit itemized tenders with exact unit rates. No vague lump-sum quotes—everything from steel grade (Fe 550D) to cement brand (OPC 53) is documented.
              </p>
              <ul className="space-y-2 text-xs text-slate-700 font-medium">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Transparent material vs labour breakdown</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Fixed timeline commitments with penalty clauses</li>
              </ul>
            </article>

            {/* Step 3 */}
            <article className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center font-extrabold text-lg">
                  3
                </div>
                <div>
                  <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Step 3 • Comparison</span>
                  <h3 className="text-lg font-bold text-slate-900">Apples-to-Apples Bid Comparison</h3>
                </div>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                Our Quote Comparison tool places submitted proposals side-by-side. Spot discrepancies, identify missing line items, compare contractor past ratings, and interview finalists via chat or in person.
              </p>
              <ul className="space-y-2 text-xs text-slate-700 font-medium">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Detailed rate benchmarking against regional averages</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> KYC audit credentials visible on professional profile</li>
              </ul>
            </article>

            {/* Step 4 */}
            <article className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center font-extrabold text-lg">
                  4
                </div>
                <div>
                  <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">Step 4 • Protection</span>
                  <h3 className="text-lg font-bold text-slate-900">Milestone Escrow & Handover</h3>
                </div>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                Sign contracts with digital milestones. Pay only for the active stage. Release funds only after on-site photographic inspection and structural compliance. Retain 5-10% retention fee until final defect liability period.
              </p>
              <ul className="space-y-2 text-xs text-slate-700 font-medium">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Escrow safety prevents advance payment default</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Complete defect liability warranty documentation</li>
              </ul>
            </article>
          </div>

          {/* Author E-E-A-T Component */}
          <AuthorBio
            dateModified="October 17, 2026"
            topic="Standardized Construction Procurement & Escrow Milestones"
          />

          {/* Interactive FAQ Section */}
          <section className="mt-16 bg-white p-8 sm:p-10 rounded-2xl border border-slate-200 shadow-sm" aria-labelledby="faq-heading">
            <div className="text-center max-w-xl mx-auto mb-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-800 mb-2">
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Frequently Asked Questions</span>
              </div>
              <h2 id="faq-heading" className="text-2xl font-extrabold text-slate-900">
                Got Questions About StroitX?
              </h2>
            </div>

            <div className="divide-y divide-slate-100 max-w-3xl mx-auto">
              {faqs.map((faq, idx) => (
                <div key={idx} className="py-4">
                  <button
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="w-full flex items-center justify-between text-left font-bold text-slate-900 text-sm sm:text-base hover:text-orange-600 transition-colors"
                    aria-expanded={openFaq === idx}
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-5 h-5 text-slate-400 transition-transform ${
                        openFaq === idx ? 'rotate-180 text-orange-600' : ''
                      }`}
                    />
                  </button>
                  {openFaq === idx && (
                    <div className="mt-3 text-sm text-slate-600 leading-relaxed pr-6 animate-fadeIn">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Final Conversion CTA */}
          <section className="mt-16 bg-gradient-to-r from-orange-600 to-amber-600 rounded-3xl p-8 sm:p-12 text-white text-center shadow-xl">
            <h2 className="text-2xl sm:text-4xl font-extrabold mb-4">
              Ready to Experience Protected Construction?
            </h2>
            <p className="text-sm sm:text-base text-orange-100 max-w-2xl mx-auto mb-8 font-light leading-relaxed">
              Join thousands of homeowners and verified building professionals constructing homes on India's most transparent marketplace.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white font-bold px-8 shadow-lg border-0"
                onClick={() => navigate('/gateway?role=HOMEOWNER')}
              >
                Post Your Construction Project (Free)
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto border-white text-white hover:bg-white/10 font-bold px-8"
                onClick={() => navigate('/gateway?role=PROFESSIONAL')}
              >
                Join as Verified Contractor
              </Button>
            </div>
          </section>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-950 text-white py-12 border-t border-slate-800 text-xs text-center text-slate-500">
        <p>© 2026 StroitX Technologies Pvt. Ltd. All rights reserved. Built to NBC 2016 Standards.</p>
      </footer>
    </div>
  );
};
