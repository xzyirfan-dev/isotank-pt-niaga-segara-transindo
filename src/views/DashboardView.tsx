import React, { useState, useMemo } from 'react';
import {
  TrendingUp, Clock, CheckCircle2, AlertTriangle, Truck, Sparkles,
  RotateCcw, ShieldCheck, HelpCircle, ArrowRight, Activity, FileText,
  Zap, Award, SlidersHorizontal, Layers, Gauge, Compass, Eye, Download,
  RefreshCw, MapPin, Thermometer, Filter, ChevronRight, ShieldAlert,
  BarChart2, PieChart as PieIcon, Calendar, Check
} from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend, AreaChart, Area
} from 'recharts';
import { useApp } from '../context/AppContext';
import { STAGE_LIST } from '../data/stageConfig';
import { Lead } from '../types';

interface DashboardViewProps {
  onOpenNewLead: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onOpenNewLead }) => {
  const {
    filteredLeads,
    assets,
    issues,
    closures,
    setActiveView,
    setSelectedLeadId,
    leads
  } = useApp();

  // State controls for interactive dashboard
  const [activeTooltipMetric, setActiveTooltipMetric] = useState<string | null>(null);
  const [selectedMuatanFilter, setSelectedMuatanFilter] = useState<string>('all');
  const [selectedDepoFilter, setSelectedDepoFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'executive' | 'fleet'>('executive');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [tickerIndex, setTickerIndex] = useState(0);

  // Trigger quick data refresh simulation
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  // Filtered Leads based on Dashboard Quick Tabs
  const displayLeads = useMemo(() => {
    return filteredLeads.filter(l => {
      const matchMuatan = selectedMuatanFilter === 'all' ||
        (selectedMuatanFilter === 'chemical' && (l.muatan.toLowerCase().includes('kimia') || l.muatan.toLowerCase().includes('caustic') || l.muatan.toLowerCase().includes('acid'))) ||
        (selectedMuatanFilter === 'gas' && (l.muatan.toLowerCase().includes('gas') || l.muatan.toLowerCase().includes('nitrogen') || l.muatan.toLowerCase().includes('argon'))) ||
        (selectedMuatanFilter === 'food' && (l.muatan.toLowerCase().includes('food') || l.muatan.toLowerCase().includes('sawit') || l.muatan.toLowerCase().includes('cpo')));
      
      const matchDepo = selectedDepoFilter === 'all' ||
        (selectedDepoFilter === 'surabaya' && (l.asal.toLowerCase().includes('surabaya') || l.tujuan.toLowerCase().includes('surabaya'))) ||
        (selectedDepoFilter === 'gresik' && (l.asal.toLowerCase().includes('gresik') || l.tujuan.toLowerCase().includes('gresik'))) ||
        (selectedDepoFilter === 'cilegon' && (l.asal.toLowerCase().includes('cilegon') || l.tujuan.toLowerCase().includes('cilegon')));

      return matchMuatan && matchDepo;
    });
  }, [filteredLeads, selectedMuatanFilter, selectedDepoFilter]);

  // Compute Core Analytics
  const totalLeads = displayLeads.length;
  const closedLeads = displayLeads.filter(l => l.status === 'closed');
  const activeLeads = displayLeads.filter(l => l.status !== 'closed');
  const closedCount = closedLeads.length;

  // SLA On Time Rate %
  const onTimeCount = closures.filter(c => c.sla_on_time).length;
  const onTimeRate = closedCount > 0 ? Math.round((onTimeCount / closedCount) * 100) : 94;

  // Cycle time average (hours)
  const avgCycleHours = closures.length > 0
    ? Math.round(closures.reduce((acc, c) => acc + c.total_hours, 0) / closures.length)
    : 198;

  // Revision rate %
  const totalRevisions = displayLeads.reduce((acc, l) => acc + l.total_revisions, 0);
  const revisionRate = totalLeads > 0 ? Math.round((totalRevisions / totalLeads) * 100) : 12;

  // Isotank Utilization %
  const totalAssets = assets.length;
  const operatingAssets = assets.filter(a => a.status === 'Beroperasi').length;
  const maintenanceAssets = assets.filter(a => a.status === 'Perawatan').length;
  const availableAssets = assets.filter(a => a.status === 'Tersedia').length;
  const assetUtilRate = totalAssets > 0 ? Math.round((operatingAssets / totalAssets) * 100) : 73;

  // Estimated Tonnes Delivered
  const estimatedTonnes = (closedCount * 22) + (activeLeads.length * 14);

  // Open issues count
  const openIssues = issues.filter(i => i.status === 'open');
  const openIssuesCount = openIssues.length;

  // Stage Breakdown Counts
  const statusCounts = STAGE_LIST.map(stg => ({
    name: stg.shortName,
    fullStep: stg.name,
    count: displayLeads.filter(l => l.status === stg.id).length,
    color: stg.step === 1 ? '#3b82f6' :
           stg.step === 2 ? '#f59e0b' :
           stg.step === 3 ? '#06b6d4' :
           stg.step === 4 ? '#6366f1' :
           stg.step === 5 ? '#a855f7' :
           stg.step === 6 ? '#f97316' :
           stg.step === 7 ? '#14b8a6' : '#10b981',
  }));

  // Recharts trend mock data
  const trendData = [
    { month: 'Mei', volume: 18, cycleHours: 210, tonase: 396 },
    { month: 'Jun', volume: 22, cycleHours: 204, tonase: 484 },
    { month: 'Jul', volume: 25, cycleHours: 200, tonase: 550 },
    { month: 'Agt', volume: 29, cycleHours: 195, tonase: 638 },
    { month: 'Sep', volume: 34, cycleHours: 192, tonase: 748 },
    { month: 'Okt', volume: 38, cycleHours: avgCycleHours, tonase: 836 },
  ];

  // Route Volume Ranking Data
  const routeAnalyticsData = [
    { rute: 'Surabaya ↔ Cilegon', leads: 14, tonase: 308, slaPercent: 96 },
    { rute: 'Gresik ↔ Semarang', leads: 10, tonase: 220, slaPercent: 92 },
    { rute: 'Tuban ↔ Jakarta', leads: 8, tonase: 176, slaPercent: 98 },
    { rute: 'Pasuruan ↔ Bandung', leads: 6, tonase: 132, slaPercent: 90 },
  ];

  // Asset Status Distribution Data
  const assetStatusChartData = [
    { status: 'Beroperasi', count: operatingAssets, fill: '#14b8a6' },
    { status: 'Tersedia Depo', count: availableAssets, fill: '#3b82f6' },
    { status: 'Perawatan/Inspeksi', count: maintenanceAssets + 1, fill: '#f59e0b' },
  ];

  // Real-time incident live ticker messages
  const tickerItems = [
    `⚡ LIVE: Transaksi LEAD-00101 (SJ-2026-001) baru saja memasuki Stage 4 (Submission for Review)`,
    `🛡️ KUALITAS & KEPATUHAN: QC Seal Integrity Rate Armada Isotank mencapai 98.4% (Audit Standard ISO)`,
    `🚨 SLA MONITORING: 2 Lead rute Cilegon mendekati estimasi ketibaan target waktu`,
    `🚚 FLEET UPDATE: Unit ISO-20T-04 dalam rute perjalanan aktif Gresik ➔ Semarang (Suhu stabil 24°C)`,
    `✅ MANAGER APPROVAL: Lead LEAD-00104 rute Tuban telah mendapat persetujuan manager Probo Subagyo`
  ];

  // Rotate ticker
  const handleNextTicker = () => {
    setTickerIndex((prev) => (prev + 1) % tickerItems.length);
  };

  // Export Executive Summary CSV
  const exportDashboardSummary = () => {
    const csvLines = [
      'METRIK KINERJA OPERASIONAL DASHBOARD ISOTRACK',
      `Tanggal Cetak,${new Date().toLocaleString('id-ID')}`,
      `Total Lead Transaksi,${totalLeads}`,
      `Lead Aktif Dalam Siklus,${activeLeads.length}`,
      `Lead Selesai (Closed),${closedCount}`,
      `On-Time SLA Rate,${onTimeRate}%`,
      `Rata-Rata Siklus Jam,${avgCycleHours} Jam`,
      `Rasio Revisi,${revisionRate}%`,
      `Utilisasi Armada Isotank,${assetUtilRate}%`,
      `Estimasi Tonase Delivered,${estimatedTonnes} Ton`,
      `Total Kendala Lapangan Open,${openIssuesCount}`,
    ].join('\n');

    const blob = new Blob([csvLines], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Executive_Summary_IsoTrack_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Real-time Ticker & Status Bar with Cyber Effect */}
      <div className="relative overflow-hidden rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-md">
        <div className="absolute inset-0 bg-gradient-to-r from-teal-500/10 via-cyan-500/5 to-purple-500/10 pointer-events-none" />
        
        <div className="p-3.5 px-4 flex flex-wrap items-center justify-between gap-3 relative z-10">
          <div className="flex items-center space-x-3 flex-1 min-w-[280px]">
            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/40 text-[11px] font-extrabold tracking-wider uppercase shrink-0">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping mr-1" />
              LIVE TICKER
            </div>
            
            <div className="text-xs text-slate-200 font-medium truncate flex-1 flex items-center space-x-2">
              <span className="transition-all duration-300 animate-fadeIn">
                {tickerItems[tickerIndex]}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleNextTicker}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold border border-slate-700 transition-colors flex items-center space-x-1"
              title="Notifikasi Berikutnya"
            >
              <span>Next Info</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <div className="h-4 w-px bg-slate-800 hidden sm:block" />
            <span className="text-[11px] font-mono text-slate-400 hidden md:block">
              Status Sistem: <strong className="text-emerald-400">100% OPERATIONAL</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Futuristic Hero Executive Header Banner */}
      <div className="p-6 md:p-7 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-950 border border-slate-800 shadow-2xl relative overflow-hidden group">
        {/* Glow Accent Effects */}
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-teal-500/15 rounded-full blur-3xl pointer-events-none group-hover:bg-teal-500/25 transition-all duration-700" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-wrap items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center space-x-2 flex-wrap gap-y-1">
              <span className="px-3 py-1 rounded-full bg-gradient-to-r from-teal-500/20 to-cyan-500/20 text-teal-300 border border-teal-500/40 text-xs font-extrabold tracking-wider uppercase flex items-center space-x-1.5 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-teal-400 animate-pulse" />
                <span>EXECUTIVE CONTROL CENTER</span>
              </span>
              <span className="text-slate-400 text-xs font-mono">PT Niaga Segara Trasindo · Divisi Logistik Chemical & Gas</span>
            </div>

            <h1 className="text-2xl md:text-3xl font-black text-slate-100 tracking-tight leading-tight">
              Dasbor Monitoring Aset Isotank & Kinerja Operasional
            </h1>
            
            <p className="text-xs md:text-sm text-slate-400 leading-relaxed">
              Pengawasan terintegrasi 8-tahap alur pengiriman cairan dan gas industri. Dilengkapi pemantauan SLA real-time, audit revisi berkas, dan rekomendasi preservasi kualitas berbasis Gemini AI.
            </p>
          </div>

          {/* Action Buttons Group */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleRefresh}
              className={`p-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all ${isRefreshing ? 'animate-spin text-teal-400' : ''}`}
              title="Refresh Data Dasbor"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <button
              onClick={exportDashboardSummary}
              className="px-3.5 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700/80 font-bold text-xs flex items-center space-x-2 shadow-md transition-all hover:border-slate-600"
            >
              <Download className="w-4 h-4 text-cyan-400" />
              <span>Export Summary CSV</span>
            </button>

            <button
              onClick={onOpenNewLead}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-400 hover:from-teal-400 hover:to-cyan-300 text-slate-950 font-black text-xs flex items-center space-x-2 shadow-lg shadow-teal-500/25 transition-all hover:scale-[1.03] active:scale-95"
            >
              <Truck className="w-4 h-4" />
              <span>+ Buat Lead Transaksi Baru</span>
            </button>
          </div>
        </div>

        {/* Dashboard Interactive Filter Tabs */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4 relative z-10">
          
          {/* Muatan Quick Tabs */}
          <div className="flex items-center space-x-1.5 bg-slate-950/70 p-1 rounded-xl border border-slate-800">
            <span className="text-[11px] font-bold text-slate-400 px-2.5 flex items-center space-x-1">
              <Filter className="w-3 h-3 text-teal-400" />
              <span>Muatan:</span>
            </span>
            {[
              { id: 'all', label: 'Semua Muatan' },
              { id: 'chemical', label: 'Bahan Kimia Cair' },
              { id: 'gas', label: 'Gas Industri' },
              { id: 'food', label: 'Food Grade' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedMuatanFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${selectedMuatanFilter === tab.id ? 'bg-teal-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Depo Regional Quick Tabs */}
          <div className="flex items-center space-x-1.5 bg-slate-950/70 p-1 rounded-xl border border-slate-800">
            <span className="text-[11px] font-bold text-slate-400 px-2.5 flex items-center space-x-1">
              <MapPin className="w-3 h-3 text-cyan-400" />
              <span>Koridor Depo:</span>
            </span>
            {[
              { id: 'all', label: 'Semua Koridor' },
              { id: 'surabaya', label: 'Surabaya' },
              { id: 'gresik', label: 'Gresik' },
              { id: 'cilegon', label: 'Cilegon' },
            ].map(depo => (
              <button
                key={depo.id}
                onClick={() => setSelectedDepoFilter(depo.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${selectedDepoFilter === depo.id ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}
              >
                {depo.label}
              </button>
            ))}
          </div>

        </div>
      </div>

      {/* Modern High-Impact KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-3.5">
        
        {/* KPI 1: Total Leads */}
        <div
          className="relative group p-4 rounded-2xl bg-slate-900/90 border border-slate-800/90 hover:border-teal-500/50 transition-all shadow-lg hover:shadow-teal-500/10 cursor-pointer overflow-hidden backdrop-blur-md"
          onMouseEnter={() => setActiveTooltipMetric('total_leads')}
          onMouseLeave={() => setActiveTooltipMetric(null)}
        >
          <div className="absolute top-0 right-0 w-20 h-20 bg-teal-500/10 rounded-bl-full pointer-events-none group-hover:bg-teal-500/20 transition-all" />
          <div className="flex items-center justify-between text-slate-400 mb-1.5 relative z-10">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">Total Lead</span>
            <Activity className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-2xl font-black text-slate-100 font-mono tracking-tight relative z-10">{totalLeads}</div>
          <div className="text-[11px] text-teal-400 font-bold mt-1.5 flex items-center space-x-1 relative z-10">
            <TrendingUp className="w-3 h-3" />
            <span>{activeLeads.length} Aktif di Siklus</span>
          </div>

          {activeTooltipMetric === 'total_leads' && (
            <div className="absolute top-full left-0 mt-2 w-64 p-3 bg-slate-950 border border-slate-700 rounded-xl shadow-2xl z-50 text-xs text-slate-200 animate-fadeIn">
              <strong className="text-teal-400 block mb-1">Rincian Total Lead Pengiriman</strong>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Jumlah kumulatif transaksi pengiriman dalam periode terpilih. {closedCount} lead telah selesai diarsipkan.
              </p>
            </div>
          )}
        </div>

        {/* KPI 2: SLA On-Time */}
        <div
          className="relative group p-4 rounded-2xl bg-slate-900/90 border border-slate-800/90 hover:border-emerald-500/50 transition-all shadow-lg hover:shadow-emerald-500/10 cursor-pointer overflow-hidden backdrop-blur-md"
          onMouseEnter={() => setActiveTooltipMetric('sla_on_time')}
          onMouseLeave={() => setActiveTooltipMetric(null)}
        >
          <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/10 rounded-bl-full pointer-events-none group-hover:bg-emerald-500/20 transition-all" />
          <div className="flex items-center justify-between text-slate-400 mb-1.5 relative z-10">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">On-Time SLA</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono tracking-tight relative z-10">{onTimeRate}%</div>
          <div className="text-[11px] text-slate-400 font-medium mt-1.5 relative z-10">Target Perusahaan: ≥ 90%</div>

          {activeTooltipMetric === 'sla_on_time' && (
            <div className="absolute top-full left-0 mt-2 w-64 p-3 bg-slate-950 border border-slate-700 rounded-xl shadow-2xl z-50 text-xs text-slate-200 animate-fadeIn">
              <strong className="text-emerald-400 block mb-1">Ketepatan Waktu Ketibaan (SLA)</strong>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Persentase pengiriman yang tiba di lokasi penerima sebelum batas waktu jam SLA yang disepakati.
              </p>
            </div>
          )}
        </div>

        {/* KPI 3: Avg Cycle Hours */}
        <div
          className="relative group p-4 rounded-2xl bg-slate-900/90 border border-slate-800/90 hover:border-cyan-500/50 transition-all shadow-lg hover:shadow-cyan-500/10 cursor-pointer overflow-hidden backdrop-blur-md"
          onMouseEnter={() => setActiveTooltipMetric('cycle_time')}
          onMouseLeave={() => setActiveTooltipMetric(null)}
        >
          <div className="absolute top-0 right-0 w-20 h-20 bg-cyan-500/10 rounded-bl-full pointer-events-none group-hover:bg-cyan-500/20 transition-all" />
          <div className="flex items-center justify-between text-slate-400 mb-1.5 relative z-10">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">Rata Siklus</span>
            <Clock className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-cyan-300 font-mono tracking-tight relative z-10">{avgCycleHours}j</div>
          <div className="text-[11px] text-slate-400 font-medium mt-1.5 relative z-10">Stage 1 s/d Stage 8</div>

          {activeTooltipMetric === 'cycle_time' && (
            <div className="absolute top-full left-0 mt-2 w-64 p-3 bg-slate-950 border border-slate-700 rounded-xl shadow-2xl z-50 text-xs text-slate-200 animate-fadeIn">
              <strong className="text-cyan-400 block mb-1">Rata-rata Waktu Siklus Pengiriman</strong>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Total durasi jam yang dibutuhkan sejak Lead dibuat (Stage 1) hingga arsip penutupan final (Stage 8).
              </p>
            </div>
          )}
        </div>

        {/* KPI 4: Revision Rate */}
        <div
          className="relative group p-4 rounded-2xl bg-slate-900/90 border border-slate-800/90 hover:border-amber-500/50 transition-all shadow-lg hover:shadow-amber-500/10 cursor-pointer overflow-hidden backdrop-blur-md"
          onMouseEnter={() => setActiveTooltipMetric('revisions')}
          onMouseLeave={() => setActiveTooltipMetric(null)}
        >
          <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/10 rounded-bl-full pointer-events-none group-hover:bg-amber-500/20 transition-all" />
          <div className="flex items-center justify-between text-slate-400 mb-1.5 relative z-10">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">Rasio Revisi</span>
            <RotateCcw className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400 font-mono tracking-tight relative z-10">{revisionRate}%</div>
          <div className="text-[11px] text-slate-400 font-medium mt-1.5 relative z-10">{totalRevisions} Total Perbaikan</div>

          {activeTooltipMetric === 'revisions' && (
            <div className="absolute top-full left-0 mt-2 w-64 p-3 bg-slate-950 border border-slate-700 rounded-xl shadow-2xl z-50 text-xs text-slate-200 animate-fadeIn">
              <strong className="text-amber-400 block mb-1">Rasio Revisi & Refollow-up Berkas</strong>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Persentase transaksi yang dikembalikan oleh Reviewer untuk perbaikan berkas di Stage 6.
              </p>
            </div>
          )}
        </div>

        {/* KPI 5: Fleet Utilization */}
        <div
          className="relative group p-4 rounded-2xl bg-slate-900/90 border border-slate-800/90 hover:border-purple-500/50 transition-all shadow-lg hover:shadow-purple-500/10 cursor-pointer overflow-hidden backdrop-blur-md"
          onMouseEnter={() => setActiveTooltipMetric('utilization')}
          onMouseLeave={() => setActiveTooltipMetric(null)}
        >
          <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 rounded-bl-full pointer-events-none group-hover:bg-purple-500/20 transition-all" />
          <div className="flex items-center justify-between text-slate-400 mb-1.5 relative z-10">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">Utilisasi ISO</span>
            <Truck className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-purple-300 font-mono tracking-tight relative z-10">{assetUtilRate}%</div>
          <div className="text-[11px] text-slate-400 font-medium mt-1.5 relative z-10">{operatingAssets}/{totalAssets} Unit Beroperasi</div>

          {activeTooltipMetric === 'utilization' && (
            <div className="absolute top-full left-0 mt-2 w-64 p-3 bg-slate-950 border border-slate-700 rounded-xl shadow-2xl z-50 text-xs text-slate-200 animate-fadeIn">
              <strong className="text-purple-400 block mb-1">Tingkat Utilisasi Armada Isotank</strong>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Persentase unit isotank yang sedang dalam perjalanan pengiriman aktif (Status Beroperasi).
              </p>
            </div>
          )}
        </div>

        {/* KPI 6: Estimated Delivered Tonnes */}
        <div
          className="relative group p-4 rounded-2xl bg-slate-900/90 border border-slate-800/90 hover:border-indigo-500/50 transition-all shadow-lg hover:shadow-indigo-500/10 cursor-pointer overflow-hidden backdrop-blur-md"
          onMouseEnter={() => setActiveTooltipMetric('tonnes')}
          onMouseLeave={() => setActiveTooltipMetric(null)}
        >
          <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-500/10 rounded-bl-full pointer-events-none group-hover:bg-indigo-500/20 transition-all" />
          <div className="flex items-center justify-between text-slate-400 mb-1.5 relative z-10">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">Tonase Cairan</span>
            <Gauge className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-indigo-300 font-mono tracking-tight relative z-10">{estimatedTonnes} <span className="text-xs font-normal text-slate-400">Ton</span></div>
          <div className="text-[11px] text-slate-400 font-medium mt-1.5 relative z-10">Cairan & Gas Delivered</div>

          {activeTooltipMetric === 'tonnes' && (
            <div className="absolute top-full left-0 mt-2 w-64 p-3 bg-slate-950 border border-slate-700 rounded-xl shadow-2xl z-50 text-xs text-slate-200 animate-fadeIn">
              <strong className="text-indigo-400 block mb-1">Total Tonase Terkirim</strong>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Estimasi akumulasi tonase muatan bahan kimia cair & gas industri yang telah berhasil terdistribusi.
              </p>
            </div>
          )}
        </div>

        {/* KPI 7: Open Field Issues */}
        <div
          className="relative group p-4 rounded-2xl bg-slate-900/90 border border-slate-800/90 hover:border-rose-500/50 transition-all shadow-lg hover:shadow-rose-500/10 cursor-pointer overflow-hidden backdrop-blur-md"
          onMouseEnter={() => setActiveTooltipMetric('open_issues')}
          onMouseLeave={() => setActiveTooltipMetric(null)}
        >
          <div className="absolute top-0 right-0 w-20 h-20 bg-rose-500/10 rounded-bl-full pointer-events-none group-hover:bg-rose-500/20 transition-all" />
          <div className="flex items-center justify-between text-slate-400 mb-1.5 relative z-10">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">Kendala Open</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-black text-rose-400 font-mono tracking-tight relative z-10">{openIssuesCount}</div>
          <div className="text-[11px] text-slate-400 font-medium mt-1.5 relative z-10">Perlu Penanganan</div>

          {activeTooltipMetric === 'open_issues' && (
            <div className="absolute top-full left-0 mt-2 w-64 p-3 bg-slate-950 border border-slate-700 rounded-xl shadow-2xl z-50 text-xs text-slate-200 animate-fadeIn">
              <strong className="text-rose-400 block mb-1">Kendala Lapangan Belum Selesai</strong>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Jumlah hambatan teknis atau administratif yang dilaporkan dan belum ditandai teratasi oleh tim.
              </p>
            </div>
          )}
        </div>

        {/* KPI 8: HSE Safety Audit Grade */}
        <div
          className="relative group p-4 rounded-2xl bg-slate-900/90 border border-slate-800/90 hover:border-teal-400/50 transition-all shadow-lg hover:shadow-teal-400/10 cursor-pointer overflow-hidden backdrop-blur-md"
          onMouseEnter={() => setActiveTooltipMetric('hse_safety')}
          onMouseLeave={() => setActiveTooltipMetric(null)}
        >
          <div className="absolute top-0 right-0 w-20 h-20 bg-teal-500/10 rounded-bl-full pointer-events-none group-hover:bg-teal-500/20 transition-all" />
          <div className="flex items-center justify-between text-slate-400 mb-1.5 relative z-10">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">Skor HSE QC</span>
            <ShieldCheck className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-2xl font-black text-teal-300 font-mono tracking-tight relative z-10">99.2%</div>
          <div className="text-[11px] text-emerald-400 font-bold mt-1.5 relative z-10">Grade AAA Zero Incident</div>

          {activeTooltipMetric === 'hse_safety' && (
            <div className="absolute top-full left-0 mt-2 w-64 p-3 bg-slate-950 border border-slate-700 rounded-xl shadow-2xl z-50 text-xs text-slate-200 animate-fadeIn">
              <strong className="text-teal-400 block mb-1">Skor Keselamatan HSE & Integritas Segel</strong>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Tingkat kepatuhan standar penanganan B3 (Bahan Berbahaya & Beracun) serta keutuhan segel valve isotank.
              </p>
            </div>
          )}
        </div>

      </div>

      {/* Interactive Cyber Pipeline 8-Tahap Grid */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800/90 shadow-xl space-y-4 backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <Layers className="w-4 h-4 text-teal-400" />
              <h3 className="font-extrabold text-slate-100 text-sm md:text-base">
                Pipelines Matriks 8-Tahap Status Lead Transaksi
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Klik pada salah satu tahap alur kerja untuk menyaring dan membuka daftar transaksi secara mendalam.
            </p>
          </div>
          
          <button
            onClick={() => setActiveView('leads')}
            className="px-3.5 py-1.5 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs font-bold flex items-center space-x-1.5 transition-all"
          >
            <span>Buka Transaksi Lead</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {STAGE_LIST.map((stg) => {
            const count = displayLeads.filter(l => l.status === stg.id).length;
            const percentage = totalLeads > 0 ? Math.round((count / totalLeads) * 100) : 0;
            return (
              <button
                key={stg.step}
                onClick={() => setActiveView('leads')}
                className="p-3.5 rounded-2xl border border-slate-800 bg-slate-950/60 hover:bg-slate-800/90 hover:border-teal-500/60 transition-all text-left flex flex-col justify-between group shadow-sm hover:shadow-teal-500/10 hover:-translate-y-0.5"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider font-mono">
                      Step {stg.step}
                    </span>
                    <span className="w-2.5 h-2.5 rounded-full bg-teal-400 group-hover:scale-125 transition-transform shadow-sm shadow-teal-400/50" />
                  </div>
                  <div className="text-xs font-extrabold text-slate-200 group-hover:text-teal-300 leading-tight">
                    {stg.shortName}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5 truncate">{stg.actor}</div>
                </div>

                <div className="mt-4 pt-2 border-t border-slate-800/80">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xl font-black text-slate-100 font-mono group-hover:text-teal-300">
                      {count}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono font-bold">
                      {percentage}%
                    </span>
                  </div>
                  {/* Micro Progress Bar */}
                  <div className="w-full bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-teal-500 to-cyan-400 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(percentage, count > 0 ? 15 : 0)}%` }}
                    />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Chart 1: Trend Volume & Cycle Time */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-md">
          <div className="flex flex-wrap items-center justify-between mb-4 gap-2">
            <div>
              <div className="flex items-center space-x-2">
                <BarChart2 className="w-4 h-4 text-teal-400" />
                <h3 className="font-extrabold text-slate-100 text-sm md:text-base">
                  Tren Volume Pengiriman & Waktu Siklus (Jam)
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Perkembangan bulanan jumlah pengiriman dan efisiensi waktu siklus dari Stage 1 hingga Stage 8.
              </p>
            </div>
            
            <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 text-[11px] font-mono font-bold border border-slate-700">
              Periode 6 Bulan Terakhir
            </span>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                <YAxis yAxisId="left" stroke="#14b8a6" fontSize={11} />
                <YAxis yAxisId="right" orientation="right" stroke="#38bdf8" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '14px', fontSize: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar yAxisId="left" dataKey="volume" name="Jumlah Lead Pengiriman" fill="#14b8a6" radius={[6, 6, 0, 0]} />
                <Line yAxisId="right" type="monotone" dataKey="cycleHours" name="Rata Siklus (Jam)" stroke="#38bdf8" strokeWidth={3} dot={{ r: 5, fill: '#38bdf8' }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Status Distribution Donut */}
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-md">
          <div className="mb-3">
            <div className="flex items-center space-x-2">
              <PieIcon className="w-4 h-4 text-cyan-400" />
              <h3 className="font-extrabold text-slate-100 text-sm md:text-base">
                Distribusi Status Transaksi
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Komposisi lead aktif per tahap alur 8-tahap.
            </p>
          </div>

          <div className="h-52 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusCounts}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="count"
                >
                  {statusCounts.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '11px' }}
                />
              </PieChart>
            </ResponsiveContainer>

            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-black text-slate-100 font-mono">{totalLeads}</span>
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Total Lead</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300 mt-2 border-t border-slate-800 pt-3">
            {statusCounts.map(st => (
              <div key={st.name} className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: st.color }} />
                <span className="truncate text-slate-400">{st.name}: <strong className="text-slate-100">{st.count}</strong></span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Fleet Operational Health Matrix & Route Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Route Logistics Leaderboard */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-md">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center space-x-2">
                <Compass className="w-4 h-4 text-emerald-400" />
                <h3 className="font-extrabold text-slate-100 text-sm md:text-base">
                  Analisis Performa Koridor Logistik Utama
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Evaluasi volume tonase dan tingkat keandalan SLA pada rute pengiriman berkepadatan tinggi.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {routeAnalyticsData.map((route, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-teal-500/40 transition-all flex items-center justify-between flex-wrap gap-3"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 font-extrabold font-mono text-sm flex items-center justify-center">
                    #{idx + 1}
                  </div>
                  <div>
                    <div className="font-bold text-slate-100 text-xs sm:text-sm">{route.rute}</div>
                    <div className="text-[11px] text-slate-400 flex items-center space-x-3 mt-0.5">
                      <span>{route.leads} Transaksi Lead</span>
                      <span>•</span>
                      <span className="text-indigo-300 font-mono">{route.tonase} Ton Delivered</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-xs font-black text-emerald-400 font-mono">{route.slaPercent}% SLA</div>
                    <div className="text-[10px] text-slate-400">On-Time Arrival</div>
                  </div>
                  <div className="w-20 bg-slate-800 h-2 rounded-full overflow-hidden hidden sm:block">
                    <div
                      className="bg-emerald-400 h-full rounded-full"
                      style={{ width: `${route.slaPercent}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Isotank Fleet Status Gauge */}
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-md">
          <div className="mb-4">
            <div className="flex items-center space-x-2">
              <Truck className="w-4 h-4 text-purple-400" />
              <h3 className="font-extrabold text-slate-100 text-sm md:text-base">
                Status Armada Isotank Aktif
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Alokasi fisik unit isotank berdasarkan kesiapan depo.
            </p>
          </div>

          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={assetStatusChartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis type="number" stroke="#94a3b8" fontSize={11} />
                <YAxis dataKey="status" type="category" stroke="#94a3b8" fontSize={11} width={110} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }} />
                <Bar dataKey="count" name="Jumlah Unit" radius={[0, 6, 6, 0]}>
                  {assetStatusChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs flex items-center justify-between">
            <div className="text-slate-300">
              <span className="font-bold text-teal-400">{operatingAssets} Unit</span> Beroperasi Aktif
            </div>
            <button
              onClick={() => setActiveView('leads')}
              className="text-teal-400 hover:underline font-bold text-[11px]"
            >
              Cek Detail Armada &rarr;
            </button>
          </div>
        </div>

      </div>

      {/* Bottom Section: Gemini AI Prescriptive Insights & Urgent Active Leads */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Gemini AI Prescriptive Insights Widget */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-teal-500/40 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-teal-500/20 transition-all" />
          
          <div className="flex items-center justify-between mb-4 relative z-10">
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-xl bg-teal-500/20 text-teal-300 border border-teal-500/30">
                <Sparkles className="w-5 h-5 text-teal-400 animate-pulse" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-100 text-sm md:text-base">
                  Gemini AI Prescriptive Insights
                </h3>
                <span className="text-[10px] text-teal-400 font-mono font-bold uppercase">
                  Real-time Neural Recommendation
                </span>
              </div>
            </div>

            <button
              onClick={() => setActiveView('ai_recommendations')}
              className="text-xs text-teal-400 hover:text-teal-300 font-bold"
            >
              Detail AI &rarr;
            </button>
          </div>

          <p className="text-xs text-slate-300 mb-4 leading-relaxed relative z-10">
            Rekomendasi optimasi berbasis analisis pola pergerakan isotank, pencegahan revisi berkas, dan kepatuhan SLA:
          </p>

          <div className="space-y-3 relative z-10">
            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-teal-500/30 text-xs hover:border-teal-400/50 transition-all">
              <div className="flex items-center justify-between mb-1">
                <span className="font-extrabold text-teal-300">Peringatan Masa Tunggu Stage 5</span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  Akurasi 98%
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Alokasikan Reviewer tambahan untuk rute Tuban ➔ Semarang guna menekan masa tunggu berkas di atas 4 jam.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-amber-500/30 text-xs hover:border-amber-400/50 transition-all">
              <div className="flex items-center justify-between mb-1">
                <span className="font-extrabold text-amber-300">Optimasi Utilisasi Isotank Idle</span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Efisiensi +14%
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Unit ISO-20T-03 & ISO-20T-07 berstatus Tersedia di Depo Surabaya dapat langsung dialokasikan ke rute muatan Caustic Soda.
              </p>
            </div>
          </div>
        </div>

        {/* Active Lead Overview with Clickable Quick Drilldown */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-md">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-teal-400" />
                <h3 className="font-extrabold text-slate-100 text-sm md:text-base">
                  Lead Aktif Terbaru dalam Proses
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Klik pada baris mana saja untuk melihat detail dokumen, bukti foto, dan riwayat status transaksi.
              </p>
            </div>

            <button
              onClick={() => setActiveView('leads')}
              className="text-xs text-teal-400 hover:text-teal-300 font-bold"
            >
              Lihat Semua Transaksi &rarr;
            </button>
          </div>

          <div className="space-y-3">
            {activeLeads.slice(0, 5).map((ld) => (
              <div
                key={ld.id}
                onClick={() => {
                  setSelectedLeadId(ld.id);
                  setActiveView('leads');
                }}
                className="p-3.5 rounded-2xl border border-slate-800 bg-slate-950/60 hover:bg-slate-800/80 hover:border-teal-500/50 transition-all flex items-center justify-between cursor-pointer group shadow-sm hover:translate-x-1"
              >
                <div className="flex items-center space-x-3.5">
                  <div className="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center font-black text-xs font-mono">
                    S{ld.current_step}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                        {ld.lead_code || 'LEAD-00101'}
                      </span>
                      <span className="font-mono font-bold text-slate-100 text-xs sm:text-sm group-hover:text-teal-300">
                        {ld.no_surat_jalan}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">[{ld.asset_code}]</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {ld.asal} &rarr; {ld.tujuan} ({ld.muatan})
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold bg-slate-800 text-teal-300 border border-slate-700 block mb-1">
                    Stage {ld.current_step}/8
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">PIC: {ld.pic_name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
