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
    setSelectedLeadId,
    setIsCommandPaletteOpen,
    notifications,
    unreadNotificationsCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
  } = useApp();

  const [currentTime, setCurrentTime] = useState<string>('');
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showThemeDropdown, setShowThemeDropdown] = useState(false);
  const [showNotificationPopover, setShowNotificationPopover] = useState(false);

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
    operasional: 'bg-teal-500/10 text-teal-400 border-teal-500/30',
    admin: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  };

  const accentClasses: Record<string, string> = {
    teal: 'bg-teal-500 text-white',
    sky: 'bg-sky-500 text-white',
    emerald: 'bg-emerald-500 text-white',
    amber: 'bg-amber-500 text-white',
  };

  return (
    <header className="sticky top-0 z-40 apple-header border-b border-[var(--border-color)] px-4 py-2.5 transition-colors">
      <div className="w-full flex flex-wrap items-center justify-between gap-3 min-h-[44px]">
        
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
                <span className="font-black tracking-tight text-xl md:text-2xl bg-gradient-to-r from-teal-300 via-cyan-200 to-emerald-300 bg-clip-text text-transparent drop-shadow-sm font-sans" style={{ letterSpacing: '-0.02em' }}>
                  IsoTrack
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block font-medium">PT Niaga Segara Trasindo</p>
            </div>
          </div>

          <div className="h-5 w-px bg-slate-800 hidden md:block" />

          {/* Live System Clock */}
          <div className="hidden lg:flex items-center space-x-1.5 bg-slate-800/60 border border-slate-700/50 rounded-lg px-3 py-1.5 text-xs text-slate-300 font-mono tabular-nums min-h-[36px]">
            <Clock className="w-3.5 h-3.5 text-teal-400 animate-pulse" />
            <span>{currentTime}</span>
          </div>

          {/* Quick Global Search Bar Trigger (Cmd+K) */}
          <button
            onClick={() => setIsCommandPaletteOpen(true)}
            className="hidden md:flex items-center space-x-2 bg-slate-800/80 hover:bg-slate-700/90 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 transition-all shadow-sm ml-2"
            title="Pencarian Global & Command Palette (Ctrl/Cmd + K)"
            aria-label="Pencarian Global (Ctrl atau Cmd + K)"
          >
            <span className="text-[11px]">Cari transaksi, aset, PIC...</span>
            <kbd className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-[10px] font-mono text-slate-300">⌘K</kbd>
          </button>
        </div>

        {/* Right: Actions, Notifications, Google SSO, Role Switcher, Language & Theme */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          
          {/* Mobile Search Button */}
          <button
            onClick={() => setIsCommandPaletteOpen(true)}
            className="md:hidden min-h-[40px] min-w-[40px] p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 flex items-center justify-center border border-slate-700"
            title="Pencarian Cepat"
            aria-label="Buka pencarian cepat"
          >
            <span className="text-xs font-mono font-bold text-teal-400">⌘K</span>
          </button>

          {/* In-App Notification Center Popover */}
          <div className="relative">
            <button
              onClick={() => setShowNotificationPopover(!showNotificationPopover)}
              className="relative min-h-[44px] min-w-[44px] p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors flex items-center justify-center border border-slate-700/80"
              title="Pusat Notifikasi In-App"
              aria-label="Buka pusat notifikasi"
            >
              <Bell className="w-4 h-4" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center animate-pulse tabular-nums shadow-md">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown Popover */}
            {showNotificationPopover && (
              <div
                className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden z-50 animate-fadeIn"
                style={{ transformOrigin: 'top right' }}
              >
                <div className="p-3.5 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-slate-100">Notifikasi In-App</span>
                    {unreadNotificationsCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-bold tabular-nums">
                        {unreadNotificationsCount} baru
                      </span>
                    )}
                  </div>
                  {unreadNotificationsCount > 0 && (
                    <button
                      onClick={markAllNotificationsAsRead}
                      className="text-[11px] text-teal-400 hover:text-teal-300 font-semibold"
                    >
                      Tandai semua dibaca
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60 p-1">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400">
                      Tidak ada notifikasi baru saat ini.
                    </div>
                  ) : (
                    notifications.map(notif => (
                      <div
                        key={notif.id}
                        onClick={() => {
                          markNotificationAsRead(notif.id);
                          if (notif.lead_id) {
                            setSelectedLeadId(notif.lead_id);
                            setShowNotificationPopover(false);
                          }
                        }}
                        className={`p-3 rounded-xl transition-all cursor-pointer flex items-start space-x-2.5 ${
                          !notif.read ? 'bg-slate-800/90 border border-teal-500/30' : 'hover:bg-slate-800/40 text-slate-400'
                        }`}
                      >
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold ${
                          notif.type === 'approval'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : notif.type === 'revision'
                            ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                            : notif.type === 'sla_warning'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                        }`}>
                          {notif.type === 'approval' ? '✓' : notif.type === 'revision' ? '!' : notif.type === 'sla_warning' ? '⏱' : 'i'}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-200 truncate">
                              {notif.title}
                            </span>
                            {!notif.read && (
                              <span className="w-2 h-2 rounded-full bg-teal-400 shrink-0 ml-1.5" />
                            )}
                          </div>
                          <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                            {notif.message}
                          </p>
                          <span className="text-[9px] text-slate-500 font-mono mt-1 block">
                            {new Date(notif.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

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
                className="min-h-[40px] px-2.5 rounded-lg bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/30 transition-all flex items-center space-x-1"
                title="Log Out / Keluar Akun Google"
                aria-label="Log out akun Google"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-[11px] font-bold hidden sm:inline">Log Out</span>
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenGoogleLogin}
              className="flex items-center space-x-1.5 min-h-[44px] px-3.5 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-teal-500/20"
              title="Log In dengan Akun Google"
              aria-label="Log in dengan Akun Google"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
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
              className={`flex items-center space-x-1.5 min-h-[44px] px-3 py-2 rounded-xl border text-xs font-semibold transition-all ${roleColors[currentUser.role]}`}
              title="Beralih Peran Pengguna (Demo Switcher)"
              aria-label="Pilih peran pengguna"
            >
              <Shield className="w-3.5 h-3.5" />
              <span className="capitalize">{currentUser.name.split(' ')[0]} ({currentUser.role})</span>
            </button>

            {showRoleDropdown && (
              <div className="absolute right-0 mt-2 w-64 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl p-2 z-50">
                <div className="px-2 py-1.5 text-[11px] font-bold text-amber-400 uppercase tracking-wider border-b border-slate-800 mb-1 flex items-center justify-between">
                  <span>[Mode Demo] Switch Role</span>
                  <span className="text-[9px] text-slate-500 font-normal">Akan dilepas saat auth real</span>
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
                  onClick={() => { switchUserRole('operasional'); setShowRoleDropdown(false); }}
                  className={`w-full text-left px-2.5 py-2 rounded-lg text-xs flex items-center justify-between hover:bg-slate-800 transition-colors ${currentUser.role === 'operasional' ? 'bg-slate-800 font-bold text-teal-400' : 'text-slate-300'}`}
                >
                  <div>
                    <div>Rian Utomo</div>
                    <div className="text-[10px] text-slate-500">Operasional Lapangan & Depo</div>
                  </div>
                  {currentUser.role === 'operasional' && <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />}
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
            className="min-h-[44px] min-w-[44px] px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-bold flex items-center justify-center space-x-1 border border-slate-700"
            title="Ganti Bahasa (Multi-Language)"
            aria-label="Ganti bahasa aplikasi"
          >
            <Globe className="w-3.5 h-3.5 text-teal-400" />
            <span className="uppercase">{language}</span>
          </button>

          {/* Dark / Light Mode Switch Toggle Button */}
          <div className="relative">
            <button
              onClick={() => setThemeMode(themeMode === 'dark' ? 'light' : 'dark')}
              className="flex items-center space-x-1 bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700/80 rounded-full p-1 shadow-sm transition-all cursor-pointer min-h-[40px]"
              title={themeMode === 'dark' ? 'Beralih ke Light Mode' : 'Beralih ke Dark Mode'}
              aria-label="Switch dark or light mode"
            >
              <div className={`p-1.5 rounded-full transition-all flex items-center justify-center ${themeMode === 'light' ? 'bg-teal-500 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}>
                <Sun className="w-4 h-4" />
              </div>
              <div className={`p-1.5 rounded-full transition-all flex items-center justify-center ${themeMode === 'dark' ? 'bg-teal-500 text-slate-950 shadow-sm font-bold' : 'text-slate-400 hover:text-slate-200'}`}>
                <Moon className="w-4 h-4" />
              </div>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
