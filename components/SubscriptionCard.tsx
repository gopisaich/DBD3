
import React, { useState, useEffect } from 'react';
import { Trash2, Calendar, Bell, Check, Clock, Archive, Edit3, Search } from 'lucide-react';
import { Subscription } from '../types';

interface Props {
  subscription: Subscription;
  onDelete: () => void;
  onEdit: () => void;
  onFixLogo?: () => void;
  onArchive?: () => void;
  isHistory?: boolean;
}

const SubscriptionCard: React.FC<Props> = ({ subscription, onDelete, onEdit, onFixLogo, onArchive, isHistory }) => {
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

  const handleDeleteAction = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete();
  };

  const handleEditAction = (e: React.MouseEvent) => {
    e.stopPropagation();
    if ('vibrate' in navigator) navigator.vibrate(10);
    onEdit();
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
    <div 
      className={`bg-white rounded-[32px] p-5 shadow-sm border border-white flex flex-col gap-4 relative overflow-hidden transition-all duration-300 hover:shadow-md ${isHistory ? 'opacity-70 grayscale-[0.2]' : ''}`}
    >
      <div 
        className="absolute left-0 top-0 bottom-0 w-2 transition-all duration-300"
        style={{ backgroundColor: subscription.color }}
      />

      <div className="flex items-center gap-4">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner overflow-hidden flex-shrink-0 bg-slate-50 border border-slate-100 p-2.5 transition-opacity relative group`}>
          {(subscription.logoUrl && !imageError) ? (
            <img 
              src={subscription.logoUrl} 
              alt={subscription.name} 
              className="w-full h-full object-contain"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center rounded-xl text-white font-extrabold text-xl relative" style={{ backgroundColor: subscription.color }}>
              {subscription.name.charAt(0)}
              {imageError && !isHistory && onFixLogo && (
                <button 
                  onClick={handleFixLogoAction}
                  disabled={isFixing}
                  className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"
                >
                  <Search size={20} className={isFixing ? 'animate-spin' : ''} />
                </button>
              )}
            </div>
          )}
        </div>
        
        <div className={`flex-1 min-w-0 transition-opacity`}>
          <h3 className="font-extrabold text-slate-900 truncate text-base tracking-tight mb-0.5">{subscription.name}</h3>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
              <Calendar size={12} className="text-slate-300" />
              <span>{formattedDate}</span>
            </div>
            {!isHistory && !isInvalidDate && (
               <div className="flex items-center gap-1 text-[10px] text-indigo-400 font-bold uppercase tracking-widest">
                <Clock size={12} className="text-indigo-200" />
                <span>{daysLeft <= 0 ? 'Ended' : `${daysLeft}D Left`}</span>
              </div>
            )}
          </div>
        </div>

        <div className={`text-right transition-opacity`}>
          <div className="font-black text-indigo-600 text-[17px] tracking-tighter">₹{formatINR(subscription.price)}</div>
          {isHistory && <div className="text-[10px] font-black text-slate-300 uppercase">Archived</div>}
        </div>

        <div className="flex gap-2 relative z-20">
          {!isHistory && (
            <button 
              type="button"
              onClick={handleEditAction}
              className={`h-12 w-12 rounded-[18px] flex items-center justify-center bg-slate-50 text-slate-400 active:scale-90 transition-all`}
            >
              <Edit3 size={18} strokeWidth={2} />
            </button>
          )}
          <button 
            type="button"
            onClick={handleDeleteAction}
            className={`h-12 w-12 rounded-[18px] flex items-center justify-center bg-slate-50 text-slate-400 active:scale-90 transition-all`}
          >
            <Trash2 size={18} strokeWidth={2} />
          </button>
        </div>
      </div>

      {!isHistory && !isInvalidDate && daysLeft > 0 && (
        <div className="space-y-1.5 px-1">
           <div className="flex justify-between text-[9px] font-black text-slate-300 uppercase tracking-widest">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full rounded-full transition-all duration-1000"
              style={{ width: `${progress}%`, backgroundColor: subscription.color }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionCard;
