import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Settings = () => {
  const [settings, setSettings] = useState({
    restaurantName: '',
    googleMapsUrl: '',
    instagramHandle: '',
    location: '',
    currency: 'INR',
    timezone: 'Asia/Kolkata'
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/settings');
      if (response.data.success) {
        setSettings({
          restaurantName: response.data.data.restaurantName || '',
          googleMapsUrl: response.data.data.googleMapsUrl || '',
          instagramHandle: response.data.data.instagramHandle || '',
          location: response.data.data.location || '',
          currency: response.data.data.currency || 'INR',
          timezone: response.data.data.timezone || 'Asia/Kolkata'
        });
      }
    } catch (error) {
      console.log('No existing settings found, using defaults');
    }
  };

  const handleChange = (e) => {
    setSettings({
      ...settings,
      [e.target.name]: e.target.value || ''
    });
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5001/api/settings', settings);
      if (response.data.success) {
        setMessage('Settings saved successfully!');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      setMessage('Error saving settings');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto font-body pb-20">
      {/* Header Section */}
      <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-4xl font-headline font-extrabold text-[#2b3437] tracking-tight">System Settings</h2>
          <p className="text-slate-500 mt-1">Configure your global restaurant ecosystem and intelligence parameters.</p>
        </div>
        <div className="flex gap-4">
          {message && (
             <div className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest ${message.includes('Error') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                {message}
             </div>
          )}
          <button 
            type="button"
            className="px-6 py-2.5 rounded-xl text-slate-400 font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all font-headline"
            onClick={loadSettings}
          >
            Discard
          </button>
          <button 
            type="button"
            disabled={loading}
            onClick={handleSubmit}
            className="px-8 py-2.5 rounded-xl bg-primary text-white font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95 font-headline disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-12 gap-8">
        
        {/* General Config - Large Card */}
        <section className="col-span-12 lg:col-span-8 bg-white rounded-3xl p-10 shadow-sm border border-slate-100">
           <div className="flex items-center gap-3 mb-10">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-2xl font-variation-settings-fill-1">storefront</span>
              </div>
              <h3 className="text-2xl font-headline font-black text-[#2b3437]">General Configuration</h3>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-300 font-headline">Restaurant Name</label>
                <input 
                  name="restaurantName"
                  value={settings.restaurantName}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 focus:ring-4 focus:ring-primary/5 transition-all font-bold text-[#2b3437] placeholder:text-slate-200" 
                  placeholder="SIKBO Grand Bistro"
                  type="text" 
                />
              </div>

              <div className="space-y-3">
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-300 font-headline">Operating Location</label>
                <input 
                  name="location"
                  value={settings.location}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 focus:ring-4 focus:ring-primary/5 transition-all font-bold text-[#2b3437] placeholder:text-slate-200" 
                  placeholder="Mumbai, India"
                  type="text" 
                />
              </div>

              <div className="space-y-3 col-span-1 md:col-span-2">
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-300 font-headline">Google Maps Intelligence URL</label>
                <input 
                  name="googleMapsUrl"
                  value={settings.googleMapsUrl}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 focus:ring-4 focus:ring-primary/5 transition-all font-bold text-[#2b3437] placeholder:text-slate-200" 
                  placeholder="https://maps.google.com/place/..."
                  type="url" 
                />
                <p className="text-[10px] text-slate-400 font-medium italic mt-2">Required for AI-powered sentiment analysis and review scraping.</p>
              </div>

              <div className="space-y-3">
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-300 font-headline">Instagram Handle</label>
                <div className="relative">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 font-bold">@</span>
                  <input 
                    name="instagramHandle"
                    value={settings.instagramHandle}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border-none rounded-2xl pl-12 pr-6 py-4 focus:ring-4 focus:ring-primary/5 transition-all font-bold text-[#2b3437] placeholder:text-slate-200" 
                    placeholder="your_handle"
                    type="text" 
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-300 font-headline">Global Currency</label>
                <select 
                  name="currency"
                  value={settings.currency}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 focus:ring-4 focus:ring-primary/5 transition-all font-bold text-[#2b3437] appearance-none"
                >
                  <option value="INR">INR (₹) - Indian Rupee</option>
                  <option value="USD">USD ($) - US Dollar</option>
                  <option value="EUR">EUR (€) - Euro</option>
                  <option value="GBP">GBP (£) - British Pound</option>
                </select>
              </div>
           </div>
        </section>

        {/* API Integration Section */}
        <section className="col-span-12 lg:col-span-4 bg-slate-50 rounded-[2rem] p-10 flex flex-col">
          <div className="flex items-center gap-3 mb-8">
             <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-primary shadow-sm">
                <span className="material-symbols-outlined text-xl font-variation-settings-fill-1">api</span>
             </div>
             <h3 className="text-xl font-headline font-black text-[#2b3437]">Live Integrations</h3>
          </div>
          
          <div className="space-y-4 flex-1">
             {[
               { name: 'Square POS', status: 'Connected', icon: 'point_of_sale', color: 'bg-emerald-50 text-emerald-600' },
               { name: 'UberEats API', status: 'Syncing', icon: 'delivery_dining', color: 'bg-blue-50 text-blue-600' }
             ].map((integration, i) => (
               <div key={i} className="flex items-center justify-between p-5 bg-white rounded-2xl border border-slate-100 shadow-sm transition-transform hover:scale-[1.02] cursor-pointer">
                  <div className="flex items-center gap-4">
                     <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${integration.color}`}>
                        <span className="material-symbols-outlined">{integration.icon}</span>
                     </div>
                     <div>
                        <p className="text-sm font-black text-[#2b3437] font-headline">{integration.name}</p>
                        <p className={`text-[10px] font-bold uppercase tracking-widest ${integration.status === 'Connected' ? 'text-emerald-500' : 'text-blue-500'}`}>{integration.status}</p>
                     </div>
                  </div>
                  <span className="material-symbols-outlined text-slate-200">chevron_right</span>
               </div>
             ))}
             
             <button className="w-full flex items-center justify-center gap-3 p-5 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 font-bold hover:bg-white hover:border-primary/20 hover:text-primary transition-all">
                <span className="material-symbols-outlined">add</span>
                <span className="text-xs uppercase tracking-widest">Connect New Service</span>
             </button>
          </div>
        </section>

        {/* Access Controls */}
        <section className="col-span-12 bg-white rounded-3xl p-10 shadow-sm border border-slate-100">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
             <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-primary">
                   <span className="material-symbols-outlined text-2xl font-variation-settings-fill-1">admin_panel_settings</span>
                </div>
                <div>
                   <h3 className="text-2xl font-headline font-black text-[#2b3437]">Team Access Controls</h3>
                   <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">3 Active Administrators</p>
                </div>
             </div>
             <button className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-primary/5 text-primary text-[10px] font-black uppercase tracking-[0.2em] hover:bg-primary/10 transition-colors font-headline">
                <span className="material-symbols-outlined text-lg">person_add</span>
                Invite New Member
             </button>
          </div>

          <div className="overflow-x-auto">
             <table className="w-full">
                <thead>
                   <tr className="text-left border-b border-slate-50 text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">
                      <th className="pb-6 px-4">Member Identity</th>
                      <th className="pb-6 px-4">System Role</th>
                      <th className="pb-6 px-4 text-right">Access Status</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                   {[
                     { name: 'Sarah Chen', email: 'sarah.c@sikbo.io', role: 'Operations Lead', status: 'Active' },
                     { name: 'Marcus Rivera', email: 'm.rivera@sikbo.io', role: 'Kitchen Manager', status: 'Active' },
                     { name: 'Elena Low', email: 'elena@sikbo.io', role: 'Analyst', status: 'Invite Sent' }
                   ].map((member, i) => (
                     <tr key={i} className="group hover:bg-slate-50 transition-colors">
                        <td className="py-6 px-4">
                           <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-400">
                                 {member.name[0]}
                              </div>
                              <div>
                                 <p className="text-sm font-black text-[#2b3437]">{member.name}</p>
                                 <p className="text-xs text-slate-400 font-medium">{member.email}</p>
                              </div>
                           </div>
                        </td>
                        <td className="py-6 px-4">
                           <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider ${member.role === 'Operations Lead' ? 'bg-primary/10 text-primary' : 'bg-slate-100 text-slate-500'}`}>
                              {member.role}
                           </span>
                        </td>
                        <td className="py-6 px-4 text-right">
                           <div className="flex items-center justify-end gap-2">
                              <span className={`w-2 h-2 rounded-full ${member.status === 'Active' ? 'bg-emerald-500 animate-pulse' : 'bg-orange-400'}`}></span>
                              <span className="text-xs font-bold text-[#2b3437]">{member.status}</span>
                           </div>
                        </td>
                     </tr>
                   ))}
                </tbody>
             </table>
          </div>
        </section>

        {/* Data Privacy Bar */}
        <section className="col-span-12 bg-slate-900 rounded-[2rem] p-8 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative">
           <div className="absolute right-0 top-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
           <div className="flex items-center gap-8 relative z-10">
              <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-white backdrop-blur-xl border border-white/10">
                 <span className="material-symbols-outlined text-2xl">security</span>
              </div>
              <div>
                 <h4 className="text-xl font-headline font-black text-white tracking-tight">Enterprise-Grade Security</h4>
                 <p className="text-slate-400 text-sm mt-1 max-w-xl">All telemetry data is encrypted using <span className="text-white font-bold">AES-256</span> standards. Compliant with restaurant data privacy protocol v4.0.</p>
              </div>
           </div>
           <button className="relative z-10 px-8 py-3 bg-white text-slate-900 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-100 transition-all font-headline">
              Audit Logs
           </button>
        </section>

      </div>
    </div>
  );
};

export default Settings;
