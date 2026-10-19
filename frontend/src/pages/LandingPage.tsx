import React from 'react';
import { Navbar } from '../components/layout/Navbar';
import { useNavigate, Link } from 'react-router-dom';
import { MetaSEO } from '../components/seo/MetaSEO';
import {
  HardHat,
  ShieldCheck,
  FileCheck,
  CreditCard,
  Users,
  Search,
  CheckCircle2,
  ArrowRight,
  Building2,
  Paintbrush,
  Ruler,
  Wrench,
  Zap,
  Lock,
} from 'lucide-react';
import { Button } from '../components/ui/Button';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <MetaSEO
        title="StroitX — India's Verified Construction Marketplace"
        description="StroitX connects homeowners with KYC-verified contractors, architects & interior designers across India. Post projects, compare line-by-line quotes, and build with milestone-based payment protection."
        canonicalPath="/"
        keywords="construction marketplace India, verified contractors, architects, interior designers, home renovation, building professionals, construction quotes, StroitX"
        dateModified="2026-10-17"
      />
      <Navbar />

      {/* Hero Section */}
      <section className="bg-slate-900 text-white relative overflow-hidden py-24 lg:py-32">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#f97316_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center space-x-2 bg-slate-800 border border-slate-700 rounded-full px-4 py-1.5 text-xs text-orange-400 font-medium mb-6">
            <ShieldCheck className="h-4 w-4" />
            <span>India's Premier Verified Construction Marketplace</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight">
            Build Better. <span className="text-orange-500">Connect Smarter.</span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto font-light leading-relaxed">
            Find trusted construction professionals, discover high-value projects, manage detailed quotations, and build with total transparency.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="w-full sm:w-auto px-8 shadow-lg shadow-orange-600/30" onClick={() => navigate('/gateway')}>
              Find a Professional
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button variant="outline" size="lg" className="w-full sm:w-auto px-8 border-slate-700 text-slate-200 hover:bg-slate-800" onClick={() => navigate('/gateway')}>
              Join as a Professional
            </Button>
          </div>
        </div>
      </section>

      {/* Construction Categories */}
      <section id="categories" className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Every Construction Discipline, One Platform</h2>
            <p className="mt-3 text-slate-600 text-sm">Find specialized experts for every phase of your building or renovation project.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { title: 'New Construction', icon: Building2, desc: 'Turnkey residential & commercial building' },
              { title: 'Renovation & Repairs', icon: Wrench, desc: 'Full structural & aesthetic remodels' },
              { title: 'Interior Design', icon: Paintbrush, desc: 'Architectural interiors & space planning' },
              { title: 'Architectural Plans', icon: Ruler, desc: '2D/3D blueprints & structural layouts' },
              { title: 'Civil & Structural', icon: HardHat, desc: 'Foundations, concrete & RCC works' },
              { title: 'Electrical Contracting', icon: Zap, desc: 'Wiring, automation & power distribution' },
              { title: 'Plumbing & MEP', icon: Wrench, desc: 'High-pressure piping & drainage setup' },
              { title: 'Consultancy & Design', icon: Users, desc: 'Project management & site auditing' },
            ].map((cat, i) => (
              <div key={i} className="p-6 bg-slate-50 border border-slate-200 rounded-xl hover:border-orange-500 hover:shadow-md transition-all group" role="article" aria-label={`${cat.title} - ${cat.desc}`}>
                <cat.icon className="h-8 w-8 text-orange-600 group-hover:scale-110 transition-transform mb-4" aria-hidden="true" />
                <h3 className="font-semibold text-slate-900 text-sm mb-1">{cat.title}</h3>
                <p className="text-xs text-slate-500">{cat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-slate-900">How StroitX Works</h2>
            <p className="mt-3 text-slate-600 text-sm">Transparent, milestone-driven construction ecosystem.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 border border-slate-200 rounded-xl relative shadow-sm">
              <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-bold mb-6">1</div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Post Project Requirements</h3>
              <p className="text-xs text-slate-600 leading-relaxed">Specify location, budget, timelines, blueprints, and project scope through our guided 10-step wizard.</p>
            </div>

            <div className="bg-white p-8 border border-slate-200 rounded-xl relative shadow-sm">
              <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-bold mb-6">2</div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Receive & Compare Quotes</h3>
              <p className="text-xs text-slate-600 leading-relaxed">Verified professionals submit line-by-line breakdown quotes for labour, materials, taxes, and timeline estimates.</p>
            </div>

            <div className="bg-white p-8 border border-slate-200 rounded-xl relative shadow-sm">
              <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-bold mb-6">3</div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Build with Milestones</h3>
              <p className="text-xs text-slate-600 leading-relaxed">Track progress with visual photo updates, manage tasks, sign contracts, and release milestone payments safely.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Verification */}
      <section id="trust" className="py-20 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center space-x-2 bg-slate-800 border border-slate-700 rounded-full px-3 py-1 text-xs text-emerald-400 font-medium mb-4">
                <ShieldCheck className="h-4 w-4" />
                <span>Zero Compromise Security</span>
              </div>
              <h2 className="text-3xl font-bold tracking-tight mb-6">Every Professional Rigorously Verified</h2>
              <ul className="space-y-4 text-slate-300 text-sm">
                <li className="flex items-start"><CheckCircle2 className="h-5 w-5 text-emerald-500 mr-3 shrink-0 mt-0.5" /> GST & Government Business License Audit</li>
                <li className="flex items-start"><CheckCircle2 className="h-5 w-5 text-emerald-500 mr-3 shrink-0 mt-0.5" /> Identity & Trade Registration Document Verification</li>
                <li className="flex items-start"><CheckCircle2 className="h-5 w-5 text-emerald-500 mr-3 shrink-0 mt-0.5" /> Historical Project Portfolio Audit</li>
                <li className="flex items-start"><CheckCircle2 className="h-5 w-5 text-emerald-500 mr-3 shrink-0 mt-0.5" /> Secure Payment Milestone Management</li>
              </ul>
            </div>
            <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 shadow-xl">
              <div className="flex items-center space-x-3 mb-6">
                <Lock className="h-8 w-8 text-orange-500" />
                <div>
                  <h3 className="font-bold text-white text-base">Payment Protection Architecture</h3>
                  <p className="text-xs text-slate-400">Milestone-linked financial management</p>
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-4 rounded-lg border border-slate-700">
                Payment Protection workflow will be available once the supported payment/escrow provider is configured. Homeowners retain total control over fund releases based on verified milestone completions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Coming Soon */}
      <section className="py-16 bg-white text-center border-t border-slate-200">
        <div className="max-w-3xl mx-auto px-4">
          <span className="bg-orange-100 text-orange-800 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">Platform Status</span>
          <h3 className="text-xl font-bold text-slate-900 mt-3 mb-2">Early Access Professional Ecosystem</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            StroitX is currently onboarding verified contractors and homeowners. Real client reviews and rating metrics will populate as active projects complete.
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-orange-600 text-white text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-extrabold tracking-tight">Build Better with StroitX.</h2>
          <p className="mt-4 text-orange-100 text-sm max-w-xl mx-auto">
            Whether you are planning your dream home or looking to expand your construction business, StroitX gives you the tools to succeed.
          </p>
          <div className="mt-8 flex justify-center space-x-4">
            <Button size="lg" className="bg-slate-900 hover:bg-slate-800 text-white border-0 px-8" onClick={() => navigate('/gateway')}>
              Get Started Now
            </Button>
          </div>
        </div>
      </section>

      {/* Main Footer Component */}
      <footer className="bg-[#040B16] text-white pt-16 pb-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8 mb-12">
            
            {/* Column 1: Brand & Contact Info */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-orange-600 rounded-md flex items-center justify-center">
                  <HardHat className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold tracking-tight">StroitX</span>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed mb-8 max-w-xs">
                Build Better. Connect Smarter. Connecting homeowners with verified construction professionals across India.
              </p>
              
              {/* Added Contact Details Section */}
              <div className="space-y-4">
                <h4 className="text-[11px] font-bold tracking-widest text-slate-500 uppercase">Contact Support</h4>
                <div className="flex flex-col space-y-3 text-sm text-slate-300">
                  <a href="tel:+919272597354" className="flex items-center gap-3 hover:text-orange-400 transition-colors w-fit">
                    <div className="w-8 h-8 rounded-full bg-slate-800/50 border border-slate-700/50 flex items-center justify-center">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-500"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                    </div>
                    +91 92725 97354
                  </a>
                  <a href="mailto:helpstroitx@outlook.com" className="flex items-center gap-3 hover:text-orange-400 transition-colors w-fit">
                    <div className="w-8 h-8 rounded-full bg-slate-800/50 border border-slate-700/50 flex items-center justify-center">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-500"><rect width="20" height="16" x="2" y="4" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg>
                    </div>
                    helpstroitx@outlook.com
                  </a>
                </div>
              </div>
            </div>

            {/* Column 2: Homeowners */}
            <div>
              <h4 className="text-[11px] font-bold tracking-widest text-slate-100 uppercase mb-6">For Homeowners</h4>
              <ul className="space-y-3 text-sm text-slate-400">
                <li><Link to="/gateway?role=HOMEOWNER" className="hover:text-white transition-colors">Post a Project</Link></li>
                <li><Link to="/verified-professionals" className="hover:text-white transition-colors">Find Verified Pros</Link></li>
                <li><Link to="/construction-cost-guide" className="hover:text-white transition-colors">Construction Cost Guide</Link></li>
                <li><Link to="/contractor-vs-architect" className="hover:text-white transition-colors">Contractor vs Architect</Link></li>
                <li><Link to="/how-it-works" className="hover:text-white transition-colors">How StroitX Works</Link></li>
              </ul>
            </div>

            {/* Column 3: Professionals */}
            <div>
              <h4 className="text-[11px] font-bold tracking-widest text-slate-100 uppercase mb-6">For Professionals</h4>
              <ul className="space-y-3 text-sm text-slate-400">
                <li><Link to="/gateway?role=PROFESSIONAL" className="hover:text-white transition-colors">Join as a Professional</Link></li>
                <li><Link to="/how-it-works" className="hover:text-white transition-colors">Verification Process</Link></li>
                <li><Link to="/verified-professionals" className="hover:text-white transition-colors">Professional Directory</Link></li>
                <li><Link to="/construction-cost-guide" className="hover:text-white transition-colors">Cost Estimator Guide</Link></li>
                <li><Link to="/contractor-vs-architect" className="hover:text-white transition-colors">Role Comparison</Link></li>
              </ul>
            </div>

            {/* Column 4: Platform */}
            <div>
              <h4 className="text-[11px] font-bold tracking-widest text-slate-100 uppercase mb-6">Platform & Trust</h4>
              <ul className="space-y-3 text-sm text-slate-400">
                <li><Link to="/legal/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link to="/legal/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link to="/legal/refunds" className="hover:text-white transition-colors">Refund & Cancellation</Link></li>
                <li><Link to="/legal/disclaimer" className="hover:text-white transition-colors">Platform Disclaimer</Link></li>
                <li><Link to="/legal/acceptable-use" className="hover:text-white transition-colors">Acceptable Use Policy</Link></li>
                <li><Link to="/legal/grievance" className="hover:text-white transition-colors">Grievance Redressal</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Verified Pros</span>
              <span className="flex items-center gap-1.5"><Lock className="w-3.5 h-3.5 text-amber-500" /> Safe Platform</span>
            </div>
            <p className="text-xs text-slate-500 text-center md:text-left">
              © {new Date().getFullYear()} StroitX Technologies Pvt. Ltd. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};