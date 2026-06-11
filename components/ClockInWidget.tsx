'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ScanFace, MapPin, QrCode, Nfc, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import * as faceapi from '@vladmandic/face-api';

import { Scanner } from '@yudiel/react-qr-scanner';

type CheckInMethod = 'gps' | 'face' | 'qr' | 'nfc';

export function ClockInWidget({ employeeCode = 'user-1234-5678', orgSlug = 'default' }: { employeeCode?: string, orgSlug?: string }) {
  const [activeMethod, setActiveMethod] = useState<CheckInMethod | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading_models' | 'scanning' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [availableMethods, setAvailableMethods] = useState<any>({ gps: true, face: true, qr: true, manual: true });

  useEffect(() => {
    // Ideally fetch availableMethods from organization
    // For now we'll do a simple quick fetch
    fetch(`/api/org/methods?slug=${orgSlug}`).then(res => res.json()).then(data => {
      if (data.methods) setAvailableMethods(data.methods);
    }).catch(() => {});
  }, [orgSlug]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeMethod]);

  const loadModelsAndStartCamera = async () => {
    try {
      setStatus('loading_models');
      setMessage('កំពុងទាញយកម៉ូដែលមុខ... / Loading face models...');
      const MODEL_URL = '/models';
      await Promise.all([
        faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
      ]);
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setStatus('idle');
      setMessage('ម៉ូដែលរួចរាល់ សូមដាក់ផ្ទៃមុខអោយចំកាមេរ៉ា / Ready. Position face.');
    } catch (err) {
      console.error(err);
      setStatus('error');
      setMessage('មិនអាចបើកកាមេរ៉ា ឬម៉ូដែលបានទេ / Cannot access camera or models');
    }
  };

  // Cosine distance / Euclidean distance manually done on client as fallback before sending to server
  const handleFaceCheckIn = async () => {
    setStatus('scanning');
    setMessage('កំពុងស្កេនទម្រង់មុខ... / Scanning face...');
    
    if (!videoRef.current) return;
    
    try {
      const detection = await faceapi.detectSingleFace(videoRef.current).withFaceLandmarks().withFaceDescriptor();
      if (!detection) {
        setStatus('error');
        setMessage('រកមិនឃើញមុខ! / No face detected.');
        return;
      }

      const descriptorArray = Array.from(detection.descriptor);
      
      // Auto-match against ALL enrolled employees (we normally do this on sever, but simulating fully here to ensure it works)
      const res = await fetch('/api/face-match/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          descriptor: descriptorArray, 
          orgSlug,
          fallbackEnrollments: localStorage.getItem(`face_enrollments_${orgSlug}`) 
        })
      });
      
      const data = await res.json();
      
      if (data.match) {
        setStatus('success');
        setMessage(data.message || `ចុះវត្តមានជោគជ័យ / Check-in OK`);
      } else {
        setStatus('error');
        setMessage(data.message || 'បរាជ័យក្នុងការផ្ទៀងផ្ទាត់ / Unrecognized face');
      }
    } catch (err) {
      console.error(err);
      setStatus('error');
      setMessage('មានបញ្ហាបច្ចេកទេស / Technical error occurred');
    }
  };

  const renderContent = () => {
    switch (activeMethod) {
      case 'face':
        return (
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-full max-w-sm aspect-[3/4] bg-slate-900 rounded-2xl overflow-hidden shadow-inner ring-4 ring-slate-100">
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted 
                className="absolute inset-0 w-full h-full object-cover mirror"
              />
              {status === 'scanning' && (
                <div className="absolute inset-0 bg-indigo-500/20 backdrop-blur-sm flex items-center justify-center">
                  <ScanFace className="w-16 h-16 text-white animate-pulse" />
                </div>
              )}
            </div>
            {status === 'idle' && !stream && (
              <button 
                onClick={loadModelsAndStartCamera}
                className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-full font-medium transition-colors"
               >
                បើកកាមេរ៉ា / Open Camera
              </button>
            )}
            {stream && status !== 'success' && (
              <button 
                onClick={handleFaceCheckIn}
                disabled={status === 'scanning' || status === 'loading_models'}
                className="px-8 py-3 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white rounded-full font-semibold outline-none flex gap-2"
              >
                {status === 'scanning' ? <Loader2 className="w-5 h-5 animate-spin"/> : <ScanFace className="w-5 h-5"/>}
                ស្កេនឥឡូវនេះ / Scan Now
              </button>
            )}
          </div>
        );
      case 'gps':
        return (
          <div className="flex flex-col items-center py-12 text-center text-slate-500">
            <MapPin className="w-12 h-12 mb-4 text-slate-300" />
            <p className="mb-4">កំពុងផ្ទៀងផ្ទាត់ទីតាំងរបស់អ្នកជាមួយការិយាល័យ...</p>
            <button 
               onClick={() => {
                 setStatus('scanning');
                 setMessage('កំពុងស្វែងរកទីតាំងGPS... / Getting GPS...');
                 if (navigator.geolocation) {
                   navigator.geolocation.getCurrentPosition(
                     (position) => {
                       const { latitude, longitude } = position.coords;
                       const officeLat = parseFloat(localStorage.getItem('office_lat') || '11.5564');
                       const officeLng = parseFloat(localStorage.getItem('office_lng') || '104.9282');
                       const officeRadius = parseFloat(localStorage.getItem('office_radius') || '50');

                       const R = 6371e3; // metres
                       const p1 = latitude * Math.PI/180;
                       const p2 = officeLat * Math.PI/180;
                       const dp = (officeLat-latitude) * Math.PI/180;
                       const dl = (officeLng-longitude) * Math.PI/180;

                       const a = Math.sin(dp/2) * Math.sin(dp/2) + Math.cos(p1) * Math.cos(p2) * Math.sin(dl/2) * Math.sin(dl/2);
                       const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
                       const d = R * c;

                       if (d <= officeRadius) {
                         // Send to backend via QR verify route simulating a GPS check in for now
                         fetch('/api/office-qr/verify', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ secret: 'OFFICE_QR_GPS', employeeCode, orgSlug })
                         }).then(res => res.json()).then(data => {
                            if (data.success) {
                               setStatus('success');
                               setMessage(`ចុះវត្តមានជោគជ័យ (ចំងាយ ${Math.round(d)}m)`);
                            } else {
                               setStatus('error');
                               setMessage('មិនអាចកត់ត្រាវត្តមានបានទេ');
                            }
                         });
                       } else {
                         setStatus('error');
                         setMessage(`អ្នកនៅក្រៅការិយាល័យ (ចំងាយ ${Math.round(d)}m > ${Math.round(officeRadius)}m)`);
                       }
                     },
                     () => {
                       setStatus('error');
                       setMessage('មិនអាចទាញយកទីតាំងបានទេ (GPS access denied)');
                     }
                   );
                 } else {
                   setStatus('error');
                   setMessage('កម្មវិធីរុករកមិនគាំទ្រ GPS ទេ (GPS not supported)');
                 }
               }}
               className="px-6 py-2.5 bg-blue-50 text-blue-700 font-bold rounded-xl border border-blue-200 hover:bg-blue-100 transition-colors"
            >
              ផ្ទៀងផ្ទាត់ GPS (Verify GPS)
            </button>
          </div>
        );
      case 'qr':
         return (
          <div className="flex flex-col items-center gap-4 w-full">
            <div className="relative w-full max-w-sm aspect-square bg-slate-900 rounded-3xl overflow-hidden shadow-inner ring-4 ring-slate-100 p-2">
              <Scanner 
                  onScan={(detected) => {
                     if (detected && detected.length > 0) {
                        try {
                           const payload = JSON.parse(detected[0].rawValue);
                           if (payload.type === 'CHECK_IN_OFFICE') {
                             setStatus('success');
                             setMessage('ស្កេនជោគជ័យ - កំពុងបញ្ជូនទិន្នន័យ... / Scanned OK');
                             // Send to backend
                             fetch('/api/office-qr/verify', {
                               method: 'POST',
                               headers: { 'Content-Type': 'application/json' },
                               body: JSON.stringify({ secret: payload.secret, employeeCode, orgSlug: payload.orgSlug || orgSlug })
                             }).then(res => res.json()).then(data => {
                               if (data.success) {
                                  setMessage('ចុះវត្តមានជោគជ័យ / Confirmed!');
                               } else {
                                  setStatus('error');
                                  setMessage('កូដមិនត្រឹមត្រូវ / Invalid QR');
                               }
                             });
                           }
                        } catch (e) {
                           setStatus('error');
                           setMessage('កូដមិនត្រឹមត្រូវ / Invalid format');
                        }
                     }
                  }}
                  onError={(err) => console.log(err)}
               />
               {status === 'success' && (
                 <div className="absolute inset-0 bg-emerald-500/20 backdrop-blur-sm flex items-center justify-center">
                   <QrCode className="w-16 h-16 text-white animate-pulse" />
                 </div>
               )}
            </div>
            <p className="text-sm text-slate-500 mt-2 font-medium">សូមស្កេនកូដ QR របស់ការិយាល័យ</p>
          </div>
         );
      default:
         return (
          <div className="flex flex-col items-center py-12 text-center text-slate-400">
            <p>សូមជ្រើសរើសវិធីសាស្រ្តខាងលើដើម្បីចុះវត្តមាន</p>
          </div>
         );
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-6 sm:p-8 w-full border border-slate-100">
      <div className="grid grid-cols-4 gap-2 mb-8">
        {[
          { id: 'face', icon: ScanFace, label: 'Face AI', labelKm: 'ទម្រង់មុខ' },
          { id: 'gps', icon: MapPin, label: 'GPS', labelKm: 'ទីតាំង' },
          { id: 'qr', icon: QrCode, label: 'QR Code', labelKm: 'កូដ QR' },
          { id: 'nfc', icon: Nfc, label: 'NFC', labelKm: 'អិនអេហ្វស៊ី' },
        ].filter(method => !!availableMethods[method.id]).map((method) => {
          const isActive = activeMethod === method.id;
          const Icon = method.icon;
          return (
            <button
              key={method.id}
              onClick={() => { setActiveMethod(method.id as CheckInMethod); setStatus('idle'); setMessage(''); }}
              className={`flex flex-col items-center justify-center p-3 rounded-2xl ${
                isActive ? 'bg-indigo-50 text-indigo-600 ring-2 ring-indigo-500 ring-inset shadow-sm' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-6 h-6 mb-2" />
              <span className="text-[10px] sm:text-xs font-semibold">{method.label}</span>
            </button>
          );
        })}
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={activeMethod || 'empty'} className="min-h-[250px] flex flex-col items-center justify-center">
          {renderContent()}
        </motion.div>
      </AnimatePresence>
      {message && (
        <div className={`mt-6 p-4 rounded-xl flex items-center justify-center gap-3 text-center sm:text-left ${
            status === 'success' ? 'bg-emerald-50 text-emerald-700' : status === 'error' ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'
          }`}>
          <p className="font-medium">{message}</p>
        </div>
      )}
    </div>
  );
}
