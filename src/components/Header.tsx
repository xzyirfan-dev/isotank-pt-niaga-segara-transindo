import React, { useState, useEffect } from 'react';
import {
  Clock, Shield, User as UserIcon, Globe, Palette, LogIn, LogOut,
  Bell, CheckCircle2, AlertTriangle, Sparkles, Sun, Moon, Search,
  ChevronDown, Plus, PlusCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';

interface HeaderProps {
  onOpenGoogleLogin: () => void;
  onOpenNewLead?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenGoogleLogin, onOpenNewLead }) => {
  const {
    currentUser,
    switchUserRole,
    isGoogleAuthenticated,
    googleAuthUser,
    setIsGoogleAuthenticated,
    setGoogleAuthUser,
    language,
    setLanguage,
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

  const roleLabels: Record<UserRole, string> = {
    karyawan: 'Sales & PIC Admin',
    manager: 'Operations Manager',
    reviewer: 'QA & Compliance',
    operasional: 'Depo & Fleet Ops',
    admin: 'System Admin',
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-gray-100 dark:border-slate-800/80 px-6 py-3 transition-colors">
      <div className="w-full flex items-center justify-between gap-4">
        
        {/* ── Left Side: Siohioma Style Role Dropdown ── */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="relative">
            <button
              onClick={() => setShowRoleDropdown(!showRoleDropdown)}
              className="flex items-center gap-2 text-base md:text-lg font-black text-gray-900 dark:text-white hover:text-emerald-700 dark:hover:text-[#bef264] transition-colors"
            >
              <span>{roleLabels[currentUser.role] || 'Sales Admin'}</span>
              <ChevronDown className="w-4 h-4 text-gray-500 transition-transform" />
            </button>

            {/* Role Switcher Menu */}
            {showRoleDropdown && (
              <div className="absolute left-0 mt-2 w-64 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-2xl p-2 z-50 animate-fadeIn">
                <div className="px-3 py-1.5 text-[11px] font-bold text-emerald-700 dark:text-[#bef264] uppercase tracking-wider border-b border-gray-100 dark:border-slate-800 mb-1 flex items-center justify-between">
                  <span>[Mode Demo] Switch Peran</span>
                  <span className="text-[9px] text-gray-400 font-normal">Pilih PIC</span>
                </div>
                <button
                  onClick={() => { switchUserRole('karyawan'); setShowRoleDropdown(false); }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors ${currentUser.role === 'karyawan' ? 'bg-emerald-50 dark:bg-slate-800 font-bold text-emerald-800 dark:text-[#bef264]' : 'text-gray-700 dark:text-slate-300'}`}
                >
                  <div>
                    <div className="font-semibold">Budi Santoso</div>
                    <div className="text-[10px] text-gray-400">Sales & PIC Pembuat</div>
                  </div>
                  {currentUser.role === 'karyawan' && <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-[#bef264]" />}
                </button>
                <button
                  onClick={() => { switchUserRole('manager'); setShowRoleDropdown(false); }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors ${currentUser.role === 'manager' ? 'bg-emerald-50 dark:bg-slate-800 font-bold text-emerald-800 dark:text-[#bef264]' : 'text-gray-700 dark:text-slate-300'}`}
                >
                  <div>
                    <div className="font-semibold">Probo Subagyo</div>
                    <div className="text-[10px] text-gray-400">Manager Operasional Armada</div>
                  </div>
                  {currentUser.role === 'manager' && <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-[#bef264]" />}
                </button>
                <button
                  onClick={() => { switchUserRole('reviewer'); setShowRoleDropdown(false); }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors ${currentUser.role === 'reviewer' ? 'bg-emerald-50 dark:bg-slate-800 font-bold text-emerald-800 dark:text-[#bef264]' : 'text-gray-700 dark:text-slate-300'}`}
                >
                  <div>
                    <div className="font-semibold">Wawan Setiawan</div>
                    <div className="text-[10px] text-gray-400">Reviewer Quality & QA BASTP</div>
                  </div>
                  {currentUser.role === 'reviewer' && <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-[#bef264]" />}
                </button>
                <button
                  onClick={() => { switchUserRole('operasional'); setShowRoleDropdown(false); }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors ${currentUser.role === 'operasional' ? 'bg-emerald-50 dark:bg-slate-800 font-bold text-emerald-800 dark:text-[#bef264]' : 'text-gray-700 dark:text-slate-300'}`}
                >
                  <div>
                    <div className="font-semibold">Rian Utomo</div>
                    <div className="text-[10px] text-gray-400">Operasional Depo & Lapangan</div>
                  </div>
                  {currentUser.role === 'operasional' && <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-[#bef264]" />}
                </button>
                <button
                  onClick={() => { switchUserRole('admin'); setShowRoleDropdown(false); }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors ${currentUser.role === 'admin' ? 'bg-emerald-50 dark:bg-slate-800 font-bold text-emerald-800 dark:text-[#bef264]' : 'text-gray-700 dark:text-slate-300'}`}
                >
                  <div>
                    <div className="font-semibold">Siti Aminah</div>
                    <div className="text-[10px] text-gray-400">Administrator Utama</div>
                  </div>
                  {currentUser.role === 'admin' && <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-[#bef264]" />}
                </button>
              </div>
            )}
          </div>

          {/* Subtle Live Clock */}
          <div className="hidden xl:flex items-center gap-1.5 text-xs text-gray-400 dark:text-slate-500 font-mono">
            <Clock className="w-3.5 h-3.5" />
            <span>{currentTime}</span>
          </div>
        </div>

        {/* ── Center: Siohioma Style Pill Search Bar ── */}
        <div className="flex-1 max-w-md mx-2">
          <button
            onClick={() => setIsCommandPaletteOpen(true)}
            className="w-full flex items-center justify-between bg-[#f4f6f4] dark:bg-slate-800/80 hover:bg-[#ebefeb] dark:hover:bg-slate-800 rounded-full px-4 py-2 text-xs text-gray-400 dark:text-slate-400 border border-transparent hover:border-gray-200 dark:hover:border-slate-700 transition-all shadow-inner"
            title="Cari transaksi, kontainer, klien (Cmd/Ctrl + K)"
          >
            <div className="flex items-center gap-2.5 truncate">
              <Search className="w-4 h-4 text-gray-400 shrink-0" />
              <span className="truncate">Search anything in IsoTrack...</span>
            </div>
            <kbd className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-white dark:bg-slate-700 text-[10px] font-mono text-gray-500 dark:text-slate-300 shadow-sm border border-gray-200 dark:border-slate-600">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* ── Right Side: Action Icons & 'Add new lead' Pill Button ── */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">

          {/* Quick Notification Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotificationPopover(!showNotificationPopover)}
              className="w-9 h-9 rounded-full bg-[#f4f6f4] dark:bg-slate-800 hover:bg-[#ebefeb] dark:hover:bg-slate-700 text-gray-600 dark:text-slate-300 flex items-center justify-center transition-colors relative"
              title="Notifikasi"
            >
              <Bell className="w-4 h-4" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#bef264] text-[#0a1c13] text-[9px] font-black flex items-center justify-center shadow-sm">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>

            {/* Notification Popover */}
            {showNotificationPopover && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-2xl overflow-hidden z-50 animate-fadeIn">
                <div className="p-3.5 bg-gray-50 dark:bg-slate-950 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-900 dark:text-white">Pusat Notifikasi</span>
                  {unreadNotificationsCount > 0 && (
                    <button
                      onClick={markAllNotificationsAsRead}
                      className="text-[11px] text-emerald-700 dark:text-[#bef264] hover:underline font-semibold"
                    >
                      Tandai dibaca
                    </button>
                  )}
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-gray-100 dark:divide-slate-800 p-1">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-xs text-gray-400">Tidak ada notifikasi baru</div>
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
                        className={`p-3 rounded-xl transition-all cursor-pointer ${!notif.read ? 'bg-[#f4fbf4] dark:bg-emerald-950/20' : 'hover:bg-gray-50 dark:hover:bg-slate-800/50'}`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-gray-800 dark:text-slate-200">{notif.title}</span>
                          {!notif.read && <span className="w-2 h-2 rounded-full bg-[#84cc16]" />}
                        </div>
                        <p className="text-[11px] text-gray-600 dark:text-slate-400 mt-0.5">{notif.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Language Switcher */}
          <button
            onClick={() => setLanguage(language === 'id' ? 'en' : 'id')}
            className="w-9 h-9 rounded-full bg-[#f4f6f4] dark:bg-slate-800 hover:bg-[#ebefeb] dark:hover:bg-slate-700 text-gray-600 dark:text-slate-300 text-xs font-extrabold flex items-center justify-center uppercase transition-colors"
            title="Ganti Bahasa"
          >
            {language}
          </button>

          {/* Theme Mode Toggle (Sun / Moon) */}
          <button
            onClick={() => setThemeMode(themeMode === 'dark' ? 'light' : 'dark')}
            className="w-9 h-9 rounded-full bg-[#f4f6f4] dark:bg-slate-800 hover:bg-[#ebefeb] dark:hover:bg-slate-700 text-gray-600 dark:text-slate-300 flex items-center justify-center transition-colors"
            title={themeMode === 'dark' ? 'Light Mode' : 'Dark Mode'}
          >
            {themeMode === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-gray-600" />}
          </button>

          {/* Google SSO button */}
          {isGoogleAuthenticated && googleAuthUser ? (
            <div className="flex items-center gap-1.5 pl-1">
              <img
                src={googleAuthUser.picture || currentUser.avatar}
                alt={googleAuthUser.name}
                className="w-8 h-8 rounded-full border-2 border-[#bef264] object-cover"
                title={googleAuthUser.name}
              />
              <button
                onClick={() => {
                  setIsGoogleAuthenticated(false);
                  setGoogleAuthUser(null);
                }}
                className="text-[11px] text-gray-400 hover:text-red-500"
                title="Log Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenGoogleLogin}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold text-gray-700 dark:text-slate-200 transition-all"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Google Sign-In</span>
            </button>
          )}

          {/* ── Siohioma Style Prominent Pill Button: 'Add new lead' ── */}
          <button
            onClick={() => {
              if (onOpenNewLead) {
                onOpenNewLead();
              } else {
                setActiveView('new_lead');
              }
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#0a1c13] hover:bg-[#142c1f] dark:bg-[#bef264] dark:hover:bg-[#a3e635] text-white dark:text-[#0a1c13] text-xs font-extrabold transition-all shadow-md active:scale-95 shrink-0"
          >
            <span>Add new lead</span>
            <div className="w-4 h-4 rounded-full bg-white/20 dark:bg-[#0a1c13]/20 flex items-center justify-center">
              <Plus className="w-3 h-3 stroke-[3]" />
            </div>
          </button>

        </div>

      </div>
    </header>
  );
};
