import React from 'react';
import { HardHat, ShieldCheck, Lock, Award } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-800 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center space-x-2 text-white font-bold text-lg mb-4">
            <HardHat className="h-5 w-5 text-orange-500" />
            <span>Stroit<span className="text-orange-500">X</span></span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed mb-4">
            Build Better. Connect Smarter.<br />
            Connecting homeowners with verified construction professionals across India.
          </p>
          <div className="flex items-center space-x-4 text-xs text-slate-400">
            <span className="flex items-center"><ShieldCheck className="h-4 w-4 text-emerald-500 mr-1" /> Verified Pros</span>
            <span className="flex items-center"><Lock className="h-4 w-4 text-orange-500 mr-1" /> Safe Platform</span>
          </div>
        </div>

        <div>
          <h4 className="text-white text-xs font-semibold uppercase tracking-wider mb-4">For Homeowners</h4>
          <ul className="space-y-2 text-xs">
            <li><a href="#" className="hover:text-white transition-colors">Post a Project</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Find Professionals</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Cost Estimator</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Quotation Comparison</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Payment Protection</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white text-xs font-semibold uppercase tracking-wider mb-4">For Professionals</h4>
          <ul className="space-y-2 text-xs">
            <li><a href="#" className="hover:text-white transition-colors">Join as a Professional</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Verification Process</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Discover Projects</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Quotation Builder Tool</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Grow Your Business</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white text-xs font-semibold uppercase tracking-wider mb-4">Platform & Trust</h4>
          <ul className="space-y-2 text-xs">
            {/* These links now point to the LegalPolicy page! */}
            <li><Link to="/legal/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
            <li><Link to="/legal/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
            <li><Link to="/legal/refunds" className="hover:text-white transition-colors">Refund & Cancellation</Link></li>
            <li><Link to="/legal/disclaimer" className="hover:text-white transition-colors">Platform Disclaimer</Link></li>
            <li><Link to="/legal/acceptable-use" className="hover:text-white transition-colors">Acceptable Use</Link></li>
            <li><Link to="/legal/grievance" className="hover:text-white transition-colors">Grievance & Complaints</Link></li>
            <li><Link to="/legal/cookies" className="hover:text-white transition-colors">Cookie Policy</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-slate-900 py-6 text-center text-xs text-slate-400">
        <p>© {new Date().getFullYear()} StroitX Technologies Pvt. Ltd. All rights reserved.</p>
      </div>
    </footer>
  );
};