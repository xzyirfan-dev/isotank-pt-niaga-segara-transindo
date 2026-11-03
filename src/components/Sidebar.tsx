import React, { useState, useMemo } from 'react';
import {
  LayoutDashboard, CheckSquare, Truck, PlusCircle, BarChart3,
  Sparkles, FileText, Settings, Users, ShieldCheck, Database, RefreshCw,
  PanelLeftClose, PanelLeftOpen, Shield, Bell
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Sidebar: React.FC = () => {
  const { activeView, setActiveView, currentUser, leads, resetDemoData, unreadNotificationsCount } = useApp();

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

  const navMenuItems = React.useMemo(() => {
    switch (currentUser.role) {
      case 'karyawan':
        return [
          { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
          { id: 'my_tasks', label: 'Tugas PIC', icon: CheckSquare, badge: myPendingTasksCount },
          { id: 'leads', label: 'Transactions', icon: Truck },
          { id: 'new_lead', label: 'Buat Lead', icon: PlusCircle },
          { id: 'reports', label: 'Statistics', icon: BarChart3 },
          { id: 'ai_recommendations', label: 'Rekomendasi AI', icon: Sparkles, highlight: true },
        ];
      case 'manager':
        return [
          { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
          { id: 'my_tasks', label: 'Approval Queue', icon: CheckSquare, badge: myPendingTasksCount },
          { id: 'leads', label: 'Transactions', icon: Truck },
          { id: 'reports', label: 'KPI & Statistics', icon: BarChart3 },
          { id: 'ai_recommendations', label: 'Bottleneck AI', icon: Sparkles, highlight: true },
        ];
      case 'reviewer':
        return [
          { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
          { id: 'my_tasks', label: 'Review & BASTP', icon: CheckSquare, badge: myPendingTasksCount },
          { id: 'leads', label: 'Transactions', icon: Truck },
          { id: 'reports', label: 'Kepatuhan SLA', icon: BarChart3 },
        ];
      case 'operasional':
        return [
          { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
          { id: 'leads', label: 'Transactions', icon: Truck },
          { id: 'new_lead', label: 'Buat Lead Baru', icon: PlusCircle },
          { id: 'reports', label: 'Armada & Depo', icon: BarChart3 },
        ];
      case 'admin':
      default:
        return [
          { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
          { id: 'leads', label: 'Transactions', icon: Truck },
          { id: 'reports', label: 'Statistics', icon: BarChart3 },
          { id: 'ai_recommendations', label: 'Rekomendasi AI', icon: Sparkles, highlight: true },
        ];
    }
  }, [currentUser.role, myPendingTasksCount]);

  const generalItems = React.useMemo(() => {
    const items = [];
    if (currentUser.role === 'admin' || currentUser.role === 'manager') {
      items.push({ id: 'admin', label: 'Settings', icon: Settings });
    }
    items.push({ id: 'system_log', label: 'Security & Audit', icon: Shield });
    return items;
  }, [currentUser.role]);

  return (
    <aside
      className={`h-full bg-[#0a1c13] text-[#e3ece6] flex flex-col justify-between shrink-0 transition-all duration-300 ease-in-out border-r border-[#142c1f] select-none ${
        isCollapsed ? 'w-20 p-3' : 'w-64 p-5'
      }`}
    >
      {/* Top section: Brand & Main Navigation */}
      <div className="flex flex-col min-h-0 flex-1">

        {/* ── Brand Header (Siohioma Style Asterisk + IsoTrack) ── */}
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} mb-6 pt-1`}>
          <div className="flex items-center gap-2.5">
            {/* 8-pointed Siohioma Starburst SVG */}
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#bef264] to-[#84cc16] flex items-center justify-center text-[#0a1c13] shadow-lg shadow-[#84cc16]/20 shrink-0">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M12 2L13.5 8.5L20 7L15.5 12L20 17L13.5 15.5L12 22L10.5 15.5L4 17L8.5 12L4 7L10.5 8.5L12 2Z" />
              </svg>
            </div>
            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="text-lg font-black tracking-tight text-white font-sans flex items-center gap-1">
                  IsoTrack
                </span>
                <span className="text-[10px] text-[#789d87] font-medium tracking-wide">
                  Niaga Segara Transindo
                </span>
              </div>
            )}
          </div>

          {!isCollapsed && (
            <button
              type="button"
              onClick={toggleCollapse}
              className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 text-[#88ac96] hover:text-white transition-all flex items-center justify-center shrink-0 active:scale-95"
              title="Kecilkan Menu Sidebar"
              aria-label="Kecilkan Menu Sidebar"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          )}
        </div>

        {isCollapsed && (
          <div className="flex justify-center mb-4">
            <button
              type="button"
              onClick={toggleCollapse}
              className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-[#88ac96] hover:text-white transition-all flex items-center justify-center active:scale-95"
              title="Perluas Menu Sidebar"
              aria-label="Perluas Menu Sidebar"
            >
              <PanelLeftOpen className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ── MENU Section ── */}
        <div className="flex-1 overflow-y-auto space-y-6 pr-0.5 custom-scrollbar">
          <div>
            {!isCollapsed && (
              <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#638771] px-3 mb-2.5 block">
                MENU
              </span>
            )}

            <nav className="space-y-1">
              {navMenuItems.map(item => {
                const Icon = item.icon;
                const isActive = activeView === item.id;

                if (isCollapsed) {
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveView(item.id)}
                      title={item.label}
                      className={`w-full h-11 flex items-center justify-center rounded-2xl transition-all duration-200 relative group ${
                        isActive
                          ? 'bg-[#153423] text-[#bef264] shadow-sm'
                          : 'text-[#8ba795] hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      {isActive && (
                        <span className="absolute left-0 top-2.5 bottom-2.5 w-1 bg-[#bef264] rounded-r-full" />
                      )}
                      <Icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${isActive ? 'text-[#bef264]' : 'text-[#8ba795]'}`} />
                      {item.badge !== undefined && item.badge > 0 && (
                        <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-1 text-[9px] rounded-full font-black bg-[#bef264] text-[#0a1c13] flex items-center justify-center shadow-md">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                }

                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveView(item.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-[13px] font-medium transition-all duration-200 group relative ${
                      isActive
                        ? 'bg-[#153423] text-white font-bold shadow-sm'
                        : 'text-[#8ba795] hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    {isActive && (
                      <span className="absolute -left-5 top-2 bottom-2 w-1.5 bg-[#bef264] rounded-r-full shadow-sm shadow-[#bef264]/40" />
                    )}
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                        isActive ? 'text-[#bef264]' : item.highlight ? 'text-[#bef264]' : 'text-[#8ba795] group-hover:text-white'
                      }`} />
                      <span className="truncate">{item.label}</span>
                    </div>

                    {item.badge !== undefined && item.badge > 0 && (
                      <span className={`px-2 py-0.5 text-[10px] rounded-full font-extrabold shadow-sm ${
                        isActive
                          ? 'bg-[#bef264] text-[#0a1c13]'
                          : 'bg-[#bef264]/20 text-[#bef264] border border-[#bef264]/30'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* ── GENERAL Section (Settings & Security) ── */}
          <div>
            {!isCollapsed && (
              <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#638771] px-3 mb-2.5 block">
                GENERAL
              </span>
            )}

            <nav className="space-y-1">
              {generalItems.map(item => {
                const Icon = item.icon;
                const isActive = activeView === item.id;

                if (isCollapsed) {
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveView(item.id)}
                      title={item.label}
                      className={`w-full h-11 flex items-center justify-center rounded-2xl transition-all duration-200 relative group ${
                        isActive
                          ? 'bg-[#153423] text-[#bef264] shadow-sm'
                          : 'text-[#8ba795] hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <Icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${isActive ? 'text-[#bef264]' : 'text-[#8ba795]'}`} />
                    </button>
                  );
                }

                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveView(item.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-[13px] font-medium transition-all duration-200 group relative ${
                      isActive
                        ? 'bg-[#153423] text-white font-bold shadow-sm'
                        : 'text-[#8ba795] hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    {isActive && (
                      <span className="absolute -left-5 top-2 bottom-2 w-1.5 bg-[#bef264] rounded-r-full shadow-sm shadow-[#bef264]/40" />
                    )}
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                        isActive ? 'text-[#bef264]' : 'text-[#8ba795] group-hover:text-white'
                      }`} />
                      <span className="truncate">{item.label}</span>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* ── Footer Controls: SLA Guard & Demo Reset ── */}
        <div className="pt-3 border-t border-[#142c1f] mt-2">
          {!isCollapsed ? (
            <div className="flex items-center justify-between text-[11px] text-[#789d87] px-2 mb-2">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#bef264]" />
                <span className="font-medium">SLA Guard Active</span>
              </span>
              <button
                onClick={() => {
                  if (confirm('Kembalikan seluruh data transaksi ke kondisi awal demo?')) {
                    resetDemoData();
                  }
                }}
                className="hover:text-white transition-colors"
                title="Reset Data Demo"
              >
                <RefreshCw className="w-3 h-3 text-[#789d87] hover:text-[#bef264]" />
              </button>
            </div>
          ) : (
            <div className="flex justify-center mb-1">
              <button
                onClick={() => {
                  if (confirm('Kembalikan seluruh data transaksi ke kondisi awal demo?')) {
                    resetDemoData();
                  }
                }}
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-[#789d87] hover:text-[#bef264] flex items-center justify-center transition-colors"
                title="Reset Data Demo"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* ── User Profile at Bottom (Matching Siohioma's bottom profile) ── */}
        <div className="pt-2">
          {isCollapsed ? (
            <div className="flex justify-center">
              <div
                className="relative cursor-pointer group"
                title={`${currentUser.name} (${currentUser.role})\n${currentUser.email}`}
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-10 h-10 rounded-full object-cover border-2 border-[#bef264]/40 shadow-sm transition-transform group-hover:scale-105"
                />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#bef264] border-2 border-[#0a1c13]" />
              </div>
            </div>
          ) : (
            <div className="p-2.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.07] border border-white/5 transition-all flex items-center gap-3">
              <div className="relative shrink-0">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-9 h-9 rounded-full object-cover border-2 border-[#bef264]/40 shadow-sm"
                />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#bef264] border-2 border-[#0a1c13]" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-white truncate leading-tight">
                  {currentUser.name}
                </div>
                <div className="text-[10px] text-[#789d87] truncate font-mono mt-0.5">
                  {currentUser.email}
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </aside>
  );
};
