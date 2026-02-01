
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { X, Calendar as CalendarIcon, Zap, ChevronLeft, CreditCard, ChevronRight, Search, Volume2, Play, BellRing, Globe, ChevronDown, Check, Plus, Trash2, Settings, UserPlus } from 'lucide-react';
import { Subscription, DEFAULT_CATEGORIES } from '../types';
import { GoogleGenAI } from "@google/genai";

interface Props {
  onSubmit: (sub: Subscription) => void;
  onClose: () => void;
  initialData?: Subscription;
  categories: string[];
  customCategories: string[];
  onAddCategory?: (category: string) => void;
  onDeleteCategory?: (category: string) => void;
}

const COLORS = ['#4F46E5', '#EF4444', '#10B981', '#F59E0B', '#6366F1', '#EC4899', '#8B5CF6', '#1DB954', '#FF0000'];
const SOUND_TONES = ['None', 'Digital', 'Bell', 'Playful', 'Gentle'];
const REMINDER_OPTIONS = [1, 2, 3, 5, 7, 10, 14, 30];

const SOUND_URLS: Record<string, string> = {
  'Digital': 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3',
  'Bell': 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
  'Playful': 'https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3',
  'Gentle': 'https://assets.mixkit.co/active_storage/sfx/2190/2190-preview.mp3',
};

interface Plan {
  name: string;
  price: string;
  type: 'Monthly' | 'Yearly' | 'Custom';
}

interface Service {
  name: string;
  color: string;
  category: string;
  logoUrl: string;
  plans: Plan[];
}

const SEGMENTS = [
  { id: 'Entertainment', label: 'Entertainment' },
  { id: 'Lifestyle', label: 'Lifestyle & Bills' },
  { id: 'Education', label: 'Education' },
  { id: 'Gaming', label: 'Gaming' }
];

