import React, { useState } from 'react';
import { ShieldCheck, KeyRound, X, AlertCircle, CheckCircle2 } from 'lucide-react';

interface TwoFactorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  actionTitle?: string;
}

export const TwoFactorModal: React.FC<TwoFactorModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  actionTitle = 'Verifikasi Dua Faktor (2FA) Administrator'
}) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  // Demo valid TOTP code
  const VALID_DEMO_CODE = '202699';

  if (!isOpen) return null;

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (code.trim().length !== 6) {
      setError('Masukkan 6-digit kode autentikasi yang valid.');
      return;
    }

    setIsVerifying(true);
    setTimeout(() => {
      // Allow demo code 202699 or any valid 6-digit code for testing convenience
      if (code === VALID_DEMO_CODE || code === '123456' || /^\d{6}$/.test(code)) {
        setIsVerifying(false);
        onSuccess();
        onClose();
        setCode('');
      } else {
        setIsVerifying(false);
        setError('Kode OTP salah atau kedaluwarsa. Silakan periksa kembali aplikasi Authenticator Anda.');
      }
    }, 400);
  };

  const handleFillDemoCode = () => {
    setCode(VALID_DEMO_CODE);
    setError('');
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100">{actionTitle}</h3>
            <p className="text-xs text-slate-400">Tindakan administratif memerlukan otentikasi lapis kedua (2FA/TOTP).</p>
          </div>
        </div>

        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Kode Verifikasi 6-Digit:
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                placeholder="202699"
                autoFocus
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-center text-lg font-mono font-bold tracking-widest text-slate-100 focus:border-teal-500 focus:outline-none"
              />
            </div>
            {error && (
              <div className="flex items-center space-x-1.5 mt-2 text-rose-400 text-xs">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Demo helper banner */}
          <div className="p-3 rounded-xl bg-slate-800/70 border border-slate-700/80 text-xs text-slate-400 flex items-center justify-between">
            <span>
              Kode Uji Coba Default: <strong className="font-mono text-teal-300">{VALID_DEMO_CODE}</strong>
            </span>
            <button
              type="button"
              onClick={handleFillDemoCode}
              className="text-[11px] font-bold text-teal-400 hover:text-teal-300 underline cursor-pointer"
            >
              Pakai Kode
            </button>
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isVerifying}
              className="flex-1 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold shadow-lg shadow-teal-900/40 flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
            >
              {isVerifying ? (
                <span>Memverifikasi...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Verifikasi & Lanjutkan</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
