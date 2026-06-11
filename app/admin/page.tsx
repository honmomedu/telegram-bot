'use client';

import React, { useState, useEffect } from 'react';
import { Users, QrCode, MessageSquare, Settings, Lock, Loader2, Plus, Edit2, Trash2, MapPin, FileText, CreditCard, Download, UserCheck } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { OfficeQRCodeWidget } from '@/components/OfficeQRCodeWidget';

import { ReportsTab } from '@/components/ReportsTab';
import { PayrollTab } from '@/components/PayrollTab';

type Tab = 'employees' | 'manual' | 'qr' | 'telegram' | 'system' | 'reports' | 'payroll';

export default function AdminPage() {
  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const initialOrg = searchParams ? (searchParams.get('org') || 'default') : 'default';
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<Tab>('employees');
  const [orgSlug, setOrgSlug] = useState(initialOrg);
  
  // Employees state
  const [employees, setEmployees] = useState<any[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  
  useEffect(() => {
    const auth = sessionStorage.getItem(`admin_auth_${orgSlug}`);
    if (auth === 'true') setIsAuthenticated(true);
  }, [orgSlug]);

// Admin name based on user request
  const adminName = 'ហុន ម៉ុម';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, orgSlug })
      });
      const data = await res.json();
      
      if (res.ok && data.success) {
        sessionStorage.setItem(`admin_auth_${orgSlug}`, 'true');
        setIsAuthenticated(true);
      } else {
        alert('ពាក្យសម្ងាត់មិនត្រឹមត្រូវ (Invalid password)');
      }
    } catch (err) {
      alert('មានបញ្ហាក្នុងការភ្ជាប់ទៅម៉ាស៊ីនមេ');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem(`admin_auth_${orgSlug}`);
    setIsAuthenticated(false);
  };

  const fetchEmployees = async () => {
    setLoadingEmployees(true);
    const { data } = await supabase.from('employees').select('*').eq('org_slug', orgSlug).order('created_at', { ascending: false });
    if (data) setEmployees(data);
    setLoadingEmployees(false);
  };

  useEffect(() => {
    if (isAuthenticated && activeTab === 'employees') {
      fetchEmployees();
    }
  }, [isAuthenticated, activeTab]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-6">
        <div className="w-full max-w-sm bg-white p-8 rounded-3xl shadow-xl border border-slate-100 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-600 mb-6 border border-slate-200 mx-auto">
             <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">សាលារៀន.org</h2>
          <p className="text-slate-500 mb-6">Admin: {adminName}</p>
          <form onSubmit={handleLogin} className="space-y-4">
             <input 
               type="password" 
               value={password}
               onChange={(e) => setPassword(e.target.value)}
               placeholder="Password..."
               className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
             />
             <button type="submit" className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-colors">
                ចូលប្រព័ន្ធ
             </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
       {/* Sidebar */}
       <div className="w-64 bg-slate-900 text-slate-300 flex-col hidden md:flex shrink-0 border-r border-slate-800">
          <div className="p-6 flex items-center gap-3">
             <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
               <Lock className="w-4 h-4 text-white" />
             </div>
             <span className="text-xl font-bold tracking-tight text-white">Admin ហុន ម៉ុម</span>
          </div>
          <nav className="flex-1 px-4 space-y-1 mt-4">
            <SidebarItem icon={Users} label="បុគ្គលិក (Employees)" active={activeTab === 'employees'} onClick={() => setActiveTab('employees')} />
            <SidebarItem icon={UserCheck} label="ចុះវត្តមាន (Manual)" active={activeTab === 'manual'} onClick={() => setActiveTab('manual')} />
            <SidebarItem icon={QrCode} label="Qr Code" active={activeTab === 'qr'} onClick={() => setActiveTab('qr')} />
            <SidebarItem icon={FileText} label="របាយការណ៍ (Reports)" active={activeTab === 'reports'} onClick={() => setActiveTab('reports')} />
            <SidebarItem icon={CreditCard} label="បើកប្រាក់ខែ (Payroll)" active={activeTab === 'payroll'} onClick={() => setActiveTab('payroll')} />
            <SidebarItem icon={MessageSquare} label="Telegram Bot" active={activeTab === 'telegram'} onClick={() => setActiveTab('telegram')} />
            <SidebarItem icon={Settings} label="ប្រព័ន្ធ (System)" active={activeTab === 'system'} onClick={() => setActiveTab('system')} />
          </nav>
          <div className="p-4">
            <button onClick={handleLogout} className="w-full py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
              ចាកចេញ (Logout)
            </button>
          </div>
       </div>

       {/* Main Content */}
       <div className="flex-1 flex flex-col min-w-0">
          <header className="h-16 bg-white border-b border-slate-200 flex items-center px-6">
             <h2 className="text-lg font-semibold text-slate-800 capitalize">{activeTab} Management</h2>
          </header>
          
          <main className="flex-1 overflow-y-auto p-6 md:p-8">
             {activeTab === 'employees' && (
               <EmployeesTab employees={employees} loading={loadingEmployees} reload={fetchEmployees} orgSlug={orgSlug} />
             )}
             {activeTab === 'manual' && (
               <ManualTab employees={employees} orgSlug={orgSlug} />
             )}
             {activeTab === 'reports' && (
               <ReportsTab employees={employees} orgSlug={orgSlug} />
             )}
             {activeTab === 'payroll' && (
               <PayrollTab employees={employees} orgSlug={orgSlug} />
             )}
             {activeTab === 'qr' && (
               <div className="max-w-md">
                 <OfficeQRCodeWidget orgSlug={orgSlug} />
               </div>
             )}
             {activeTab === 'telegram' && (
               <TelegramTab />
             )}
             {activeTab === 'system' && (
               <SystemTab orgSlug={orgSlug} />
             )}
          </main>
       </div>
    </div>
  );
}

