import React from 'react';
import { Search, Filter } from 'lucide-react';

export default function SearchFilterBar({
  searchValue = '',
  onSearchChange,
  placeholder = 'Search records...',
  filters = [], // array of { label, value, onChange, options: [{ label, value }] }
  actions = null, // Extra JSX buttons on right
}) {
  return (
    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 mb-5">
      <div className="flex flex-1 flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px] max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={placeholder}
            className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
          />
        </div>

        {filters.map((f, idx) => (
          <div key={idx} className="flex items-center space-x-1.5">
            {f.label && <span className="text-xs text-slate-500 font-medium">{f.label}:</span>}
            <select
              value={f.value}
              onChange={(e) => f.onChange(e.target.value)}
              className="py-2 px-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium text-slate-700"
            >
              {f.options.map((opt, oIdx) => (
                <option key={oIdx} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

