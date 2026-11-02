import React, { useEffect, useState } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X, RotateCcw } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const AppleToastNotification: React.FC = () => {
  const { toast, clearToast } = useApp();
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!toast) {
      setProgress(100);
      return;
    }

    const duration = toast.undoAction ? (toast.duration || 7000) : (toast.duration || 4000);
    const intervalTime = 50;
    const decrement = (intervalTime / duration) * 100;

    const timer = setInterval(() => {
      setProgress(prev => Math.max(0, prev - decrement));
    }, intervalTime);

    return () => clearInterval(timer);
  }, [toast]);

  if (!toast) return null;

  const iconMap = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />,
    status: <Info className="w-5 h-5 text-teal-400 shrink-0" />,
  };

  const borderMap = {
    success: 'border-emerald-500/40 shadow-emerald-500/10',
    warning: 'border-amber-500/40 shadow-amber-500/10',
    error: 'border-rose-500/40 shadow-rose-500/10',
    status: 'border-teal-500/40 shadow-teal-500/10',
  };

  const progressBg = {
    success: 'bg-emerald-400',
    warning: 'bg-amber-400',
    error: 'bg-rose-400',
    status: 'bg-teal-400',
  };

  const handleUndo = () => {
    if (toast.undoAction) {
      toast.undoAction();
      clearToast();
    }
  };

  return (
    <div
      role="region"
      aria-live="polite"
      className="fixed bottom-6 right-6 z-70 max-w-md w-full px-4 sm:px-0 animate-in slide-in-from-bottom-5 fade-in duration-300"
    >
      <div
        className={`apple-card p-4 rounded-2xl bg-slate-900/95 border backdrop-blur-xl shadow-2xl flex flex-col overflow-hidden relative ${borderMap[toast.type]}`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start space-x-3 flex-1 min-w-0">
            {iconMap[toast.type]}
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-extrabold text-slate-100 tracking-tight leading-snug">
                {toast.title}
              </h4>
              <p className="text-[12px] text-slate-300 mt-0.5 leading-relaxed break-words">
                {toast.message}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1.5 shrink-0 ml-2">
            {toast.undoAction && (
              <button
                type="button"
                onClick={handleUndo}
                className="px-3 py-1.5 rounded-xl bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 border border-amber-400/40 text-xs font-extrabold flex items-center space-x-1 transition-all shadow-sm active:scale-95"
                title="Batalkan perubahan tahap ini"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Undo</span>
              </button>
            )}

            <button
              type="button"
              onClick={clearToast}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Tutup notifikasi"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Progress bar countdown indicator */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-800/80">
          <div
            className={`h-full transition-all duration-75 ${progressBg[toast.type]}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};