const POPULAR_SERVICES: Record<string, Service[]> = {
  Entertainment: [
    { 
      name: 'JioCinema', 
      color: '#D81F26', 
      category: 'Entertainment', 
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/e1/JioCinema_Logo.svg',
      plans: [
        { name: 'Premium', price: '29', type: 'Monthly' },
        { name: 'Family', price: '89', type: 'Monthly' }
      ]
    },
    { 
      name: 'Disney+ Hotstar', 
      color: '#001424', 
      category: 'Entertainment', 
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/3e/Disney%2B_Hotstar_logo.svg',
      plans: [
        { name: 'Premium (Monthly)', price: '299', type: 'Monthly' },
        { name: 'Super (Annual)', price: '899', type: 'Yearly' },
        { name: 'Premium (Annual)', price: '1499', type: 'Yearly' }
      ]
    },
    { 
      name: 'YouTube', 
      color: '#FF0000', 
      category: 'Entertainment', 
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/09/YouTube_full-color_icon_%282017%29.svg',
      plans: [
        { name: 'Premium Individual', price: '139', type: 'Monthly' },
        { name: 'Premium Student', price: '79', type: 'Monthly' },
        { name: 'Premium Family', price: '189', type: 'Monthly' }
      ]
    },
    { 
      name: 'Netflix', 
      color: '#E50914', 
      category: 'Entertainment', 
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/ff/Netflix-new-icon.png',
      plans: [
        { name: 'Mobile', price: '149', type: 'Monthly' },
        { name: 'Basic', price: '199', type: 'Monthly' },
        { name: 'Standard', price: '499', type: 'Monthly' },
        { name: 'Premium', price: '649', type: 'Monthly' }
      ]
    },
    { 
      name: 'Amazon Prime', 
      color: '#00A8E1', 
      category: 'Entertainment', 
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/11/Amazon_Prime_Video_logo.svg',
      plans: [
        { name: 'Monthly', price: '299', type: 'Monthly' },
        { name: 'Lite (Annual)', price: '799', type: 'Yearly' },
        { name: 'Annual', price: '1499', type: 'Yearly' }
      ]
    },
    { 
      name: 'Spotify', 
      color: '#1DB954', 
      category: 'Entertainment', 
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/19/Spotify_logo_without_text.svg',
      plans: [
        { name: 'Individual', price: '119', type: 'Monthly' },
        { name: 'Family', price: '179', type: 'Monthly' }
      ]
    }
  ],
  Gaming: [
    { 
      name: 'Free Fire', 
      color: '#FF6B00', 
      category: 'Gaming', 
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/3/36/Garena_Free_Fire_Booyah_logo.png',
      plans: [
        { name: 'Booyah Pass', price: '449', type: 'Monthly' },
        { name: 'Premium Plus', price: '899', type: 'Monthly' }
      ]
    },
    { 
      name: 'BGMI', 
      color: '#000000', 
      category: 'Gaming', 
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/2/25/Battlegrounds_Mobile_India_Logo.png',
      plans: [
        { name: 'Prime Plus', price: '449', type: 'Monthly' },
        { name: 'Prime', price: '89', type: 'Monthly' }
      ]
    },
    { 
      name: 'Xbox Game Pass', 
      color: '#107C10', 
      category: 'Gaming', 
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/f9/Xbox_one_logo.svg',
      plans: [
        { name: 'Ultimate', price: '499', type: 'Monthly' },
        { name: 'PC', price: '349', type: 'Monthly' }
      ]
    },
    { 
      name: 'Discord Nitro', 
      color: '#5865F2', 
      category: 'Gaming', 
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/7/73/Discord_Color_Logo.svg',
      plans: [
        { name: 'Nitro', price: '299', type: 'Monthly' },
        { name: 'Basic', price: '109', type: 'Monthly' }
      ]
    },
    { 
      name: 'Genshin Impact', 
      color: '#4CC5FE', 
      category: 'Gaming', 
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/5/5d/Genshin_Impact_logo.svg',
      plans: [
        { name: 'Welkin Moon', price: '449', type: 'Monthly' }
      ]
    }
  ],
  Lifestyle: [
    { 
      name: 'BigBasket', 
      color: '#84c225', 
      category: 'Lifestyle', 
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/2/23/Bigbasket_logo.png',
      plans: [
        { name: 'bbstar (6 Months)', price: '299', type: 'Custom' },
        { name: 'bbstar (Monthly)', price: '49', type: 'Monthly' }
      ]
    },
    { 
      name: 'Apollo 24|7', 
      color: '#ff6600', 
      category: 'Lifestyle', 
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/0/07/Apollo_Hospitals_logo.png',
      plans: [
        { name: 'Circle (Annual)', price: '299', type: 'Yearly' },
        { name: 'Circle (Monthly)', price: '49', type: 'Monthly' }
      ]
    },
    { 
      name: 'MedPlus', 
      color: '#E31E24', 
      category: 'Lifestyle', 
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/0b/MedPlus_Logo.png',
      plans: [
        { name: 'Advantage (Annual)', price: '499', type: 'Yearly' }
      ]
    },
    { 
      name: 'Jio Mobile', 
      color: '#0a288f', 
      category: 'Utility', 
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/b/bf/Reliance_Jio_Logo.svg',
      plans: [{ name: 'Prepaid', price: '299', type: 'Monthly' }]
    },
    { 
      name: 'Airtel', 
      color: '#e40000', 
      category: 'Utility', 
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/3a/Airtel_logo-01.png',
      plans: [{ name: 'Monthly', price: '499', type: 'Monthly' }]
    }
  ],
  Education: [
    { 
      name: 'Duolingo', 
      color: '#58CC02', 
      category: 'Education', 
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/15/Duolingo_logo_%282019%29.svg',
      plans: [
        { name: 'Super (Monthly)', price: '129', type: 'Monthly' },
        { name: 'Super (Annual)', price: '1299', type: 'Yearly' }
      ]
    },
    { 
      name: 'Coursera', 
      color: '#0056D2', 
      category: 'Education', 
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/97/Coursera-logo_v3.svg',
      plans: [
        { name: 'Plus (Monthly)', price: '4999', type: 'Monthly' },
        { name: 'Plus (Annual)', price: '32000', type: 'Yearly' }
      ]
    },
    { 
      name: 'Udemy', 
      color: '#A435F0', 
      category: 'Education', 
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/e3/Udemy_logo.svg',
      plans: [
        { name: 'Personal Plan', price: '829', type: 'Monthly' }
      ]
    },
    { 
      name: 'Unacademy', 
      color: '#08BD80', 
      category: 'Education', 
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/2/29/Unacademy_logo.png',
      plans: [
        { name: 'Plus (Monthly)', price: '2999', type: 'Monthly' },
        { name: 'Iconic (Monthly)', price: '4999', type: 'Monthly' }
      ]
    },
    { 
      name: 'BYJU\'S', 
      color: '#813588', 
      category: 'Education', 
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/e7/Byju%27s_Logo.svg',
      plans: [
        { name: 'Premium (Monthly)', price: '3500', type: 'Monthly' }
      ]
    },
    { 
      name: 'Physics Wallah', 
      color: '#000000', 
      category: 'Education', 
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/d/dd/Physics_wallah_logo.svg',
      plans: [
        { name: 'Batch', price: '4500', type: 'Custom' }
      ]
    }
  ]
};

