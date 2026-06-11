'use client';

import React, { useState, useEffect } from 'react';
import { Settings, Lock, Loader2, Plus, Edit2, Copy, Building2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function OwnerPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [orgs, setOrgs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Form states
  const [slug, setSlug] = useState('');
  const [name, setName] = useState('');
  const [adminPassword, setAdminPassword] = useState('admin123');

  useEffect(() => {
    const auth = sessionStorage.getItem('owner_auth');
    if (auth === 'true') setIsAuthenticated(true);
  }, []);

  useEffect(() => {
    if (isAuthenticated) fetchOrgs();
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === (process.env.NEXT_PUBLIC_OWNER_PASSWORD || 'owner123')) {
      sessionStorage.setItem('owner_auth', 'true');
      setIsAuthenticated(true);
    } else {
      alert('ពាក្យសម្ងាត់មិនត្រឹមត្រូវ (Invalid password)');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('owner_auth');
    setIsAuthenticated(false);
  };

  const fetchOrgs = async () => {
    setLoading(true);
    const { data } = await supabase.from('organizations').select('*').order('created_at', { ascending: false });
    if (data) setOrgs(data);
    setLoading(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from('organizations').insert({ slug, name, admin_password: adminPassword });
    if (error) {
      alert('Error creating org: ' + error.message);
    } else {
      setSlug('');
      setName('');
      setAdminPassword('admin123');
      fetchOrgs();
    }
    setLoading(false);
  };

  const toggleMethod = async (slug: string, currentMethods: any, method: string) => {
    const newMethods = { ...currentMethods, [method]: !currentMethods[method] };
    await supabase.from('organizations').update({ attendance_methods: newMethods }).eq('slug', slug);
    fetchOrgs();
  };

  const copyLink = (path: string) => {
    const url = `${window.location.origin}${path}`;
    navigator.clipboard.writeText(url);
    alert('Copied: ' + url);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-6">
        <div className="w-full max-w-sm bg-white p-8 rounded-3xl shadow-xl border border-slate-100 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-600 mb-6 border border-slate-200 mx-auto">
             <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-6">Owner Login</h2>
          <form onSubmit={handleLogin} className="space-y-4">
             <input 
               type="password" 
               value={password}
               onChange={(e) => setPassword(e.target.value)}
               placeholder="Owner Password..."
               className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
             />
             <button type="submit" className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-colors">
                ចូលប្រព័ន្ធ (Login)
             </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12">
       <div className="max-w-5xl mx-auto flex flex-col gap-8">
          <header className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center text-red-600">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-800">Super Admin / Owner</h1>
                  <p className="text-slate-500 text-sm">គ្រប់គ្រងស្ថាប័នទាំងអស់ (Manage Organizations)</p>
                </div>
             </div>
             <button onClick={handleLogout} className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">
               ចាកចេញ (Logout)
             </button>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
             <div className="md:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="font-bold text-lg mb-4 text-slate-800">បង្កើតស្ថាប័នថ្មី</h3>
                <form onSubmit={handleCreate} className="space-y-4">
                   <div>
                     <label className="text-xs font-bold text-slate-500 mb-1 block">Slug (URL)</label>
                     <input type="text" placeholder="e.g. acme-corp" required value={slug} onChange={(e)=>setSlug(e.target.value)} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500" />
                   </div>
                   <div>
                     <label className="text-xs font-bold text-slate-500 mb-1 block">ឈ្មោះស្ថាប័ន (Name)</label>
                     <input type="text" placeholder="Acme Corporation" required value={name} onChange={(e)=>setName(e.target.value)} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500" />
                   </div>
                   <div>
                     <label className="text-xs font-bold text-slate-500 mb-1 block">Admin Password</label>
                     <input type="text" required value={adminPassword} onChange={(e)=>setAdminPassword(e.target.value)} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500" />
                   </div>
                   <button type="submit" disabled={loading} className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg font-bold flex items-center justify-center gap-2 mt-4">
                     {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} បង្កើត (Create)
                   </button>
                </form>
             </div>

             <div className="md:col-span-2 space-y-4">
               {loading && orgs.length === 0 ? (
                 <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 text-indigo-500 animate-spin" /></div>
               ) : orgs.map(org => (
                 <div key={org.slug} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col gap-4">
                    <div className="flex justify-between items-start">
                       <div>
                         <h3 className="text-xl font-bold text-slate-800">{org.name}</h3>
                         <div className="font-mono text-xs text-indigo-600 bg-indigo-50 px-2 py-1 rounded inline-block mt-1">slug: {org.slug}</div>
                       </div>
                       <div className="flex gap-2">
                         <button onClick={() => copyLink(`/employee?org=${org.slug}`)} className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 rounded-lg hover:bg-emerald-100">
                           <Copy className="w-3 h-3" /> App Link
                         </button>
                         <button onClick={() => copyLink(`/admin?org=${org.slug}`)} className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100">
                           <Copy className="w-3 h-3" /> Admin Link
                         </button>
                       </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm mt-2">
                       <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                         <span className="text-slate-500 block mb-1">Admin Password:</span>
                         <span className="font-mono font-medium text-slate-700">{org.admin_password}</span>
                       </div>
                       <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex flex-col gap-2">
                         <span className="text-slate-500 block">Attendance Methods:</span>
                         <div className="flex flex-wrap gap-2">
                           {['gps', 'qr', 'face'].map(method => {
                             const methods = org.attendance_methods || {};
                             const isActive = methods[method];
                             return (
                               <button 
                                 key={method} 
                                 onClick={() => toggleMethod(org.slug, methods, method)}
                                 className={`px-2 py-1 text-xs rounded font-medium border ${isActive ? 'bg-indigo-100 text-indigo-700 border-indigo-200' : 'bg-slate-100 text-slate-400 border-slate-200'}`}
                               >
                                 {method.toUpperCase()}
                               </button>
                             );
                           })}
                         </div>
                       </div>
                    </div>
                 </div>
               ))}
               
               {!loading && orgs.length === 0 && (
                 <div className="text-center p-12 bg-white rounded-2xl shadow-sm border border-slate-200 text-slate-500">
                   មិនមានស្ថាប័នទេ (No organizations found)
                 </div>
               )}
             </div>
          </div>
       </div>
    </div>
  );
}
