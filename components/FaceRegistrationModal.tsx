'use client';

import React, { useRef, useState, useEffect } from 'react';
import * as faceapi from '@vladmandic/face-api';
import { supabase } from '@/lib/supabase';
import { Camera, X, Loader2, CheckCircle2 } from 'lucide-react';

export function FaceRegistrationModal({ isOpen, onClose, userId, orgSlug = 'default' }: { isOpen: boolean, onClose: () => void, userId: string | null, orgSlug?: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [status, setStatus] = useState<'loading_models' | 'ready' | 'scanning' | 'success' | 'error'>('loading_models');
  const [message, setMessage] = useState('កំពុងទាញយកម៉ូដែល AI... / Loading AI models...');
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadModels();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [isOpen]);

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const loadModels = async () => {
    try {
      setStatus('loading_models');
      const MODEL_URL = '/models';
      await Promise.all([
        faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
      ]);
      setStatus('ready');
      setMessage('ម៉ូដែលរួចរាល់ សូមបើកកាមេរ៉ា / Models ready. Please start camera.');
    } catch (err) {
      console.error(err);
      setStatus('error');
      setMessage('បរាជ័យក្នុងការទាញយកម៉ូដែល / Failed to load models.');
    }
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setStatus('ready');
      setMessage('សូមដាក់មុខរបស់អ្នកអោយចំកាមេរ៉ា / Position your face inside the frame.');
    } catch (err) {
      setStatus('error');
      setMessage('មិនអាចបើកកាមេរ៉ាបានទេ / Cannot access camera');
    }
  };

  const handleRegisterFace = async () => {
    if (!videoRef.current) return;
    setStatus('scanning');
    setMessage('កំពុងស្កេន និងបង្កើតទិន្នន័យមុខ... / Processing face descriptor...');

    try {
      const detection = await faceapi.detectSingleFace(videoRef.current).withFaceLandmarks().withFaceDescriptor();
      
      if (!detection) {
        setStatus('error');
        setMessage('មិនអាចរកឃើញទម្រង់មុខទេ! / No face detected! Please try again.');
        return;
      }

      const descriptor = Array.from(detection.descriptor);

      // Save to localStorage
      const enrollments = JSON.parse(localStorage.getItem(`face_enrollments_${orgSlug}`) || '{}');
      if (userId) {
         enrollments[userId] = descriptor;
      }
      localStorage.setItem(`face_enrollments_${orgSlug}`, JSON.stringify(enrollments));

      // Attempt to save to Supabase via API route
      try {
        const response = await fetch('/api/face-match/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ employeeCode: userId, descriptor, orgSlug })
        });
        
        if (!response.ok) {
           console.warn('Failed to save to Supabase, but saved locally.');
        }
      } catch (err) {
        console.warn('API error saving to Supabase:', err);
      }

      setStatus('success');
      setMessage('ចុះឈ្មោះទម្រង់មុខជោគជ័យ! / Face successfully registered!');
      
      setTimeout(() => {
        onClose();
        setStatus('ready');
        setMessage('ត្រៀមអាន / Ready');
      }, 3000);

    } catch (err) {
      setStatus('error');
      setMessage('បរាជ័យដំណើរការ / Failed to process face');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h3 className="font-bold text-lg text-slate-800">ចុះឈ្មោះទម្រង់មុខ (Face Registration)</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 text-slate-500 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 flex flex-col items-center gap-6">
          <div className="w-full aspect-[3/4] max-h-[350px] bg-slate-900 rounded-2xl overflow-hidden relative shadow-inner ring-4 ring-slate-100">
            {stream ? (
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted 
                className="absolute inset-0 w-full h-full object-cover mirror"
              />
            ) : (
               <div className="absolute inset-0 flex items-center justify-center text-slate-600 flex-col gap-2">
                 <Camera className="w-12 h-12 opacity-50" />
                 <span className="text-sm">Camera Off</span>
               </div>
            )}

            {status === 'scanning' && (
              <div className="absolute inset-0 bg-indigo-500/20 backdrop-blur-sm flex items-center justify-center">
                <Loader2 className="w-16 h-16 text-white animate-spin" />
              </div>
            )}
            {status === 'success' && (
              <div className="absolute inset-0 bg-emerald-500/20 backdrop-blur-sm flex items-center justify-center">
                <CheckCircle2 className="w-16 h-16 text-white" />
              </div>
            )}
          </div>

          <p className="text-sm font-medium text-slate-600 text-center">{message}</p>

          <div className="flex w-full gap-3">
            {!stream ? (
              <button 
                onClick={startCamera}
                disabled={status === 'loading_models'}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-semibold transition-colors disabled:opacity-50"
              >
                បើកកាមេរ៉ា / Open Camera
              </button>
            ) : (
              <button 
                onClick={handleRegisterFace}
                disabled={status !== 'ready' && status !== 'error'}
                className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-colors disabled:opacity-50"
              >
                ចាប់យកទម្រង់មុខ / Capture Face
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
