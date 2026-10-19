import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { MapPin, Camera, CheckCircle2, ShieldCheck, ArrowRight, X, AlertCircle } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export const ProfessionalOnboardingModal: React.FC<ModalProps> = ({ isOpen, onClose, onComplete }) => {
  const [locationStatus, setLocationStatus] = useState<'IDLE' | 'LOADING' | 'GRANTED' | 'DENIED'>('IDLE');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [cameraStatus, setCameraStatus] = useState<'IDLE' | 'GRANTED'>('IDLE');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleRequestLocation = () => {
    if (!navigator.geolocation) {
      setErrorMsg('Geolocation is not supported by your browser.');
      setLocationStatus('DENIED');
      return;
    }

    setLocationStatus('LOADING');
    setErrorMsg('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLocationStatus('GRANTED');
      },
      (err) => {
        setErrorMsg('Location permission denied or unavailable. You can still set your city manually.');
        setLocationStatus('DENIED');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleCameraChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setCameraStatus('GRANTED');
    }
  };

  const handleFinishOnboarding = () => {
    localStorage.setItem('stroitx_prof_onboarding', 'true');
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
      <div className="bg-slate-900 border-2 border-orange-500/60 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl text-white relative space-y-6">
        {/* Close Button */}
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white p-1">
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div>
          <div className="inline-flex items-center space-x-2 bg-orange-600/20 text-orange-400 border border-orange-500/30 px-3 py-1 rounded-full text-xs font-bold mb-3">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Partner Onboarding Setup</span>
          </div>
          <h2 className="text-2xl font-black text-white">Enable Partner Permissions</h2>
          <p className="text-xs text-slate-400 mt-1">
            Configure location & camera access to receive nearby homeowner project leads and upload work site photos.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-950/60 border border-rose-800 text-rose-300 rounded-xl text-xs flex items-center">
            <AlertCircle className="h-4 w-4 mr-2 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Step 1: Geolocation Request */}
        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-orange-500/10 text-orange-500 rounded-xl">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">1. Nearby Project Matching</h4>
                <p className="text-[11px] text-slate-400">Match construction leads within your service radius</p>
              </div>
            </div>

            {locationStatus === 'GRANTED' && (
              <Badge variant="success">
                <CheckCircle2 className="h-3.5 w-3.5 mr-1 inline" /> Granted
              </Badge>
            )}
          </div>

          {locationStatus === 'GRANTED' && coords && (
            <p className="text-[11px] font-mono text-emerald-400 bg-slate-900 p-2 rounded border border-slate-800">
              📍 Coordinates Captured: {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
            </p>
          )}

          {locationStatus !== 'GRANTED' && (
            <Button
              size="sm"
              variant="outline"
              className="w-full text-xs border-slate-700 text-slate-200 hover:bg-slate-800"
              onClick={handleRequestLocation}
              isLoading={locationStatus === 'LOADING'}
            >
              <MapPin className="h-3.5 w-3.5 mr-1.5 text-orange-500" /> Enable Device Geolocation
            </Button>
          )}
        </div>

        {/* Step 2: Camera & File Storage Access */}
        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl">
                <Camera className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">2. Portfolio & Photo Access</h4>
                <p className="text-[11px] text-slate-400">Upload site progress photos & KYC licenses</p>
              </div>
            </div>

            {cameraStatus === 'GRANTED' && (
              <Badge variant="success">
                <CheckCircle2 className="h-3.5 w-3.5 mr-1 inline" /> Ready
              </Badge>
            )}
          </div>

          <div className="relative">
            <input
              type="file"
              accept="image/*"
              // @ts-ignore
              capture="environment"
              onChange={handleCameraChange}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
            />
            <Button
              size="sm"
              variant="outline"
              className="w-full text-xs border-slate-700 text-slate-200 hover:bg-slate-800 pointer-events-none"
            >
              <Camera className="h-3.5 w-3.5 mr-1.5 text-blue-400" /> Test Camera / Select Test Photo
            </Button>
          </div>
        </div>

        {/* Submit Action */}
        <Button
          size="lg"
          className="w-full font-bold shadow-lg shadow-orange-600/30 text-sm py-3"
          onClick={handleFinishOnboarding}
        >
          Complete Onboarding Setup <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};
