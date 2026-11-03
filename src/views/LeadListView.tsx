import React, { useState, useMemo, useEffect } from 'react';
import {
  Truck, Search, Filter, PlusCircle, Clock, CheckCircle2, AlertTriangle,
  RotateCcw, FileText, ChevronRight, User as UserIcon, ArrowUpDown,
  Kanban, Table, CheckSquare, Square, Download, Users, Shield, Info, Eye
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { STAGE_LIST } from '../data/stageConfig';
import { LeadStatus } from '../types';

interface LeadListViewProps {
  onOpenNewLead: () => void;
}

export const LeadListView: React.FC<LeadListViewProps> = ({ onOpenNewLead }) => {
  const {
    filteredLeads,
    setSelectedLeadId,
    users,
    currentUser,
    leadViewMode,
    setLeadViewMode,
    savedFilterPresets,
    activePresetFilterId,
    applySavedPreset,
    bulkTransitionStage,
    bulkAssignPic,
    transitionLeadStage,
  } = useApp();

  const [activeStageFilter, setActiveStageFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [picFilter, setPicFilter] = useState<string>('all');
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
  const [selectedBulkPicId, setSelectedBulkPicId] = useState<string>('');
  const [hoveredLeadId, setHoveredLeadId] = useState<string | null>(null);
  const [infoStageTooltip, setInfoStageTooltip] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const LEADS_PER_VIEW = 10;

  // Filter leads based on chips, search, PIC, and saved presets
  const displayedLeads = useMemo(() => {
    return filteredLeads.filter((lead) => {
      // Saved Preset filter logic
      if (activePresetFilterId) {
        const preset = savedFilterPresets.find(p => p.id === activePresetFilterId);
        if (preset) {
          if (preset.slaUrgentOnly) {
            const isLate = lead.sla_hours_actual && lead.sla_hours_target && lead.sla_hours_actual > lead.sla_hours_target;
            const diffHours = (lead.sla_hours_target || 48) - (lead.sla_hours_actual || 0);
            if (!isLate && diffHours > 12) return false;
          }
          if (preset.depoFilter) {
            if (!lead.asal.toLowerCase().includes(preset.depoFilter) && !lead.tujuan.toLowerCase().includes(preset.depoFilter)) {
              return false;
            }
          }
          if (preset.muatanFilter) {
            if (preset.muatanFilter === 'chemical' && !lead.muatan.toLowerCase().includes('kimia') && !lead.muatan.toLowerCase().includes('caustic') && !lead.muatan.toLowerCase().includes('acid')) {
              return false;
            }
          }
          if (preset.stageFilter) {
            if (lead.status !== preset.stageFilter && lead.status !== 'final_approval') {
              return false;
            }
          }
        }
      }

      // Stage chip filter
      if (activeStageFilter !== 'all' && lead.status !== activeStageFilter) {
        return false;
      }
      // PIC filter
      if (picFilter !== 'all' && lead.pic_id !== picFilter) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchCode = (lead.lead_code || '').toLowerCase().includes(q);
        const matchSJ = lead.no_surat_jalan.toLowerCase().includes(q);
        const matchClient = (lead.client_company || '').toLowerCase().includes(q);
        const matchVendor = (lead.transport_vendor_name || '').toLowerCase().includes(q);
        const matchSupir = (lead.nama_supir || '').toLowerCase().includes(q);
        const matchPlat = (lead.no_plat_truk || '').toLowerCase().includes(q);
        const matchAsset = lead.asset_code.toLowerCase().includes(q);
        const matchAsal = lead.asal.toLowerCase().includes(q);
        const matchTujuan = lead.tujuan.toLowerCase().includes(q);
        const matchMuatan = lead.muatan.toLowerCase().includes(q);
        const matchPic = lead.pic_name.toLowerCase().includes(q);
        if (!matchCode && !matchSJ && !matchClient && !matchVendor && !matchSupir && !matchPlat && !matchAsset && !matchAsal && !matchTujuan && !matchMuatan && !matchPic) {
          return false;
        }
      }
      return true;
    });
  }, [filteredLeads, activeStageFilter, picFilter, searchQuery, activePresetFilterId, savedFilterPresets]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeStageFilter, picFilter, searchQuery, activePresetFilterId]);

  const totalPages = Math.ceil(displayedLeads.length / LEADS_PER_VIEW) || 1;
  const startIndex = (currentPage - 1) * LEADS_PER_VIEW;
  const paginatedLeads = displayedLeads.slice(startIndex, startIndex + LEADS_PER_VIEW);

  const handleScrollUp = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
      const el = document.getElementById('leads-table-container');
      if (el) el.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleScrollDown = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
      const el = document.getElementById('leads-table-container');
      if (el) el.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Bulk Selection Handlers
  const handleToggleSelectAll = () => {
    if (selectedLeadIds.length === displayedLeads.length) {
      setSelectedLeadIds([]);
    } else {
      setSelectedLeadIds(displayedLeads.map(l => l.id));
    }
  };

  const handleToggleSelectOne = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedLeadIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Bulk Export CSV Handler
  const handleBulkExportCSV = () => {
    const selectedData = displayedLeads.filter(l => selectedLeadIds.includes(l.id));
    const headers = ['ID Lead', 'No Surat Jalan', 'Klien', 'Muatan', 'Isotank', 'Rute', 'Status Stage', 'PIC'];
    const rows = selectedData.map(l => [
      l.lead_code,
      `"${l.no_surat_jalan}"`,
      `"${l.client_company || ''}"`,
      `"${l.muatan}"`,
      l.asset_code,
      `"${l.asal} -> ${l.tujuan}"`,
      `Stage ${l.current_step} (${l.status})`,
      `"${l.pic_name}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Bulk_Export_IsoTrack_${selectedData.length}_leads.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header with Primary Button & Views Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-100 tracking-tight flex items-center space-x-2" style={{ letterSpacing: '-0.02em' }}>
            <Truck className="w-6 h-6 text-teal-400" />
            <span>Manajemen Transaksi Lead & Alur 8 Tahap</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Operasional transaksional menyeluruh: verifikasi rute, mitra penyedia truk, pemantauan batas SLA, dan pengesahan BASTP.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {/* Table / Kanban Switcher */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 shadow-sm">
            <button
              onClick={() => setLeadViewMode('table')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                leadViewMode === 'table'
                  ? 'bg-teal-500 text-slate-950 font-black shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Tampilan Tabel Transaksional"
            >
              <Table className="w-3.5 h-3.5" />
              <span>Tabel</span>
            </button>
            <button
              onClick={() => setLeadViewMode('kanban')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                leadViewMode === 'kanban'
                  ? 'bg-teal-500 text-slate-950 font-black shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Tampilan Papan Kanban 8 Tahap"
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>Kanban</span>
            </button>
          </div>

          {/* Primary Action Button */}
          <button
            onClick={onOpenNewLead}
            className="px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs flex items-center space-x-1.5 shadow-md shadow-teal-500/20 active:scale-95 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Lead Baru</span>
          </button>
        </div>
      </div>

      {/* Saved Filter Presets Bar (Full Width Responsive Grid, 1-Word Professional Labels) */}
      <div className="p-2 rounded-2xl bg-slate-900/40 border border-transparent shadow-sm w-full backdrop-blur-md">
        <div className="flex flex-wrap md:flex-nowrap items-center gap-1.5 w-full">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 font-mono shrink-0">
            PRESET CEPAT:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 flex-1 w-full">
            <button
              onClick={() => applySavedPreset(null)}
              className={`w-full py-1.5 px-2 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center ${
                activePresetFilterId === null
                  ? 'bg-teal-500 text-slate-950 font-black shadow-sm'
                  : 'bg-slate-950/60 text-slate-300 hover:bg-slate-900 hover:text-slate-100'
              }`}
            >
              <span className="whitespace-nowrap font-bold text-xs">Semua</span>
            </button>
            {savedFilterPresets.map(preset => {
              let oneWordLabel = preset.name;
              if (preset.id === 'preset-kritis') oneWordLabel = '🔴 Kritis';
              else if (preset.id === 'preset-kapal') oneWordLabel = '🚢 Laut';
              else if (preset.id === 'preset-kimia') oneWordLabel = '🧪 Kimia';
              else if (preset.id === 'preset-approval') oneWordLabel = '🟡 Approval';
              else {
                oneWordLabel = preset.name.replace(/^(🔴|🚢|🧪|🟡)\s*/, '').split(' ')[0] || preset.name;
              }

              return (
                <button
                  key={preset.id}
                  onClick={() => applySavedPreset(preset.id === activePresetFilterId ? null : preset.id)}
                  className={`w-full py-1.5 px-2 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center space-x-1 ${
                    preset.id === activePresetFilterId
                      ? 'bg-teal-500 text-slate-950 font-black shadow-sm'
                      : 'bg-slate-950/60 text-slate-300 hover:bg-slate-900 hover:text-slate-100 border border-transparent'
                  }`}
                  title={preset.description}
                >
                  <span className="whitespace-nowrap font-bold text-xs">{oneWordLabel}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Stage Chips Filter Bar (Full Width 9-Column Grid, Fully Visible Text, Zero Truncation) */}
      <div className="bg-slate-900/40 border border-transparent rounded-2xl p-2 w-full backdrop-blur-md relative overflow-visible">
        <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-1.5 w-full">
          
          {/* Semua Tahap Button */}
          <button
            onClick={() => setActiveStageFilter('all')}
            className={`w-full py-2 px-1 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1 ${
              activeStageFilter === 'all'
                ? 'bg-teal-500 text-slate-950 shadow-md font-black'
                : 'bg-slate-950/60 text-slate-300 hover:bg-slate-900 hover:text-slate-100'
            }`}
          >
            <span className="whitespace-nowrap font-bold text-[11px] tracking-tight">Semua</span>
            <span className="px-1.5 py-0.5 rounded-full bg-slate-950/40 text-[10px] font-mono font-bold tabular-nums">
              {filteredLeads.length}
            </span>
          </button>

          {/* 8 Stage Buttons */}
          {STAGE_LIST.map((stg) => {
            const count = filteredLeads.filter(l => l.status === stg.id).length;
            const isSelected = activeStageFilter === stg.id;
            return (
              <div key={stg.step} className="relative flex items-center w-full">
                <button
                  onClick={() => setActiveStageFilter(stg.id)}
                  className={`w-full py-2 px-1 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1 ${
                    isSelected
                      ? 'bg-teal-500 text-slate-950 shadow-md font-black'
                      : 'bg-slate-950/60 text-slate-300 hover:bg-slate-900 hover:text-slate-100'
                  }`}
                >
                  <span className="whitespace-nowrap font-bold text-[11px] tracking-tight">
                    {stg.shortName}
                  </span>
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold tabular-nums ${
                    isSelected ? 'bg-slate-950/40 text-slate-950' : 'bg-slate-900 text-slate-400'
                  }`}>
                    {count}
                  </span>
                </button>

                {/* Info ! icon in yellow */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setInfoStageTooltip(infoStageTooltip === stg.step ? null : stg.step);
                  }}
                  className="absolute -top-1.5 -right-1.5 p-0.5 text-amber-400 hover:text-yellow-300 font-black text-xs leading-none transition-all z-10 cursor-pointer active:scale-125"
                  title={`Definisi ${stg.name}`}
                >
                  !
                </button>

                {/* Info Popover - Positioned at Top Right of Button without Clipping */}
                {infoStageTooltip === stg.step && (
                  <div className="absolute bottom-full right-0 mb-2 w-64 bg-slate-950 border border-teal-500/50 rounded-2xl p-3.5 shadow-2xl z-[90] text-xs space-y-2 animate-fadeIn backdrop-blur-xl">
                    <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
                      <span className="font-black text-teal-300 text-xs">{stg.name}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setInfoStageTooltip(null);
                        }}
                        className="text-slate-400 hover:text-white text-xs font-bold"
                      >
                        ✕
                      </button>
                    </div>
                    <p className="text-slate-300 text-[11px] leading-relaxed font-normal">
                      {stg.description}
                    </p>
                    <div className="text-[10px] text-slate-400 pt-1.5 border-t border-slate-800 flex justify-between items-center">
                      <span>Aktor Wajib:</span>
                      <strong className="text-teal-300 font-semibold">{stg.actor}</strong>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Search & PIC Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 border border-slate-800 rounded-xl p-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari Klien, Vendor Transport, Driver, Plat Truk, No Surat Jalan, Kode Isotank..."
            className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-100 focus:border-teal-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center space-x-2">
          <label className="text-xs text-slate-400 font-semibold flex items-center space-x-1">
            <Filter className="w-3.5 h-3.5 text-teal-400" />
            <span>Filter PIC:</span>
          </label>
          <select
            value={picFilter}
            onChange={(e) => setPicFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:border-teal-500 focus:outline-none"
          >
            <option value="all">Semua Karyawan PIC</option>
            {users.map(u => (
              <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
            ))}
          </select>
        </div>
      </div>

      {/* VIEW MODE 1: TABEL TRANSAKSIONAL (10 BARIS MAKSIMAL PER TAMPILAN & FITUR SCROLL UP-DOWN) */}
      {leadViewMode === 'table' && (
        <div className="space-y-2.5">
          {/* Table Header Indicator Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 shadow-sm">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-pulse shrink-0" />
              <span className="text-[11px] sm:text-xs">
                Menampilkan <strong className="text-teal-300 font-mono">{displayedLeads.length > 0 ? startIndex + 1 : 0} - {Math.min(startIndex + LEADS_PER_VIEW, displayedLeads.length)}</strong> dari <strong className="text-white font-mono">{displayedLeads.length} Leads</strong> (Halaman {currentPage} dari {totalPages})
              </span>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center space-x-1.5">
                <button
                  type="button"
                  onClick={handleScrollUp}
                  disabled={currentPage <= 1}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-slate-300 font-bold text-xs border border-slate-700 transition-all"
                  title="Halaman Sebelumnya"
                >
                  &larr; Prev
                </button>
                <span className="px-2 py-0.5 text-xs font-mono font-bold text-teal-300">
                  {currentPage} / {totalPages}
                </span>
                <button
                  type="button"
                  onClick={handleScrollDown}
                  disabled={currentPage >= totalPages}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-slate-300 font-bold text-xs border border-slate-700 transition-all"
                  title="Halaman Selanjutnya"
                >
                  Next &rarr;
                </button>
              </div>
            )}
          </div>

          {/* Table Container: strictly vertical scroll (overflow-y-auto), ZERO horizontal scrolling (overflow-x-hidden), max 10 leads height */}
          <div
            id="leads-table-container"
            className="w-full overflow-x-hidden overflow-y-auto max-h-[580px] rounded-2xl border border-slate-800 bg-slate-900/95 shadow-xl scroll-smooth relative"
          >
            <table className="w-full text-left text-xs border-collapse table-fixed">
              <thead className="sticky top-0 z-20 bg-slate-950/95 backdrop-blur-md border-b-2 border-slate-800 text-[11px] uppercase tracking-wider text-slate-400 font-mono shadow-sm">
                <tr>
                  <th className="p-3 w-10 text-center bg-slate-950">
                    <input
                      type="checkbox"
                      checked={displayedLeads.length > 0 && selectedLeadIds.length === displayedLeads.length}
                      onChange={handleToggleSelectAll}
                      className="rounded border-slate-700 text-teal-500 focus:ring-teal-400 cursor-pointer"
                    />
                  </th>
                  <th className="p-3 w-40 sm:w-48 bg-slate-950">ID Lead & Surat Jalan</th>
                  <th className="p-3 bg-slate-950">Klien & Muatan</th>
                  <th className="p-3 w-36 sm:w-44 bg-slate-950">Isotank & Rute</th>
                  <th className="p-3 w-32 sm:w-36 bg-slate-950">Tahap & SLA</th>
                  <th className="p-3 w-24 text-right bg-slate-950">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {paginatedLeads.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-slate-400 text-xs">
                      Tidak ada transaksi lead yang sesuai dengan kriteria pencarian atau filter aktif.
                    </td>
                  </tr>
                ) : (
                  paginatedLeads.map((lead) => {
                    const isClosed = lead.status === 'closed';
                    const targetDate = new Date(lead.target_at);
                    const now = new Date();
                    const diffHours = Math.round((targetDate.getTime() - now.getTime()) / (1000 * 60 * 60));
                    const isOverdue = diffHours < 0 && !isClosed;
                    const isSelected = selectedLeadIds.includes(lead.id);

                    const padClass = 'py-3 px-3';

                    return (
                      <tr
                        key={lead.id}
                        onClick={() => setSelectedLeadId(lead.id)}
                        className={`hover:bg-slate-800/80 transition-colors cursor-pointer group ${
                          isSelected ? 'bg-teal-500/10' : ''
                        }`}
                      >
                        {/* Checkbox Column */}
                        <td className={`${padClass} text-center w-10`} onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => handleToggleSelectOne(lead.id, e as any)}
                            className="rounded border-slate-700 text-teal-500 focus:ring-teal-400 cursor-pointer"
                          />
                        </td>

                        {/* ID Lead & Surat Jalan */}
                        <td className={padClass}>
                          <div className="flex items-center space-x-1.5 flex-wrap">
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-black bg-teal-500/20 text-teal-300 border border-teal-500/30 tabular-nums">
                              {lead.lead_code || 'LEAD-00101'}
                            </span>
                            <span className="font-extrabold text-slate-100 font-mono group-hover:text-teal-300 truncate">
                              {lead.no_surat_jalan}
                            </span>
                          </div>
                          {lead.is_inter_island && (
                            <span className="mt-1 text-[10px] text-cyan-300 font-bold block truncate">
                              🚢 {lead.shipping_company ? lead.shipping_company.replace('PT Pelayaran ', '').replace('PT ', '') : 'Kapal Kargo'}
                            </span>
                          )}
                        </td>

                        {/* Klien & Muatan */}
                        <td className={padClass}>
                          <div className="font-bold text-slate-200 truncate">
                            {lead.client_company || 'PT Petrokimia Utama Indonesia'}
                          </div>
                          <div className="text-[11px] text-slate-400 truncate">
                            {lead.muatan}
                          </div>
                        </td>

                        {/* Isotank & Rute */}
                        <td className={padClass}>
                          <div className="flex items-center space-x-1 font-mono font-bold text-teal-300 text-xs">
                            <span>{lead.asset_code}</span>
                            <span className="text-[10px] text-slate-500 font-normal">({lead.no_plat_truk})</span>
                          </div>
                          <div className="text-[11px] text-slate-400 truncate mt-0.5">
                            {lead.asal} &rarr; {lead.tujuan}
                          </div>
                        </td>

                        {/* Tahap & SLA */}
                        <td className={padClass}>
                          <div className="flex items-center space-x-1.5">
                            <span className={`w-5 h-5 rounded flex items-center justify-center font-bold text-[10px] shrink-0 ${
                              isClosed
                                ? 'bg-emerald-500 text-slate-950'
                                : lead.current_step === 2 || lead.current_step === 7
                                ? 'bg-amber-400 text-slate-950'
                                : lead.current_step === 6
                                ? 'bg-orange-500 text-white'
                                : 'bg-teal-500 text-slate-950'
                            }`}>
                              {lead.current_step}
                            </span>
                            <span className="font-bold text-slate-200 truncate text-[11px]">
                              {STAGE_LIST.find(s => s.step === lead.current_step)?.shortName || lead.status}
                            </span>
                          </div>
                          <div className="mt-1">
                            <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold font-mono tabular-nums border inline-flex items-center ${
                              isClosed
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                : isOverdue
                                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                                : diffHours <= 12
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                : 'bg-slate-800 text-slate-300 border-slate-700'
                            }`}>
                              <Clock className="w-2.5 h-2.5 mr-1" />
                              {isClosed ? 'Closed' : isOverdue ? `Telat ${Math.abs(diffHours)}j` : `Sisa ${diffHours}j`}
                            </span>
                          </div>
                        </td>

                        {/* PIC & Aksi */}
                        <td className={`${padClass} text-right`}>
                          <div className="text-slate-300 font-medium truncate text-[11px]">{lead.pic_name}</div>
                          <button
                            onClick={() => setSelectedLeadId(lead.id)}
                            className="mt-1 inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-teal-500 text-slate-300 hover:text-slate-950 font-bold text-[11px] transition-colors"
                            title="Buka Detail Lead"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Buka</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Clean Pagination Footer if multiple pages */}
          {totalPages > 1 && (
            <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 shadow-sm">
              <span className="text-[11px] text-slate-400">
                Halaman <strong className="text-teal-300 font-mono">{currentPage}</strong> dari <strong className="text-white font-mono">{totalPages}</strong>
              </span>

              <div className="flex items-center space-x-1.5">
                <button
                  type="button"
                  onClick={handleScrollUp}
                  disabled={currentPage <= 1}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-slate-300 font-bold text-xs border border-slate-700 transition-all"
                  title="Halaman Sebelumnya"
                >
                  &larr; Prev
                </button>
                <span className="px-2 py-0.5 text-xs font-mono font-bold text-teal-300">
                  {currentPage} / {totalPages}
                </span>
                <button
                  type="button"
                  onClick={handleScrollDown}
                  disabled={currentPage >= totalPages}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-slate-300 font-bold text-xs border border-slate-700 transition-all"
                  title="Halaman Selanjutnya"
                >
                  Next &rarr;
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW MODE 2: PAPAN KANBAN 8 TAHAP */}
      {leadViewMode === 'kanban' && (
        <div className="overflow-x-auto pb-4">
          <div className="flex items-start space-x-3.5 min-w-[1600px]">
            {STAGE_LIST.map((stg) => {
              const stageLeads = displayedLeads.filter(l => l.status === stg.id);
              return (
                <div
                  key={stg.step}
                  className="w-72 bg-slate-900/90 border border-slate-800/80 rounded-2xl p-3 flex flex-col space-y-2.5 shrink-0 shadow-lg h-fit"
                >
                  {/* Column Header */}
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div className="flex items-center space-x-2">
                      <span className="w-5 h-5 rounded-md bg-teal-500/20 text-teal-300 font-bold text-[11px] flex items-center justify-center font-mono">
                        {stg.step}
                      </span>
                      <span className="text-xs font-bold text-slate-100 truncate">
                        {stg.shortName}
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-slate-950 text-[10px] font-mono font-bold text-slate-400 tabular-nums">
                      {stageLeads.length}
                    </span>
                  </div>

                  {/* Cards inside stage column */}
                  <div className="space-y-2 overflow-y-auto max-h-[calc(100vh-280px)] pr-0.5">
                    {stageLeads.length === 0 ? (
                      <div className="p-3 text-center text-[10px] text-slate-500 border border-dashed border-slate-800/80 rounded-xl">
                        Tidak Ada Lead
                      </div>
                    ) : (
                      stageLeads.map((lead) => {
                        const targetDate = new Date(lead.target_at);
                        const now = new Date();
                        const diffHours = Math.round((targetDate.getTime() - now.getTime()) / (1000 * 60 * 60));
                        const isOverdue = diffHours < 0 && lead.status !== 'closed';

                        return (
                          <div
                            key={lead.id}
                            onClick={() => setSelectedLeadId(lead.id)}
                            className="p-3 bg-slate-950/80 border border-slate-800/80 hover:border-teal-500/50 rounded-xl shadow-sm cursor-pointer transition-all hover:bg-slate-900/90 group space-y-2"
                          >
                            <div className="flex items-center justify-between">
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-teal-500/15 text-teal-300 border border-teal-500/30">
                                {lead.lead_code}
                              </span>
                              <span className={`text-[10px] font-mono font-bold tabular-nums px-1.5 py-0.5 rounded ${
                                isOverdue ? 'bg-rose-500/20 text-rose-300' : 'bg-slate-900 text-slate-400'
                              }`}>
                                {isOverdue ? `Terlambat ${Math.abs(diffHours)}j` : `Sisa ${diffHours}j`}
                              </span>
                            </div>

                            <div>
                              <span className="text-xs font-bold text-slate-100 font-mono block group-hover:text-teal-300 truncate">
                                {lead.no_surat_jalan}
                              </span>
                              <span className="text-[11px] text-slate-300 truncate block font-medium">
                                {lead.client_company || 'Perusahaan Klien'}
                              </span>
                            </div>

                            <div className="text-[10px] text-slate-400 space-y-1 pt-1.5 border-t border-slate-800/60">
                              <div className="flex justify-between items-center">
                                <span className="text-slate-400">Muatan:</span>
                                <strong className="text-slate-200 truncate max-w-[130px] font-semibold">{lead.muatan}</strong>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-slate-400">Aset & PIC:</span>
                                <span className="text-slate-300 truncate max-w-[130px]">
                                  <strong className="text-teal-300 font-mono">{lead.asset_code}</strong> &middot; {lead.pic_name}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* FLOATING BULK ACTIONS BAR (Muncul jika ada lead tercentang) */}
      {selectedLeadIds.length > 0 && (
        <div
          role="region"
          aria-label="Aksi Massal"
          className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40 bg-slate-900 border-2 border-teal-500 shadow-2xl rounded-2xl p-3 px-5 flex flex-wrap items-center justify-between gap-4 max-w-2xl w-full animate-fadeIn"
          style={{ animation: 'appleScaleIn 0.25s var(--ease-apple-spring)' }}
        >
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-1 rounded-full bg-teal-500 text-slate-950 font-black text-xs tabular-nums">
              {selectedLeadIds.length} Terpilih
            </span>
            <span className="text-xs text-slate-200 font-semibold hidden sm:inline">
              Aksi Massal Transaksi
            </span>
          </div>

          <div className="flex items-center space-x-2 flex-wrap">
            {/* Bulk PIC Assign dropdown */}
            <div className="flex items-center space-x-1 bg-slate-950 border border-slate-700 rounded-xl px-2 py-1">
              <Users className="w-3.5 h-3.5 text-teal-400" />
              <select
                value={selectedBulkPicId}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedBulkPicId(val);
                  if (val) {
                    const u = users.find(usr => usr.id === val);
                    if (u) bulkAssignPic(selectedLeadIds, u.id, u.name);
                    setSelectedBulkPicId('');
                  }
                }}
                className="bg-transparent text-xs text-slate-200 focus:outline-none cursor-pointer"
              >
                <option value="">Tugaskan PIC...</option>
                {users.map(u => (
                  <option key={u.id} value={u.id} className="bg-slate-900 text-slate-100">{u.name}</option>
                ))}
              </select>
            </div>

            {/* Bulk Export CSV */}
            <button
              onClick={handleBulkExportCSV}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center space-x-1 transition-all"
              title="Ekspor CSV Data Terpilih"
            >
              <Download className="w-3.5 h-3.5 text-teal-400" />
              <span>Ekspor</span>
            </button>

            {/* Clear Selection */}
            <button
              onClick={() => setSelectedLeadIds([])}
              className="px-2.5 py-1.5 rounded-xl text-xs text-rose-400 hover:bg-rose-500/10 font-bold transition-all"
            >
              Batal
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
