import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { apiRequest } from '../lib/api';
import { useAuth } from '../lib/auth';
import toast, { Toaster } from 'react-hot-toast';
import { 
  CheckCircle, MapPin, Share2, Phone, Mail, Building, 
  Star, ArrowLeft, MessageSquare, X, Search,
  Edit, FolderPlus, Image as ImageIcon, Plus, UploadCloud
} from 'lucide-react';

export const PublicProfessionalProfile: React.FC = () => {
  const { user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [prof, setProf] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modals & States
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [editForm, setEditForm] = useState({ companyName: '', profession: '', location: '', bio: '', rating: 0, reviewCount: 0 });
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isOwnProfile = !id || id === 'profile';
  const isOwner = isOwnProfile || (user?.role === 'PROFESSIONAL' && user?.id === prof?.userId);

  const fetchProf = async () => {
    try {
      setIsLoading(true);
      const endpoint = isOwnProfile ? '/professionals/me' : `/professionals/${id}`;
      const res = await apiRequest(endpoint);
      if (res.data) setProf(res.data);
    } catch (err) {
      console.error(err);
      if (!isOwnProfile) toast.error('Failed to load professional profile.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProf();
  }, [id]);

  // TOAST NOTIFICATIONS INTEGRATED
  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return toast.error('Please write a comment.');

    try {
      setIsSubmitting(true);
      await apiRequest(`/professionals/${id}/reviews`, {
        method: 'POST',
        body: JSON.stringify({ rating, comment })
      });
      setIsReviewModalOpen(false);
      setComment('');
      setRating(5);
      toast.success('Review posted successfully!');
      fetchProf(); 
    } catch (err) {
      toast.error('Failed to post review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await apiRequest('/professionals/me', {
        method: 'PUT',
        body: JSON.stringify(editForm),
      });
      setProf((prev: any) => ({ ...prev, ...res.data }));
      setIsEditProfileOpen(false);
      toast.success('Profile details updated successfully!');
    } catch (err: any) {
      toast.error('Failed to save profile details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // IMAGE MULTIPART DISK STORAGE ENFORCED (NO BASE64 IN DATABASE)
  const [imagePreview, setImagePreview] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 10MB Limit
    if (file.size > 10 * 1024 * 1024) {
      e.target.value = ''; // Reset input
      return toast.error("Image file is too large. Max size is 10MB.");
    }

    // Type Protection
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif'];
    if (!validTypes.includes(file.type)) {
      e.target.value = ''; 
      return toast.error("Invalid file type. Please use JPG, PNG, or WebP.");
    }

    // Instant local preview
    setImagePreview(URL.createObjectURL(file));

    try {
      setIsUploadingImage(true);
      const formData = new FormData();
      formData.append('portfolioImage', file);

      const res = await apiRequest('/professionals/portfolio/upload', {
        method: 'POST',
        body: formData,
      });

      if (res.data?.url) {
        setImageUrl(res.data.url);
        toast.success("Image uploaded to disk storage!");
      }
    } catch (err: any) {
      console.error('Image upload failed:', err);
      toast.error(err.message || 'Failed to upload image. Please try again.');
      setImagePreview('');
      setImageUrl('');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleAddProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl) return toast.error("Please upload a project image.");
    
    try {
      setIsSubmitting(true);
      const res = await apiRequest('/professionals/portfolio', {
        method: 'POST',
        body: JSON.stringify({ title, short_description: shortDescription, image_urls: [imageUrl] }),
      });
      if (res.data) {
        setProf((prev: any) => ({
          ...prev,
          pastProjects: [res.data, ...(prev.pastProjects || [])]
        }));
      }
      setIsModalOpen(false);
      setTitle(''); setShortDescription(''); setImageUrl(''); setImagePreview('');
      toast.success('Project added to portfolio!');
    } catch (err: any) {
      toast.error('Failed to add project to portfolio.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // PULSING SKELETON LOADERS
  if (isLoading) {
    return (
      <DashboardLayout title="Loading...">
        <div className="animate-pulse space-y-6 max-w-6xl mx-auto">
          <div className="bg-white rounded-2xl border border-slate-100 p-6 md:p-8 flex flex-col md:flex-row gap-8 shadow-sm">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-slate-200 shrink-0 mx-auto md:mx-0"></div>
            <div className="flex-1 w-full space-y-4">
              <div className="h-8 bg-slate-200 rounded-lg w-1/2 md:w-1/3"></div>
              <div className="h-4 bg-slate-200 rounded w-1/4"></div>
              <div className="h-4 bg-slate-200 rounded w-2/3 mt-6"></div>
              <div className="h-4 bg-slate-200 rounded w-3/4"></div>
              <div className="grid grid-cols-3 gap-4 pt-6 mt-6 border-t border-slate-100">
                <div className="h-12 bg-slate-200 rounded-xl"></div>
                <div className="h-12 bg-slate-200 rounded-xl"></div>
                <div className="h-12 bg-slate-200 rounded-xl"></div>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // GRACEFUL EMPTY STATE
  if (!prof) {
    return (
      <DashboardLayout title="Profile Not Found">
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center max-w-lg mx-auto">
          <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6 shadow-inner">
            <Search className="w-10 h-10 text-slate-400" />
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-3">Profile Unavailable</h2>
          <p className="text-slate-500 mb-8 leading-relaxed">
            The professional profile you are looking for does not exist, has been removed, or the link is incorrect.
          </p>
          <button 
            onClick={() => navigate(user?.role === 'HOMEOWNER' ? '/homeowner/find-professionals' : '/professional/dashboard')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-md hover:shadow-lg flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> Return to Directory
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const companyName = prof.companyName || prof.businessName || prof.user?.name || prof.user?.email?.split('@')[0] || 'Company Name Not Set';
  const category = prof.profession || prof.category || 'Category Not Set';
  const location = prof.location || prof.city || 'Location Not Set';
  const bio = prof.bio || prof.about || 'No bio provided by this professional yet.';
  const projectsCount = prof.completedProjects || 0;
  const overallRating = Number(prof.rating) || 0.0;
  
  const reviews = prof.reviewsReceived || (prof.user?.reviewsReceived) || prof.reviews || [];
  const reviewsCount = Number(prof.reviewCount) || reviews.length || 0;
  const expYears = prof.experienceYears || prof.yearsOfExperience || 0;

  return (
    <DashboardLayout title={`Profile: ${companyName}`}>
      <Toaster position="top-center" reverseOrder={false} />
      
      {!isOwnProfile && (
        <button onClick={() => navigate(-1)} className="text-sm font-bold text-slate-500 hover:text-blue-600 flex items-center mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to Directory
        </button>
      )}
      
      {/* MOBILE RESPONSIVENESS IMPROVED */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 md:p-8 mb-6">
        <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-start text-center md:text-left">
          <div className="w-28 h-28 md:w-32 md:h-32 rounded-full bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-md overflow-hidden border-4 border-white outline outline-1 outline-slate-200">
             {prof.logoUrl ? (
               <img src={prof.logoUrl} alt="Logo" className="w-full h-full object-cover" />
             ) : (
               <div>
                 <Building className="w-8 h-8 md:w-10 md:h-10 mx-auto mb-1 text-slate-300" />
                 <span className="text-[10px] md:text-xs font-bold uppercase">{companyName.substring(0, 8)}</span>
               </div>
             )}
          </div>

          <div className="flex-1 w-full">
            <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-5 mb-4">
              <div>
                <div className="flex items-center justify-center md:justify-start gap-2 mb-1.5">
                  <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900">{companyName}</h2>
                  {(prof.verified === true || prof.verificationStatus === 'VERIFIED') && (
                    <CheckCircle className="w-6 h-6 text-blue-500 fill-blue-100 shrink-0" />
                  )}
                </div>
                <p className="text-sm font-medium text-slate-500 mb-2">{category}</p>
                <p className="text-sm text-slate-600 flex items-center justify-center md:justify-start gap-1.5 font-medium">
                  <MapPin className="w-4 h-4 text-slate-400" /> {location}
                </p>
              </div>
              
              <div className="flex flex-wrap justify-center md:justify-start items-center gap-3 shrink-0">
                {isOwner ? (
                  <button 
                    onClick={() => {
                      setEditForm({
                        companyName: prof?.companyName || prof?.businessName || '',
                        profession: prof?.profession || prof?.category || '',
                        location: prof?.location || user?.city || '',
                        bio: prof?.bio || '',
                        rating: Number(prof?.rating) || 0,
                        reviewCount: Number(prof?.reviewCount) || 0
                      });
                      setIsEditProfileOpen(true);
                    }}
                    className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
                  >
                    <Edit className="w-4 h-4" /> Edit Profile Details
                  </button>
                ) : (
                  <>
                    {user?.role !== 'PROFESSIONAL' && (
                      <button 
                        onClick={() => navigate(`/messages?userId=${prof.userId || prof.user?.id}`)}
                        className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
                      >
                        <MessageSquare className="w-4 h-4" /> Message / Inquire
                      </button>
                    )}
                    <button className="w-full sm:w-auto bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 px-5 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-sm transition-all">
                      <Share2 className="w-4 h-4 text-blue-600" /> Share
                    </button>
                  </>
                )}
              </div>
            </div>

            <p className="text-sm text-slate-600 max-w-3xl mb-8 leading-relaxed">{bio}</p>

            <div className="grid grid-cols-3 gap-2 md:gap-4 border-t border-slate-100 pt-6 max-w-2xl text-center md:text-left">
              <div>
                <p className="text-xl md:text-2xl font-extrabold text-slate-900">{projectsCount}</p>
                <p className="text-[10px] md:text-xs font-semibold text-slate-500 mt-1">Completed Projects</p>
              </div>
              <div className="border-x border-slate-100 px-2 md:px-4 md:border-x-0">
                <p className="text-xl md:text-2xl font-extrabold text-slate-900 flex items-center justify-center md:justify-start gap-1">
                  {overallRating.toFixed(1)} <Star className="w-4 h-4 md:w-5 md:h-5 text-amber-400 fill-amber-400" />
                </p>
                <p className="text-[10px] md:text-xs font-semibold text-slate-500 mt-1">Rating ({reviewsCount} Reviews)</p>
              </div>
              <div>
                <p className="text-xl md:text-2xl font-extrabold text-slate-900">{expYears}</p>
                <p className="text-[10px] md:text-xs font-semibold text-slate-500 mt-1">Years Experience</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-white rounded-2xl border border-slate-200 p-5 md:p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-4">About Us</h3>
            <p className="text-sm text-slate-600 leading-relaxed">{bio}</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 md:p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center">
                  <FolderPlus className="h-5 w-5 mr-2 text-orange-500" /> Past Projects Portfolio
                </h3>
              </div>
              {isOwner && (
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="bg-blue-50 text-blue-600 px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-blue-100 transition-colors w-full sm:w-auto"
                >
                  <Plus className="h-4 w-4" /> Add Project
                </button>
              )}
            </div>

            {!prof?.pastProjects || prof.pastProjects.length === 0 ? (
              <div className="text-center py-10 text-xs text-slate-400 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                <ImageIcon className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                <p className="font-semibold text-slate-700">No past projects added yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {prof.pastProjects.map((item: any) => (
                  <div key={item.id} className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden shadow-sm group hover:border-blue-200 transition-colors">
                    {item.image_urls && item.image_urls.length > 0 && (
                      <img src={item.image_urls[0]} alt={item.title} className="w-full h-40 object-cover bg-slate-200 group-hover:opacity-90 transition-opacity" />
                    )}
                    <div className="p-5">
                      <h4 className="font-bold text-slate-900 text-sm mb-1">{item.title}</h4>
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{item.short_description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 md:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900">Client Reviews</h3>
              <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">{reviewsCount} Reviews</span>
            </div>
            
            {(!isOwner && user?.role === 'HOMEOWNER') && (
              <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 md:p-5 mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                <p className="text-xs text-blue-800 font-semibold text-center sm:text-left">Worked with {companyName} recently?</p>
                <button 
                  type="button"
                  onClick={(e) => { e.preventDefault(); setIsReviewModalOpen(true); }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-sm transition-all w-full sm:w-auto"
                >
                  Write a Review
                </button>
              </div>
            )}

            {reviews.length > 0 ? (
              <div className="space-y-5">
                {reviews.map((rev: any, idx: number) => (
                  <div key={idx} className="bg-slate-50/50 rounded-xl p-5 border border-slate-100">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center font-extrabold text-sm border border-orange-200">
                          {rev.reviewer?.name ? rev.reviewer.name.charAt(0) : 'U'}
                        </div>
                        <div>
                          <span className="block text-sm font-bold text-slate-900">{rev.reviewer?.name || 'Homeowner'}</span>
                          <span className="block text-[10px] text-slate-400 font-bold mt-0.5 uppercase tracking-wider">{new Date(rev.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-0.5 bg-white px-2 py-1 rounded-lg border border-slate-200 shadow-sm">
                        <span className="text-xs font-bold mr-1">{rev.rating}.0</span>
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      </div>
                    </div>
                    <p className="text-sm text-slate-700 italic leading-relaxed pt-2">"{rev.comment}"</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-slate-50/80 rounded-2xl border border-dashed border-slate-200">
                {reviewsCount > 0 ? (
                  <p className="text-sm text-slate-700 font-semibold px-4">This professional has a {overallRating.toFixed(1)} star rating based on {reviewsCount} past jobs.</p>
                ) : (
                  <div className="text-slate-400">
                    <Star className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm italic font-medium">No reviews yet.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 md:p-6 shadow-sm sticky top-24">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Contact Information</h3>
            <div className="space-y-5 mb-8">
              <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div className="p-2 bg-white rounded-lg shadow-sm border border-slate-200 shrink-0">
                  <Phone className="w-5 h-5 text-blue-600" />
                </div>
                <span className="text-sm font-semibold text-slate-800 break-all">{prof.user?.phone || prof.phone || 'Not provided'}</span>
              </div>
              <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div className="p-2 bg-white rounded-lg shadow-sm border border-slate-200 shrink-0">
                  <Mail className="w-5 h-5 text-blue-600" />
                </div>
                <span className="text-sm font-semibold text-slate-800 break-all">{prof.user?.email || 'Not provided'}</span>
              </div>
              <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div className="p-2 bg-white rounded-lg shadow-sm border border-slate-200 shrink-0">
                  <MapPin className="w-5 h-5 text-blue-600" />
                </div>
                <span className="text-sm font-semibold text-slate-800">{location}</span>
              </div>
            </div>
            
            {!isOwner && user?.role !== 'PROFESSIONAL' && (
              <button 
                onClick={() => navigate(`/messages?userId=${prof.userId || prof.user?.id}`)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl font-bold transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2 text-sm"
              >
                <MessageSquare className="w-4 h-4" /> Contact Professional
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ADMIN EDIT PROFILE MODAL */}
      {isEditProfileOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 md:p-8 max-w-md w-full shadow-2xl border border-slate-200 my-8 relative">
            <div className="flex items-center justify-between mb-5 border-b border-slate-100 pb-4">
              <h3 className="text-lg font-bold text-slate-900">Edit Profile Details</h3>
              <button onClick={() => setIsEditProfileOpen(false)} className="text-slate-400 hover:bg-slate-100 p-1.5 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleEditProfileSubmit} className="space-y-5 text-sm">
              <Input label="Company Name" value={editForm.companyName} onChange={(e) => setEditForm({...editForm, companyName: e.target.value})} required />
              <Input label="Primary Profession" value={editForm.profession} onChange={(e) => setEditForm({...editForm, profession: e.target.value})} required />
              <Input label="City / Location" value={editForm.location} onChange={(e) => setEditForm({...editForm, location: e.target.value})} required />
              
              <div className="grid grid-cols-2 gap-4 p-5 bg-amber-50 border border-amber-200 rounded-xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-amber-400"></div>
                <div>
                  <label className="block text-amber-900 font-bold mb-1.5 text-xs uppercase tracking-wider">Override Rating</label>
                  <input type="number" step="0.1" max="5" min="0" value={editForm.rating} onChange={(e) => setEditForm({...editForm, rating: parseFloat(e.target.value) || 0})} className="w-full border border-amber-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-amber-500 bg-white font-mono" />
                </div>
                <div>
                  <label className="block text-amber-900 font-bold mb-1.5 text-xs uppercase tracking-wider">Review Count</label>
                  <input type="number" min="0" value={editForm.reviewCount} onChange={(e) => setEditForm({...editForm, reviewCount: parseInt(e.target.value) || 0})} className="w-full border border-amber-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-amber-500 bg-white font-mono" />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1.5 text-xs uppercase tracking-wider">About Us (Bio)</label>
                <textarea rows={4} className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 resize-none" value={editForm.bio} onChange={(e) => setEditForm({...editForm, bio: e.target.value})} />
              </div>
              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                <button type="button" onClick={() => setIsEditProfileOpen(false)} className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-50 transition-colors">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition-all shadow-md disabled:opacity-50 flex items-center gap-2">
                  {isSubmitting ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD PROJECT MODAL WITH IMAGE UPLOAD */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 md:p-8 max-w-md w-full shadow-2xl border border-slate-200 my-8 relative">
            <div className="flex items-center justify-between mb-5 border-b border-slate-100 pb-4">
              <h3 className="text-lg font-bold text-slate-900">Add Past Project</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:bg-slate-100 p-1.5 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddProjectSubmit} className="space-y-5 text-sm">
              <Input label="Project Name" value={title} onChange={(e) => setTitle(e.target.value)} required />
              <div>
                <label className="block text-slate-700 font-bold mb-1.5 text-xs uppercase tracking-wider">Description</label>
                <textarea rows={3} className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 resize-none" value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} required />
              </div>
              
              <div>
                <label className="block text-slate-700 font-bold mb-1.5 text-xs uppercase tracking-wider">Upload Project Photo</label>
                <div className="relative border-2 border-dashed border-slate-300 rounded-xl p-6 hover:bg-blue-50 hover:border-blue-300 transition-colors text-center cursor-pointer group">
                  <input type="file" accept="image/jpeg, image/jpg, image/png, image/webp, image/avif" onChange={handleImageUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                  <UploadCloud className="w-10 h-10 text-slate-400 group-hover:text-blue-500 mx-auto mb-3 transition-colors" />
                  <p className="font-bold text-slate-700">
                    {isUploadingImage ? 'Uploading image to storage...' : 'Click to browse or drag & drop'}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">JPG, PNG, WebP (Max 10MB)</p>
                </div>
                {(imagePreview || imageUrl) && (
                  <div className="mt-4 relative group">
                    <img src={imagePreview || imageUrl} alt="Preview" className="h-40 w-full object-cover rounded-xl border border-slate-200 shadow-md" />
                    <button type="button" onClick={() => { setImageUrl(''); setImagePreview(''); }} className="absolute top-2 right-2 bg-slate-900/80 hover:bg-rose-600 text-white p-2 rounded-lg backdrop-blur shadow-lg transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-50 transition-colors">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all shadow-md disabled:opacity-50">
                  {isSubmitting ? 'Uploading...' : 'Save to Portfolio'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REVIEW MODAL */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 md:p-8 max-w-md w-full shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-5 border-b border-slate-100 pb-4">
              <h3 className="text-lg font-bold text-slate-900">Rate & Review {companyName}</h3>
              <button onClick={() => setIsReviewModalOpen(false)} className="text-slate-400 hover:bg-slate-100 p-1.5 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleReviewSubmit} className="space-y-6">
              <div>
                <label className="block text-slate-700 font-bold mb-3 text-xs uppercase tracking-wider text-center">Tap to Rate</label>
                <div className="flex gap-2 justify-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button type="button" key={star} onClick={() => setRating(star)} className="p-1 focus:outline-none transition-transform hover:scale-110 active:scale-95">
                      <Star className={`w-10 h-10 ${star <= rating ? 'text-amber-400 fill-amber-400 drop-shadow-md' : 'text-slate-200 fill-slate-200'}`} />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-slate-700 font-bold mb-1.5 text-xs uppercase tracking-wider">Your Experience</label>
                <textarea rows={4} value={comment} onChange={(e) => setComment(e.target.value)} placeholder="What was it like working with them? Share details..." className="w-full border border-slate-300 rounded-xl p-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none shadow-sm" required></textarea>
              </div>
              <div className="pt-2 flex justify-end gap-3">
                <button type="button" onClick={() => setIsReviewModalOpen(false)} className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-50 transition-colors">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md transition-all disabled:opacity-50 flex items-center gap-2">
                  {isSubmitting ? 'Posting...' : 'Post Public Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};