import React from 'react';
import { Navbar } from '../components/layout/Navbar';
import { useNavigate } from 'react-router-dom';
import { MetaSEO } from '../components/seo/MetaSEO';
import { BreadcrumbNav } from '../components/seo/BreadcrumbNav';
import { AuthorBio } from '../components/seo/AuthorBio';
import { Button } from '../components/ui/Button';
import {
  Ruler,
  HardHat,
  Check,
  X,
  Scale,
  ArrowRight,
  HelpCircle,
  Building,
  CheckCircle2,
  DollarSign,
  AlertTriangle,
} from 'lucide-react';

export const ContractorVsArchitectPage: React.FC = () => {
  const navigate = useNavigate();

  const comparisonData = [
    {
      feature: 'Primary Role',
      architect: 'Conceptual design, aesthetic planning, space optimization, municipal approval drawings',
      contractor: 'Physical construction execution, labor management, material procurement, on-site safety',
    },
    {
      feature: 'Statutory Licensure',
      architect: 'Mandatory Council of Architecture (CoA) Registration under Architects Act 1972',
      contractor: 'Government Contractor Class License (PWD/CPWD) or State Trade & GST Registration',
    },
    {
      feature: 'Fee Structure in India',
      architect: '4% – 8% of total estimated project cost, or fixed ₹40 – ₹120 per sq ft for drawing packages',
      contractor: 'Turnkey material+labour contract (₹1,650 – ₹3,200/sq ft) or item-rate labour contract',
    },
    {
      feature: 'Key Deliverables',
      architect: '2D floor plans, 3D elevations, structural CAD files, plumbing & electrical schematics',
      contractor: 'Physical RCC foundation, brickwork, slab casting, plastering, tiling, and turnkey handover',
    },
    {
      feature: 'Project Stage',
      architect: 'Pre-construction (Months 1–3) with periodic site inspection during structural execution',
      contractor: 'Active construction (Months 4–14) through structural execution, MEP, and final finishing',
    },
    {
      feature: 'Site Presence',
      architect: 'Periodic milestone review visits (e.g. footing, slab casting, brickwork alignment inspection)',
      contractor: 'Full-time daily supervisor, foreman, and dedicated labor gangs on site',
    },
    {
      feature: 'Quality & Code Liability',
      architect: 'Civil & structural design safety complying with NBC 2016 and municipal setback bylaws',
      contractor: 'Workmanship defect liability, material batch testing (cube tests, tensile tests), warranties',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <MetaSEO
        title="Contractor vs Architect: Full Role & Cost Comparison Guide"
        description="Compare general contractor vs architect roles, fee structures, project phases, and legal liabilities in India. Learn when to hire which for your build."
        canonicalPath="/contractor-vs-architect"
        keywords="contractor vs architect, hire contractor or architect, architect fees India, general contractor rates, residential construction guide, building home in India"
        ogType="article"
        datePublished="2026-02-15"
        dateModified="2026-10-17"
        breadcrumbs={[
          { name: 'Comparison Guides', url: '/contractor-vs-architect' },
          { name: 'Contractor vs Architect', url: '/contractor-vs-architect' },
        ]}
      />

      <Navbar />

      <main className="flex-1">
        {/* Header Hero */}
        <header className="bg-slate-900 text-white py-16 lg:py-20 border-b border-slate-800">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <BreadcrumbNav
              items={[
                { label: 'Guides', path: '/contractor-vs-architect' },
                { label: 'Contractor vs Architect', path: '/contractor-vs-architect' },
              ]}
              className="justify-center text-slate-400 mb-4"
            />
            <div className="inline-flex items-center gap-2 bg-slate-800 border border-slate-700 px-3.5 py-1.5 rounded-full text-xs font-semibold text-orange-400 mb-4">
              <Scale className="w-4 h-4" />
              <span>Comprehensive 2026 Homeowner Hiring Guide</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Contractor vs Architect: <span className="text-orange-500">Who Do You Need?</span>
            </h1>
            <p className="mt-4 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto font-light leading-relaxed">
              Understand the crucial differences in roles, fee models, project phases, and legal responsibilities before signing construction contracts.
            </p>
          </div>
        </header>

        {/* Content Body */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          
          {/* Executive Summary */}
          <section className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm mb-12">
            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Building className="w-5 h-5 text-orange-600" />
              The Quick Summary
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Think of an <strong>Architect</strong> as the visionary planner and author of your building’s blueprint, optimizing natural light, ventilation, zoning laws, and structural aesthetics. Think of a <strong>General Contractor</strong> as the master builder who takes those architectural blueprints and manages the day-to-day procurement, masons, bar benders, electricians, and concrete pouring to turn design into reality.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 text-xs text-slate-700 font-semibold">
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl">
                <span className="text-orange-800 font-bold block mb-1">Hire an Architect First If:</span>
                You are building from scratch on empty land, need municipal sanction drawings, or want custom space optimization.
              </div>
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <span className="text-blue-800 font-bold block mb-1">Hire a Contractor First If:</span>
                You already hold sanctioned structural drawings, are doing standard renovation, or need immediate turnkey civil execution.
              </div>
            </div>
          </section>

          {/* Detailed Side-by-Side Comparison Table */}
          <section className="mb-14" aria-labelledby="comparison-matrix-heading">
            <h2 id="comparison-matrix-heading" className="text-2xl font-bold text-slate-900 mb-6">
              Side-by-Side Comparison Matrix
            </h2>
            <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm bg-white">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-900 text-white uppercase text-[11px] tracking-wider">
                  <tr>
                    <th scope="col" className="p-4 sm:p-5 w-1/4">Feature / Aspect</th>
                    <th scope="col" className="p-4 sm:p-5 w-3/8 text-orange-400">
                      <div className="flex items-center gap-2">
                        <Ruler className="w-4 h-4" />
                        <span>Architect</span>
                      </div>
                    </th>
                    <th scope="col" className="p-4 sm:p-5 w-3/8 text-blue-400">
                      <div className="flex items-center gap-2">
                        <HardHat className="w-4 h-4" />
                        <span>General Contractor</span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {comparisonData.map((row, i) => (
                    <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                      <td className="p-4 sm:p-5 font-bold text-slate-900 align-top">{row.feature}</td>
                      <td className="p-4 sm:p-5 leading-relaxed align-top">{row.architect}</td>
                      <td className="p-4 sm:p-5 leading-relaxed align-top">{row.contractor}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* 5 Rules Listicle */}
          <section className="mb-14 bg-white p-8 sm:p-10 rounded-2xl border border-slate-200 shadow-sm" aria-labelledby="rules-listicle-heading">
            <h2 id="rules-listicle-heading" className="text-2xl font-extrabold text-slate-900 mb-6">
              5 Golden Rules for Indian Homeowners
            </h2>
            <div className="space-y-6">
              <div className="flex gap-4 items-start">
                <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold shrink-0 mt-0.5">1</div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 mb-1">Never let a contractor design your structural foundation without an engineer</h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Contractors are construction experts, but structural safety requires certified calculations (soil bearing capacity, steel reinforcement ratios per IS 456). Always ensure an architect or structural engineer stamps your foundation layout.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold shrink-0 mt-0.5">2</div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 mb-1">Request a detailed Bill of Quantities (BOQ) before asking for contractor bids</h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Have your architect draft a complete BOQ itemizing cement volumes, steel weights, tile sq ft, and plumbing fixtures. Handing this standard document to 3 contractors prevents hidden variation bills.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold shrink-0 mt-0.5">3</div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 mb-1">Verify Council of Architecture (CoA) registration numbers</h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    In India, using the title "Architect" without a valid CoA registration number is illegal under the Architects Act 1972. Verify your architect’s status on coa.gov.in.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold shrink-0 mt-0.5">4</div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 mb-1">Link contractor payments strictly to physical milestones</h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Avoid paying more than a 10% mobilization advance. Use StroitX milestone contracts: pay upon footing casting, plinth level, roof slab casting, plaster completion, and final handover.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold shrink-0 mt-0.5">5</div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 mb-1">Retain a 5% Defect Liability Fund for 6 months</h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Indian monsoons often expose hairline slab cracks or plumbing seepage. Withholding a 5% retention fee until post-monsoon ensures the contractor fixes any defects without friction.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Author E-E-A-T Component */}
          <AuthorBio
            dateModified="October 17, 2026"
            topic="Construction Contract Structuring & Professional Licensure"
          />

          {/* Conversion CTA */}
          <section className="mt-14 bg-slate-900 text-white rounded-3xl p-8 sm:p-12 text-center border border-slate-800 shadow-xl">
            <h2 className="text-2xl sm:text-3xl font-extrabold mb-3">
              Find Vetted Architects & Contractors on StroitX
            </h2>
            <p className="text-sm text-slate-400 max-w-xl mx-auto mb-8 leading-relaxed">
              Every professional on StroitX is KYC-verified with authenticated GST, ID, and audited project portfolios.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                className="w-full sm:w-auto bg-orange-600 hover:bg-orange-700 font-bold px-8"
                onClick={() => navigate('/gateway?role=HOMEOWNER')}
              >
                Post Your Construction Tender (Free)
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto border-slate-700 text-slate-300 hover:bg-slate-800 font-bold px-8"
                onClick={() => navigate('/how-it-works')}
              >
                Explore How StroitX Works
              </Button>
            </div>
          </section>

        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-950 text-white py-12 border-t border-slate-800 text-xs text-center text-slate-500">
        <p>© 2026 StroitX Technologies Pvt. Ltd. All rights reserved. Peer-reviewed construction guidelines.</p>
      </footer>
    </div>
  );
};
