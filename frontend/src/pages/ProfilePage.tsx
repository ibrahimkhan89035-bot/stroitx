import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { apiRequest } from '../lib/api';
import { useAuth } from '../lib/auth';
import { useNavigate } from 'react-router-dom';
import { User, Building, Award, Sparkles, FolderPlus, Image, Plus, X, Star, MessageSquare, Edit } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [profileData, setProfileData] = useState<any>(null);
  const [pastProjects, setPastProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State for Past Projects
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // NEW: Modal State for Editing Profile
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    companyName: '',
    profession: '',
    location: '',
    bio: ''
  });

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      if (user?.role === 'PROFESSIONAL') {
        const res = await apiRequest('/professionals/me');
        setProfileData(res.data);
        if (res.data?.pastProjects) {
          setPastProjects(res.data.pastProjects);
        }
      } else {
        const res = await apiRequest('/auth/me');
        setProfileData(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user]);

  // Handle opening the Edit Profile modal and pre-filling current data
  const handleOpenEditModal = () => {
    const prof = profileData || user;
    setEditForm({
      companyName: prof?.companyName || '',
      profession: prof?.profession || prof?.category || '',
      location: prof?.location || user?.city || '',
      bio: prof?.bio || ''
    });
    setIsEditProfileOpen(true);
  };

  // Handle submitting the Edit Profile form
  const handleEditProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await apiRequest('/professionals/me', {
        method: 'PUT',
        body: JSON.stringify(editForm),
      });
      
      // Update the UI instantly with the new data
      setProfileData((prev: any) => ({ ...prev, ...res.data }));
      setIsEditProfileOpen(false);
    } catch (err: any) {
      console.error('Failed to update profile:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim() || !shortDescription.trim()) {
      setError('Please provide project title and a short description.');
      return;
    }

    const finalImage = imageUrl.trim() || 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?auto=format&fit=crop&w=800&q=80';

    try {
      setIsSubmitting(true);
      const res = await apiRequest('/professionals/portfolio', {
        method: 'POST',
        body: JSON.stringify({
          title,
          short_description: shortDescription,
          image_urls: [finalImage],
        }),
      });

      if (res.data) {
        setPastProjects([res.data, ...pastProjects]);
      }
      setIsModalOpen(false);
      setTitle('');
      setShortDescription('');
      setImageUrl('');
    } catch (err: any) {
      setError(err.message || 'Failed to save past project.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Account Profile">
        <div className="text-center py-12 text-slate-400">Loading user profile details...</div>
      </DashboardLayout>
    );
  }

  const isProf = user?.role === 'PROFESSIONAL';
  const prof = profileData || user;
  const displayName = prof?.companyName || prof?.fullName || prof?.homeownerProfile?.fullName || prof?.professionalProfile?.fullName || user?.email?.split('@')[0];
  const userCity = prof?.location || user?.city || 'Not provided';
  const totalProjects = prof?.totalProjectsPosted !== undefined ? prof.totalProjectsPosted : 0;
  const totalQuotes = prof?.totalQuotesReceived !== undefined ? prof.totalQuotesReceived : 0;
  const reviews = prof?.user?.reviewsReceived || [];

  return (
    <DashboardLayout title="User Profile & Portfolio">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header Profile Card */}
        <Card className="p-8 bg-slate-900 text-white relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-2xl bg-orange-600 text-white font-black flex items-center justify-center text-2xl shadow-lg">
                {displayName?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-xl font-bold">{displayName}</h2>
                  <Badge variant={user?.role === 'HOMEOWNER' ? 'info' : 'orange'}>{user?.role}</Badge>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">{user?.email}</p>
              </div>
            </div>

            {isProf && (
              <div className="flex flex-col items-end space-y-3">
                <Button variant="outline" size="sm" onClick={handleOpenEditModal} className="bg-slate-800 text-white border-slate-700 hover:bg-slate-700">
                  <Edit className="h-3.5 w-3.5 mr-1.5" /> Edit Profile Details
                </Button>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">KYC Status</span>
                  <Badge variant={prof?.verificationStatus === 'VERIFIED' ? 'success' : 'warning'} className="mt-1">
                    {prof?.verificationStatus || 'NOT_SUBMITTED'}
                  </Badge>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Detailed Account Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center">
              <User className="h-4 w-4 mr-2 text-orange-500" /> Contact Details
            </h3>
            <div className="space-y-3 text-xs text-slate-700">
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Email</span>
                <span className="font-semibold text-slate-900">{user?.email}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Mobile</span>
                <span className="font-semibold text-slate-900">{user?.mobileNumber || user?.phone || 'Not Provided'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Location / City</span>
                <span className="font-semibold text-slate-900">{userCity}</span>
              </div>
            </div>
          </Card>

          {isProf && (
            <Card className="p-6">
              <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center">
                <Building className="h-4 w-4 mr-2 text-orange-500" /> Business Credentials
              </h3>
              <div className="space-y-3 text-xs text-slate-700">
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Company Name</span>
                  <span className="font-semibold text-slate-900">{prof?.companyName || 'Not Set'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Services / Category</span>
                  <span className="font-semibold text-slate-900">{prof?.profession || prof?.category || 'Not Set'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Company Bio</span>
                  <span className="font-semibold text-slate-900 w-32 truncate text-right">
                    {prof?.bio || 'Not provided'}
                  </span>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* NEW: PROFILE EDIT MODAL */}
        {isEditProfileOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900">Edit Professional Profile</h3>
                <button onClick={() => setIsEditProfileOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleEditProfileSubmit} className="space-y-4 text-xs">
                <Input
                  label="Company Name"
                  placeholder="e.g. Shinde Enterprises"
                  value={editForm.companyName}
                  onChange={(e) => setEditForm({...editForm, companyName: e.target.value})}
                  required
                />
                
                <Input
                  label="Primary Profession / Category"
                  placeholder="e.g. ELECTRICAL, RENOVATION, ARCHITECTURE"
                  value={editForm.profession}
                  onChange={(e) => setEditForm({...editForm, profession: e.target.value})}
                  required
                />

                <Input
                  label="City / Location"
                  placeholder="e.g. Pune, Maharashtra"
                  value={editForm.location}
                  onChange={(e) => setEditForm({...editForm, location: e.target.value})}
                  required
                />

                <div>
                  <label className="block text-slate-700 font-medium mb-1">About Us (Bio)</label>
                  <textarea
                    rows={4}
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    placeholder="Tell homeowners about your experience, team, and specialties..."
                    value={editForm.bio}
                    onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                  />
                  <p className="text-[10px] text-slate-400 mt-1">This text will be displayed publicly on your directory page.</p>
                </div>

                <div className="pt-2 flex justify-end space-x-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => setIsEditProfileOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" size="sm" isLoading={isSubmitting}>
                    Save Changes
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* SLEEK PAST PROJECTS PORTFOLIO SECTION */}
        {isProf && (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center">
                  <FolderPlus className="h-4 w-4 mr-2 text-orange-500" /> Past Projects Portfolio
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Showcase your completed construction & design work to prospective clients.</p>
              </div>
              <Button size="sm" onClick={() => setIsModalOpen(true)}>
                <Plus className="h-4 w-4 mr-1.5" /> Add Project
              </Button>
            </div>

            {pastProjects.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                <Image className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                <p className="font-semibold text-slate-700">No past projects added yet</p>
                <p className="text-slate-400 text-[11px] mt-1">Click "Add Project" to showcase your recent work and build client trust.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {pastProjects.map((item) => (
                  <div key={item.id} className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col justify-between">
                    <div>
                      {item.image_urls && item.image_urls.length > 0 && (
                        <img src={item.image_urls[0]} alt={item.title} className="w-full h-36 object-cover bg-slate-200" />
                      )}
                      <div className="p-4">
                        <h4 className="font-bold text-slate-900 text-sm">{item.title}</h4>
                        <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">{item.short_description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        {/* CLIENT REVIEWS SECTION */}
        {isProf && (
          <Card className="p-6 mb-8">
            <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center">
                  <Star className="h-4 w-4 mr-2 text-amber-500 fill-amber-500" /> Client Reviews & Feedback
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Monitor your overall rating and read feedback from homeowners.</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-black text-slate-900 flex items-center justify-end">
                  {Number(prof?.rating || 0).toFixed(1)} <Star className="h-5 w-5 text-amber-500 fill-amber-500 ml-1" />
                </div>
                <div className="text-xs text-slate-500 font-semibold">{prof?.reviewCount || 0} Total Reviews</div>
              </div>
            </div>

            {reviews.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                <MessageSquare className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                <p className="font-semibold text-slate-700">No reviews yet</p>
                <p className="text-slate-400 text-[11px] mt-1">When clients leave a review on your public profile, they will appear here.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map((review: any) => (
                  <div key={review.id} className="bg-slate-50 border border-slate-200 rounded-xl p-5">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-bold text-sm text-slate-900">{review.reviewer?.name || 'Verified Homeowner'}</p>
                        <p className="text-[10px] font-medium text-slate-500 mt-0.5">
                          {new Date(review.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                      </div>
                      <div className="flex space-x-0.5">
                        {[1, 2, 3, 4, 5].map((starIndex) => (
                          <Star key={starIndex} className={`h-4 w-4 ${starIndex <= review.rating ? 'text-amber-500 fill-amber-500' : 'text-slate-300 fill-slate-300'}`} />
                        ))}
                      </div>
                    </div>
                    {review.comment && (
                      <p className="text-xs text-slate-700 bg-white p-3.5 rounded-lg border border-slate-100 shadow-sm">
                        "{review.comment}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        {/* ADD PROJECT MODAL */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900">Add Past Project to Portfolio</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="h-4 w-4" />
                </button>
              </div>

              {error && <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700">{error}</div>}

              <form onSubmit={handleAddProjectSubmit} className="space-y-4 text-xs">
                <Input label="Project Name / Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Short Description</label>
                  <textarea rows={2} className="w-full p-2.5 border border-slate-300 rounded-lg text-xs" value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} required />
                </div>
                <Input label="Project Photo Link / Image URL" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
                <div className="pt-2 flex justify-end space-x-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                  <Button type="submit" size="sm" isLoading={isSubmitting}>Save to Portfolio</Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};