import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { apiRequest } from '../../lib/api';
import { Layers, FolderPlus, Image, Plus, X } from 'lucide-react';

export const ProfessionalPortfolioPage: React.FC = () => {
  const [pastProjects, setPastProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchPortfolio = async () => {
    try {
      setIsLoading(true);
      const res = await apiRequest('/professionals/portfolio');
      if (res.data) setPastProjects(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('File too large. Maximum size is 10MB.');
      return;
    }

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('portfolioImage', file);

      const res = await apiRequest('/professionals/portfolio/upload', {
        method: 'POST',
        body: formData,
      });

      if (res.data?.url) {
        setImageUrl(res.data.url);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to upload photo.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !shortDescription.trim()) return;

    try {
      setIsSubmitting(true);
      const img = imageUrl.trim() || 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?auto=format&fit=crop&w=800&q=80';
      const res = await apiRequest('/professionals/portfolio', {
        method: 'POST',
        body: JSON.stringify({
          title,
          short_description: shortDescription,
          image_urls: [img],
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
      alert(err.message || 'Failed to add project');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout title="My Portfolio">
      <div className="space-y-6">
        <div className="flex justify-between items-center bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-md">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-orange-600 rounded-xl text-white">
              <Layers className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Past Projects Portfolio</h2>
              <p className="text-xs text-slate-400 mt-0.5">Showcase your completed construction and interior work to clients</p>
            </div>
          </div>
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="h-4 w-4 mr-1.5" /> Add Project
          </Button>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-slate-400 text-xs">Loading portfolio...</div>
        ) : pastProjects.length === 0 ? (
          <Card className="p-8 text-center text-xs text-slate-400">
            <Image className="h-10 w-10 text-slate-300 mx-auto mb-2" />
            <p className="font-bold text-slate-700 dark:text-slate-300 text-sm">No portfolio items added yet</p>
            <p className="mt-1">Click "Add Project" above to showcase your completed work.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {pastProjects.map((item) => (
              <Card key={item.id} className="p-0 overflow-hidden">
                {item.image_urls && item.image_urls.length > 0 && (
                  <img src={item.image_urls[0]} alt={item.title} className="w-full h-40 object-cover" />
                )}
                <div className="p-5">
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">{item.title}</h4>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{item.short_description}</p>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200 dark:border-slate-800 text-xs">
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">Add Portfolio Project</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white"><X className="h-4 w-4" /></button>
              </div>

              <form onSubmit={handleAddProject} className="space-y-4">
                <Input label="Project Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Short Description</label>
                  <textarea rows={3} className="w-full p-2.5 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 text-slate-900 dark:text-white" value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} required></textarea>
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Project Photo</label>
                  <input
                    type="file"
                    accept="image/jpeg, image/jpg, image/png, image/webp"
                    onChange={handleFileUpload}
                    className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100 dark:file:bg-slate-800 dark:file:text-slate-200 cursor-pointer mb-2"
                  />
                  {isUploading && <p className="text-[11px] text-orange-500 font-semibold mb-2">Uploading photo to disk storage...</p>}
                  <Input label="Or Paste Direct Image URL" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." />
                  {imageUrl && (
                    <div className="mt-2">
                      <img src={imageUrl} alt="Project Preview" className="h-28 w-full object-cover rounded-lg border border-slate-200 dark:border-slate-700" />
                    </div>
                  )}
                </div>
                <div className="pt-2 flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                  <Button type="submit" isLoading={isSubmitting}>Save Project</Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
