import React from 'react';
import { ShieldCheck, Award, Calendar, CheckCircle, BookOpen } from 'lucide-react';

interface AuthorBioProps {
  dateModified?: string;
  topic?: string;
}

export const AuthorBio: React.FC<AuthorBioProps> = ({
  dateModified = 'October 17, 2026',
  topic = 'Construction Standards & Cost Analysis',
}) => {
  return (
    <aside
      className="my-10 p-6 md:p-8 bg-slate-900 text-white rounded-2xl border border-slate-800 shadow-xl"
      aria-labelledby="author-eeat-heading"
    >
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div className="flex items-center gap-2 text-xs font-bold text-orange-400 uppercase tracking-widest">
          <ShieldCheck className="w-4 h-4 text-orange-500" aria-hidden="true" />
          <span>E-E-A-T Verified Construction Editorial</span>
        </div>
        <div className="flex items-center gap-4 text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
            Last Verified & Updated: <strong className="text-slate-200">{dateModified}</strong>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {/* Author Bio */}
        <div className="flex gap-4">
          <div className="w-14 h-14 rounded-2xl bg-orange-600/20 border border-orange-500/30 flex items-center justify-center shrink-0 text-orange-400 font-extrabold text-lg">
            RS
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 id="author-eeat-heading" className="text-base font-bold text-white">Er. Rajesh Sharma</h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Author
              </span>
            </div>
            <p className="text-xs text-orange-400 font-medium mt-0.5">
              Lead Structural Engineer & Construction Advisor (IIT Delhi)
            </p>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              18+ years of experience leading EPC residential townships and commercial developments across India. Senior Member of the Indian Concrete Institute (ICI).
            </p>
          </div>
        </div>

        {/* Technical Reviewer Bio */}
        <div className="flex gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center shrink-0 text-blue-400 font-extrabold text-lg">
            PK
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white">Ar. Priya Kulkarni</h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                Peer Reviewer
              </span>
            </div>
            <p className="text-xs text-blue-400 font-medium mt-0.5">
              Senior Architectural Consultant (CoA Reg. CA/2012/54219)
            </p>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Certified architect with over 12 years of expertise in sustainable space planning, municipal RERA clearances, and architectural line-by-line quote auditing.
            </p>
          </div>
        </div>
      </div>

      {/* Editorial Trust Badges */}
      <div className="mt-6 pt-5 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-300">
        <div className="flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true" />
          <span>Compliant with National Building Code of India (NBC 2016) & IS 456:2000</span>
        </div>
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-orange-400 shrink-0" aria-hidden="true" />
          <span>Line-Item Quote Verification Methodology</span>
        </div>
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-blue-400 shrink-0" aria-hidden="true" />
          <span>Topic: {topic}</span>
        </div>
      </div>
    </aside>
  );
};
