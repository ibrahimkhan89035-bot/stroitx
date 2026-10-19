import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { apiRequest } from '../../lib/api';
import { useNavigate } from 'react-router-dom';
import { Search, ShieldCheck, Star, MapPin, Award, Building } from 'lucide-react';

export const FindProfessionalsPage: React.FC = () => {
  const navigate = useNavigate();
  const [professionals, setProfessionals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [category, setCategory] = useState('');
  const [city, setCity] = useState('');
  const [search, setSearch] = useState('');

  const fetchPros = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (category) params.append('category', category);
      if (city) params.append('city', city);
      if (search) params.append('search', search);

      const res = await apiRequest(`/professionals?${params.toString()}`);
      if (res.data) setProfessionals(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPros();
  }, [category, city]);

  return (
    <DashboardLayout title="Find Construction Professionals">
      {/* Search & Filters */}
      <Card className="mb-8 p-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            placeholder="Search contractor or company name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchPros()}
          />
          <Select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            options={[
              { label: 'All Categories', value: '' },
              { label: 'New Construction', value: 'NEW_CONSTRUCTION' },
              { label: 'Renovation', value: 'RENOVATION' },
              { label: 'Interior Design', value: 'INTERIOR' },
              { label: 'Civil Work', value: 'CIVIL_WORK' },
              { label: 'Electrical', value: 'ELECTRICAL' },
              { label: 'Plumbing', value: 'PLUMBING' },
            ]}
          />
          <Input
            placeholder="City filter (e.g. Mumbai, Bengaluru)"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
        </div>
      </Card>

      {/* Directory Grid */}
      {isLoading ? (
        <div className="text-center py-12 text-slate-400">Searching verified contractors directory...</div>
      ) : professionals.length === 0 ? (
        <EmptyState
          icon={<Building className="h-8 w-8 text-slate-400" />}
          title="No professionals found"
          description="Try broadening your search query or city filters."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {professionals.map((prof) => {
            const displayName = prof?.businessName || prof?.user?.name || prof?.user?.email?.split('@')[0] || 'Professional';
            const initial = displayName.charAt(0).toUpperCase();
            const isVerified = prof?.verified === true || prof?.verificationStatus === 'VERIFIED';

            return (
              <Card key={prof?.id || Math.random()} className="flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-sm">
                        {initial}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm leading-tight">{displayName}</h4>
                        <p className="text-xs text-slate-500">{prof?.user?.name || prof?.user?.email || 'Registered Pro'}</p>
                      </div>
                    </div>
                    {isVerified ? (
                      <Badge variant="success">
                        <ShieldCheck className="h-3 w-3 mr-1 inline" /> Verified
                      </Badge>
                    ) : (
                      <Badge variant="neutral">Under Review</Badge>
                    )}
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600 mb-4">
                    <p className="flex items-center">
                      <Award className="h-3.5 w-3.5 mr-1.5 text-orange-500" />
                      <strong>Profession:</strong> {prof?.profession || prof?.category || 'General'}
                    </p>
                    <p className="flex items-center">
                      <MapPin className="h-3.5 w-3.5 mr-1.5 text-slate-400" />
                      <strong>Location:</strong> {prof?.location || 'India'}
                    </p>
                    <p className="flex items-center">
                      <Star className="h-3.5 w-3.5 mr-1.5 text-amber-500 fill-amber-500" />
                      <strong>Experience:</strong> {prof?.experienceYears || prof?.yearsOfExperience || 0} Years ({prof?.rating || 0} ★)
                    </p>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-4"
                  onClick={() => navigate(`/professional/${prof?.id}`)}
                >
                  View Profile & Portfolio
                </Button>
              </Card>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
};
