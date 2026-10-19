import React, { useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../../lib/api';
import { CheckCircle2, ArrowRight, ArrowLeft, Upload, FileText, Check, MapPin, Compass, Loader2 } from 'lucide-react';

export const PostProjectWizard: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  const [createdProjectId, setCreatedProjectId] = useState<string | null>(null);

  const [isLocating, setIsLocating] = useState(false);
  const [locationSuccess, setLocationSuccess] = useState(false);

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setLocationSuccess(false);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();

          if (data && data.address) {
            const addr = data.address;
            const house = addr.house_number || addr.building || addr.house_name || '';
            const road = addr.road || addr.street || addr.pedestrian || addr.footway || '';
            const suburb = addr.suburb || addr.neighbourhood || addr.residential || addr.quarter || '';

            const streetParts = [house, road, suburb].filter(Boolean);
            const specificAddress = streetParts.length > 0
              ? streetParts.join(', ')
              : (data.display_name ? data.display_name.split(',').slice(0, 3).join(',').trim() : 'Site Location');

            const city = addr.city || addr.town || addr.village || addr.suburb || addr.county || addr.city_district || 'Bengaluru';
            const state = addr.state || 'Karnataka';
            const pincode = addr.postcode || '560001';

            setFormData((prev) => ({
              ...prev,
              address: specificAddress,
              city: city,
              state: state,
              pincode: pincode,
            }));
            setLocationSuccess(true);
          }
        } catch (err) {
          console.error('Reverse geocoding error:', err);
          setFormData((prev) => ({
            ...prev,
            address: `GPS Site Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`,
            city: 'Bengaluru',
            state: 'Karnataka',
            pincode: '560103',
          }));
          setLocationSuccess(true);
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        setIsLocating(false);
        alert('Could not access precise device location. You can fill location manually below.');
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  };

  const [formData, setFormData] = useState({
    title: '',
    projectType: 'NEW_CONSTRUCTION',
    address: '',
    city: '',
    state: '',
    pincode: '',
    propertyType: 'Residential Plot',
    plotSizeSqFt: 1200,
    builtUpAreaSqFt: 2000,
    floorsCount: 2,
    bedroomsCount: 3,
    bathroomsCount: 3,
    description: '',
    minBudget: 1500000,
    maxBudget: 3500000,
    budgetType: 'ESTIMATED',
    preferredStartDate: '',
    expectedCompletionDate: '',
    urgencyLevel: 'NORMAL',
    fileName: '',
  });

  const steps = [
    'Project Type',
    'Location',
    'Property Details',
    'Requirements',
    'Budget',
    'Timeline',
    'Documents',
    'Floor Plan',
    'Review',
    'Publish Status',
  ];

  const handleNext = () => {
    if (currentStep < 9) setCurrentStep((s) => s + 1);
  };

  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep((s) => s - 1);
  };

  const handlePublish = async () => {
    try {
      setIsLoading(true);
      // Create Project (defaults to POSTED status)
      const res = await apiRequest('/projects', {
        method: 'POST',
        body: JSON.stringify(formData),
      });

      const projectId = res.data.id;
      setCreatedProjectId(projectId);
      setIsPublished(true);
      setCurrentStep(10);
    } catch (err: any) {
      alert(err.message || 'Failed to publish project.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout title="Post New Project Wizard">
      <div className="max-w-4xl mx-auto">
        {/* Step Navigation Bar */}
        <div className="mb-8 bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-x-auto">
          <div className="flex items-center min-w-max space-x-2">
            {steps.map((label, index) => {
              const stepNum = index + 1;
              const isActive = currentStep === stepNum;
              const isDone = currentStep > stepNum;
              return (
                <div key={label} className="flex items-center space-x-2">
                  <div
                    className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold transition-colors ${
                      isDone
                        ? 'bg-emerald-600 text-white'
                        : isActive
                        ? 'bg-orange-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'
                    }`}
                  >
                    {isDone ? <Check className="h-4 w-4" /> : stepNum}
                  </div>
                  <span className={`text-xs font-medium ${isActive ? 'text-slate-900 dark:text-white font-bold' : 'text-slate-400 dark:text-slate-500'}`}>
                    {label}
                  </span>
                  {index < steps.length - 1 && <div className="w-4 h-px bg-slate-200 dark:bg-slate-700"></div>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Wizard Form Card */}
        <Card className="p-8">
          {/* STEP 1: Project Type */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Step 1: Select Construction Category</h3>
              <Input
                label="Project Title"
                placeholder="e.g. 3BHK Villa Construction in Whitefield"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
              <Select
                label="Primary Category"
                value={formData.projectType}
                onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
                options={[
                  { label: 'New Construction', value: 'NEW_CONSTRUCTION' },
                  { label: 'Renovation & Repair', value: 'RENOVATION' },
                  { label: 'Interior Design', value: 'INTERIOR' },
                  { label: 'Architectural Design', value: 'ARCHITECTURE' },
                  { label: 'Structural Work', value: 'STRUCTURAL' },
                  { label: 'Civil Work', value: 'CIVIL_WORK' },
                  { label: 'Electrical Contracting', value: 'ELECTRICAL' },
                  { label: 'Plumbing & MEP', value: 'PLUMBING' },
                  { label: 'Other Specialization', value: 'OTHER' },
                ]}
              />
            </div>
          )}

          {/* STEP 2: Location */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Step 2: Location Details</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Auto-detect location or fill in manually</p>
                </div>

                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={handleGetCurrentLocation}
                  isLoading={isLocating}
                  className="shadow-sm font-semibold"
                >
                  <Compass className="h-4 w-4 mr-1.5" /> Get Current Location
                </Button>
              </div>

              {locationSuccess && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-lg text-xs flex items-center">
                  <CheckCircle2 className="h-4 w-4 mr-2 text-emerald-600 shrink-0" />
                  <span>GPS Location auto-detected and address fields filled below!</span>
                </div>
              )}

              <Input
                label="Site Street Address"
                placeholder="Plot No. 42, Green Glen Layout"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  label="City"
                  placeholder="Bengaluru"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                />
                <Input
                  label="State"
                  placeholder="Karnataka"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                />
                <Input
                  label="Pincode"
                  placeholder="560103"
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                />
              </div>
            </div>
          )}

          {/* STEP 3: Property Details */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Step 3: Property Specifications</h3>
              <Select
                label="Property Type"
                value={formData.propertyType}
                onChange={(e) => setFormData({ ...formData, propertyType: e.target.value })}
                options={[
                  { label: 'Residential Plot / Villa', value: 'Residential Plot' },
                  { label: 'Apartment / Condominium', value: 'Apartment' },
                  { label: 'Commercial Building', value: 'Commercial Building' },
                  { label: 'Industrial Site', value: 'Industrial Site' },
                ]}
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Plot Area (Sq.Ft)"
                  type="number"
                  value={formData.plotSizeSqFt}
                  onChange={(e) => setFormData({ ...formData, plotSizeSqFt: parseFloat(e.target.value) || 0 })}
                />
                <Input
                  label="Built-up Area (Sq.Ft)"
                  type="number"
                  value={formData.builtUpAreaSqFt}
                  onChange={(e) => setFormData({ ...formData, builtUpAreaSqFt: parseFloat(e.target.value) || 0 })}
                />
                <Input
                  label="Floors Count (G+N)"
                  type="number"
                  value={formData.floorsCount}
                  onChange={(e) => setFormData({ ...formData, floorsCount: parseInt(e.target.value) || 0 })}
                />
                <Input
                  label="Bedrooms Count"
                  type="number"
                  value={formData.bedroomsCount}
                  onChange={(e) => setFormData({ ...formData, bedroomsCount: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>
          )}

          {/* STEP 4: Requirements */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Step 4: Detailed Requirements Scope</h3>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Comprehensive Project Scope & Specifications
                </label>
                <textarea
                  rows={6}
                  className="w-full p-3.5 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white bg-white dark:bg-slate-900 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  placeholder="Describe foundation requirements, material preferences (e.g. UltraTech Cement, Tata Tiscon steel), sanitary fittings, and structural scope..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
            </div>
          )}

          {/* STEP 5: Budget */}
          {currentStep === 5 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Step 5: Budget Expectation</h3>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Minimum Estimated Budget (₹)"
                  type="number"
                  value={formData.minBudget}
                  onChange={(e) => setFormData({ ...formData, minBudget: parseFloat(e.target.value) || 0 })}
                />
                <Input
                  label="Maximum Budget Cap (₹)"
                  type="number"
                  value={formData.maxBudget}
                  onChange={(e) => setFormData({ ...formData, maxBudget: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <Select
                label="Budget Type"
                value={formData.budgetType}
                onChange={(e) => setFormData({ ...formData, budgetType: e.target.value })}
                options={[
                  { label: 'Estimated Range', value: 'ESTIMATED' },
                  { label: 'Fixed Cap Budget', value: 'FIXED' },
                ]}
              />
            </div>
          )}

          {/* STEP 6: Timeline */}
          {currentStep === 6 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Step 6: Construction Schedule</h3>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Preferred Start Date"
                  type="date"
                  value={formData.preferredStartDate}
                  onChange={(e) => setFormData({ ...formData, preferredStartDate: e.target.value })}
                />
                <Input
                  label="Target Completion Date"
                  type="date"
                  value={formData.expectedCompletionDate}
                  onChange={(e) => setFormData({ ...formData, expectedCompletionDate: e.target.value })}
                />
              </div>
              <Select
                label="Project Urgency"
                value={formData.urgencyLevel}
                onChange={(e) => setFormData({ ...formData, urgencyLevel: e.target.value })}
                options={[
                  { label: 'Normal Schedule', value: 'NORMAL' },
                  { label: 'Urgent Execution', value: 'URGENT' },
                  { label: 'Flexible Start', value: 'FLEXIBLE' },
                ]}
              />
            </div>
          )}

          {/* STEP 7 & 8: Documents & Blueprint */}
          {(currentStep === 7 || currentStep === 8) && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Step {currentStep}: {currentStep === 7 ? 'Upload Project Documents' : 'Upload Floor Plan / Blueprint'}
                </h3>
                <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2.5 py-1 rounded-full font-semibold">
                  Optional Step
                </span>
              </div>
              <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-8 text-center bg-slate-50 dark:bg-slate-800/40">
                <Upload className="h-10 w-10 text-slate-400 mx-auto mb-3" />
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  {currentStep === 7 ? 'Upload Scope Documents / Specifications (Optional)' : 'Upload Floor Plan or CAD Drawings (Optional)'}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4">
                  If you don't have blueprints or photos ready, you can skip this step and proceed.
                </p>
                <Input
                  type="file"
                  className="max-w-xs mx-auto"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) setFormData({ ...formData, fileName: f.name });
                  }}
                />
                {formData.fileName && (
                  <p className="mt-3 text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center justify-center">
                    <FileText className="h-4 w-4 mr-1" /> {formData.fileName} attached
                  </p>
                )}
              </div>
            </div>
          )}

          {/* STEP 9: Review */}
          {currentStep === 9 && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Step 9: Final Review Before Publishing</h3>

              <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-xl border border-slate-200 dark:border-slate-700 text-xs space-y-3 text-slate-700 dark:text-slate-300">
                <div className="flex justify-between">
                  <span className="font-semibold text-slate-500 dark:text-slate-400">Project Title:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{formData.title || 'Untitled Project'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-slate-500 dark:text-slate-400">Category:</span>
                  <span>{formData.projectType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-slate-500 dark:text-slate-400">Location:</span>
                  <span>{formData.address}, {formData.city}, {formData.state} - {formData.pincode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-slate-500 dark:text-slate-400">Built-Up Area:</span>
                  <span>{formData.builtUpAreaSqFt} Sq.Ft ({formData.floorsCount} Floors)</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-slate-500 dark:text-slate-400">Budget Range:</span>
                  <span className="font-bold text-orange-600 dark:text-orange-400">₹{formData.minBudget.toLocaleString()} - ₹{formData.maxBudget.toLocaleString()}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-500 dark:text-slate-400 block mb-1">Scope Description:</span>
                  <p className="bg-white dark:bg-slate-900 p-3 rounded border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 leading-relaxed">{formData.description || 'No detailed scope provided.'}</p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 10: Confirmation Page (Shown ONLY after real backend confirmation) */}
          {currentStep === 10 && isPublished && (
            <div className="py-12 text-center">
              <CheckCircle2 className="h-16 w-16 text-emerald-500 mx-auto mb-4 animate-bounce" />
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Project Published Successfully!</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6">
                Your construction project is now live on the StroitX marketplace. Verified contractors in {formData.city || 'your region'} will start reviewing and submitting quotes.
              </p>
              <div className="flex justify-center space-x-4">
                <Button onClick={() => navigate(`/homeowner/projects/${createdProjectId}`)}>
                  View Published Project
                </Button>
                <Button variant="outline" onClick={() => navigate('/homeowner/dashboard')}>
                  Back to Dashboard
                </Button>
              </div>
            </div>
          )}

          {/* Wizard Action Controls */}
          {currentStep <= 9 && (
            <div className="mt-8 pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              {currentStep > 1 ? (
                <Button variant="outline" onClick={handlePrev}>
                  <ArrowLeft className="h-4 w-4 mr-1.5" /> Previous
                </Button>
              ) : (
                <div></div>
              )}

              {currentStep < 9 ? (
                <Button onClick={handleNext}>
                  {(currentStep === 7 || currentStep === 8) && !formData.fileName
                    ? 'Skip & Continue'
                    : 'Next Step'} <ArrowRight className="h-4 w-4 ml-1.5" />
                </Button>
              ) : (
                <Button variant="primary" onClick={handlePublish} isLoading={isLoading}>
                  Publish Project to Marketplace
                </Button>
              )}
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
};