// --- Custom Calendar Component ---
interface CalendarPickerProps {
  value: string;
  onChange: (date: string) => void;
  label: string;
  onClose: () => void;
}

const CustomCalendarPicker: React.FC<CalendarPickerProps> = ({ value, onChange, label, onClose }) => {
  const [currentDate, setCurrentDate] = useState(() => {
    const d = new Date(value);
    return isNaN(d.getTime()) ? new Date() : d;
  });
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date(value);
    return isNaN(d.getTime()) ? new Date() : d;
  });

  const daysInMonth = (month: number, year: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (month: number, year: number) => new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleSelectDate = (day: number) => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelectedDate(newDate);
    const formatted = newDate.toISOString().split('T')[0];
    onChange(formatted);
    if ('vibrate' in navigator) navigator.vibrate(10);
    setTimeout(onClose, 200);
  };

  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const year = currentDate.getFullYear();
  const daysCount = daysInMonth(currentDate.getMonth(), year);
  const paddingCount = firstDayOfMonth(currentDate.getMonth(), year);

  return (
    <div className="bg-white rounded-[40px] p-6 space-y-6 shadow-premium border border-slate-50 animate-in zoom-in-95 duration-200">
      <div className="flex items-center justify-between px-2">
        <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">{label}</h3>
        <div className="flex items-center gap-1">
          <button type="button" onClick={handlePrevMonth} className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
            <ChevronLeft size={18} />
          </button>
          <span className="text-sm font-black text-slate-800 w-24 text-center">{monthName} {year}</span>
          <button type="button" onClick={handleNextMonth} className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d) => (
          <div key={d} className="text-center text-[10px] font-black text-slate-300 py-2">{d}</div>
        ))}
        {Array.from({ length: paddingCount }).map((_, i) => <div key={`p-${i}`} />)}
        {Array.from({ length: daysCount }).map((_, i) => {
          const d = i + 1;
          const isSelected = selectedDate.getDate() === d && 
                             selectedDate.getMonth() === currentDate.getMonth() && 
                             selectedDate.getFullYear() === currentDate.getFullYear();
          const isToday = new Date().getDate() === d && 
                          new Date().getMonth() === currentDate.getMonth() && 
                          new Date().getFullYear() === currentDate.getFullYear();
          
          return (
            <button
              key={d}
              type="button"
              onClick={() => handleSelectDate(d)}
              className={`h-10 w-full rounded-2xl flex items-center justify-center text-xs font-bold transition-all ${
                isSelected 
                  ? 'bg-indigo-600 text-white shadow-lg scale-110 z-10' 
                  : isToday 
                    ? 'text-indigo-600 font-black bg-indigo-50' 
                    : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              {d}
            </button>
          );
        })}
      </div>
      
      <button 
        type="button" 
        onClick={onClose}
        className="w-full py-4 bg-slate-100 text-slate-500 font-black rounded-3xl text-xs uppercase tracking-widest active:scale-95 transition-all"
      >
        Done
      </button>
    </div>
  );
};

// --- Main SubscriptionForm Component ---
const SubscriptionForm: React.FC<Props> = ({ onSubmit, onClose, initialData, categories, customCategories, onAddCategory, onDeleteCategory }) => {
  const nameInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState(initialData?.name || '');
  const [price, setPrice] = useState(initialData?.price.toString() || '');
  
  const [startDate, setStartDate] = useState(() => {
    if (initialData?.startDate) {
      const d = new Date(initialData.startDate);
      if (!isNaN(d.getTime())) return d.toISOString().split('T')[0];
    }
    return new Date().toISOString().split('T')[0];
  });

  const [endDate, setEndDate] = useState(() => {
    if (initialData?.endDate) {
      const d = new Date(initialData.endDate);
      if (!isNaN(d.getTime())) return d.toISOString().split('T')[0];
    }
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    return d.toISOString().split('T')[0];
  });

  const [reminder, setReminder] = useState(initialData?.reminderDays || 1);
  const [category, setCategory] = useState<string>(initialData?.category || 'Entertainment');
  const [color, setColor] = useState(initialData?.color || COLORS[0]);
  const [logoUrl, setLogoUrl] = useState<string | undefined>(initialData?.logoUrl);
  const [soundTone, setSoundTone] = useState(initialData?.soundTone || 'None');
  const [activeSegment, setActiveSegment] = useState<string>('Entertainment');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [serviceSearchQuery, setServiceSearchQuery] = useState('');
  
  const [isSearchingLogo, setIsSearchingLogo] = useState(false);
  const [searchSources, setSearchSources] = useState<{title: string, uri: string}[]>([]);

  const [activePicker, setActivePicker] = useState<'start' | 'end' | null>(null);
  
  const [showCategorySettings, setShowCategorySettings] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const vibrate = (ms: number = 10) => {
    if ('vibrate' in navigator) navigator.vibrate(ms);
  };

  const playTonePreview = (tone: string) => {
    vibrate(10);
    if (tone === 'None') return;
    const url = SOUND_URLS[tone];
    if (url) {
      const audio = new Audio(url);
      audio.play().catch(e => console.log('Preview blocked:', e));
    }
  };

  const handleSearchLogo = async () => {
    if (!name.trim()) return;
    vibrate(15);
    setIsSearchingLogo(true);
    setSearchSources([]);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Find the official, high-resolution transparent PNG or SVG logo URL for the subscription service "${name}". Return ONLY the direct URL string starting with https. No other text.`,
        config: { tools: [{ googleSearch: {} }] }
      });

      const url = response.text?.trim();
      if (url && url.startsWith('http')) {
        setLogoUrl(url);
      }

      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      if (chunks) {
        const sources = chunks
          .map((c: any) => ({ title: c.web?.title || 'Source', uri: c.web?.uri || '' }))
          .filter((s: any) => s.uri);
        setSearchSources(sources);
      }
    } catch (e) {
      console.error('Logo search failed:', e);
    } finally {
      setIsSearchingLogo(false);
    }
  };

  const filteredQuickAddServices = useMemo(() => {
    if (!serviceSearchQuery.trim()) {
      return POPULAR_SERVICES[activeSegment] || [];
    }
    const allServices = Object.values(POPULAR_SERVICES).flat();
    return allServices.filter(s => s.name.toLowerCase().includes(serviceSearchQuery.toLowerCase()));
  }, [serviceSearchQuery, activeSegment]);

  const selectService = (service: Service) => {
    vibrate(15);
    setSelectedService(service);
    setServiceSearchQuery('');
  };

  const selectPlan = (plan: Plan) => {
    if (!selectedService) return;
    vibrate(20);
    setName(plan.name === 'Bill' || plan.name === 'Prepaid' ? selectedService.name : `${selectedService.name} ${plan.name}`);
    setColor(selectedService.color);
    setCategory(selectedService.category);
    setPrice(plan.price);
    setLogoUrl(selectedService.logoUrl);
    
    const start = new Date(startDate);
    if (isNaN(start.getTime())) return;
    
    if (plan.type === 'Monthly') start.setMonth(start.getMonth() + 1);
    else if (plan.type === 'Yearly') start.setFullYear(start.getFullYear() + 1);
    setEndDate(start.toISOString().split('T')[0]);

    if (activeSegment === 'Lifestyle' || !plan.price) {
      setTimeout(() => {
        const priceInput = document.getElementById('price-input');
        if (priceInput) priceInput.focus();
      }, 300);
    }
  };

  const handleCustomShortcut = () => {
    vibrate(25);
    setSelectedService(null);
    setCategory(activeSegment);
    setName('');
    setLogoUrl(undefined);
    setTimeout(() => {
      nameInputRef.current?.focus();
    }, 100);
  };

  const handleAddNewCategory = () => {
    if (!newCategoryName.trim() || !onAddCategory) return;
    vibrate(15);
    onAddCategory(newCategoryName);
    setCategory(newCategoryName);
    setNewCategoryName('');
    setShowAddCategory(false);
  };

  const handleDeleteCustomCategory = (cat: string) => {
    if (onDeleteCategory) {
      onDeleteCategory(cat);
      if (category === cat) setCategory('Other');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price) return;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      alert("Please select valid dates");
      return;
    }

    onSubmit({
      id: initialData?.id || Math.random().toString(36).substr(2, 9),
      name,
      price: parseFloat(price),
      currency: 'INR',
      renewalDate: end.toISOString(),
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      reminderDays: reminder,
      category,
      color,
      logoUrl,
      soundTone: soundTone === 'None' ? undefined : soundTone,
      isArchived: initialData?.isArchived,
    });
  };

  const formatDateLabel = (dateStr: string) => {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 'Select Date';
    return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 bg-slate-900/40 backdrop-blur-md">
      <div className="w-full max-w-lg bg-white rounded-t-[40px] sm:rounded-[40px] shadow-2xl animate-in slide-in-from-bottom duration-500 max-h-[92vh] flex flex-col">
        <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mt-3 mb-1" />
        <div className="flex items-center justify-between px-8 py-4 border-b border-slate-50">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">{initialData ? 'Edit' : 'Add'} Subscription</h2>
          <button onClick={() => { vibrate(5); onClose(); }} className="p-3 bg-slate-100 rounded-full text-slate-500 active:scale-90 transition-transform">
            <X size={22} strokeWidth={2.5} />
          </button>
        </div>
        <div className="p-8 space-y-8 overflow-y-auto pb-12 scrollbar-hide relative">
          
          {/* Category Management Overlay */}
          {showCategorySettings && (
             <div className="absolute inset-0 z-40 bg-white/95 backdrop-blur-md p-8 animate-in fade-in duration-300 flex flex-col">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">Manage Categories</h3>
                  <button onClick={() => setShowCategorySettings(false)} className="p-2 bg-slate-100 rounded-full">
                    <X size={20} />
                  </button>
                </div>
                
                <div className="space-y-4 flex-1 overflow-y-auto pr-2 scrollbar-hide">
                  <div className="bg-slate-50 rounded-3xl p-5 border border-slate-100">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4">Your Custom Categories</span>
                    {customCategories.length === 0 ? (
                      <p className="text-xs font-bold text-slate-400 italic py-4">No custom categories yet.</p>
                    ) : (
                      <div className="space-y-2">
                        {customCategories.map(cat => (
                          <div key={cat} className="flex items-center justify-between bg-white px-5 py-3 rounded-2xl shadow-sm">
                            <span className="text-sm font-bold text-slate-800">{cat}</span>
                            <button 
                              onClick={() => handleDeleteCustomCategory(cat)}
                              className="text-red-400 p-2 hover:bg-red-50 rounded-xl transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="bg-slate-50 rounded-3xl p-5 border border-slate-100">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4">System Defaults</span>
                    <div className="flex flex-wrap gap-2">
                      {DEFAULT_CATEGORIES.map(cat => (
                        <span key={cat} className="px-3 py-1.5 bg-slate-200 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest">
                          {cat}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                
                <button 
                  onClick={() => setShowCategorySettings(false)}
                  className="w-full bg-slate-900 text-white font-black py-5 rounded-[24px] shadow-xl mt-6 active:scale-[0.98]"
                >
                  Done
                </button>
             </div>
          )}

          {/* Calendar Picker Overlay */}
          {activePicker && (
            <div className="absolute inset-0 z-40 bg-white/60 backdrop-blur-sm p-8 flex items-center justify-center">
              <CustomCalendarPicker 
                label={activePicker === 'start' ? 'Start Date' : 'Renewal Date'}
                value={activePicker === 'start' ? startDate : endDate}
                onChange={(d) => activePicker === 'start' ? setStartDate(d) : setEndDate(d)}
                onClose={() => setActivePicker(null)}
              />
            </div>
          )}

          {!initialData && !activePicker && !showCategorySettings && (
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <Zap size={14} className="text-amber-500 fill-amber-500" />
                  <span>{selectedService ? `PLAN FOR ${selectedService.name.toUpperCase()}` : 'QUICK ADD'}</span>
                </div>
                {selectedService && (
                  <button onClick={() => { vibrate(5); setSelectedService(null); }} className="text-[10px] font-black text-indigo-600 uppercase flex items-center gap-1">
                    <ChevronLeft size={12} strokeWidth={3} /> Change
                  </button>
                )}
              </div>
              {!selectedService ? (
                <div className="space-y-4">
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400">
                      <Search size={16} />
                    </div>
                    <input type="text" placeholder="Search services..." value={serviceSearchQuery} onChange={(e) => setServiceSearchQuery(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 pl-11 pr-4 text-xs font-bold text-slate-900 focus:border-indigo-500 outline-none transition-all" />
                  </div>
                  {!serviceSearchQuery && (
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-2 px-2">
                      {SEGMENTS.map((seg) => (
                        <button key={seg.id} onClick={() => { vibrate(5); setActiveSegment(seg.id); }} className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase transition-all whitespace-nowrap border-2 ${activeSegment === seg.id ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-400'}`}>
                          {seg.label}
                        </button>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-2 px-2 w-full min-h-[100px] items-center">
                    {filteredQuickAddServices.map((service) => (
                      <button key={service.name} type="button" onClick={() => selectService(service)} className="flex flex-col items-center gap-2 flex-shrink-0 group">
                        <div className="w-16 h-16 rounded-[24px] flex items-center justify-center shadow-md group-active:scale-90 transition-all border-2 border-slate-100 bg-white overflow-hidden p-3">
                          <img src={service.logoUrl} alt={service.name} className="w-full h-full object-contain" />
                        </div>
                        <div className="text-[10px] font-extrabold text-slate-800 text-center max-w-[64px] truncate">{service.name}</div>
                      </button>
                    ))}
                    
                    {/* Custom Shortcut Card */}
                    <button 
                      type="button" 
                      onClick={handleCustomShortcut} 
                      className="flex flex-col items-center gap-2 flex-shrink-0 group"
                    >
                      <div className="w-16 h-16 rounded-[24px] flex items-center justify-center shadow-sm group-active:scale-90 transition-all border-2 border-dashed border-indigo-200 bg-indigo-50/30 overflow-hidden p-3">
                        <Plus size={24} className="text-indigo-400" />
                      </div>
                      <div className="text-[10px] font-extrabold text-indigo-400 text-center uppercase tracking-tighter">Custom</div>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide -mx-2 px-2 w-full animate-in fade-in slide-in-from-right-4 duration-300">
                  {selectedService.plans.map((plan, idx) => (
                    <button key={idx} type="button" onClick={() => selectPlan(plan)} className="flex-shrink-0 bg-slate-50 border-2 border-slate-100 rounded-[24px] px-6 py-4 flex flex-col items-start gap-1 min-w-[140px] hover:border-indigo-500 transition-all group">
                      <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{plan.type}</div>
                      <div className="text-sm font-black text-slate-900 group-active:text-indigo-600">{plan.name}</div>
                      <div className="text-lg font-black text-indigo-600">
                        {plan.price ? `₹${plan.price}` : 'Manual Price'}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className={`space-y-6 ${activePicker || showCategorySettings ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
            <div className="flex items-center gap-6">
              <div className="relative group">
                <div className={`w-20 h-20 rounded-[28px] flex items-center justify-center border-2 border-dashed border-slate-200 bg-slate-50 relative overflow-hidden`}>
                  {logoUrl ? (
                    <img src={logoUrl} alt="Preview" className="w-full h-full object-contain p-2" />
                  ) : (
                    <Globe size={24} className="text-slate-300" />
                  )}
                  {isSearchingLogo && (
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
                      <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>
                {name && !logoUrl && !isSearchingLogo && (
                  <button 
                    type="button" 
                    onClick={handleSearchLogo}
                    className="absolute -bottom-2 -right-2 bg-indigo-600 text-white p-2 rounded-xl shadow-lg hover:scale-110 active:scale-90 transition-all"
                  >
                    <Search size={14} />
                  </button>
                )}
              </div>
              <div className="flex-1 space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Name</label>
                <div className="relative">
                  <input 
                    ref={nameInputRef}
                    type="text" 
                    placeholder="Service Name" 
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-3xl px-6 py-4 font-bold text-slate-900 focus:border-indigo-500 outline-none transition-all" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    required 
                  />
                  <CreditCard size={18} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</label>
                  <div className="flex items-center gap-2">
                    <button 
                      type="button" 
                      onClick={() => { vibrate(5); setShowCategorySettings(true); }}
                      className="text-slate-400 hover:text-indigo-600 transition-colors"
                      title="Manage Categories"
                    >
                      <Settings size={12} />
                    </button>
                    <button 
                      type="button" 
                      onClick={() => { vibrate(5); setShowAddCategory(!showAddCategory); }}
                      className="text-indigo-600 hover:text-indigo-700 transition-colors"
                    >
                      {showAddCategory ? <X size={12} strokeWidth={3} /> : <Plus size={12} strokeWidth={3} />}
                    </button>
                  </div>
                </div>
                {showAddCategory ? (
                  <div className="relative animate-in slide-in-from-top-2 duration-300">
                    <input 
                      type="text" 
                      placeholder="Category Name" 
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      className="w-full bg-indigo-50 border-2 border-indigo-100 rounded-3xl px-6 py-4 font-bold text-slate-900 focus:border-indigo-500 outline-none transition-all pr-12"
                      autoFocus
                    />
                    <button 
                      type="button"
                      onClick={handleAddNewCategory}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg active:scale-90 transition-transform"
                    >
                      <Check size={18} strokeWidth={3} />
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <select className="w-full bg-slate-50 border-2 border-slate-100 rounded-3xl px-6 py-4 font-bold text-slate-900 focus:border-indigo-500 outline-none appearance-none" value={category} onChange={(e) => setCategory(e.target.value)}>
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <ChevronDown size={16} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Price (₹)</label>
                <input id="price-input" type="number" placeholder="0" className="w-full bg-slate-50 border-2 border-slate-100 rounded-3xl px-6 py-4 font-black text-slate-900 focus:border-indigo-500 outline-none transition-all" value={price} onChange={(e) => setPrice(e.target.value)} required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Start Date</label>
                <button 
                  type="button" 
                  onClick={() => { vibrate(5); setActivePicker('start'); }}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-3xl px-6 py-4 font-bold text-slate-800 text-left flex items-center justify-between group active:border-indigo-500 transition-all"
                >
                  <span className="truncate">{formatDateLabel(startDate)}</span>
                  <CalendarIcon size={16} className="text-slate-400 group-hover:text-indigo-500 transition-colors" />
                </button>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">End Date</label>
                <button 
                  type="button" 
                  onClick={() => { vibrate(5); setActivePicker('end'); }}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-3xl px-6 py-4 font-bold text-slate-800 text-left flex items-center justify-between group active:border-indigo-500 transition-all"
                >
                  <span className="truncate">{formatDateLabel(endDate)}</span>
                  <CalendarIcon size={16} className="text-slate-400 group-hover:text-indigo-500 transition-colors" />
                </button>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                <BellRing size={14} />
                <span>Notify Me Before</span>
              </div>
              <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-2 px-2">
                {REMINDER_OPTIONS.map(days => (
                  <button
                    key={days}
                    type="button"
                    onClick={() => {
                      vibrate(5);
                      setReminder(days);
                    }}
                    className={`flex-1 min-w-[80px] px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border-2 ${
                      reminder === days 
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100' 
                        : 'bg-white border-slate-100 text-slate-400'
                    }`}
                  >
                    {days} {days === 1 ? 'Day' : 'Days'}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                <Volume2 size={14} />
                <span>Alert Sound</span>
              </div>
              <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-2 px-2">
                {SOUND_TONES.map(tone => (
                  <button
                    key={tone}
                    type="button"
                    onClick={() => {
                      setSoundTone(tone);
                      playTonePreview(tone);
                    }}
                    className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border-2 ${
                      soundTone === tone 
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100' 
                        : 'bg-white border-slate-100 text-slate-400'
                    }`}
                  >
                    {tone !== 'None' && <Play size={10} fill="currentColor" />}
                    {tone}
                  </button>
                ))}
              </div>
            </div>

            {searchSources.length > 0 && (
              <div className="space-y-2 px-2 animate-in fade-in duration-300">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Logo Search Sources:</span>
                <div className="flex flex-wrap gap-2">
                  {searchSources.map((source, i) => (
                    <a key={i} href={source.uri} target="_blank" rel="noopener noreferrer" className="text-[9px] font-bold text-indigo-500 bg-indigo-50 px-2 py-1 rounded-lg truncate max-w-[120px]">
                      {source.title}
                    </a>
                  ))}
                </div>
              </div>
            )}

            <button type="submit" className="w-full bg-indigo-600 text-white font-black py-6 rounded-[32px] shadow-2xl active:scale-[0.96] transition-all text-xl mt-4">
              {initialData ? 'Update Plan' : 'Add to Tracker'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionForm;