function SidebarItem({ icon: Icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) {
  return (
    <div 
      onClick={onClick}
      className={`px-4 py-3 rounded-xl flex items-center gap-3 cursor-pointer transition-colors ${active ? 'bg-indigo-600 text-white font-medium' : 'hover:bg-slate-800 hover:text-white'}`}
    >
       <Icon className="w-5 h-5" />
       <span className="text-sm">{label}</span>
    </div>
  );
}

// ---------------- Employees Tab ----------------
function EmployeesTab({ employees, loading, reload, orgSlug }: { employees: any[], loading: boolean, reload: () => void, orgSlug: string }) {
  const [empCode, setEmpCode] = useState('');
  const [name, setName] = useState('');
  const [adding, setAdding] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);
    await supabase.from('employees').insert({ org_slug: orgSlug, employee_code: empCode, name });
    setAdding(false);
    setEmpCode('');
    setName('');
    reload();
  };

  const handleDelete = async (id: string) => {
    if (confirm('តើអ្នកប្រាកដជាចង់លុបមែនទេ?')) {
       await supabase.from('employees').delete().eq('id', id);
       reload();
    }
  };

  return (
    <div className="space-y-6">
       <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
         <h3 className="font-bold text-lg mb-4 text-slate-800">បន្ថែមបុគ្គលិកថ្មី (Add Employee)</h3>
         <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-4">
            <input type="text" placeholder="Employee Code (ex: EMP-001)" required value={empCode} onChange={(e)=>setEmpCode(e.target.value)} className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500" />
            <input type="text" placeholder="Full Name" required value={name} onChange={(e)=>setName(e.target.value)} className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500" />
            <button type="submit" disabled={adding} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg font-bold flex items-center justify-center gap-2">
              {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} បន្ថែម
            </button>
         </form>
       </div>

       <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
         <table className="w-full text-left">
           <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
             <tr>
               <th className="px-6 py-4 font-bold">Code</th>
               <th className="px-6 py-4 font-bold">Name</th>
               <th className="px-6 py-4 font-bold">Telegram ID</th>
               <th className="px-6 py-4 font-bold">NFC Card ID</th>
               <th className="px-6 py-4 font-bold text-right">Actions</th>
             </tr>
           </thead>
           <tbody className="divide-y divide-slate-100">
             {loading ? (
               <tr><td colSpan={5} className="p-8 text-center text-slate-500">កំពុងផ្ទុក...</td></tr>
             ) : employees.map((emp) => (
               <tr key={emp.id} className="hover:bg-slate-50">
                 <td className="px-6 py-4 font-medium text-slate-800">{emp.employee_code}</td>
                 <td className="px-6 py-4 text-slate-600">{emp.name}</td>
                 <td className="px-6 py-4 text-slate-500 font-mono text-sm">{emp.telegram_id || 'Not linked'}</td>
                 <td className="px-6 py-4 text-slate-500 font-mono text-sm">
                   {emp.nfc_card_id || 'None'}
                   <button 
                     onClick={async () => {
                       const newCard = prompt('Enter NFC Card ID:', emp.nfc_card_id || '');
                       if (newCard !== null) {
                         await supabase.from('employees').update({ nfc_card_id: newCard }).eq('id', emp.id);
                         reload();
                       }
                     }}
                     className="ml-2 text-indigo-500 hover:text-indigo-700 underline text-xs"
                   >
                     Edit
                   </button>
                 </td>
                 <td className="px-6 py-4 flex justify-end gap-2">
                    <button onClick={() => handleDelete(emp.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                 </td>
               </tr>
             ))}
             {!loading && employees.length === 0 && (
                <tr><td colSpan={5} className="p-8 text-center text-slate-500">គ្មានទិន្នន័យ</td></tr>
             )}
           </tbody>
         </table>
       </div>
    </div>
  );
}

// ---------------- Telegram Tab ----------------
function TelegramTab() {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 max-w-2xl">
      <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
         <MessageSquare className="w-6 h-6 text-blue-500" /> ការកំណត់ Telegram Bot
      </h3>
      <p className="text-slate-600 mb-6 leading-relaxed">
         The bot webhook is configured at <code className="bg-slate-100 px-2 py-1 rounded text-slate-800 text-sm">/api/bot</code>. 
         Employees can search for your bot on Telegram, hit START to launch the Mini App, or send <code className="bg-slate-100 px-2 py-1 rounded text-slate-800 text-sm">/link EMP-xxx</code> to bind their account manually.
      </p>
      
      <div className="space-y-4">
         <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
            <h4 className="font-bold text-blue-900 mb-1">Bot Token</h4>
            <p className="text-sm font-mono text-blue-700">{process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN ? 'Loaded (Hidden)' : 'Not Set in Client Env'}</p>
         </div>
      </div>
    </div>
  );
}

