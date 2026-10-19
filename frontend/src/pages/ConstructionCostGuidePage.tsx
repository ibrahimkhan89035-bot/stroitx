import React, { useState } from 'react';
import { Navbar } from '../components/layout/Navbar';
import { useNavigate } from 'react-router-dom';
import { MetaSEO } from '../components/seo/MetaSEO';
import { BreadcrumbNav } from '../components/seo/BreadcrumbNav';
import { AuthorBio } from '../components/seo/AuthorBio';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import {
  Calculator,
  Building2,
  DollarSign,
  TrendingUp,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Layers,
  PieChart,
} from 'lucide-react';

export const ConstructionCostGuidePage: React.FC = () => {
  const navigate = useNavigate();

  // Simple Interactive Cost Estimator State
  const [builtUpArea, setBuiltUpArea] = useState<number>(1500);
  const [qualityTier, setQualityTier] = useState<number>(2100);
  const [cityRateAdj, setCityRateAdj] = useState<number>(1.0);

  const estimatedTotal = Math.round(builtUpArea * qualityTier * cityRateAdj);

  const cityRates = [
    { city: 'Bengaluru', basic: '₹1,750 - ₹1,950', premium: '₹2,100 - ₹2,550', luxury: '₹2,700 - ₹3,600' },
    { city: 'Mumbai MMR', basic: '₹1,950 - ₹2,200', premium: '₹2,350 - ₹2,800', luxury: '₹3,000 - ₹4,200' },
    { city: 'Delhi-NCR', basic: '₹1,650 - ₹1,850', premium: '₹2,000 - ₹2,450', luxury: '₹2,600 - ₹3,400' },
    { city: 'Hyderabad', basic: '₹1,600 - ₹1,800', premium: '₹1,950 - ₹2,350', luxury: '₹2,500 - ₹3,200' },
    { city: 'Pune', basic: '₹1,700 - ₹1,900', premium: '₹2,050 - ₹2,450', luxury: '₹2,600 - ₹3,400' },
    { city: 'Chennai', basic: '₹1,700 - ₹1,900', premium: '₹2,050 - ₹2,400', luxury: '₹2,550 - ₹3,300' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <MetaSEO
        title="Construction Cost Estimator & Rate Guide India 2026"
        description="Complete 2026 house construction cost per sq ft guide for Indian cities. Compare Basic, Premium & Luxury material rates, labour costs & budgeting tips."
        canonicalPath="/construction-cost-guide"
        keywords="house construction cost India, construction rate per sq ft, cost to build house Bengaluru Mumbai Delhi, construction material calculator, civil contractor rates"
        ogType="article"
        datePublished="2026-03-01"
        dateModified="2026-10-17"
        breadcrumbs={[
          { name: 'Cost Guides', url: '/construction-cost-guide' },
          { name: 'Construction Cost Guide 2026', url: '/construction-cost-guide' },
        ]}
      />

      <Navbar />

      <main className="flex-1">
        {/* Header Hero */}
        <header className="bg-slate-900 text-white py-16 lg:py-20 border-b border-slate-800">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <BreadcrumbNav
              items={[
                { label: 'Guides', path: '/construction-cost-guide' },
                { label: 'Construction Cost Guide 2026', path: '/construction-cost-guide' },
              ]}
              className="justify-center text-slate-400 mb-4"
            />
            <div className="inline-flex items-center gap-2 bg-slate-800 border border-slate-700 px-3.5 py-1.5 rounded-full text-xs font-semibold text-orange-400 mb-4">
              <TrendingUp className="w-4 h-4" />
              <span>Verified 2026 Market Rates</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
              House Construction Cost in India: <span className="text-orange-500">2026 Rate Guide</span>
            </h1>
            <p className="mt-4 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto font-light leading-relaxed">
              Detailed per sq ft rate benchmarks across top Indian cities, material grade specifications, and a live budget estimation tool.
            </p>
          </div>
        </header>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          
          {/* Interactive Cost Calculator Widget */}
          <section className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-xl mb-14" aria-labelledby="calc-heading">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-orange-100 text-orange-600 rounded-xl">
                <Calculator className="w-6 h-6" />
              </div>
              <div>
                <h2 id="calc-heading" className="text-xl sm:text-2xl font-extrabold text-slate-900">
                  Quick Construction Budget Estimator
                </h2>
                <p className="text-xs text-slate-500">Based on prevailing Q4 2026 cement, steel, and regional mason wages</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Total Built-Up Area (Sq Ft)</label>
                <Input
                  type="number"
                  min="300"
                  max="50000"
                  value={builtUpArea}
                  onChange={(e) => setBuiltUpArea(Number(e.target.value) || 0)}
                  placeholder="e.g. 1500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Construction Quality Tier</label>
                <Select
                  value={qualityTier.toString()}
                  onChange={(e) => setQualityTier(Number(e.target.value))}
                  options={[
                    { label: 'Basic Standard (₹1,750/sq ft)', value: '1750' },
                    { label: 'Premium Class (₹2,100/sq ft)', value: '2100' },
                    { label: 'Luxury Turnkey (₹2,950/sq ft)', value: '2950' },
                  ]}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">City / Location Benchmark</label>
                <Select
                  value={cityRateAdj.toString()}
                  onChange={(e) => setCityRateAdj(Number(e.target.value))}
                  options={[
                    { label: 'Bengaluru / Pune (Standard 1.0x)', value: '1.0' },
                    { label: 'Mumbai MMR (+15% Factor)', value: '1.15' },
                    { label: 'Delhi-NCR (Standard 1.0x)', value: '1.0' },
                    { label: 'Hyderabad / Tier-2 (-5% Factor)', value: '0.95' },
                  ]}
                />
              </div>
            </div>

            <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-6">
              <div>
                <span className="text-xs text-orange-400 font-bold uppercase tracking-wider block mb-1">
                  Estimated Total Construction Budget
                </span>
                <div className="text-3xl sm:text-4xl font-extrabold text-white">
                  ₹{estimatedTotal.toLocaleString('en-IN')}
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Approx. ₹{Math.round(qualityTier * cityRateAdj).toLocaleString('en-IN')} / sq ft (Includes labour + materials)
                </p>
              </div>
              <Button
                size="lg"
                className="w-full sm:w-auto bg-orange-600 hover:bg-orange-700 font-bold px-8 shadow-lg shadow-orange-600/30"
                onClick={() => navigate('/gateway?role=HOMEOWNER')}
              >
                Get Line-Item Quotes on StroitX
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </section>

          {/* City Rate Breakdown Table */}
          <section className="mb-14" aria-labelledby="city-rates-heading">
            <h2 id="city-rates-heading" className="text-2xl font-bold text-slate-900 mb-2">
              City-Wise Construction Cost Per Sq Ft (India 2026)
            </h2>
            <p className="text-sm text-slate-600 mb-6 leading-relaxed">
              Material shipping tariffs and skilled mason day-wages create localized variance. Rates below reflect standard residential built-up area construction.
            </p>
            <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm bg-white">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-900 text-white uppercase text-[11px] tracking-wider">
                  <tr>
                    <th scope="col" className="p-4 sm:p-5">City / Metropolitan Region</th>
                    <th scope="col" className="p-4 sm:p-5">Basic (C-Class)</th>
                    <th scope="col" className="p-4 sm:p-5 text-orange-400">Premium (B-Class)</th>
                    <th scope="col" className="p-4 sm:p-5 text-emerald-400">Luxury (A-Class)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {cityRates.map((r, i) => (
                    <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                      <td className="p-4 sm:p-5 font-bold text-slate-900 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-orange-600 shrink-0" />
                        <span>{r.city}</span>
                      </td>
                      <td className="p-4 sm:p-5 font-mono">{r.basic}</td>
                      <td className="p-4 sm:p-5 font-mono font-semibold text-orange-950">{r.premium}</td>
                      <td className="p-4 sm:p-5 font-mono font-bold text-emerald-900">{r.luxury}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Cost Allocation Pie Distribution */}
          <section className="mb-14 bg-white p-8 sm:p-10 rounded-2xl border border-slate-200 shadow-sm" aria-labelledby="allocation-heading">
            <h2 id="allocation-heading" className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <PieChart className="w-6 h-6 text-orange-600" />
              Where Does Your Money Go? Typical Budget Breakdown
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              <div className="p-5 rounded-2xl bg-orange-50 border border-orange-200">
                <span className="text-3xl font-extrabold text-orange-600 block mb-1">15%</span>
                <h3 className="font-bold text-slate-900 text-sm mb-1">Substructure & Footing</h3>
                <p className="text-xs text-slate-600">Excavation, PCC, RCC column footings, plinth beam, anti-termite treatment.</p>
              </div>

              <div className="p-5 rounded-2xl bg-blue-50 border border-blue-200">
                <span className="text-3xl font-extrabold text-blue-600 block mb-1">45%</span>
                <h3 className="font-bold text-slate-900 text-sm mb-1">Superstructure (Civil)</h3>
                <p className="text-xs text-slate-600">RCC columns, beams, roof slab casting, solid block/brick masonry, internal plaster.</p>
              </div>

              <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200">
                <span className="text-3xl font-extrabold text-emerald-600 block mb-1">18%</span>
                <h3 className="font-bold text-slate-900 text-sm mb-1">MEP & Utilities</h3>
                <p className="text-xs text-slate-600">Concealed conduit electrical, CPVC plumbing, sanitary fixtures, rainwater harvesting.</p>
              </div>

              <div className="p-5 rounded-2xl bg-purple-50 border border-purple-200">
                <span className="text-3xl font-extrabold text-purple-600 block mb-1">22%</span>
                <h3 className="font-bold text-slate-900 text-sm mb-1">Finishing & Fixtures</h3>
                <p className="text-xs text-slate-600">Vitrified tiles/granite, teak main door, UPVC windows, emulsion painting, railing.</p>
              </div>
            </div>
          </section>

          {/* 4 Hidden Costs Listicle */}
          <section className="mb-14 bg-amber-50/60 p-8 sm:p-10 rounded-2xl border border-amber-200" aria-labelledby="hidden-costs-heading">
            <div className="flex items-center gap-2 mb-4 text-amber-800 font-bold text-xs uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Budgeting Pitfalls</span>
            </div>
            <h2 id="hidden-costs-heading" className="text-2xl font-extrabold text-slate-900 mb-4">
              4 "Hidden" Costs Often Omitted from Lump-Sum Quotes
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs sm:text-sm text-slate-700">
              <div className="bg-white p-5 rounded-xl border border-amber-200 shadow-sm">
                <h3 className="font-bold text-slate-900 mb-1">1. Soil Stabilization & Rock Breaker Charges</h3>
                <p className="text-slate-600 leading-relaxed">If hard granite rock or loose clay is encountered, mechanical breaker machinery and pile foundations add ₹80–₹180/sq ft.</p>
              </div>
              <div className="bg-white p-5 rounded-xl border border-amber-200 shadow-sm">
                <h3 className="font-bold text-slate-900 mb-1">2. Municipal Sanction & Plan Approval Fees</h3>
                <p className="text-slate-600 leading-relaxed">BDA/BBMP, BMC, or local development authority scrutiny fees, betterment charges, and architect liaison costs typically range from ₹1.2L to ₹3.5L.</p>
              </div>
              <div className="bg-white p-5 rounded-xl border border-amber-200 shadow-sm">
                <h3 className="font-bold text-slate-900 mb-1">3. Temporary Water Borewell & Electricity Meter</h3>
                <p className="text-slate-600 leading-relaxed">Curing concrete requires 1,000+ liters of water daily. A site borewell and temporary commercial meter cost ₹1.5L–₹2.2L upfront.</p>
              </div>
              <div className="bg-white p-5 rounded-xl border border-amber-200 shadow-sm">
                <h3 className="font-bold text-slate-900 mb-1">4. Boundary Compound Wall & Gate</h3>
                <p className="text-slate-600 leading-relaxed">Standard building contractors quote strictly for the house plinth area. A 6-foot compound wall running 150 running ft costs an additional ₹2.5L–₹4.5L.</p>
              </div>
            </div>
          </section>

          {/* Author Bio */}
          <AuthorBio
            dateModified="October 17, 2026"
            topic="Residential Construction Cost Benchmarking & BOQ Analysis"
          />

          {/* Final CTA */}
          <section className="mt-14 bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-3xl p-8 sm:p-12 text-center border border-slate-700 shadow-2xl">
            <h2 className="text-2xl sm:text-4xl font-extrabold mb-4">
              Stop Guessing Your Building Costs
            </h2>
            <p className="text-sm text-slate-300 max-w-xl mx-auto mb-8 leading-relaxed">
              Submit your floor plans on StroitX to receive audited line-by-line quotes from 3 verified contractors within 48 hours.
            </p>
            <Button
              size="lg"
              className="bg-orange-600 hover:bg-orange-700 font-bold px-8 shadow-lg shadow-orange-600/30"
              onClick={() => navigate('/gateway?role=HOMEOWNER')}
            >
              Get Free Line-Item Contractor Tenders
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </section>

        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-950 text-white py-12 border-t border-slate-800 text-xs text-center text-slate-500">
        <p>© 2026 StroitX Technologies Pvt. Ltd. All rights reserved. Rates indexed to NBC 2016 guidelines.</p>
      </footer>
    </div>
  );
};
