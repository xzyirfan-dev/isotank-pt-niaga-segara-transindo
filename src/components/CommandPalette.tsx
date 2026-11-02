import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Search, Truck, Shield, LayoutDashboard, PlusCircle, BarChart3,
  Settings, CheckSquare, FileText, ArrowRight, CornerDownLeft, Sparkles, X, User
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface PaletteItem {
  id: string;
  category: string;
  title: string;
  subtitle: string;
  icon: any;
  action: () => void;
  badge?: string;
}

export const CommandPalette: React.FC = () => {
  const {
    isCommandPaletteOpen,
    setIsCommandPaletteOpen,
    leads,
    assets,
    users,
    setActiveView,
    setSelectedLeadId,
    currentUser,
  } = useApp();

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut listener: Cmd+K or Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(!isCommandPaletteOpen);
      }
      if (e.key === 'Escape' && isCommandPaletteOpen) {
        setIsCommandPaletteOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandPaletteOpen, setIsCommandPaletteOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isCommandPaletteOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isCommandPaletteOpen]);

  // Command items calculation
  const searchResults = useMemo<PaletteItem[]>(() => {
    const q = query.trim().toLowerCase();

    // 1. Navigation Actions
    const navActions: PaletteItem[] = [
      {
        id: 'act-dashboard',
        category: 'Aksi Cepat',
        title: 'Buka Dasbor Utama',
        subtitle: 'Navigasi ke panel kendali eksekutif & alur kerja',
        icon: LayoutDashboard,
        action: () => { setActiveView('dashboard'); setIsCommandPaletteOpen(false); },
      },
      {
        id: 'act-new-lead',
        category: 'Aksi Cepat',
        title: '+ Buat Transaksi Lead Baru',
        subtitle: 'Inisiasi lead & penugasan transporter armada',
        icon: PlusCircle,
        action: () => { setActiveView('new_lead'); setIsCommandPaletteOpen(false); },
      },
      {
        id: 'act-tasks',
        category: 'Aksi Cepat',
        title: 'Buka Antrean Tugas Saya',
        subtitle: `Tugas spesifik untuk peran ${currentUser.role}`,
        icon: CheckSquare,
        action: () => { setActiveView('my_tasks'); setIsCommandPaletteOpen(false); },
      },
      {
        id: 'act-leads',
        category: 'Aksi Cepat',
        title: 'Daftar Transaksi Lead (Tabel & Kanban)',
        subtitle: 'Manajemen 8 alur tahap operasional',
        icon: Truck,
        action: () => { setActiveView('leads'); setIsCommandPaletteOpen(false); },
      },
      {
        id: 'act-reports',
        category: 'Aksi Cepat',
        title: 'Laporan & Analytics Selesai',
        subtitle: 'Unduh laporan PDF & Excel resmi',
        icon: BarChart3,
        action: () => { setActiveView('reports'); setIsCommandPaletteOpen(false); },
      },
      {
        id: 'act-settings',
        category: 'Aksi Cepat',
        title: 'Pengaturan & Master Data',
        subtitle: 'Konfigurasi tipe isotank, kriteria closing & SLA',
        icon: Settings,
        action: () => { setActiveView('admin'); setIsCommandPaletteOpen(false); },
      },
    ];

    if (!q) {
      return navActions.slice(0, 5);
    }

    const filteredActions = navActions.filter(a =>
      a.title.toLowerCase().includes(q) || a.subtitle.toLowerCase().includes(q)
    );

    // 2. Leads search
    const filteredLeads = leads
      .filter(l =>
        l.lead_code.toLowerCase().includes(q) ||
        l.no_surat_jalan.toLowerCase().includes(q) ||
        (l.client_company && l.client_company.toLowerCase().includes(q)) ||
        l.muatan.toLowerCase().includes(q) ||
        l.pic_name.toLowerCase().includes(q) ||
        l.asset_code.toLowerCase().includes(q)
      )
      .slice(0, 5)
      .map(l => ({
        id: `lead-${l.id}`,
        category: 'Transaksi Lead',
        title: `${l.lead_code} · ${l.no_surat_jalan}`,
        subtitle: `${l.client_company || 'Klien'} — ${l.muatan} (${l.asal} → ${l.tujuan})`,
        badge: `Stage ${l.current_step}`,
        icon: Truck,
        action: () => {
          setSelectedLeadId(l.id);
          setIsCommandPaletteOpen(false);
        },
      }));

    // 3. Assets search
    const filteredAssets = assets
      .filter(a =>
        a.code.toLowerCase().includes(q) ||
        a.type.toLowerCase().includes(q) ||
        a.location.toLowerCase().includes(q) ||
        a.status.toLowerCase().includes(q)
      )
      .slice(0, 3)
      .map(a => ({
        id: `asset-${a.id}`,
        category: 'Unit Isotank',
        title: `${a.code} (${a.type})`,
        subtitle: `Kapasitas: ${a.capacity} · Lokasi: ${a.location}`,
        badge: a.status,
        icon: Shield,
        action: () => {
          setActiveView('admin');
          setIsCommandPaletteOpen(false);
        },
      }));

    // 4. Users / PIC search
    const filteredUsers = users
      .filter(u =>
        u.name.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q)
      )
      .slice(0, 3)
      .map(u => ({
        id: `user-${u.id}`,
        category: 'Karyawan & PIC',
        title: `${u.name} (${u.role.toUpperCase()})`,
        subtitle: `${u.department} · ${u.email}`,
        badge: u.role,
        icon: User,
        action: () => {
          setActiveView('admin');
          setIsCommandPaletteOpen(false);
        },
      }));

    return [...filteredActions, ...filteredLeads, ...filteredAssets, ...filteredUsers];
  }, [query, leads, assets, users, currentUser, setActiveView, setSelectedLeadId, setIsCommandPaletteOpen]);

  // Handle keyboard navigation inside the palette
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < searchResults.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : searchResults.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (searchResults[selectedIndex]) {
        searchResults[selectedIndex].action();
      }
    }
  };

  if (!isCommandPaletteOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Pencarian Cepat & Command Palette"
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-start justify-center pt-16 md:pt-24 p-4 animate-fadeIn"
      onClick={() => setIsCommandPaletteOpen(false)}
    >
      <div
        className="w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: 'appleScaleIn 0.25s var(--ease-apple-spring)' }}
      >
        {/* Search Bar Input */}
        <div className="relative border-b border-slate-800 flex items-center px-4 py-3 bg-slate-900/90">
          <Search className="w-5 h-5 text-teal-400 mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Ketik pencarian: kode lead, no surat jalan, isotank, PIC, atau aksi..."
            className="w-full bg-transparent text-sm font-medium text-slate-100 placeholder:text-slate-500 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 mr-2"
              title="Bersihkan input"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] font-mono text-slate-400">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-[380px] overflow-y-auto p-2 divide-y divide-slate-800/40">
          {searchResults.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 space-y-1">
              <p className="font-semibold text-slate-300">Tidak ada hasil ditemukan untuk "{query}"</p>
              <p className="text-slate-500">Coba gunakan nomor surat jalan, nama supir, atau kode isotank (misal: ISO-20T).</p>
            </div>
          ) : (
            searchResults.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={item.action}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`p-3 rounded-xl flex items-center justify-between cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-teal-500/15 border border-teal-500/40 text-slate-100'
                      : 'hover:bg-slate-800/60 text-slate-300'
                  }`}
                >
                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      isSelected ? 'bg-teal-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold truncate text-slate-100">
                          {item.title}
                        </span>
                        {item.badge && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-slate-800 text-teal-300 border border-slate-700 shrink-0">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 truncate">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0 ml-3">
                    <span className="text-[10px] text-slate-500 hidden sm:inline font-medium uppercase tracking-wider">
                      {item.category}
                    </span>
                    {isSelected && (
                      <CornerDownLeft className="w-3.5 h-3.5 text-teal-400" />
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts helper */}
        <div className="px-4 py-2 bg-slate-950/80 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="flex items-center space-x-1">
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] font-mono text-slate-300">&uarr;&darr;</kbd>
              <span>Navigasi</span>
            </span>
            <span className="flex items-center space-x-1">
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] font-mono text-slate-300">&crarr;</kbd>
              <span>Buka</span>
            </span>
          </div>
          <span className="font-mono text-slate-500 text-[10px]">
            IsoTrack Command Engine
          </span>
        </div>
      </div>
    </div>
  );
};