// ---------------- System Tab (Location configuration) ----------------
function SystemTab({ orgSlug }: { orgSlug: string }) {
  const [lat, setLat] = useState('11.5564');
  const [lng, setLng] = useState('104.9282');
  const [radius, setRadius] = useState('50');

  useEffect(() => {
    supabase.from('organizations').select('settings').eq('slug', orgSlug).single().then(({ data }) => {
      if (data?.settings) {
        if (data.settings.geofence_lat) setLat(data.settings.geofence_lat.toString());
        if (data.settings.geofence_lng) setLng(data.settings.geofence_lng.toString());
        if (data.settings.geofence_radius) setRadius(data.settings.geofence_radius.toString());
      }
    });
  }, [orgSlug]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: orgData } = await supabase.from('organizations').select('settings').eq('slug', orgSlug).single();
    const settings = orgData?.settings || {};
    settings.geofence_lat = parseFloat(lat);
    settings.geofence_lng = parseFloat(lng);
    settings.geofence_radius = parseFloat(radius);
    
    await supabase.from('organizations').update({ settings }).eq('slug', orgSlug);
    alert('រក្សាទុករួចរាល់ (Saved)');
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLat(pos.coords.latitude.toString());
          setLng(pos.coords.longitude.toString());
        },
        (err) => alert('Error getting location: ' + err.message)
      );
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 max-w-2xl">
      <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
         <Settings className="w-6 h-6 text-slate-600" /> ការកំណត់ប្រព័ន្ធ (System Settings)
      </h3>
      
      <form onSubmit={handleSave} className="space-y-6">
         <div className="space-y-4">
           <h4 className="font-semibold text-slate-700 border-b border-slate-100 pb-2">ទីតាំងការិយាល័យ (Office Location)</h4>
           
           <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">រយៈទទឹង (Latitude)</label>
                <input type="text" value={lat} onChange={(e)=>setLat(e.target.value)} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500" />
             </div>
             <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">រយៈបណ្តោយ (Longitude)</label>
                <input type="text" value={lng} onChange={(e)=>setLng(e.target.value)} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500" />
             </div>
           </div>
           
           <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">កាំអនុញ្ញាតជាម៉ែត្រ (Radius in meters)</label>
              <input type="number" value={radius} onChange={(e)=>setRadius(e.target.value)} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500" />
           </div>

           <div className="flex gap-4">
              <button type="button" onClick={getCurrentLocation} className="flex-1 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-xl font-bold transition-colors flex items-center justify-center gap-2">
                 <MapPin className="w-4 h-4" /> យកទីតាំងបច្ចុប្បន្ន (Current GPS)
              </button>
           </div>
         </div>

         <div className="pt-6 border-t border-slate-100 flex justify-end">
            <button type="submit" className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-colors shadow-md">
               រក្សាទុក (Save Settings)
            </button>
         </div>
      </form>
    </div>
  );
}

