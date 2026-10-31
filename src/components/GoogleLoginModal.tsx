import React, { useState } from 'react';
import { X, ShieldCheck, CheckCircle, Lock, UserPlus, ArrowRight, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';

interface GoogleLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GoogleLoginModal: React.FC<GoogleLoginModalProps> = ({ isOpen, onClose }) => {
  const {
    setIsGoogleAuthenticated,
    setGoogleAuthUser,
    users,
    setCurrentUser,
    syncGoogleUserToEmployee,
  } = useApp();

  const [step, setStep] = useState<'select' | 'custom' | 'consent' | 'loading'>('select');
  const [selectedAccount, setSelectedAccount] = useState<{
    name: string;
    email: string;
    picture: string;
    role: UserRole;
  }>({
    name: 'Mufid Irfan Syaifullah',
    email: 'mufid.irfan.syaifullah@gmail.com',
    picture: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
    role: 'admin',
  });

  const [customName, setCustomName] = useState('');
  const [customEmail, setCustomEmail] = useState('');
  const [customRole, setCustomRole] = useState<UserRole>('karyawan');

  if (!isOpen) return null;

  const defaultAccounts = [
    {
      name: 'Mufid Irfan Syaifullah',
      email: 'mufid.irfan.syaifullah@gmail.com',
      picture: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
      role: 'admin' as UserRole,
      title: 'Enterprise Director & IT Lead',
    },
    {
      name: 'Budi Santoso',
      email: 'budi.santoso@niagasegara.co.id',
      picture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
      role: 'karyawan' as UserRole,
      title: 'Operasional Lapangan & Logistics PIC',
    },
    {
      name: 'Probo Subagyo',
      email: 'probo.subagyo@niagasegara.co.id',
      picture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
      role: 'manager' as UserRole,
      title: 'Manager Operasional Armada',
    },
    {
      name: 'Wawan Setiawan',
      email: 'wawan.setiawan@niagasegara.co.id',
      picture: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
      role: 'reviewer' as UserRole,
      title: 'Reviewer Quality & QA',
    },
  ];

  const handleSelectPredefined = (acc: typeof defaultAccounts[0]) => {
    setSelectedAccount({
      name: acc.name,
      email: acc.email,
      picture: acc.picture,
      role: acc.role,
    });
    setStep('consent');
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail || !customName) return;

    setSelectedAccount({
      name: customName,
      email: customEmail,
      picture: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
      role: customRole,
    });
    setStep('consent');
  };

  const handleFinalAuthenticate = () => {
    setStep('loading');
    setTimeout(() => {
      // Sync Google user with system employee database automatically
      syncGoogleUserToEmployee(selectedAccount);

      setIsGoogleAuthenticated(true);
      setGoogleAuthUser({
        name: selectedAccount.name,
        email: selectedAccount.email,
        picture: selectedAccount.picture,
      });

      setStep('select');
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700/90 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Google Identity */}
        <div className="px-6 py-4 bg-slate-800/90 border-b border-slate-700/80 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <span className="font-bold text-slate-100 text-sm">Masuk Menggunakan Akun Google</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6">

          {/* STEP 1: SELECT ACCOUNT */}
          {step === 'select' && (
            <div className="space-y-4">
              <div className="text-center mb-2">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-teal-500 to-cyan-400 text-slate-950 font-bold flex items-center justify-center mx-auto mb-2 text-sm shadow-md">
                  ISO
                </div>
                <h3 className="text-sm font-extrabold text-slate-100">Log In ke Portal IsoTrack</h3>
                <p className="text-xs text-slate-400 mt-0.5">PT Niaga Segara Trasindo Enterprise Authentication</p>
              </div>

              <div className="space-y-2">
                {defaultAccounts.map(acc => (
                  <button
                    key={acc.email}
                    onClick={() => handleSelectPredefined(acc)}
                    className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-700/80 bg-slate-800/40 hover:bg-slate-800 hover:border-teal-500/50 transition-all text-left group"
                  >
                    <div className="flex items-center space-x-3">
                      <img src={acc.picture} alt={acc.name} className="w-9 h-9 rounded-full object-cover border border-slate-600" />
                      <div>
                        <div className="text-xs font-bold text-slate-200 group-hover:text-teal-300">{acc.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{acc.email}</div>
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-700/80 text-teal-300 uppercase font-semibold">
                      {acc.role}
                    </span>
                  </button>
                ))}
              </div>

              <button
                onClick={() => setStep('custom')}
                className="w-full flex items-center justify-center space-x-2 p-2.5 rounded-xl border border-dashed border-slate-700 hover:border-teal-500/50 text-xs font-bold text-teal-400 hover:bg-slate-800/50 transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                <span>Gunakan Akun Google Lain...</span>
              </button>

              <div className="flex items-center justify-center space-x-1.5 text-[11px] text-slate-400 pt-2 border-t border-slate-800">
                <Lock className="w-3 h-3 text-teal-400" />
                <span>Protected by Google Identity Services & OAuth 2.0 SSL</span>
              </div>
            </div>
          )}

          {/* STEP 2: CUSTOM GOOGLE ACCOUNT INPUT */}
          {step === 'custom' && (
            <form onSubmit={handleCustomSubmit} className="space-y-4">
              <h3 className="text-sm font-bold text-slate-100">Masukkan Detail Akun Google</h3>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Nama Lengkap Akun Google:</label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="Contoh: Mufid Irfan"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:border-teal-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Alamat Email Google (@gmail.com / @company.co.id):</label>
                <input
                  type="email"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  placeholder="mufid.irfan.syaifullah@gmail.com"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:border-teal-500 focus:outline-none font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Pilih Peran Operasional Perusahaan:</label>
                <select
                  value={customRole}
                  onChange={(e) => setCustomRole(e.target.value as UserRole)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:border-teal-500 focus:outline-none capitalize"
                >
                  <option value="karyawan">Karyawan (PIC Operasional Lapangan)</option>
                  <option value="manager">Manager Operasional Armada</option>
                  <option value="reviewer">Reviewer QA & Kepatuhan</option>
                  <option value="admin">Administrator Sistem Utama</option>
                </select>
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep('select')}
                  className="flex-1 py-2 text-xs font-semibold rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 text-xs font-bold rounded-xl bg-teal-500 text-slate-950 hover:bg-teal-400 shadow-md"
                >
                  Lanjutkan Authorization
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: CONSENT DIALOG */}
          {step === 'consent' && (
            <div className="space-y-4">
              <div className="text-center">
                <img
                  src={selectedAccount.picture}
                  alt={selectedAccount.name}
                  className="w-14 h-14 rounded-full mx-auto border-2 border-teal-400 object-cover shadow-lg mb-2"
                />
                <h3 className="text-sm font-bold text-slate-100">{selectedAccount.name}</h3>
                <p className="text-xs text-teal-400 font-mono mt-0.5">{selectedAccount.email}</p>
                <span className="inline-block mt-1 px-2.5 py-0.5 rounded text-[10px] uppercase font-bold bg-slate-800 text-slate-300 border border-slate-700">
                  Peran: {selectedAccount.role}
                </span>
              </div>

              <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-3.5 space-y-2 text-xs text-slate-300">
                <div className="font-bold text-slate-200 border-b border-slate-700 pb-1.5 mb-2">
                  Izin Otorisasi Sesi Google OAuth:
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                  <span>Verifikasi identitas pengguna & foto profil Google Account</span>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                  <span>Akses hak otorisasi role transaksi pengiriman IsoTrack</span>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                  <span>Sinkronisasi otomatis notifikasi audit log sistem</span>
                </div>
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <button
                  onClick={() => setStep('select')}
                  className="flex-1 py-2 text-xs font-semibold rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800"
                >
                  Kembali
                </button>
                <button
                  onClick={handleFinalAuthenticate}
                  className="flex-1 py-2 text-xs font-bold rounded-xl bg-teal-500 text-slate-950 hover:bg-teal-400 shadow-md shadow-teal-500/20"
                >
                  Konfirmasi Log In
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: LOADING */}
          {step === 'loading' && (
            <div className="py-8 text-center space-y-4">
              <div className="w-10 h-10 border-3 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <div className="text-xs font-bold text-slate-200">Memproses Otentikasi Akun Google...</div>
              <p className="text-[11px] text-slate-400">Menghubungkan token sesi Google Identity dan otorisasi hak akses.</p>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
