import React, { useState, useMemo } from 'react';
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
    tableDensity,
    setTableDensity,
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

          {/* Density Switcher (Active only in Table Mode) */}
          {leadViewMode === 'table' && (
            <div className="hidden sm:flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 shadow-sm">
              <button
                onClick={() => setTableDensity('comfortable')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  tableDensity === 'comfortable'
                    ? 'bg-slate-800 text-teal-300 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Kepadatan Baris Nyaman (Comfortable)"
              >
                Nyaman
              </button>
              <button
                onClick={() => setTableDensity('compact')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  tableDensity === 'compact'
                    ? 'bg-slate-800 text-teal-300 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Kepadatan Baris Padat (Compact)"
              >
                Padat
              </button>
            </div>
          )}

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

      {/* Saved Filter Presets Bar */}
      <div className="flex flex-wrap items-center gap-2 p-2.5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-sm">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">
          Preset Cepat:
        </span>
        <button
          onClick={() => applySavedPreset(null)}
          className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
            activePresetFilterId === null
              ? 'bg-slate-800 text-teal-300 border border-teal-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          Semua Data
        </button>
        {savedFilterPresets.map(preset => (
          <button
            key={preset.id}
            onClick={() => applySavedPreset(preset.id === activePresetFilterId ? null : preset.id)}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center space-x-1 ${
              preset.id === activePresetFilterId
                ? 'bg-teal-500 text-slate-950 font-black shadow-sm'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 border border-slate-700/60'
            }`}
            title={preset.description}
          >
            <span>{preset.name}</span>
          </button>
        ))}
      </div>

      {/* Stage Chips Filter Bar with (i) Info Contextual Popover */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 flex flex-wrap items-center gap-1.5 overflow-x-auto">
        <button
          onClick={() => setActiveStageFilter('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
            activeStageFilter === 'all'
              ? 'bg-teal-500 text-slate-950 shadow-md font-black'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <span>Semua Tahap</span>
          <span className="px-1.5 py-0.2 rounded-full bg-slate-950/40 text-[10px] font-mono tabular-nums">
            {filteredLeads.length}
          </span>
        </button>

        {STAGE_LIST.map((stg) => {
          const count = filteredLeads.filter(l => l.status === stg.id).length;
          const isSelected = activeStageFilter === stg.id;
          return (
            <div key={stg.step} className="relative flex items-center">
              <button
                onClick={() => setActiveStageFilter(stg.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 shrink-0 ${
                  isSelected
                    ? 'bg-teal-500 text-slate-950 shadow-md font-black'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <span>{stg.shortName}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono tabular-nums ${
                  isSelected ? 'bg-slate-950/40 text-slate-950 font-bold' : 'bg-slate-900 text-slate-400'
                }`}>
                  {count}
                </span>
              </button>

              {/* Info (i) icon for stage definition */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setInfoStageTooltip(infoStageTooltip === stg.step ? null : stg.step);
                }}
                className="ml-1 p-1 text-slate-500 hover:text-teal-400 rounded-full"
                title={`Definisi & Aturan ${stg.name}`}
              >
                <Info className="w-3 h-3" />
              </button>

              {/* Contextual Info Tooltip */}
              {infoStageTooltip === stg.step && (
                <div className="absolute top-10 left-0 w-64 bg-slate-950 border border-teal-500/40 rounded-xl p-3 shadow-2xl z-30 text-xs space-y-1.5">
                  <div className="font-extrabold text-teal-300 flex items-center justify-between">
                    <span>{stg.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">Stage {stg.step}</span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    {stg.description}
                  </p>
                  <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-800">
                    Aktor Wajib: <strong className="text-slate-200">{stg.actor}</strong>
                  </div>
                </div>
              )}
            </div>
          );
        })}
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

      {/* VIEW MODE 1: TABEL TRANSAKSIONAL */}
      {leadViewMode === 'table' && (
        <div className="space-y-3">
          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/90 shadow-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400 font-mono">
                <tr>
                  <th className="p-3 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={displayedLeads.length > 0 && selectedLeadIds.length === displayedLeads.length}
                      onChange={handleToggleSelectAll}
                      className="rounded border-slate-700 text-teal-500 focus:ring-teal-400 cursor-pointer"
                    />
                  </th>
                  <th className="p-3">ID Lead & Surat Jalan</th>
                  <th className="p-3">Klien & Muatan</th>
                  <th className="p-3">Unit Isotank</th>
                  <th className="p-3">Rute Distribusi</th>
                  <th className="p-3">Tahap Alur (Stage)</th>
                  <th className="p-3">Tenggat SLA</th>
                  <th className="p-3">PIC Penanggung Jawab</th>
                  <th className="p-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {displayedLeads.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-12 text-slate-400 text-xs">
                      Tidak ada transaksi lead yang sesuai dengan kriteria pencarian atau filter aktif.
                    </td>
                  </tr>
                ) : (
                  displayedLeads.map((lead) => {
                    const isClosed = lead.status === 'closed';
                    const targetDate = new Date(lead.target_at);
                    const now = new Date();
                    const diffHours = Math.round((targetDate.getTime() - now.getTime()) / (1000 * 60 * 60));
                    const isOverdue = diffHours < 0 && !isClosed;
                    const isSelected = selectedLeadIds.includes(lead.id);

                    const padClass = tableDensity === 'compact' ? 'py-2 px-3' : 'py-3.5 px-3';

                    return (
                      <tr
                        key={lead.id}
                        onClick={() => setSelectedLeadId(lead.id)}
                        className={`hover:bg-slate-800/80 transition-colors cursor-pointer group ${
                          isSelected ? 'bg-teal-500/10' : ''
                        }`}
                      >
                        {/* Checkbox Column */}
                        <td className={`${padClass} text-center`} onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => handleToggleSelectOne(lead.id, e as any)}
                            className="rounded border-slate-700 text-teal-500 focus:ring-teal-400 cursor-pointer"
                          />
                        </td>

                        {/* ID Lead & Surat Jalan */}
                        <td className={padClass}>
                          <div className="flex items-center space-x-2">
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-black bg-teal-500/20 text-teal-300 border border-teal-500/30 tabular-nums">
                              {lead.lead_code || 'LEAD-00101'}
                            </span>
                            <span className="font-extrabold text-slate-100 font-mono group-hover:text-teal-300">
                              {lead.no_surat_jalan}
                            </span>
                          </div>
                          {lead.is_inter_island && (
                            <span className="mt-1 text-[10px] text-cyan-300 font-bold block">
                              🚢 Kapal: {lead.shipping_company ? lead.shipping_company.replace('PT Pelayaran ', '').replace('PT ', '') : 'Kargo'}
                            </span>
                          )}
                        </td>

                        {/* Klien & Muatan */}
                        <td className={padClass}>
                          <div className="font-bold text-slate-200 truncate max-w-[180px]">
                            {lead.client_company || 'PT Petrokimia Utama Indonesia'}
                          </div>
                          <div className="text-[11px] text-slate-400 truncate max-w-[180px]">
                            {lead.muatan}
                          </div>
                        </td>

                        {/* Unit Isotank */}
                        <td className={padClass}>
                          <span className="font-mono font-bold text-teal-300 text-xs">
                            {lead.asset_code}
                          </span>
                          <span className="text-[10px] text-slate-500 block">
                            {lead.no_plat_truk || 'B 9842 UFX'}
                          </span>
                        </td>

                        {/* Rute */}
                        <td className={padClass}>
                          <div className="text-slate-300 font-medium truncate max-w-[160px]">
                            {lead.asal} &rarr; {lead.tujuan}
                          </div>
                        </td>

                        {/* Tahap Alur */}
                        <td className={padClass}>
                          <div className="flex items-center space-x-1.5">
                            <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs ${
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
                            <span className="font-semibold text-slate-200">
                              {STAGE_LIST.find(s => s.step === lead.current_step)?.shortName || lead.status}
                            </span>
                          </div>
                        </td>

                        {/* Tenggat SLA */}
                        <td className={padClass}>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono tabular-nums border inline-flex items-center space-x-1 ${
                            isClosed
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : isOverdue
                              ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                              : diffHours <= 12
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                              : 'bg-slate-800 text-slate-300 border-slate-700'
                          }`}>
                            <Clock className="w-3 h-3 mr-1" />
                            {isClosed ? 'Selesai (Closed)' : isOverdue ? `Terlambat ${Math.abs(diffHours)}j` : `Sisa ${diffHours}j`}
                          </span>
                        </td>

                        {/* PIC */}
                        <td className={padClass}>
                          <span className="text-slate-200 font-medium">{lead.pic_name}</span>
                          <span className="text-[10px] text-slate-500 block">Dibuat: {lead.creator_name}</span>
                        </td>

                        {/* Aksi */}
                        <td className={`${padClass} text-right`}>
                          <button
                            onClick={() => setSelectedLeadId(lead.id)}
                            className="p-1.5 rounded-lg bg-slate-800 group-hover:bg-teal-500 text-slate-400 group-hover:text-slate-950 transition-colors"
                            title="Buka Lembar Kerja Detail"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW MODE 2: PAPAN KANBAN 8 TAHAP */}
      {leadViewMode === 'kanban' && (
        <div className="overflow-x-auto pb-4">
          <div className="flex space-x-4 min-w-[1600px]">
            {STAGE_LIST.map((stg) => {
              const stageLeads = displayedLeads.filter(l => l.status === stg.id);
              return (
                <div
                  key={stg.step}
                  className="w-72 bg-slate-900/90 border border-slate-800 rounded-2xl p-3 flex flex-col space-y-3 shrink-0 shadow-lg"
                >
                  {/* Column Header */}
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                    <div className="flex items-center space-x-2">
                      <span className="w-6 h-6 rounded-lg bg-teal-500/20 text-teal-400 font-bold text-xs flex items-center justify-center font-mono">
                        {stg.step}
                      </span>
                      <span className="text-xs font-bold text-slate-200 truncate">
                        {stg.shortName}
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] font-mono font-bold text-slate-400 tabular-nums">
                      {stageLeads.length}
                    </span>
                  </div>

                  {/* Cards inside stage column */}
                  <div className="space-y-2.5 overflow-y-auto max-h-[600px] pr-1">
                    {stageLeads.length === 0 ? (
                      <div className="p-4 text-center text-[11px] text-slate-500 border border-dashed border-slate-800 rounded-xl">
                        Kosong
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
                            className="p-3 bg-slate-950/90 border border-slate-800 hover:border-teal-500/60 rounded-xl shadow-md cursor-pointer transition-all hover:bg-slate-900 group space-y-2"
                          >
                            <div className="flex items-center justify-between">
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-extrabold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                                {lead.lead_code}
                              </span>
                              <span className={`text-[10px] font-mono font-bold tabular-nums ${
                                isOverdue ? 'text-rose-400' : 'text-slate-400'
                              }`}>
                                {isOverdue ? `Terlambat ${Math.abs(diffHours)}j` : `Sisa ${diffHours}j`}
                              </span>
                            </div>

                            <div>
                              <span className="text-xs font-bold text-slate-100 font-mono block group-hover:text-teal-300 truncate">
                                {lead.no_surat_jalan}
                              </span>
                              <span className="text-[11px] text-slate-300 truncate block">
                                {lead.client_company || 'PT Petrokimia'}
                              </span>
                            </div>

                            <div className="text-[10px] text-slate-400 space-y-0.5 pt-1 border-t border-slate-800/80">
                              <div className="flex justify-between">
                                <span>Muatan:</span>
                                <strong className="text-slate-200 truncate max-w-[120px]">{lead.muatan}</strong>
                              </div>
                              <div className="flex justify-between">
                                <span>Aset:</span>
                                <span className="text-teal-300 font-mono">{lead.asset_code}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>PIC:</span>
                                <span className="text-slate-300">{lead.pic_name}</span>
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
