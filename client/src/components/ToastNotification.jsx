import React from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

export default function ToastNotification({ toast, onClose }) {
  if (!toast) return null;

  const isSuccess = toast.type === 'success';

  return (
    <div className="fixed bottom-5 right-5 z-50 flex items-center p-4 bg-white border border-slate-200 shadow-xl rounded-xl max-w-sm animate-slide-up">
      <div className={`p-1.5 rounded-lg mr-3 ${isSuccess ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
        {isSuccess ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
      </div>
      <div className="flex-1 mr-2">
        <p className="text-sm font-medium text-slate-800">{toast.message}</p>
      </div>
      <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

