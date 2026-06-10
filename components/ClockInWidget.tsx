'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ScanFace, 
  MapPin, 
  QrCode, 
  Nfc, 
  CheckCircle2, 
  Loader2,
  AlertCircle
} from 'lucide-react';

type CheckInMethod = 'gps' | 'face' | 'qr' | 'nfc';

export function ClockInWidget() {
  const [activeMethod, setActiveMethod] = useState<CheckInMethod | null>(null);
  const [status, setStatus] = useState<'idle' | 'scanning' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  // Stop camera when unmounting or switching modes
  useEffect(() => {
    return () => {
      stopCamera();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeMethod, stream]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      setStatus('error');
      setMessage('មិនអាចបើកកាមេរ៉ាបានទេ / Cannot access camera');
    }
  };

  const handleFaceCheckIn = async () => {
    setStatus('scanning');
    setMessage('កំពុងស្កេនទម្រង់មុខ... / Scanning face...');
    
    if (!videoRef.current || !canvasRef.current) return;
    
    const context = canvasRef.current.getContext('2d');
    if (context) {
      // Draw current video frame to canvas
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      context.drawImage(videoRef.current, 0, 0);
      
      const imageBase64 = canvasRef.current.toDataURL('image/jpeg').split(',')[1];
      
      try {
        const res = await fetch('/api/face-match', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64 })
        });
        const data = await res.json();
        
        if (data.match) {
          setStatus('success');
          setMessage(data.message || 'ចុះវត្តមានបានជោគជ័យ! / Check-in successful!');
        } else {
          setStatus('error');
          setMessage(data.message || 'បរាជ័យក្នុងការស្កេនទម្រង់មុខ / Face match failed');
        }
      } catch (err) {
        setStatus('error');
        setMessage('មានបញ្ហាបច្ចេកទេស / Technical error occurred');
      }
    }
  };

  const handleGpsCheckIn = () => {
    setStatus('scanning');
    setMessage('កំពុងស្វែងរកទីតាំង... / Fetching location...');
    
    if (!navigator.geolocation) {
      setStatus('error');
      setMessage('ឧបករណ៍កម្មវិធីរុករករបស់អ្នកមិនគាំទ្រទេ / Geolocation not supported');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        // In a real app we would check these coordinates against the Supabase geofence
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setStatus('success');
        setMessage(`ទីតាំងត្រូវបានកត់ត្រាជោគជ័យ! / Location recorded!`);
      },
      (error) => {
        setStatus('error');
        setMessage('មិនអាចទទួលបានទីតាំង / Cannot get location');
      }
    );
  };

  const simulateNfcOrQr = (type: 'nfc' | 'qr') => {
    setStatus('scanning');
    setMessage(`កំពុងរង់ចាំ${type.toUpperCase()}... / Waiting for ${type.toUpperCase()}...`);
    setTimeout(() => {
      setStatus('success');
      setMessage('ចុះវត្តមានបានជោគជ័យ! / Check-in successful!');
    }, 2000);
  };

  const renderContent = () => {
    switch (activeMethod) {
      case 'face':
        return (
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-full max-w-sm aspect-[3/4] bg-slate-900 rounded-2xl overflow-hidden shadow-inner ring-4 ring-slate-100 dark:ring-slate-800">
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted 
                className="absolute inset-0 w-full h-full object-cover mirror"
              />
              <canvas ref={canvasRef} className="hidden" />
              {status === 'scanning' && (
                <div className="absolute inset-0 bg-indigo-500/20 backdrop-blur-sm flex items-center justify-center">
                  <ScanFace className="w-16 h-16 text-white animate-pulse" />
                </div>
              )}
            </div>
            {status === 'idle' && (
              <button 
                onClick={() => { startCamera(); }}
                className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-full font-medium transition-colors"
              >
                បើកកាមេរ៉ា / Open Camera
              </button>
            )}
            {stream && status !== 'success' && (
              <button 
                onClick={handleFaceCheckIn}
                disabled={status === 'scanning'}
                className="px-8 py-3 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white rounded-full font-semibold shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-70 flex items-center gap-2"
              >
                {status === 'scanning' ? <Loader2 className="w-5 h-5 animate-spin"/> : <ScanFace className="w-5 h-5"/>}
                ស្កេនឥឡូវនេះ / Scan Now
              </button>
            )}
          </div>
        );
      case 'gps':
        return (
          <div className="flex flex-col items-center py-8">
            <div className="w-32 h-32 bg-indigo-50 rounded-full flex items-center justify-center mb-6 relative">
              {status === 'scanning' && (
                <span className="absolute inset-0 border-4 border-indigo-400 rounded-full animate-ping opacity-25"></span>
              )}
              <MapPin className={`w-12 h-12 text-indigo-500 ${status === 'scanning' ? 'animate-bounce' : ''}`} />
            </div>
            {status !== 'success' && (
              <button 
                onClick={handleGpsCheckIn}
                disabled={status === 'scanning'}
                className="px-8 py-3 bg-gradient-to-r from-indigo-500 to-violet-600 text-white rounded-full font-semibold shadow-lg transition-all flex items-center gap-2"
              >
                {status === 'scanning' ? <Loader2 className="w-5 h-5 animate-spin"/> : <MapPin className="w-5 h-5"/>}
                ចាប់យកទីតាំង / Get Location
              </button>
            )}
          </div>
        );
      case 'qr':
        return (
           <div className="flex flex-col items-center py-8">
            <div className="w-32 h-32 bg-violet-50 rounded-2xl flex items-center justify-center mb-6">
              <QrCode className="w-16 h-16 text-violet-500" />
            </div>
            {status !== 'success' && (
              <button 
                onClick={() => simulateNfcOrQr('qr')}
                disabled={status === 'scanning'}
                className="px-8 py-3 bg-gradient-to-r from-indigo-500 to-violet-600 text-white rounded-full font-semibold shadow-lg transition-all flex items-center gap-2"
              >
                {status === 'scanning' ? <Loader2 className="w-5 h-5 animate-spin"/> : <QrCode className="w-5 h-5"/>}
                ចាប់ផ្តើមស្កេន QR / Start QR
              </button>
            )}
          </div>
        );
      case 'nfc':
        return (
          <div className="flex flex-col items-center py-8">
            <div className="w-32 h-32 bg-blue-50 rounded-full flex items-center justify-center mb-6">
              <Nfc className="w-16 h-16 text-blue-500" />
            </div>
            <p className="text-sm text-slate-500 text-center mb-6 max-w-xs">
              ដាក់ទូរស័ព្ទរបស់អ្នកក្បែរឧបករណ៍អាន NFC<br/>Place your device near the NFC reader
            </p>
            {status !== 'success' && (
              <button 
                onClick={() => simulateNfcOrQr('nfc')}
                disabled={status === 'scanning'}
                className="px-8 py-3 bg-gradient-to-r from-indigo-500 to-violet-600 text-white rounded-full font-semibold shadow-lg transition-all flex items-center gap-2"
              >
                {status === 'scanning' ? <Loader2 className="w-5 h-5 animate-spin"/> : <Nfc className="w-5 h-5"/>}
                ចាប់ផ្តើមអាន NFC / Start NFC
              </button>
            )}
          </div>
        );
      default:
        return (
          <div className="flex flex-col items-center py-12 text-center text-slate-400">
            <p>សូមជ្រើសរើសវិធីសាស្រ្តខាងលើដើម្បីចុះវត្តមាន</p>
            <p className="text-sm mt-1">Please select a method above to check in</p>
          </div>
        );
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-6 sm:p-8 w-full max-w-2xl mx-auto border border-slate-100 overflow-hidden">
      
      {/* Header */}
      <div className="flex flex-col items-center text-center mb-8">
        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600 mb-2">
          កត់ត្រាវត្តមាន / Check In
        </h2>
        <p className="text-slate-500 text-sm">
          ជ្រើសរើសជម្រើសមួយ / Select an option
        </p>
      </div>

      {/* Method Selector */}
      <div className="grid grid-cols-4 gap-2 sm:gap-4 mb-8">
        {[
          { id: 'face', icon: ScanFace, label: 'Face AI', labelKm: 'ទម្រង់មុខ' },
          { id: 'gps', icon: MapPin, label: 'GPS', labelKm: 'ទីតាំង' },
          { id: 'qr', icon: QrCode, label: 'QR Code', labelKm: 'កូដ QR' },
          { id: 'nfc', icon: Nfc, label: 'NFC', labelKm: 'អិនអេហ្វស៊ី' },
        ].map((method) => {
          const isActive = activeMethod === method.id;
          const Icon = method.icon;
          return (
            <button
              key={method.id}
              onClick={() => {
                setActiveMethod(method.id as CheckInMethod);
                setStatus('idle');
                setMessage('');
              }}
              className={`flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl transition-all ${
                isActive 
                  ? 'bg-indigo-50 text-indigo-600 ring-2 ring-indigo-500 ring-inset shadow-sm' 
                  : 'bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-700'
              }`}
            >
              <Icon className={`w-6 h-6 sm:w-8 sm:h-8 mb-2 ${isActive ? 'text-indigo-600' : ''}`} />
              <span className="text-[10px] sm:text-xs font-semibold">{method.label}</span>
              <span className="text-[9px] sm:text-[10px] opacity-70 mt-0.5">{method.labelKm}</span>
            </button>
          );
        })}
      </div>

      {/* Main Content Area */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeMethod || 'empty'}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="min-h-[250px] flex flex-col items-center justify-center"
        >
          {renderContent()}
        </motion.div>
      </AnimatePresence>

      {/* Status Messages */}
      {message && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mt-6 p-4 rounded-xl flex items-center justify-center gap-3 text-center sm:text-left ${
            status === 'success' 
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
              : status === 'error'
              ? 'bg-red-50 text-red-700 border border-red-200'
              : 'bg-blue-50 text-blue-700 border border-blue-200'
          }`}
        >
          {status === 'success' && <CheckCircle2 className="w-5 h-5 shrink-0" />}
          {status === 'error' && <AlertCircle className="w-5 h-5 shrink-0" />}
          {status === 'scanning' && <Loader2 className="w-5 h-5 shrink-0 animate-spin" />}
          <p className="font-medium">{message}</p>
        </motion.div>
      )}

    </div>
  );
}
