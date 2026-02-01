import React, { useState, useEffect } from 'react';
import { X, Calendar as CalendarIcon, Search, Globe, RefreshCw, Plus } from 'lucide-react';
import { Subscription, BillingCycle } from '../types';
import { GoogleGenAI } from "@google/genai";

interface Props {
  onSubmit: (sub: Subscription) => void;
  onClose: () => void;
  initialData?: Subscription;
  categories: string[];
  customCategories: string[];
  onAddCategory: (newCat: string) => void;
  onDeleteCategory: (catToDelete: string) => void;
}

const COLORS = ['#4F46E5', '#EF4444', '#10B981', '#F59E0B', '#6366F1', '#EC4899', '#8B5CF6', '#1DB954', '#FF0000'];
const CYCLES: BillingCycle[] = ['Weekly', 'Monthly', 'Quarterly', 'Yearly', 'One-time'];

const POPULAR_SERVICES = [
  { name: 'Netflix', color: '#E50914', category: 'Entertainment', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/ff/Netflix-new-icon.png', price: '199', cycle: 'Monthly' },
  { name: 'Spotify', color: '#1DB954', category: 'Entertainment', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/19/Spotify_logo_without_text.svg', price: '119', cycle: 'Monthly' },
  { name: 'Amazon Prime', color: '#00A8E1', category: 'Lifestyle', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/11/Amazon_Prime_Video_logo.svg', price: '1499', cycle: 'Yearly' },
  { name: 'Disney+ Hotstar', color: '#001424', category: 'Entertainment', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/3e/Disney%2B_Hotstar_logo.svg', price: '299', cycle: 'Monthly' }
];

const SubscriptionForm: React.FC<Props> = ({ 
  onSubmit, 
  onClose, 
  initialData, 
  categories,
  customCategories,
  onAddCategory,
  onDeleteCategory
}) => {
  const [name, setName] = useState(initialData?.name || '');
  const [price, setPrice] = useState(initialData?.price.toString() || '');
  const [billingCycle, setBillingCycle] = useState<BillingCycle>(initialData?.billingCycle || 'Monthly');
  const [startDate, setStartDate] = useState(initialData?.startDate ? new Date(initialData.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(initialData?.endDate ? new Date(initialData.endDate).toISOString().split('T')[0] : '');
  const [category, setCategory] = useState<string>(initialData?.category || 'Entertainment');
  const [color, setColor] = useState(initialData?.color || COLORS[0]);
  const [logoUrl, setLogoUrl] = useState<string | undefined>(initialData?.logoUrl);
  const [isSearchingLogo, setIsSearchingLogo] = useState(false);

  useEffect(() => {
    if (!startDate || !billingCycle || initialData) return;
    const start = new Date(startDate);
    const next = new Date(start);
    switch(billingCycle) {
      case 'Weekly': next.setDate(next.getDate() + 7); break;
      case 'Monthly': next.setMonth(next.getMonth() + 1); break;
      case 'Quarterly': next.setMonth(next.getMonth() + 3); break;
      case 'Yearly': next.setFullYear(next.getFullYear() + 1); break;
      case 'One-time': break;
    }
    if (billingCycle !== 'One-time') setEndDate(next.toISOString().split('T')[0]);
  }, [startDate, billingCycle, initialData]);

  const handleSearchLogo = async () => {
    if (!name.trim()) return;
    setIsSearchingLogo(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Find the official high-resolution transparent PNG logo URL for: ${name}. Only return the direct URL.`,
      });
      const url = response.text?.trim();
      if (url && url.startsWith('http')) setLogoUrl(url);
    } catch (e) { 
      console.error('Gemini logo search failed:', e); 
    } finally { 
      setIsSearchingLogo(false); 
    }
  };

  const selectPopular = (s: any) => {
    setName(s.name);
    setColor(s.color);
    setCategory(s.category);
    setPrice(s.price);
    setLogoUrl(s.logoUrl);
    setBillingCycle(s.cycle as BillingCycle);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price) return;
    onSubmit({
      id: initialData?.id || Math.random().toString(36).substr(2, 9),
      name,
      price: parseFloat(price),
      currency: 'INR',
      renewalDate: endDate || startDate,
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate || startDate).toISOString(),
      billingCycle,
      reminderDays: initialData?.reminderDays || 1,
      category,
      color,
      logoUrl,
      isArchived: initialData?.isArchived,
    });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 bg-slate-900/60 backdrop-blur-md transition-all">
      <div className="w-full max-w-lg bg-white rounded-t-[40px] sm:rounded-[40px] shadow-2xl animate-in slide-in-from-bottom duration-300 max-h-[95vh] flex flex-col relative">
        <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mt-4 mb-2 flex-shrink-0" />
        
        <div className="flex items-center justify-between px-8 py-4 border-b border-slate-50 flex-shrink-0">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">{initialData ? 'Edit' : 'Add'} Plan</h2>
          <button onClick={onClose} className="p-3 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-8 space-y-8 overflow-y-auto pb-12 scrollbar-hide flex-1">
          {!initialData && (
            <div className="space-y-3">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Quick Add</span>
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
                {POPULAR_SERVICES.map(s => (
                  <button key={s.name} type="button" onClick={() => selectPopular(s)} className="flex flex-col items-center gap-2 flex-shrink-0 group">
                    <div className="w-16 h-16 rounded-[24px] border-2 border-slate-100 flex items-center justify-center p-3 group-active:scale-90 transition-all bg-white hover:border-indigo-300 shadow-sm">
                      <img src={s.logoUrl} className="w-full h-full object-contain" alt={s.name} />
                    </div>
                    <span className="text-[9px] font-bold text-slate-500">{s.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-[28px] border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden relative group transition-all hover:border-indigo-300">
                {logoUrl ? <img src={logoUrl} className="w-full h-full object-contain p-2" alt="Logo preview" /> : <Globe className="text-slate-300" />}
                {isSearchingLogo && (
                  <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                    <RefreshCw className="animate-spin text-indigo-600" size={24} />
                  </div>
                )}
                {name && !logoUrl && !isSearchingLogo && (
                  <button type="button" onClick={handleSearchLogo} className="absolute inset-0 bg-indigo-50/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Search className="text-indigo-600" size={24} />
                  </button>
                )}
              </div>
              <div className="flex-1 space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Plan Name</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-3.5 font-bold text-slate-800 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-300" 
                  placeholder="e.g., Netflix Premium" 
                  required 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Billing Cycle</label>
                <div className="relative">
                  <select 
                    value={billingCycle} 
                    onChange={e => setBillingCycle(e.target.value as BillingCycle)} 
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-3.5 font-bold text-slate-800 appearance-none focus:border-indigo-500 outline-none transition-all pr-10"
                  >
                    {CYCLES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <RefreshCw size={14} />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Price (₹)</label>
                <input 
                  type="number" 
                  value={price} 
                  onChange={e => setPrice(e.target.value)} 
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-3.5 font-black text-slate-800 focus:border-indigo-500 outline-none transition-all" 
                  placeholder="0.00"
                  required 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Last Paid</label>
                <div className="relative">
                  <input 
                    type="date" 
                    value={startDate} 
                    onChange={e => setStartDate(e.target.value)} 
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3.5 font-bold text-slate-800 outline-none focus:border-indigo-500 transition-all" 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Next Due</label>
                <div className="relative">
                  <input 
                    type="date" 
                    value={endDate} 
                    onChange={e => setEndDate(e.target.value)} 
                    className="w-full bg-indigo-50 border-2 border-indigo-100 rounded-2xl px-4 py-3.5 font-bold text-indigo-700 outline-none focus:border-indigo-500 transition-all" 
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category & Style</label>
              <div className="flex flex-col gap-3">
                <div className="flex gap-2">
                  <select value={category} onChange={e => setCategory(e.target.value)} className="flex-1 bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-3.5 font-bold text-slate-800 outline-none focus:border-indigo-500 transition-all">
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <div className="flex gap-1.5 bg-slate-50 border-2 border-slate-100 rounded-2xl p-2 items-center">
                    {COLORS.slice(0, 5).map(c => (
                      <button 
                        key={c} 
                        type="button" 
                        onClick={() => setColor(c)} 
                        className={`w-7 h-7 rounded-full transition-all ${color === c ? 'scale-110 ring-4 ring-white shadow-md' : 'opacity-40 hover:opacity-100'}`} 
                        style={{backgroundColor:c}} 
                        aria-label={`Select color ${c}`} 
                      />
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide py-1">
                  {customCategories.map(cat => (
                    <div key={cat} className="flex items-center gap-1.5 bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-indigo-100 whitespace-nowrap shadow-sm">
                      <span>{cat}</span>
                      <button type="button" onClick={() => onDeleteCategory(cat)} className="hover:text-red-500 transition-colors">
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                  <button 
                    type="button"
                    onClick={() => {
                      const newCat = prompt('New Category Name:');
                      if (newCat && newCat.trim()) onAddCategory(newCat.trim());
                    }}
                    className="flex items-center gap-1.5 bg-slate-100 text-slate-500 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-200 whitespace-nowrap hover:bg-slate-200 transition-colors shadow-sm"
                  >
                    <Plus size={14} /> New Cat
                  </button>
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full bg-indigo-600 text-white font-black py-5 rounded-[28px] shadow-xl text-lg active:scale-95 transition-all mt-4 hover:bg-indigo-700 shadow-indigo-100"
            >
              {initialData ? 'Update Plan' : 'Start Tracking'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionForm;
