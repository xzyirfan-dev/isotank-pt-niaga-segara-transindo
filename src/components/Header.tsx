import React, { useState, useEffect } from 'react';
import {
  Clock, Shield, User as UserIcon, Globe, Palette, LogIn, LogOut,
  Bell, CheckCircle2, AlertTriangle, Sparkles, Sun, Moon
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UserRole, AccentColor } from '../types';

interface HeaderProps {
  onOpenGoogleLogin: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenGoogleLogin }) => {
  const {
    currentUser,
    switchUserRole,
    isGoogleAuthenticated,
    googleAuthUser,
    setIsGoogleAuthenticated,
    setGoogleAuthUser,
    language,
    setLanguage,
    accentColor,
    setAccentColor,
    themeMode,
    setThemeMode,
    leads,
    setActiveView,
  } = useApp();

  const [currentTime, setCurrentTime] = useState<string>('');
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showThemeDropdown, setShowThemeDropdown] = useState(false);

  // Live real-time clock with seconds
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      };
      setCurrentTime(now.toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', options) + ' WIB');
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, [language]);

  // Calculate pending tasks count for current user
  const pendingTasksCount = leads.filter(lead => {
    if (currentUser.role === 'karyawan') {
      return (lead.pic_id === currentUser.id || lead.creator_id === currentUser.id) &&
             (lead.status === 'lead_created' || lead.status === 'in_progress' || lead.status === 'follow_up');
    }
    if (currentUser.role === 'manager') {
      return lead.status === 'lead_approval' || lead.status === 'final_approval';
    }
    if (currentUser.role === 'reviewer') {
      return lead.status === 'submission' || lead.status === 'review';
    }
    return true; // Admin sees all active
  }).length;

  const roleColors: Record<UserRole, string> = {
    karyawan: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    manager: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    reviewer: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    admin: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  };

  const accentClasses: Record<string, string> = {
    teal: 'bg-teal-500 text-white',
    sky: 'bg-sky-500 text-white',
    emerald: 'bg-emerald-500 text-white',
    amber: 'bg-amber-500 text-white',
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800/80 px-4 py-2.5 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        
        {/* Left: Brand Identity & Live Clock */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2.5">
            <img
              src="/assets/aistudio/nistrans-logo__1__d944a664.svg"
              alt="Nistrans Logo"
              className="h-9 w-auto object-contain shrink-0 filter drop-shadow-md"
            />
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-black tracking-tight text-xl md:text-2xl bg-gradient-to-r from-teal-300 via-cyan-200 to-emerald-300 bg-clip-text text-transparent drop-shadow-sm font-sans">
                  IsoTrack
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block font-medium">PT Niaga Segara Trasindo</p>
            </div>
          </div>

          <div className="h-5 w-px bg-slate-800 hidden md:block" />

          {/* Live System Clock */}
          <div className="hidden lg:flex items-center space-x-1.5 bg-slate-800/60 border border-slate-700/50 rounded-md px-2.5 py-1 text-xs text-slate-300 font-mono">
            <Clock className="w-3.5 h-3.5 text-teal-400 animate-pulse" />
            <span>{currentTime}</span>
          </div>
        </div>

        {/* Right: Actions, Google SSO, Role Switcher, Language & Theme */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          
          {/* Notifications / My Tasks quick badge */}
          <button
            onClick={() => setActiveView('my_tasks')}
            className="relative p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Tugas Saya Berperan"
          >
            <Bell className="w-4 h-4" />
            {pendingTasksCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-bounce">
                {pendingTasksCount}
              </span>
            )}
          </button>

          {/* Google Account Login/Logout Controls (Hanya Icon Gambar Akun & Logo Log In / Log Out) */}
          {isGoogleAuthenticated && googleAuthUser ? (
            <div className="flex items-center space-x-2 bg-slate-800/90 border border-slate-700/80 rounded-xl p-1 px-1.5 shadow-sm">
              {/* Icon Gambar Akun */}
              <img
                src={googleAuthUser.picture || currentUser.avatar}
                alt={googleAuthUser.name}
                className="w-8 h-8 rounded-full border-2 border-teal-400 object-cover shadow-sm cursor-pointer"
                title={`Akun Login: ${googleAuthUser.name} (${googleAuthUser.email})`}
              />

              {/* Logo / Tombol Log Out */}
              <button
                onClick={() => {
                  setIsGoogleAuthenticated(false);
                  setGoogleAuthUser(null);
                }}
                className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/30 transition-all flex items-center space-x-1"
                title="Log Out / Keluar Akun Google"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-[11px] font-bold hidden sm:inline">Log Out</span>
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenGoogleLogin}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-teal-500/20"
              title="Log In dengan Akun Google"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <LogIn className="w-3.5 h-3.5" />
              <span>Log In</span>
            </button>
          )}

          {/* Quick Role Switcher (For Demo & Evaluator) */}
          <div className="relative">
            <button
              onClick={() => setShowRoleDropdown(!showRoleDropdown)}
              className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all ${roleColors[currentUser.role]}`}
              title="Beralih Peran Pengguna (Demo Switcher)"
            >
              <Shield className="w-3.5 h-3.5" />
              <span className="capitalize">{currentUser.name.split(' ')[0]} ({currentUser.role})</span>
            </button>

            {showRoleDropdown && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl p-2 z-50">
                <div className="px-2 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 mb-1">
                  Beralih Peran (Evaluasi Demo)
                </div>
                <button
                  onClick={() => { switchUserRole('karyawan'); setShowRoleDropdown(false); }}
                  className={`w-full text-left px-2.5 py-2 rounded-lg text-xs flex items-center justify-between hover:bg-slate-800 transition-colors ${currentUser.role === 'karyawan' ? 'bg-slate-800 font-bold text-blue-400' : 'text-slate-300'}`}
                >
                  <div>
                    <div>Budi Santoso</div>
                    <div className="text-[10px] text-slate-500">Karyawan (PIC & Pembuat)</div>
                  </div>
                  {currentUser.role === 'karyawan' && <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />}
                </button>
                <button
                  onClick={() => { switchUserRole('manager'); setShowRoleDropdown(false); }}
                  className={`w-full text-left px-2.5 py-2 rounded-lg text-xs flex items-center justify-between hover:bg-slate-800 transition-colors ${currentUser.role === 'manager' ? 'bg-slate-800 font-bold text-amber-400' : 'text-slate-300'}`}
                >
                  <div>
                    <div>Probo Subagyo</div>
                    <div className="text-[10px] text-slate-500">Manager Operasional Armada</div>
                  </div>
                  {currentUser.role === 'manager' && <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />}
                </button>
                <button
                  onClick={() => { switchUserRole('reviewer'); setShowRoleDropdown(false); }}
                  className={`w-full text-left px-2.5 py-2 rounded-lg text-xs flex items-center justify-between hover:bg-slate-800 transition-colors ${currentUser.role === 'reviewer' ? 'bg-slate-800 font-bold text-purple-400' : 'text-slate-300'}`}
                >
                  <div>
                    <div>Wawan Setiawan</div>
                    <div className="text-[10px] text-slate-500">Reviewer Quality & QA</div>
                  </div>
                  {currentUser.role === 'reviewer' && <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />}
                </button>
                <button
                  onClick={() => { switchUserRole('admin'); setShowRoleDropdown(false); }}
                  className={`w-full text-left px-2.5 py-2 rounded-lg text-xs flex items-center justify-between hover:bg-slate-800 transition-colors ${currentUser.role === 'admin' ? 'bg-slate-800 font-bold text-emerald-400' : 'text-slate-300'}`}
                >
                  <div>
                    <div>Siti Aminah</div>
                    <div className="text-[10px] text-slate-500">Administrator Utama</div>
                  </div>
                  {currentUser.role === 'admin' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                </button>
              </div>
            )}
          </div>

          {/* Language Switcher */}
          <button
            onClick={() => setLanguage(language === 'id' ? 'en' : 'id')}
            className="px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-bold flex items-center space-x-1 border border-slate-700"
            title="Ganti Bahasa (Multi-Language)"
          >
            <Globe className="w-3.5 h-3.5 text-teal-400" />
            <span className="uppercase">{language}</span>
          </button>

          {/* Theme Mode & Accent Toggle */}
          <div className="relative">
            <button
              onClick={() => setShowThemeDropdown(!showThemeDropdown)}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
              title="Pengaturan Tema & Warna Aksen"
            >
              <Palette className="w-4 h-4 text-teal-400" />
            </button>

            {showThemeDropdown && (
              <div className="absolute right-0 mt-2 w-48 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl p-3 z-50">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Mode Tampilan
                </div>
                <div className="flex items-center justify-between bg-slate-800/80 rounded-lg p-1 mb-3">
                  <button
                    onClick={() => setThemeMode('dark')}
                    className={`flex-1 py-1 text-xs rounded-md flex items-center justify-center space-x-1 ${themeMode === 'dark' ? 'bg-slate-700 text-teal-400 font-bold' : 'text-slate-400'}`}
                  >
                    <Moon className="w-3 h-3" />
                    <span>Dark</span>
                  </button>
                  <button
                    onClick={() => setThemeMode('light')}
                    className={`flex-1 py-1 text-xs rounded-md flex items-center justify-center space-x-1 ${themeMode === 'light' ? 'bg-slate-200 text-slate-900 font-bold' : 'text-slate-400'}`}
                  >
                    <Sun className="w-3 h-3" />
                    <span>Light</span>
                  </button>
                </div>

                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Warna Aksen
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {(['teal', 'sky', 'emerald', 'amber'] as AccentColor[]).map(c => (
                    <button
                      key={c}
                      onClick={() => { setAccentColor(c); setShowThemeDropdown(false); }}
                      className={`h-7 rounded-lg border flex items-center justify-center text-[10px] uppercase font-bold transition-all ${c === 'teal' ? 'bg-teal-500/20 text-teal-400 border-teal-500' : c === 'sky' ? 'bg-sky-500/20 text-sky-400 border-sky-500' : c === 'emerald' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500' : 'bg-amber-500/20 text-amber-400 border-amber-500'}`}
                    >
                      {c[0]}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};