// ---------------- Manual Attendance Tab ----------------
function ManualTab({ employees, orgSlug }: { employees: any[], orgSlug: string }) {
  const [empCode, setEmpCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleManualAction = async (actionType: 'in' | 'out') => {
    if (!empCode) return alert('No employee selected');
    setLoading(true);
    try {
      const res = await fetch('/api/attendance/manual', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ employeeCode: empCode, orgSlug, action: actionType })
      });
      const data = await res.json();
      if (res.ok && data.success) {
         alert(`Manual Check ${actionType.toUpperCase()} successful for ${data.name}`);
         setEmpCode('');
      } else {
         alert('Error: ' + (data.error || 'Failed manually checking in/out'));
      }
    } catch (e: any) {
      alert('Network error manually checking in/out');
    }
    setLoading(false);
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 max-w-2xl">
       <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          <UserCheck className="w-6 h-6 text-slate-600" /> ចុះវត្តមានដោយផ្ទាល់ (Manual Entry)
       </h3>
       
       <div className="space-y-6">
          <div>
            <label className="text-sm font-bold text-slate-500 mb-2 block">ជ្រើសរើសបុគ្គលិក (Select Employee)</label>
            <select 
               value={empCode} 
               onChange={e => setEmpCode(e.target.value)}
               className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
            >
               <option value="">-- សូមជ្រើសរើស (Select) --</option>
               {employees.map(emp => (
                 <option key={emp.employee_code} value={emp.employee_code}>
                    {emp.name} ({emp.employee_code})
                 </option>
               ))}
            </select>
          </div>

          <div className="flex gap-4 pt-4 border-t border-slate-100">
             <button 
               onClick={() => handleManualAction('in')}
               disabled={!empCode || loading}
               className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl font-bold transition-colors shadow-md"
             >
                {loading ? 'Processing...' : 'ចូល (CHECK IN)'}
             </button>
             <button 
               onClick={() => handleManualAction('out')}
               disabled={!empCode || loading}
               className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-xl font-bold transition-colors shadow-md"
             >
                {loading ? 'Processing...' : 'ចេញ (CHECK OUT)'}
             </button>
          </div>
       </div>
    </div>
  );
}
