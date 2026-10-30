import React from 'react';

export default function StatusBadge({ status }) {
  const s = String(status || '').toLowerCase();

  let colorClasses = 'bg-slate-100 text-slate-700 border-slate-200';

  if (s === 'active' || s === 'present' || s === 'completed' || s === 'pass' || s === 'o' || s === 'a+' || s === 'a') {
    colorClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  } else if (s === 'inactive' || s === 'absent' || s === 'dropped' || s === 'fail' || s === 'f') {
    colorClasses = 'bg-rose-50 text-rose-700 border-rose-200';
  } else if (s === 'late' || s === 'enrolled' || s === 'b+' || s === 'b' || s === 'c') {
    colorClasses = 'bg-amber-50 text-amber-700 border-amber-200';
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${colorClasses}`}>
      {status}
    </span>
  );
}

