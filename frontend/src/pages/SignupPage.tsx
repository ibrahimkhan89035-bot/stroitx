import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { HardHat, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Button } from '../components/ui/Button';
import { MetaSEO } from '../components/seo/MetaSEO';

export const SignupPage: React.FC<{ defaultRole?: 'HOMEOWNER' | 'PROFESSIONAL' }> = ({ defaultRole = 'HOMEOWNER' }) => {
  const { role } = useParams();
  const activeRole = (role?.toUpperCase() as any) || defaultRole;

  const { registerHomeowner, registerProfessional } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    companyName: '',
    email: '',
    mobileNumber: '',
    password: '',
    confirmPassword: '',
    city: '',
    yearsOfExperience: 3,
    category: 'NEW_CONSTRUCTION',
    termsAccepted: true,
  });

  const [customCategory, setCustomCategory] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setIsLoading(true);
      if (activeRole === 'HOMEOWNER') {
        await registerHomeowner(formData);
        navigate('/homeowner/dashboard');
      } else {
        const categoryPayload =
          formData.category === 'OTHER' || formData.category === 'Other'
            ? customCategory.trim() || 'General'
            : formData.category;

        await registerProfessional({
          ...formData,
          category: categoryPayload,
        });
        navigate('/professional/subscription');
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <MetaSEO
        title={activeRole === 'HOMEOWNER' ? 'Sign Up as Homeowner | StroitX Marketplace' : 'Join as Construction Professional | StroitX'}
        description={
          activeRole === 'HOMEOWNER'
            ? 'Create a free homeowner account on StroitX. Post your house construction, renovation, or interior project and get verified bids.'
            : 'Register as a verified construction contractor, architect, or interior designer on StroitX. Access qualified leads and guaranteed milestone payments.'
        }
        canonical="https://stroitx.com/signup"
      />
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center space-x-2 text-2xl font-black mb-2">
          <div className="p-2 bg-orange-600 rounded-lg text-white">
            <HardHat className="h-6 w-6" />
          </div>
          <span>Stroit<span className="text-orange-500">X</span></span>
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900">
          Create {activeRole === 'HOMEOWNER' ? 'Homeowner' : 'Professional'} Account
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Join India's transparent construction marketplace
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm border border-slate-200 sm:rounded-xl sm:px-10">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input
              label="Full Name"
              type="text"
              required
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              placeholder="e.g. Rajesh Kumar"
            />

            {activeRole === 'PROFESSIONAL' && (
              <>
                <Input
                  label="Company Name"
                  type="text"
                  required
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  placeholder="e.g. Apex Structural Builders Pvt Ltd"
                />

                <Select
                  label="Primary Category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  options={[
                    { label: 'New Construction', value: 'NEW_CONSTRUCTION' },
                    { label: 'Renovation & Repair', value: 'RENOVATION' },
                    { label: 'Interior Design', value: 'INTERIOR' },
                    { label: 'Architectural Design', value: 'ARCHITECTURE' },
                    { label: 'Civil & Structural', value: 'CIVIL_WORK' },
                    { label: 'Electrical Contracting', value: 'ELECTRICAL' },
                    { label: 'Plumbing & MEP', value: 'PLUMBING' },
                    { label: 'Other', value: 'OTHER' },
                  ]}
                />

                {(formData.category === 'OTHER' || formData.category === 'Other') && (
                  <Input
                    label="Specified Profession"
                    type="text"
                    required
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    placeholder="Please specify your profession..."
                  />
                )}

                <Input
                  label="Years of Experience"
                  type="number"
                  required
                  min={0}
                  value={formData.yearsOfExperience}
                  onChange={(e) => setFormData({ ...formData, yearsOfExperience: parseInt(e.target.value) || 0 })}
                />
              </>
            )}

            <Input
              label="Email Address"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="name@example.com"
            />

            <Input
              label="Mobile Number"
              type="tel"
              required
              value={formData.mobileNumber}
              onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
              placeholder="+91 9876543210"
            />

            <Input
              label="City"
              type="text"
              required
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              placeholder="e.g. Mumbai, Bengaluru, Delhi"
            />

            <Input
              label="Password"
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="••••••••"
            />

            <Input
              label="Confirm Password"
              type="password"
              required
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              placeholder="••••••••"
            />

            <div className="flex items-center">
              <input
                id="terms"
                type="checkbox"
                required
                checked={formData.termsAccepted}
                onChange={(e) => setFormData({ ...formData, termsAccepted: e.target.checked })}
                className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-slate-300 rounded"
              />
              <label htmlFor="terms" className="ml-2 block text-xs text-slate-700">
                I agree to the StroitX <a href="#" className="text-orange-600 underline">Terms & Conditions</a>
              </label>
            </div>

            <Button type="submit" className="w-full mt-2" isLoading={isLoading}>
              Create {activeRole === 'HOMEOWNER' ? 'Homeowner' : 'Professional'} Account
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500">
            Already registered?{' '}
            <button onClick={() => navigate('/login')} className="text-orange-600 font-semibold hover:underline">
              Log in to your account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
