import React, { useState } from 'react';
import {
  Truck, Search, Filter, PlusCircle, Clock, CheckCircle2, AlertTriangle,
  RotateCcw, FileText, ChevronRight, User as UserIcon, ArrowUpDown
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { STAGE_LIST } from '../data/stageConfig';
import { LeadStatus } from '../types';

interface LeadListViewProps {
  onOpenNewLead: () => void;
}

export const LeadListView: React.FC<LeadListViewProps> = ({ onOpenNewLead }) => {
  const { filteredLeads, setSelectedLeadId, users, currentUser } = useApp();

  const [activeStageFilter, setActiveStageFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [picFilter, setPicFilter] = useState<string>('all');

  // Filter leads based on chips, search, and PIC
  const displayedLeads = filteredLeads.filter((lead) => {
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

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-100 tracking-tight flex items-center space-x-2">
            <Truck className="w-6 h-6 text-teal-400" />
            <span>Daftar Transaksi Lead & Kemitraan Transport</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Kelola Klien, Mitra Penyedia Truk, Driver, Nomor Plat, serta 8-tahap alur operasional isotank secara real-time.
          </p>
        </div>

        <button
          onClick={onOpenNewLead}
          className="px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs flex items-center space-x-1.5 shadow-md shadow-teal-500/20"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ Lead & Transporter Baru</span>
        </button>
      </div>

      {/* Stage Chips Filter Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 flex flex-wrap items-center gap-1.5 overflow-x-auto">
        <button
          onClick={() => setActiveStageFilter('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
            activeStageFilter === 'all'
              ? 'bg-teal-500 text-slate-950 shadow-md'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <span>Semua</span>
          <span className="px-1.5 py-0.2 rounded-full bg-slate-950/40 text-[10px]">
            {filteredLeads.length}
          </span>
        </button>

        {STAGE_LIST.map((stg) => {
          const count = filteredLeads.filter(l => l.status === stg.id).length;
          const isSelected = activeStageFilter === stg.id;
          return (
            <button
              key={stg.step}
              onClick={() => setActiveStageFilter(stg.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 shrink-0 ${
                isSelected
                  ? 'bg-teal-500 text-slate-950 shadow-md'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <span>{stg.shortName}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                isSelected ? 'bg-slate-950/40 text-slate-950 font-bold' : 'bg-slate-900 text-slate-400'
              }`}>
                {count}
              </span>
            </button>
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

      {/* Lead Cards List */}
      <div className="space-y-3">
        {displayedLeads.length === 0 ? (
          <div className="text-center py-12 bg-slate-900/60 border border-slate-800 rounded-2xl text-slate-400 text-xs">
            Tidak ada transaksi lead yang sesuai dengan kriteria filter.
          </div>
        ) : (
          displayedLeads.map((lead) => {
            const isClosed = lead.status === 'closed';
            const targetDate = new Date(lead.target_at);
            const now = new Date();
            const diffHours = Math.round((targetDate.getTime() - now.getTime()) / (1000 * 60 * 60));
            const isOverdue = diffHours < 0 && !isClosed;

            const stageMeta = STAGE_LIST.find(s => s.id === lead.status) || STAGE_LIST[0];

            return (
              <div
                key={lead.id}
                onClick={() => setSelectedLeadId(lead.id)}
                className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-teal-500/50 transition-all shadow-md cursor-pointer group hover:bg-slate-800/80"
              >
                <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center font-extrabold text-teal-400 text-sm font-mono shrink-0">
                      {lead.current_step}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                        <span className="px-2 py-0.5 rounded text-[11px] font-mono font-extrabold bg-teal-500/20 text-teal-300 border border-teal-500/40">
                          {lead.lead_code || 'LEAD-00101'}
                        </span>
                        <span className="font-extrabold text-slate-100 text-sm font-mono group-hover:text-teal-300">
                          {lead.no_surat_jalan}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-slate-800 text-teal-400 border border-teal-500/20 font-mono">
                          {lead.asset_code}
                        </span>
                      </div>
                      
                      <div className="text-xs text-slate-200 font-bold mt-1">
                        Klien: <span className="text-teal-300">{lead.client_company || 'PT Petrokimia Utama Indonesia'}</span>
                      </div>

                      <div className="text-[11px] text-slate-400 flex items-center space-x-2 flex-wrap mt-0.5">
                        <span>Vendor Truk: <strong className="text-slate-200">{lead.transport_vendor_name || 'PT Segara Logistik Express'}</strong></span>
                        <span>•</span>
                        <span>Supir: <strong className="text-slate-200">{lead.nama_supir || 'Bambang Susanto'}</strong></span>
                        <span>•</span>
                        <span>Plat: <strong className="text-teal-300 font-mono">{lead.no_plat_truk || 'B 9842 UFX'}</strong></span>
                      </div>

                      <div className="text-xs text-slate-300 font-semibold mt-1">
                        Rute: {lead.asal} &rarr; {lead.tujuan} ({lead.muatan})
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {/* Status Stage Pill */}
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${stageMeta.badgeBg} ${stageMeta.badgeText}`}>
                      Stage {lead.current_step}: {stageMeta.shortName}
                    </span>

                    {/* SLA Badge */}
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border flex items-center space-x-1 ${
                      isClosed
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : isOverdue
                        ? 'bg-rose-500/10 text-rose-400 border-rose-500/30 animate-pulse'
                        : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                    }`}>
                      <Clock className="w-3 h-3" />
                      <span>{isClosed ? 'Selesai' : isOverdue ? `Terlambat ${Math.abs(diffHours)}j` : `${diffHours}j SLA`}</span>
                    </span>

                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-teal-400 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>

                {/* Progress bar % & Details footer */}
                <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
                  <div className="flex items-center space-x-4">
                    <span>PIC: <strong className="text-slate-300">{lead.pic_name}</strong></span>
                    <span>Manager: <strong className="text-slate-300">{lead.manager_name}</strong></span>
                    {lead.total_revisions > 0 && (
                      <span className="text-amber-400 font-bold flex items-center space-x-1">
                        <RotateCcw className="w-3 h-3" />
                        <span>{lead.total_revisions} Revisi</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 w-full sm:w-48">
                    <div className="flex-1 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-teal-400"
                        style={{ width: `${lead.progress_percentage}%` }}
                      />
                    </div>
                    <span className="font-mono text-teal-400 font-bold">{lead.progress_percentage}%</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
