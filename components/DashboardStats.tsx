
import React, { useMemo } from 'react';
import { Wallet, TrendingUp, PieChart as PieIcon } from 'lucide-react';
import { Subscription } from '../types';

interface Props {
  subscriptions: Subscription[];
}

const CATEGORY_COLORS: Record<string, string> = {
  'Entertainment': '#ef4444',
  'Gaming': '#8b5cf6',
  'Education': '#3b82f6',
  'Fitness': '#10b981',
  'News': '#f59e0b',
  'Work': '#6366f1',
  'Utility': '#64748b',
  'Lifestyle': '#ec4899',
  'Other': '#cbd5e1',
};

const DashboardStats: React.FC<Props> = ({ subscriptions }) => {
  const monthlyTotal = subscriptions.reduce((sum, sub) => sum + sub.price, 0);
  const yearlyTotal = monthlyTotal * 12;

  const nextSub = [...subscriptions].sort((a, b) => 
    new Date(a.renewalDate).getTime() - new Date(b.renewalDate).getTime()
  )[0];

  const categoryData = useMemo(() => {
    const totals: Record<string, number> = {};
    subscriptions.forEach(sub => {
      totals[sub.category] = (totals[sub.category] || 0) + sub.price;
    });
    
    return Object.entries(totals)
      .map(([name, value], index) => {
        // Generate a stable color if it's a custom category
        const fallbackColors = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'];
        const color = CATEGORY_COLORS[name] || fallbackColors[index % fallbackColors.length];
        
        return {
          name,
          value,
          percent: monthlyTotal > 0 ? (value / monthlyTotal) * 100 : 0,
          color
        };
      })
      .sort((a, b) => b.value - a.value);
  }, [subscriptions, monthlyTotal]);

  const formatINR = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // SVG Chart Logic
  let cumulativePercent = 0;
  const chartSlices = categoryData.map((item) => {
    const startPercent = cumulativePercent;
    cumulativePercent += item.percent;
    
    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (item.percent / 100) * circumference;
    const rotation = (startPercent / 100) * 360;

    return { ...item, offset, circumference, rotation };
  });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2 bg-white p-7 rounded-[40px] shadow-sm border border-white flex flex-col justify-center relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 text-indigo-100 opacity-20 group-hover:opacity-40 transition-opacity">
              <TrendingUp size={64} strokeWidth={1.5} />
          </div>
          <div className="flex items-center gap-2 mb-2 relative z-10">
            <div className="w-6 h-6 bg-indigo-50 rounded-lg flex items-center justify-center">
              <Wallet size={12} className="text-indigo-600" />
            </div>
            <span className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">Monthly Spend</span>
          </div>
          <div className="flex items-baseline gap-2 relative z-10">
            <span className="text-4xl font-extrabold text-slate-900 tracking-tighter">₹{formatINR(monthlyTotal)}</span>
            <span className="text-slate-300 font-bold text-sm uppercase tracking-tight">INR</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-[32px] shadow-sm border border-white flex flex-col justify-between min-h-[100px]">
          <span className="text-slate-400 text-[9px] font-black uppercase tracking-widest block">Yearly Est.</span>
          <div className="text-lg font-extrabold text-slate-800 tracking-tight mt-1">₹{formatINR(yearlyTotal)}</div>
        </div>

        <div className="bg-white p-5 rounded-[32px] shadow-sm border border-white flex flex-col justify-between min-h-[100px]">
          <span className="text-slate-400 text-[9px] font-black uppercase tracking-widest block">Next Due</span>
          <div className="text-[13px] font-extrabold text-indigo-600 truncate tracking-tight mt-1 flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse flex-shrink-0" />
            {nextSub ? nextSub.name : 'None'}
          </div>
        </div>
      </div>

      {subscriptions.length > 0 && (
        <div className="bg-white p-6 rounded-[40px] shadow-sm border border-white">
          <div className="flex items-center gap-2 mb-6">
             <div className="w-6 h-6 bg-rose-50 rounded-lg flex items-center justify-center">
              <PieIcon size={12} className="text-rose-500" />
            </div>
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Spending Breakdown</h3>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-8">
            <div className="relative w-32 h-32 flex-shrink-0">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f1f5f9" strokeWidth="12" />
                {chartSlices.map((slice, i) => (
                  <circle
                    key={i}
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke={slice.color}
                    strokeWidth="12"
                    strokeDasharray={slice.circumference}
                    strokeDashoffset={slice.offset}
                    strokeLinecap="round"
                    style={{
                      transform: `rotate(${slice.rotation}deg)`,
                      transformOrigin: 'center',
                      transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                  />
                ))}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-tighter">Budget</span>
                <span className="text-xs font-black text-slate-900">Breakdown</span>
              </div>
            </div>

            <div className="flex-1 w-full space-y-3">
              {categoryData.map((item, i) => (
                <div key={i} className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-2.5 h-2.5 rounded-full shadow-sm group-hover:scale-125 transition-transform" 
                      style={{ backgroundColor: item.color }} 
                    />
                    <span className="text-sm font-bold text-slate-600">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-black text-slate-900 tracking-tight">₹{formatINR(item.value)}</div>
                    <div className="text-[10px] font-bold text-slate-300 uppercase">{Math.round(item.percent)}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardStats;
