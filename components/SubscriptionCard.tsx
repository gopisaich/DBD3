
import React, { useState } from 'react';
import { Trash2, Calendar, Edit3, Search, Clock } from 'lucide-react';
import { Subscription } from '../types';

interface Props {
  subscription: Subscription;
  onDelete: () => void;
  onEdit: () => void;
  onFixLogo?: () => void;
  onArchive?: () => void;
  isHistory?: boolean;
}

const SubscriptionCard: React.FC<Props> = ({ subscription, onDelete, onEdit, onFixLogo, isHistory }) => {
  const [imageError, setImageError] = useState(false);
  const [isFixing, setIsFixing] = useState(false);
  
  const today = new Date();
  const endDate = new Date(subscription.endDate);
  const startDate = new Date(subscription.startDate);
  
  const isInvalidDate = isNaN(endDate.getTime()) || isNaN(startDate.getTime());
  
  const totalDuration = !isInvalidDate ? endDate.getTime() - startDate.getTime() : 1;
  const elapsed = !isInvalidDate ? today.getTime() - startDate.getTime() : 0;
  const timeLeft = !isInvalidDate ? endDate.getTime() - today.getTime() : 0;
  
  const daysLeft = Math.ceil(timeLeft / (1000 * 60 * 60 * 24));
  const progress = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));

  const formattedDate = isInvalidDate ? 'No Date' : endDate.toLocaleDateString('en-IN', {
    month: 'short',
    day: 'numeric'
  });

  const formatINR = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleFixLogoAction = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onFixLogo || isFixing) return;
    setIsFixing(true);
    await onFixLogo();
    setIsFixing(false);
    setImageError(false);
  };

  return (
    <div className={`bg-white rounded-[32px] p-5 shadow-sm border border-white flex flex-col gap-4 relative overflow-hidden transition-all duration-300 hover:shadow-md ${isHistory ? 'opacity-70 grayscale-[0.2]' : ''}`}>
      <div className="absolute left-0 top-0 bottom-0 w-2" style={{ backgroundColor: subscription.color }} />

      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner overflow-hidden flex-shrink-0 bg-slate-50 border border-slate-100 p-2 relative group">
          {(subscription.logoUrl && !imageError) ? (
            <img src={subscription.logoUrl} alt={subscription.name} className="w-full h-full object-contain" onError={() => setImageError(true)} />
          ) : (
            <div className="w-full h-full flex items-center justify-center rounded-xl text-white font-extrabold text-xl" style={{ backgroundColor: subscription.color }}>
              {subscription.name.charAt(0)}
              {imageError && !isHistory && onFixLogo && (
                <button onClick={handleFixLogoAction} disabled={isFixing} className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-xl">
                  <Search size={20} className={isFixing ? 'animate-spin' : 'text-white'} />
                </button>
              )}
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <h3 className="font-extrabold text-slate-900 truncate text-base tracking-tight">{subscription.name}</h3>
            {!isHistory && (
              <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-500 text-[8px] font-black uppercase tracking-widest whitespace-nowrap">
                {subscription.billingCycle}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
              <Calendar size={12} className="text-slate-300" />
              <span>{formattedDate}</span>
            </div>
            {!isHistory && !isInvalidDate && (
               <div className="flex items-center gap-1 text-[10px] text-indigo-400 font-bold uppercase tracking-widest">
                <Clock size={12} className="text-indigo-200" />
                <span>{daysLeft <= 0 ? 'Due' : `${daysLeft}D`}</span>
              </div>
            )}
          </div>
        </div>

        <div className="text-right flex flex-col items-end">
          <div className="font-black text-indigo-600 text-[17px] tracking-tighter">₹{formatINR(subscription.price)}</div>
          <div className="text-[8px] font-bold text-slate-300 uppercase">{isHistory ? 'Archived' : `per ${subscription.billingCycle.toLowerCase().replace('-time','')}`}</div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 relative z-20">
        <div className="flex-1">
          {!isHistory && !isInvalidDate && daysLeft > 0 && (
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${progress}%`, backgroundColor: subscription.color }} />
            </div>
          )}
        </div>
        <div className="flex gap-2">
          {!isHistory && (
            <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="h-10 w-10 rounded-[15px] flex items-center justify-center bg-slate-50 text-slate-400 active:scale-90 transition-all border border-slate-100">
              <Edit3 size={16} strokeWidth={2.5} />
            </button>
          )}
          <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="h-10 w-10 rounded-[15px] flex items-center justify-center bg-slate-50 text-slate-400 active:scale-90 transition-all border border-slate-100">
            <Trash2 size={16} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionCard;
