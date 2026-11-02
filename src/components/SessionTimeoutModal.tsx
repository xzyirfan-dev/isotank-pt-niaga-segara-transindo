import React, { useEffect, useState } from 'react';
import { ShieldAlert, Clock, RefreshCw, Lock } from 'lucide-react';

interface SessionTimeoutModalProps {
  isOpen: boolean;
  onExtend: () => void;
  onLockNow: () => void;
}

export const SessionTimeoutModal: React.FC<SessionTimeoutModalProps> = ({
  isOpen,
  onExtend,
  onLockNow
}) => {
  const [secondsRemaining, setSecondsRemaining] = useState(60);

  useEffect(() => {
    if (!isOpen) {
      setSecondsRemaining(60);
      return;
    }

    setSecondsRemaining(60);
    const interval = setInterval(() => {
      setSecondsRemaining(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          onLockNow();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, onLockNow]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="w-full max-w-md bg-slate-900 border border-amber-500/40 rounded-2xl shadow-2xl p-6 relative overflow-hidden">
        {/* Amber accent top bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-rose-500 to-amber-500 animate-pulse" />

        <div className="flex items-start space-x-4 mb-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center space-x-2">
              <span>Peringatan Keamanan Sesi</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Sesuai standar perlindungan data ISO 27001 & data lead operasional, sesi Anda akan dikunci otomatis karena tidak ada interaksi pengguna.
            </p>
          </div>
        </div>

        {/* Countdown Timer Display */}
        <div className="my-5 p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
          <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1 flex items-center justify-center space-x-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Sisa Waktu Respons</span>
          </div>
          <div className="text-3xl font-extrabold text-amber-400 font-mono tabular-nums tracking-tight">
            00:{secondsRemaining < 10 ? `0${secondsRemaining}` : secondsRemaining}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Klik tombol di bawah untuk memperpanjang sesi aktif Anda.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={onLockNow}
            className="flex-1 py-2.5 px-3 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-800 text-slate-300 text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
          >
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            <span>Kunci Sesi</span>
          </button>

          <button
            type="button"
            onClick={onExtend}
            className="flex-1 py-2.5 px-3 rounded-xl bg-teal-600 hover:bg-teal-500 active:scale-[0.98] text-white text-xs font-bold shadow-lg shadow-teal-900/30 flex items-center justify-center space-x-1.5 transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Perpanjang Sesi</span>
          </button>
        </div>
      </div>
    </div>
  );
};
