import React, { useState, useMemo } from 'react';
import {
  LayoutDashboard, CheckSquare, Truck, PlusCircle, BarChart3,
  Sparkles, FileText, Settings, Users, ShieldCheck, Database, RefreshCw,
  ChevronLeft, ChevronRight, PanelLeftClose, PanelLeftOpen
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Sidebar: React.FC = () => {
  const { activeView, setActiveView, currentUser, leads, resetDemoData } = useApp();

  // Collapsed / Minimized sidebar state with localStorage persistence
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('isotrack_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const toggleCollapse = () => {
    setIsCollapsed(prev => {
      const next = !prev;
      try {
        localStorage.setItem('isotrack_sidebar_collapsed', String(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });
  };

  // Count my pending tasks
  const myPendingTasksCount = leads.filter(lead => {
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
    return lead.status !== 'closed';
  }).length;

  const navItems = React.useMemo(() => {
    switch (currentUser.role) {
      case 'karyawan':
        return [
          { id: 'dashboard', label: 'Dasbor Lead Saya', icon: LayoutDashboard },
          { id: 'my_tasks', label: 'Tugas & Revisi PIC', icon: CheckSquare, badge: myPendingTasksCount },
          { id: 'leads', label: 'Transaksi Lead', icon: Truck },
          { id: 'new_lead', label: 'Buat Lead Baru', icon: PlusCircle },
          { id: 'reports', label: 'Laporan & Pencapaian', icon: BarChart3 },
          { id: 'ai_recommendations', label: 'Rekomendasi Alur', icon: Sparkles, highlight: true },
        ];
      case 'manager':
        return [
          { id: 'dashboard', label: 'Dasbor Otorisasi', icon: LayoutDashboard },
          { id: 'my_tasks', label: 'Antrean Approval', icon: CheckSquare, badge: myPendingTasksCount },
          { id: 'leads', label: 'Transaksi Lead', icon: Truck },
          { id: 'reports', label: 'Evaluasi KPI Tim', icon: BarChart3 },
          { id: 'ai_recommendations', label: 'Rekomendasi Bottleneck', icon: Sparkles, highlight: true },
          { id: 'system_log', label: 'Audit Trail Sistem', icon: FileText },
        ];
      case 'reviewer':
        return [
          { id: 'dashboard', label: 'Dasbor Verifikasi', icon: LayoutDashboard },
          { id: 'my_tasks', label: 'Antrean Review & BASTP', icon: CheckSquare, badge: myPendingTasksCount },
          { id: 'leads', label: 'Transaksi Lead', icon: Truck },
          { id: 'reports', label: 'Laporan Kepatuhan', icon: BarChart3 },
          { id: 'system_log', label: 'Audit Berkas & Segel', icon: FileText },
        ];
      case 'operasional':
        return [
          { id: 'dashboard', label: 'Dasbor Operasional & Depo', icon: LayoutDashboard },
          { id: 'leads', label: 'Transaksi Lead', icon: Truck },
          { id: 'new_lead', label: 'Buat Lead Baru', icon: PlusCircle },
          { id: 'reports', label: 'Laporan Armada', icon: BarChart3 },
          { id: 'system_log', label: 'Log Aset & Depo', icon: FileText },
        ];
      case 'admin':
      default:
        return [
          { id: 'dashboard', label: 'Dasbor Ringkasan Sistem', icon: LayoutDashboard },
          { id: 'leads', label: 'Transaksi Lead', icon: Truck },
          { id: 'admin', label: 'Pengaturan & Master Data', icon: Settings },
          { id: 'system_log', label: 'Log Sistem (Audit)', icon: FileText },
          { id: 'reports', label: 'Laporan & Analytics', icon: BarChart3 },
          { id: 'ai_recommendations', label: 'Rekomendasi Cerdas', icon: Sparkles, highlight: true },
        ];
    }
  }, [currentUser.role, myPendingTasksCount]);

  return (
    <aside
      className={`h-full bg-[#064e3b] text-white border-r border-slate-700 flex flex-col justify-between shrink-0 transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-20 p-2.5' : 'w-64 p-4'
      }`}
    >
      <div className="space-y-4">
        
        {/* Toggle Minimize / Expand Header Bar */}
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} pb-1`}>
          {!isCollapsed && (
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-mono pl-1">
              MENU OPERASIONAL
            </span>
          )}
          <button
            type="button"
            onClick={toggleCollapse}
            className="w-8 h-8 rounded-xl bg-slate-800/80 hover:bg-teal-500 hover:text-slate-950 text-slate-300 border border-slate-700/60 transition-all shadow-sm active:scale-95 flex items-center justify-center shrink-0"
            title={isCollapsed ? 'Perluas Menu Side Bar' : 'Kecilkan Menu Side Bar'}
            aria-label={isCollapsed ? 'Perluas Menu Side Bar' : 'Kecilkan Menu Side Bar'}
          >
            {isCollapsed ? (
              <PanelLeftOpen className="w-4 h-4 text-teal-400" />
            ) : (
              <PanelLeftClose className="w-4 h-4 text-slate-300" />
            )}
          </button>
        </div>

        {/* Logged-In Employee Profile Banner */}
        {isCollapsed ? (
          /* Minimized Profile: Centered Avatar with Status Dot and Tooltip */
          <div className="flex justify-center py-1">
            <div
              className="relative group cursor-pointer"
              title={`${currentUser.name} (${currentUser.role.toUpperCase()})\n${currentUser.department}\n${currentUser.email}`}
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-10 h-10 rounded-xl object-cover border-2 border-teal-500/40 shadow-sm transition-transform group-hover:scale-105"
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-900" />
            </div>
          </div>
        ) : (
          /* Expanded Full Profile Banner */
          <div className="p-3 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/80 shadow-md">
            <div className="flex items-center space-x-2.5">
              {/* Sebelah kiri foto */}
              <div className="relative shrink-0">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-11 h-11 rounded-xl object-cover border-2 border-teal-500/40 shadow-sm"
                />
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-900" title="Status Google Sign-In Aktif" />
              </div>

              {/* Kanan */}
              <div className="min-w-0 flex-1 space-y-0.5">
                {/* Baris 1: Nama + Tag Karyawan di sebelah kanan nama */}
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[11px] font-extrabold text-slate-100 truncate leading-tight" title={currentUser.name}>
                    {currentUser.name}
                  </span>
                  <span className="px-1.5 py-0.2 rounded text-[8px] font-extrabold bg-teal-500/20 text-teal-300 uppercase border border-teal-500/30 shrink-0">
                    {currentUser.role}
                  </span>
                </div>

                {/* Baris 2: Jabatan */}
                <div className="text-[10px] font-semibold text-teal-400 truncate leading-tight" title={currentUser.department}>
                  {currentUser.department}
                </div>

                {/* Baris 3: Email Google Login */}
                <div className="text-[9px] text-slate-400 font-mono truncate leading-tight" title={currentUser.email}>
                  {currentUser.email}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Menu Links */}
        <nav className="space-y-1.5">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeView === item.id;

            if (isCollapsed) {
              /* Minimized Item: Icon Only with Floating Badge and Tooltip */
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id)}
                  title={item.label}
                  className={`w-full h-11 flex items-center justify-center rounded-xl transition-all relative group ${
                    isActive
                      ? 'bg-white/20 text-white font-bold'
                      : 'text-blue-100 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-blue-200'}`} />

                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-1 text-[9px] rounded-full font-black bg-rose-500 text-white flex items-center justify-center shadow-md">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            }

            /* Expanded Item: Icon + Full Label + Badge */
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                  isActive
                    ? 'bg-white/20 text-white font-bold'
                    : 'text-blue-100 hover:bg-white/10 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${isActive ? 'text-slate-950' : item.highlight ? 'text-teal-400' : 'text-slate-400'}`} />
                  <span className="truncate">{item.label}</span>
                </div>

                {item.badge !== undefined && item.badge > 0 && (
                  <span className={`px-2 py-0.5 text-[10px] rounded-full font-bold ${isActive ? 'bg-slate-950 text-teal-400' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Info & Demo Data Reset Button */}
      <div className="pt-3 border-t border-slate-800 space-y-2">
        {isCollapsed ? (
          /* Minimized Footer: Centered Icons with Tooltips */
          <div className="flex flex-col items-center space-y-2">
            <div
              className="w-9 h-9 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-400 border border-teal-500/20 cursor-help"
              title="SLA Guard Active - v3.2"
            >
              <ShieldCheck className="w-4 h-4" />
            </div>

            <button
              onClick={() => {
                if (confirm('Apakah Anda yakin ingin mengembalikan seluruh data transaksi ke kondisi awal demo?')) {
                  resetDemoData();
                }
              }}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-800/80 hover:bg-rose-500 hover:text-white text-slate-400 border border-slate-700/60 transition-colors shadow-sm"
              title="Reset Data Demo"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        ) : (
          /* Expanded Footer */
          <>
            <div className="flex items-center justify-between text-[11px] text-slate-400 px-2">
              <span className="flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                <span>SLA Guard Active</span>
              </span>
              <span className="text-[10px] font-mono text-slate-400">v3.2</span>
            </div>

            <button
              onClick={() => {
                if (confirm('Apakah Anda yakin ingin mengembalikan seluruh data transaksi ke kondisi awal demo?')) {
                  resetDemoData();
                }
              }}
              className="w-full flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-[11px] font-medium text-slate-300 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
              <span>Reset Data Demo</span>
            </button>
          </>
        )}
      </div>
    </aside>
  );
};

