import React from 'react';

export default function StatCard({ title, value, subtitle, icon: Icon, color = 'indigo' }) {
  const bgClasses = {
    indigo: 'bg-indigo-50 text-indigo-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    purple: 'bg-purple-50 text-purple-600',
    rose: 'bg-rose-50 text-rose-600',
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm flex items-start justify-between">
      <div>
        <p className="text-xs font-semibold tracking-wider text-slate-500 uppercase">{title}</p>
        <p className="text-2xl font-bold text-slate-800 mt-1">{value !== undefined ? value : '—'}</p>
        {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
      </div>
      {Icon && (
        <div className={`p-3 rounded-lg ${bgClasses[color] || bgClasses.indigo}`}>
          <Icon className="w-6 h-6" />
        </div>
      )}
    </div>
  );
}

