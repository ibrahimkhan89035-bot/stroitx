import React, { useState } from 'react';
import { Navbar } from '../components/layout/Navbar';
import { useNavigate } from 'react-router-dom';
import { MetaSEO } from '../components/seo/MetaSEO';
import { BreadcrumbNav } from '../components/seo/BreadcrumbNav';
import { Button } from '../components/ui/Button';
import {
  ShieldCheck,
  Building2,
  HardHat,
  Ruler,
  Paintbrush,
  Wrench,
  Zap,
  MapPin,
  Star,
  CheckCircle2,
  ArrowRight,
  Search,
} from 'lucide-react';

export const PublicDirectoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCity, setSelectedCity] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = [
    { title: 'General Contractors', icon: HardHat, count: '140+ Pros' },
    { title: 'Architects & Planners', icon: Ruler, count: '95+ Pros' },
    { title: 'Interior Designers', icon: Paintbrush, count: '110+ Pros' },
    { title: 'Civil & Structural Engineers', icon: Building2, count: '80+ Pros' },
    { title: 'Renovation Specialists', icon: Wrench, count: '75+ Pros' },
    { title: 'MEP & Electrical Contractors', icon: Zap, count: '60+ Pros' },
  ];

  const cities = ['All', 'Bengaluru', 'Mumbai', 'Delhi-NCR', 'Hyderabad', 'Pune', 'Chennai'];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <MetaSEO
        title="Verified Construction Contractors & Architects Directory"
        description="Browse KYC-verified contractors, architects & interior designers across India. View audited portfolios, past projects, ratings, and request direct tenders."
        canonicalPath="/verified-professionals"
        keywords="verified contractors India, architects directory, interior designers directory, civil engineers list, hire construction contractor Bengaluru Mumbai"
        breadcrumbs={[
          { name: 'Directory', url: '/verified-professionals' },
          { name: 'Verified Professionals', url: '/verified-professionals' },
        ]}
      />

      <Navbar />

      <main className="flex-1">
        {/* Header Hero */}
        <header className="bg-slate-900 text-white py-16 border-b border-slate-800">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <BreadcrumbNav
              items={[{ label: 'Verified Directory', path: '/verified-professionals' }]}
              className="justify-center text-slate-400 mb-4"
            />
            <div className="inline-flex items-center gap-2 bg-slate-800 border border-slate-700 px-3.5 py-1.5 rounded-full text-xs font-semibold text-orange-400 mb-4">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>100% KYC & GST Verified Trade Directory</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Verified Construction Professionals Across India
            </h1>
            <p className="mt-4 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto font-light leading-relaxed">
              Connect with audited contractors, CoA-registered architects, and licensed structural engineers backed by StroitX milestone payment protection.
            </p>
          </div>
        </header>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          
          {/* Categories Grid */}
          <section className="mb-14" aria-labelledby="category-directory-heading">
            <h2 id="category-directory-heading" className="text-2xl font-bold text-slate-900 mb-6">
              Browse by Professional Discipline
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {categories.map((cat, idx) => {
                const Icon = cat.icon;
                return (
                  <div
                    key={idx}
                    className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-orange-500 hover:shadow-md transition-all group flex items-start gap-4"
                  >
                    <div className="p-3 rounded-xl bg-orange-50 text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-colors shrink-0">
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-base mb-1">{cat.title}</h3>
                      <span className="inline-block text-xs text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full mb-3">
                        {cat.count}
                      </span>
                      <p className="text-xs text-slate-500 mb-4">
                        Audited GST, identity checks, and past project site verification.
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs"
                        onClick={() => navigate('/gateway?role=HOMEOWNER')}
                      >
                        Request Line-Item Tender
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Vetting Criteria Listicle */}
          <section className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-sm mb-14" aria-labelledby="standards-heading">
            <div className="max-w-3xl">
              <span className="text-xs font-bold text-orange-600 uppercase tracking-widest block mb-1">
                E-E-A-T Quality Gate
              </span>
              <h2 id="standards-heading" className="text-2xl font-extrabold text-slate-900 mb-4">
                Our 4-Stage Vetting Protocol for Every Listed Professional
              </h2>
              <div className="space-y-4 text-xs sm:text-sm text-slate-600">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900 block">1. Government Business & GST Verification:</strong>
                    Active GSTIN status is audited to confirm tax compliance and registered operational status.
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900 block">2. Identity Proof & Licensure Check:</strong>
                    Directors and proprietors provide verified Aadhaar/PAN. Architects must furnish Council of Architecture (CoA) numbers.
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900 block">3. Audited Project Portfolios:</strong>
                    Photographic proof of completed RCC structures, interior handovers, and client references are reviewed before approval.
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900 block">4. ₹2 Banking Mandate Authorization:</strong>
                    Every contractor establishes an authenticated auto-pay banking mandate to guarantee verified transaction capability.
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Conversion CTA */}
          <section className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 text-center border border-slate-800 shadow-xl">
            <h2 className="text-2xl sm:text-3xl font-extrabold mb-3">
              Need a Verified Professional for Your Site?
            </h2>
            <p className="text-sm text-slate-400 max-w-xl mx-auto mb-8 leading-relaxed">
              Post your project requirements for free. Receive line-item quotes from verified professionals in your city within 48 hours.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                className="w-full sm:w-auto bg-orange-600 hover:bg-orange-700 font-bold px-8 shadow-lg shadow-orange-600/30"
                onClick={() => navigate('/gateway?role=HOMEOWNER')}
              >
                Post Construction Requirement (Free)
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto border-slate-700 text-slate-300 hover:bg-slate-800 font-bold px-8"
                onClick={() => navigate('/gateway?role=PROFESSIONAL')}
              >
                Apply for Verified Contractor Listing
              </Button>
            </div>
          </section>

        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-950 text-white py-12 border-t border-slate-800 text-xs text-center text-slate-500">
        <p>© 2026 StroitX Technologies Pvt. Ltd. Verified professional directory complies with RERA regulations.</p>
      </footer>
    </div>
  );
};
