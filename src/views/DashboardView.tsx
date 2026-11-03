import React, { useState, useMemo } from 'react';
import {
  TrendingUp, Clock, CheckCircle2, AlertTriangle, Truck, Sparkles,
  RotateCcw, ShieldCheck, HelpCircle, ArrowRight, Activity, FileText,
  Zap, Award, SlidersHorizontal, Layers, Gauge, Compass, Eye, Download,
  RefreshCw, MapPin, Thermometer, Filter, ChevronRight, ShieldAlert,
  BarChart2, PieChart as PieIcon, Calendar, Check, Search, DollarSign,
  Target, CheckCheck, FileCheck, Star, ChevronDown, CalendarRange, Users
} from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend, AreaChart, Area
} from 'recharts';
import { useApp } from '../context/AppContext';
import { STAGE_LIST } from '../data/stageConfig';
import { Lead } from '../types';
import { ReportDownloadModal, ReportCategory } from '../components/ReportDownloadModal';

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
    periodFilter,
    setPeriodFilter,
    leads,
    currentUser
  } = useApp();

  // Primary Sub-Menu Navigation State: Monitoring vs Tracking
  const [dashboardSubTab, setDashboardSubTab] = useState<'monitoring' | 'tracking'>('monitoring');

  // Interactive filters
  const [selectedMuatanFilter, setSelectedMuatanFilter] = useState<string>('all');
  const [selectedDepoFilter, setSelectedDepoFilter] = useState<string>('all');
  const [finishedLeadsSearch, setFinishedLeadsSearch] = useState<string>('');
  const [finishedSlaFilter, setFinishedSlaFilter] = useState<'all' | 'ontime' | 'late'>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [tickerIndex, setTickerIndex] = useState(0);
  const [actionCategory, setActionCategory] = useState<'all' | 'approval' | 'followup' | 'overdue'>('all');

  // Month & Year selector states
  const [selectedMonth, setSelectedMonth] = useState<number>(10);
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [calendarStart, setCalendarStart] = useState<string>(periodFilter.startDate || '2026-10-01');
  const [calendarEnd, setCalendarEnd] = useState<string>(periodFilter.endDate || '2026-10-31');
  const [showCalendarModal, setShowCalendarModal] = useState<boolean>(false);

  // Report Download Popup Modal State
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState<boolean>(false);
  const [downloadModalInitialType, setDownloadModalInitialType] = useState<ReportCategory>('finished');

  const openDownloadReportPopup = (type: ReportCategory = 'finished') => {
    setDownloadModalInitialType(type);
    setIsDownloadModalOpen(true);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  const monthNames = [
    { num: 1, name: 'Januari' },
    { num: 2, name: 'Februari' },
    { num: 3, name: 'Maret' },
    { num: 4, name: 'April' },
    { num: 5, name: 'Mei' },
    { num: 6, name: 'Juni' },
    { num: 7, name: 'Juli' },
    { num: 8, name: 'Agustus' },
    { num: 9, name: 'September' },
    { num: 10, name: 'Oktober' },
    { num: 11, name: 'November' },
    { num: 12, name: 'Desember' },
  ];

  const handleMonthYearChange = (m: number, y: number) => {
    setSelectedMonth(m);
    setSelectedYear(y);
    const padMonth = String(m).padStart(2, '0');
    const daysInMonth = new Date(y, m, 0).getDate();
    const startDate = `${y}-${padMonth}-01`;
    const endDate = `${y}-${padMonth}-${String(daysInMonth).padStart(2, '0')}`;
    setCalendarStart(startDate);
    setCalendarEnd(endDate);
    setPeriodFilter({
      preset: 'month_year',
      startDate,
      endDate,
      selectedMonth: m,
      selectedYear: y,
    });
  };

  const handleApplyCalendar = () => {
    if (calendarStart && calendarEnd) {
      setPeriodFilter({
        preset: 'custom',
        startDate: calendarStart,
        endDate: calendarEnd,
      });
      setShowCalendarModal(false);
    }
  };

  // Filtered Leads
  const displayLeads = useMemo(() => {
    return filteredLeads.filter(l => {
      const matchMuatan = selectedMuatanFilter === 'all' ||
        (selectedMuatanFilter === 'chemical' && (l.muatan.toLowerCase().includes('kimia') || l.muatan.toLowerCase().includes('caustic') || l.muatan.toLowerCase().includes('acid') || l.muatan.toLowerCase().includes('alcohol') || l.muatan.toLowerCase().includes('resin'))) ||
        (selectedMuatanFilter === 'gas' && (l.muatan.toLowerCase().includes('gas') || l.muatan.toLowerCase().includes('nitrogen') || l.muatan.toLowerCase().includes('argon') || l.muatan.toLowerCase().includes('ammonia'))) ||
        (selectedMuatanFilter === 'food' && (l.muatan.toLowerCase().includes('food') || l.muatan.toLowerCase().includes('sawit') || l.muatan.toLowerCase().includes('cpo') || l.muatan.toLowerCase().includes('olein') || l.muatan.toLowerCase().includes('pfad') || l.muatan.toLowerCase().includes('sugar')));
      
      const matchDepo = selectedDepoFilter === 'all' ||
        (selectedDepoFilter === 'surabaya' && (l.asal.toLowerCase().includes('surabaya') || l.tujuan.toLowerCase().includes('surabaya'))) ||
        (selectedDepoFilter === 'gresik' && (l.asal.toLowerCase().includes('gresik') || l.tujuan.toLowerCase().includes('gresik'))) ||
        (selectedDepoFilter === 'cilegon' && (l.asal.toLowerCase().includes('cilegon') || l.tujuan.toLowerCase().includes('cilegon')));

      return matchMuatan && matchDepo;
    });
  }, [filteredLeads, selectedMuatanFilter, selectedDepoFilter]);

  // Action Needed Queue
  const allActionNeededLeads = useMemo(() => {
    return leads.filter(l => {
      if (l.status === 'closed') return false;
      const isLate = Boolean(l.sla_hours_actual && l.sla_hours_target && l.sla_hours_actual > l.sla_hours_target);
      const diffHours = (l.sla_hours_target || 48) - (l.sla_hours_actual || 0);
      const isUrgentSla = diffHours <= 12;

      if (currentUser.role === 'manager') {
        return l.status === 'lead_approval' || l.status === 'final_approval' || isLate || isUrgentSla;
      }
      if (currentUser.role === 'reviewer') {
        return l.status === 'submission' || l.status === 'review' || isLate;
      }
      if (currentUser.role === 'karyawan') {
        return l.status === 'follow_up' || l.status === 'lead_created' || (l.pic_id === currentUser.id && isUrgentSla);
      }
      if (currentUser.role === 'operasional') {
        return (l.operationalSubStages || []).some(s => s.status === 'berjalan' || s.status === 'belum') || isLate;
      }
      return l.status === 'lead_approval' || l.status === 'final_approval' || l.status === 'follow_up' || isLate || isUrgentSla;
    });
  }, [leads, currentUser]);

  const approvalCategoryCount = useMemo(() => {
    return allActionNeededLeads.filter(l => l.status === 'lead_approval' || l.status === 'final_approval').length;
  }, [allActionNeededLeads]);

  const followupCategoryCount = useMemo(() => {
    return allActionNeededLeads.filter(l => l.status === 'follow_up' || l.status === 'lead_created').length;
  }, [allActionNeededLeads]);

  const overdueCategoryCount = useMemo(() => {
    return allActionNeededLeads.filter(l => {
      const isLate = Boolean(l.sla_hours_actual && l.sla_hours_target && l.sla_hours_actual > l.sla_hours_target);
      const diffHours = (l.sla_hours_target || 48) - (l.sla_hours_actual || 0);
      return isLate || diffHours <= 12;
    }).length;
  }, [allActionNeededLeads]);

  const displayedActionNeededLeads = useMemo(() => {
    if (actionCategory === 'approval') {
      return allActionNeededLeads.filter(l => l.status === 'lead_approval' || l.status === 'final_approval');
    }
    if (actionCategory === 'followup') {
      return allActionNeededLeads.filter(l => l.status === 'follow_up' || l.status === 'lead_created');
    }
    if (actionCategory === 'overdue') {
      return allActionNeededLeads.filter(l => {
        const isLate = Boolean(l.sla_hours_actual && l.sla_hours_target && l.sla_hours_actual > l.sla_hours_target);
        const diffHours = (l.sla_hours_target || 48) - (l.sla_hours_actual || 0);
        return isLate || diffHours <= 12;
      });
    }
    return allActionNeededLeads;
  }, [allActionNeededLeads, actionCategory]);

  // Analytics Computation
  const totalLeads = displayLeads.length;
  const closedLeads = useMemo(() => displayLeads.filter(l => l.status === 'closed'), [displayLeads]);
  const activeLeads = displayLeads.filter(l => l.status !== 'closed');
  const closedCount = closedLeads.length;

  const filteredFinishedLeads = useMemo(() => {
    return closedLeads.filter(l => {
      const q = finishedLeadsSearch.toLowerCase().trim();
      const matchSearch = q === '' ||
        l.no_surat_jalan.toLowerCase().includes(q) ||
        l.lead_code.toLowerCase().includes(q) ||
        (l.client_company && l.client_company.toLowerCase().includes(q)) ||
        l.muatan.toLowerCase().includes(q) ||
        l.asset_code.toLowerCase().includes(q) ||
        (l.creator_name && l.creator_name.toLowerCase().includes(q)) ||
        (l.pic_name && l.pic_name.toLowerCase().includes(q));

      const isLate = (l.sla_hours_actual && l.sla_hours_target && l.sla_hours_actual > l.sla_hours_target);
      const matchSla = finishedSlaFilter === 'all' ||
        (finishedSlaFilter === 'ontime' && !isLate) ||
        (finishedSlaFilter === 'late' && isLate);

      return matchSearch && matchSla;
    });
  }, [closedLeads, finishedLeadsSearch, finishedSlaFilter]);

  const creatorPerformance = useMemo(() => {
    const map = new Map<string, {
      name: string;
      leadsCount: number;
      totalTonase: number;
      totalRevenue: number;
      onTimeCount: number;
      kpiTotal: number;
    }>();

    closedLeads.forEach(l => {
      const name = l.creator_name || l.pic_name || 'Budi Santoso';
      const existing = map.get(name) || {
        name,
        leadsCount: 0,
        totalTonase: 0,
        totalRevenue: 0,
        onTimeCount: 0,
        kpiTotal: 0,
      };

      existing.leadsCount += 1;
      existing.totalTonase += l.volume_tonase || 24;
      existing.totalRevenue += l.contract_value || 45000000;
      const isLate = l.sla_hours_actual && l.sla_hours_target && l.sla_hours_actual > l.sla_hours_target;
      if (!isLate) existing.onTimeCount += 1;
      existing.kpiTotal += l.kpi_score || 96;

      map.set(name, existing);
    });

    return Array.from(map.values()).map(item => ({
      ...item,
      onTimeRate: item.leadsCount > 0 ? Math.round((item.onTimeCount / item.leadsCount) * 100) : 100,
      avgKpi: item.leadsCount > 0 ? (item.kpiTotal / item.leadsCount).toFixed(1) : '95.0',
    }));
  }, [closedLeads]);

  const onTimeCount = closedLeads.filter(l => {
    if (l.sla_hours_actual && l.sla_hours_target) {
      return l.sla_hours_actual <= l.sla_hours_target;
    }
    const c = closures.find(cl => cl.lead_id === l.id);
    return c ? c.sla_on_time : true;
  }).length;

  const onTimeRate = closedCount > 0 ? Math.round((onTimeCount / closedCount) * 100) : 96;

  const avgCycleHours = closures.length > 0
    ? Math.round(closures.reduce((acc, c) => acc + c.total_hours, 0) / closures.length)
    : 198;

  const totalAssets = assets.length;
  const operatingAssets = assets.filter(a => a.status === 'Beroperasi').length;
  const maintenanceAssets = assets.filter(a => a.status === 'Perawatan').length;
  const availableAssets = assets.filter(a => a.status === 'Tersedia').length;
  const assetUtilRate = totalAssets > 0 ? Math.round((operatingAssets / totalAssets) * 100) : 73;

  const totalDeliveredTonnes = closedLeads.reduce((acc, l) => acc + (l.volume_tonase || 24), 0);
  const totalFinishedRevenue = closedLeads.reduce((acc, l) => acc + (l.contract_value || 45000000), 0);

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

  const trendData = [
    { month: 'Mei', volume: 18, cycleHours: 210, tonase: 396 },
    { month: 'Jun', volume: 22, cycleHours: 204, tonase: 484 },
    { month: 'Jul', volume: 25, cycleHours: 200, tonase: 550 },
    { month: 'Agt', volume: 29, cycleHours: 195, tonase: 638 },
    { month: 'Sep', volume: 34, cycleHours: 192, tonase: 748 },
    { month: 'Okt', volume: 38, cycleHours: avgCycleHours, tonase: 836 },
  ];

  const routeAnalyticsData = [
    { rute: 'Surabaya ↔ Cilegon', leads: 14, tonase: 308, slaPercent: 96 },
    { rute: 'Gresik ↔ Semarang', leads: 10, tonase: 220, slaPercent: 92 },
    { rute: 'Tuban ↔ Jakarta', leads: 8, tonase: 176, slaPercent: 98 },
    { rute: 'Pasuruan ↔ Bandung', leads: 6, tonase: 132, slaPercent: 90 },
  ];

  const assetStatusChartData = [
    { status: 'Beroperasi', count: operatingAssets, fill: '#14b8a6' },
    { status: 'Tersedia Depo', count: availableAssets, fill: '#3b82f6' },
    { status: 'Perawatan', count: maintenanceAssets + 1, fill: '#f59e0b' },
  ];

  const tickerItems = [
    `⚡ LIVE: Transaksi LEAD-00101 (SJ-2026-0891) baru saja memasuki Stage 3 (In Progress)`,
    `🛡️ KUALITAS & KEPATUHAN: QC Seal Integrity Rate Armada Isotank mencapai 98.4%`,
    `🚨 SLA MONITORING: 2 Lead rute Cilegon mendekati estimasi ketibaan target waktu`,
    `🚚 FLEET UPDATE: Unit ISO-20T-04 dalam rute perjalanan aktif Gresik ➔ Semarang`,
    `✅ MANAGER APPROVAL: Lead LEAD-00104 rute Tuban disetujui Manager Probo Subagyo`
  ];

  const exportFinishedLeadsCsv = () => {
    const headers = [
      'ID Lead', 'No Surat Jalan', 'Klien', 'Muatan', 'Isotank',
      'Rute', 'Selesai', 'SLA', 'Revenue (IDR)', 'KPI Score', 'BASTP'
    ];
    const rows = filteredFinishedLeads.map(l => {
      const isLate = (l.sla_hours_actual && l.sla_hours_target && l.sla_hours_actual > l.sla_hours_target);
      return [
        l.lead_code, l.no_surat_jalan, `"${l.client_company || '-'}"`, `"${l.muatan}"`,
        l.asset_code, `"${l.asal} -> ${l.tujuan}"`, l.completed_at || l.updated_at,
        isLate ? 'TERLAMBAT' : 'ON-TIME', l.contract_value || 45000000, l.kpi_score || 96,
        `"${l.final_delivery_doc_name || 'BASTP.pdf'}"`
      ];
    });
    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Laporan_Lead_Finish_${selectedYear}_${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      
      {/* HEADER SECTION WITH SINGLE-ROW MONITORING TABS & COMPACT PERIOD CONTROLS */}
      <div className="p-3.5 md:p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="flex flex-wrap lg:flex-nowrap items-center justify-between gap-3 w-full">
          
          {/* Left Side: Title & Sub-Menu Tabs (Monitoring vs Tracking) */}
          <div className="flex items-center space-x-3 shrink-0">
            <h1 className="text-lg md:text-xl font-black text-slate-100 tracking-tight">
              Dasbor Operasional
            </h1>

            {/* Sub-Menu Tabs: Monitoring vs Tracking */}
            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setDashboardSubTab('monitoring')}
                className={`px-3 py-1.5 rounded-lg font-extrabold transition-all flex items-center space-x-1.5 ${
                  dashboardSubTab === 'monitoring'
                    ? 'bg-teal-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <BarChart2 className="w-3.5 h-3.5" />
                <span>Monitoring</span>
              </button>

              <button
                type="button"
                onClick={() => setDashboardSubTab('tracking')}
                className={`px-3 py-1.5 rounded-lg font-extrabold transition-all flex items-center space-x-1.5 ${
                  dashboardSubTab === 'tracking'
                    ? 'bg-teal-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Truck className="w-3.5 h-3.5" />
                <span>Tracking</span>
                {allActionNeededLeads.length > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black">
                    {allActionNeededLeads.length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Right Side: Streamlined Compact Period Controls in 1 Row */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap justify-end shrink-0">
            
            {/* Month Dropdown */}
            <div className="flex items-center bg-slate-950/60 hover:bg-slate-900 border border-transparent hover:border-slate-800 rounded-xl px-2.5 py-1.5 text-xs transition-all shadow-sm">
              <Calendar className="w-3.5 h-3.5 text-teal-400 mr-1.5 shrink-0 pointer-events-none" />
              <select
                value={selectedMonth}
                onChange={(e) => handleMonthYearChange(Number(e.target.value), selectedYear)}
                className="bg-transparent text-slate-100 font-bold text-xs border-0 outline-none ring-0 focus:outline-none focus:ring-0 focus:border-0 appearance-none cursor-pointer pr-1"
              >
                {monthNames.map(m => (
                  <option key={m.num} value={m.num} className="bg-slate-900 text-slate-100">
                    {m.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3 h-3 text-slate-400 ml-0.5 pointer-events-none shrink-0" />
            </div>

            {/* Year Dropdown */}
            <div className="flex items-center bg-slate-950/60 hover:bg-slate-900 border border-transparent hover:border-slate-800 rounded-xl px-2.5 py-1.5 text-xs transition-all shadow-sm">
              <select
                value={selectedYear}
                onChange={(e) => handleMonthYearChange(selectedMonth, Number(e.target.value))}
                className="bg-transparent text-slate-100 font-bold font-mono text-xs border-0 outline-none ring-0 focus:outline-none focus:ring-0 focus:border-0 appearance-none cursor-pointer pr-1"
              >
                <option value={2025} className="bg-slate-900 text-slate-100">2025</option>
                <option value={2026} className="bg-slate-900 text-slate-100">2026</option>
                <option value={2027} className="bg-slate-900 text-slate-100">2027</option>
              </select>
              <ChevronDown className="w-3 h-3 text-slate-400 ml-0.5 pointer-events-none shrink-0" />
            </div>

            {/* Filter Muatan Dropdown */}
            <div className="flex items-center bg-slate-950/60 hover:bg-slate-900 border border-transparent hover:border-slate-800 rounded-xl px-2.5 py-1.5 text-xs transition-all shadow-sm">
              <Filter className="w-3.5 h-3.5 text-cyan-400 mr-1.5 shrink-0 pointer-events-none" />
              <select
                value={selectedMuatanFilter}
                onChange={(e) => setSelectedMuatanFilter(e.target.value)}
                className="bg-transparent text-slate-100 font-semibold text-xs border-0 outline-none ring-0 focus:outline-none focus:ring-0 focus:border-0 appearance-none cursor-pointer max-w-[110px] truncate pr-1"
              >
                <option value="all" className="bg-slate-900 text-slate-100">Semua Muatan</option>
                <option value="chemical" className="bg-slate-900 text-slate-100">Chemical</option>
                <option value="gas" className="bg-slate-900 text-slate-100">Gas Industri</option>
                <option value="food" className="bg-slate-900 text-slate-100">Food Grade</option>
              </select>
              <ChevronDown className="w-3 h-3 text-slate-400 ml-0.5 pointer-events-none shrink-0" />
            </div>

          </div>
        </div>
      </div>

      {/* Live Ticker Banner (Compact Single Row) */}
      <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center space-x-2 truncate">
          <span className="px-2 py-0.5 rounded-md bg-teal-500/20 text-teal-300 border border-teal-500/30 text-[10px] font-black uppercase tracking-wider shrink-0 font-mono">
            LIVE TICKER
          </span>
          <span className="text-slate-300 font-medium truncate text-[11px]">
            {tickerItems[tickerIndex]}
          </span>
        </div>
        <button
          onClick={() => setTickerIndex((prev) => (prev + 1) % tickerItems.length)}
          className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 text-[10px] font-bold shrink-0"
        >
          Lanjut &rarr;
        </button>
      </div>

      {/* ========================================================================= */}
      {/* SUB-MENU 1: MONITORING (CHARTS & PERFORMANCE DASHBOARDS) */}
      {/* ========================================================================= */}
      {dashboardSubTab === 'monitoring' && (
        <div className="space-y-4 animate-fadeIn">
          
          {/* Top Metric Cards Grid (Compact & Futuristic 3D Finly Cards) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            
            <div className="card-3d-futuristic futuristic-card-gradient p-4 rounded-2xl border border-[var(--border-color)] space-y-1.5 shadow-lg">
              <div className="flex items-center justify-between text-[11px] text-[var(--text-secondary)]">
                <span className="font-semibold tracking-wide">Total Lead & Volume</span>
                <div className="p-1.5 rounded-lg bg-[var(--primary)]/10 text-[var(--primary)]">
                  <TrendingUp className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-black text-[var(--text-primary)] font-mono tabular-nums">{totalLeads}</span>
                <span className="text-xs text-[var(--primary)] font-bold font-mono">({totalDeliveredTonnes} Ton)</span>
              </div>
              <span className="text-[10px] text-[var(--text-muted)] block truncate">
                {closedCount} Selesai &middot; {activeLeads.length} Aktif
              </span>
            </div>

            <div className="card-3d-futuristic futuristic-card-gradient p-4 rounded-2xl border border-[var(--border-color)] space-y-1.5 shadow-lg">
              <div className="flex items-center justify-between text-[11px] text-[var(--text-secondary)]">
                <span className="font-semibold tracking-wide">Capaian Tepat Waktu SLA</span>
                <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
                  <Clock className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-black text-emerald-600 font-mono tabular-nums">{onTimeRate}%</span>
                <span className="text-xs text-[var(--text-muted)] font-mono">({avgCycleHours}j avg)</span>
              </div>
              <span className="text-[10px] text-[var(--text-muted)] block truncate">
                Kepatuhan standar waktu rute
              </span>
            </div>

            <div className="card-3d-futuristic futuristic-card-gradient p-4 rounded-2xl border border-[var(--border-color)] space-y-1.5 shadow-lg">
              <div className="flex items-center justify-between text-[11px] text-[var(--text-secondary)]">
                <span className="font-semibold tracking-wide">Pendapatan Selesai (IDR)</span>
                <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500">
                  <Award className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="text-xl font-black text-amber-600 font-mono tabular-nums truncate">
                Rp {(totalFinishedRevenue / 1000000).toFixed(0)} Juta
              </div>
              <span className="text-[10px] text-[var(--text-muted)] block truncate">
                Nilai kontrak lead selesai
              </span>
            </div>

            <div className="card-3d-futuristic futuristic-card-gradient p-4 rounded-2xl border border-[var(--border-color)] space-y-1.5 shadow-lg">
              <div className="flex items-center justify-between text-[11px] text-[var(--text-secondary)]">
                <span className="font-semibold tracking-wide">Utilisasi Isotank</span>
                <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-500">
                  <Gauge className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-black text-cyan-600 font-mono tabular-nums">{assetUtilRate}%</span>
                <span className="text-xs text-[var(--text-muted)] font-mono">({operatingAssets}/{totalAssets})</span>
              </div>
              <span className="text-[10px] text-[var(--text-muted)] block truncate">
                {availableAssets} Tersedia Depo
              </span>
            </div>

          </div>

          {/* Charts Row 1: Volume Trend & Asset Distribution */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Chart 1: Trend Volume & Siklus Pengiriman (2 Cols) */}
            <div className="md:col-span-2 p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 shadow-md">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center space-x-2">
                  <BarChart2 className="w-4 h-4 text-teal-400" />
                  <h3 className="text-xs font-bold text-slate-100">Tren Realisasi Volume & Tonase (6 Bulan)</h3>
                </div>
                <span className="text-[10px] font-mono text-slate-400">Unit: Ton & Jam</span>
              </div>

              <div className="h-52 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="tonaseGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#14b8a6" stopOpacity={0.0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                    <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                    <YAxis stroke="#94a3b8" fontSize={11} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '11px' }}
                    />
                    <Area type="monotone" dataKey="tonase" name="Tonase (Ton)" stroke="#14b8a6" strokeWidth={2} fillOpacity={1} fill="url(#tonaseGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Asset Utilization Donut */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 shadow-md">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center space-x-2">
                  <PieIcon className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-xs font-bold text-slate-100">Status Armada Isotank</h3>
                </div>
                <span className="text-[10px] font-mono text-cyan-300 font-bold">{totalAssets} Unit</span>
              </div>

              <div className="h-44 w-full relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={assetStatusChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={65}
                      paddingAngle={4}
                      dataKey="count"
                    >
                      {assetStatusChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute text-center">
                  <span className="text-lg font-black text-slate-100 font-mono">{assetUtilRate}%</span>
                  <span className="text-[9px] text-slate-400 block font-semibold">Aktif</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-1 text-[10px] text-center border-t border-slate-800 pt-2">
                <div>
                  <span className="text-teal-400 font-bold block">{operatingAssets}</span>
                  <span className="text-slate-400">Beroperasi</span>
                </div>
                <div>
                  <span className="text-blue-400 font-bold block">{availableAssets}</span>
                  <span className="text-slate-400">Tersedia</span>
                </div>
                <div>
                  <span className="text-amber-400 font-bold block">{maintenanceAssets + 1}</span>
                  <span className="text-slate-400">Perawatan</span>
                </div>
              </div>
            </div>

          </div>

          {/* Charts Row 2: Route Ranking & Team KPI Score */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Route Analytics */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 shadow-md">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-teal-400" />
                  <h3 className="text-xs font-bold text-slate-100">Volume & Kepatuhan SLA Rute Utama</h3>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                {routeAnalyticsData.map((item) => (
                  <div key={item.rute} className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-100 block">{item.rute}</span>
                      <span className="text-[10px] text-slate-400">{item.leads} Transaksi &middot; {item.tonase} Ton</span>
                    </div>
                    <div className="text-right">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold font-mono">
                        {item.slaPercent}% Tepat Waktu
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Employee Performance KPI Table */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 shadow-md">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-xs font-bold text-slate-100">Kinerja Tim & Skor KPI Perusahaan</h3>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 text-[10px] uppercase border-b border-slate-800">
                    <tr>
                      <th className="p-2">PIC Tim</th>
                      <th className="p-2 text-center">Lead Finish</th>
                      <th className="p-2 text-center">Tonase</th>
                      <th className="p-2 text-center">SLA Rate</th>
                      <th className="p-2 text-right">Skor KPI</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 text-slate-300">
                    {creatorPerformance.map((item) => (
                      <tr key={item.name} className="hover:bg-slate-800/30">
                        <td className="p-2 font-bold text-slate-100">{item.name}</td>
                        <td className="p-2 text-center font-mono">{item.leadsCount}</td>
                        <td className="p-2 text-center font-mono text-teal-300">{item.totalTonase} T</td>
                        <td className="p-2 text-center font-mono text-emerald-400">{item.onTimeRate}%</td>
                        <td className="p-2 text-right font-mono font-bold text-amber-300">{item.avgKpi}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          {/* 8-Stage Pipeline Breakdown Bar */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 shadow-md">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-slate-100">Distribusi Transaksi Dalam 8 Tahap Pipeline</span>
              <span className="text-[10px] font-mono text-teal-300">{totalLeads} Total Lead</span>
            </div>

            <div className="grid grid-cols-4 md:grid-cols-8 gap-2 text-center text-xs">
              {statusCounts.map((stg, i) => (
                <div key={stg.name} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold block truncate">{i + 1}. {stg.name}</span>
                  <span className="text-base font-black font-mono text-slate-100">{stg.count}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-MENU 2: TRACKING (ACTION QUEUE & PER-LEAD TRACKING CARDS) */}
      {/* ========================================================================= */}
      {dashboardSubTab === 'tracking' && (
        <div className="space-y-4 animate-fadeIn">
          
          {/* SECTION 1: PERLU TINDAKAN SAYA (TASK ACTION QUEUE) */}
          <section className="p-4 md:p-5 rounded-2xl bg-slate-900 border-2 border-teal-500/40 shadow-xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-teal-500 text-slate-950 font-black text-[10px] uppercase flex items-center space-x-1 shadow-sm">
                    <AlertTriangle className="w-3 h-3 stroke-[2.5]" />
                    <span>PERLU TINDAKAN SAYA</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-xs font-mono font-bold">
                    {allActionNeededLeads.length} Antrean
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Transaksi aktif yang membutuhkan persetujuan, verifikasi, atau tindak lanjut sesuai peran Anda (<strong className="text-teal-300 capitalize">{currentUser.name} &middot; {currentUser.role}</strong>).
                </p>
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                <button
                  onClick={() => setActionCategory('all')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                    actionCategory === 'all' ? 'bg-teal-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Semua ({allActionNeededLeads.length})
                </button>
                <button
                  onClick={() => setActionCategory('approval')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                    actionCategory === 'approval' ? 'bg-amber-400 text-slate-950' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Approval ({approvalCategoryCount})
                </button>
                <button
                  onClick={() => setActionCategory('followup')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                    actionCategory === 'followup' ? 'bg-orange-400 text-slate-950' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Revisi ({followupCategoryCount})
                </button>
                <button
                  onClick={() => setActionCategory('overdue')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                    actionCategory === 'overdue' ? 'bg-rose-500 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Kritis ({overdueCategoryCount})
                </button>
              </div>
            </div>

            {/* Task Action Queue Cards (Compact High Density) */}
            {displayedActionNeededLeads.length === 0 ? (
              <div className="p-6 rounded-xl bg-slate-950 text-center space-y-2 border border-slate-800">
                <CheckCheck className="w-8 h-8 text-emerald-400 mx-auto" />
                <h4 className="text-xs font-bold text-slate-200">Tidak Ada Antrean Tertunda</h4>
                <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                  Seluruh transaksi tugas peran Anda telah diselesaikan dengan lancar.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {displayedActionNeededLeads.map((leadItem) => {
                  const isLate = Boolean(leadItem.sla_hours_actual && leadItem.sla_hours_target && leadItem.sla_hours_actual > leadItem.sla_hours_target);
                  const diffHours = (leadItem.sla_hours_target || 48) - (leadItem.sla_hours_actual || 0);
                  const isUrgent = diffHours <= 12 && !isLate;
                  const currentStage = STAGE_LIST.find(s => s.step === leadItem.current_step);

                  return (
                    <div
                      key={leadItem.id}
                      className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-teal-500/50 shadow-md transition-all space-y-2 flex flex-col justify-between"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 font-mono font-bold text-[11px]">
                            {leadItem.lead_code || 'LEAD-00101'}
                          </span>
                          {isLate ? (
                            <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-bold animate-pulse">
                              Terlambat SLA
                            </span>
                          ) : isUrgent ? (
                            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold">
                              Sisa {diffHours}j
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px] font-bold">
                              Tahap {leadItem.current_step}
                            </span>
                          )}
                        </div>

                        <div className="text-xs">
                          <strong className="text-slate-100 font-bold block truncate">{leadItem.client_company || 'Perusahaan Klien'}</strong>
                          <span className="text-[11px] text-slate-400 block truncate">{leadItem.no_surat_jalan} &middot; {leadItem.muatan}</span>
                        </div>

                        <div className="p-2 rounded bg-slate-900 border border-slate-800 text-[11px] flex justify-between">
                          <span className="text-teal-400 font-bold">{currentStage?.name}</span>
                          <span className="text-slate-400">{leadItem.asal} &rarr; {leadItem.tujuan}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => setSelectedLeadId(leadItem.id)}
                        className="w-full py-1.5 px-3 rounded-lg bg-teal-500/15 hover:bg-teal-500 text-teal-300 hover:text-slate-950 font-bold text-xs border border-teal-500/30 transition-all flex items-center justify-center space-x-1"
                      >
                        <span>Proses Transaksi</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* SECTION 2: ACTIVE SHIPMENTS & LEAD TRACKING */}
          <section className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 shadow-md">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center space-x-2">
                <Truck className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-bold text-slate-100">Pelacakan Transaksi Aktif Dalam Siklus</h3>
              </div>
              <span className="text-[10px] font-mono text-cyan-300">{activeLeads.length} Lead Aktif</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {activeLeads.map((l) => (
                <div key={l.id} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-mono font-bold text-teal-400 text-[11px]">{l.lead_code}</span>
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-mono">{l.asset_code}</span>
                  </div>

                  <div>
                    <strong className="text-slate-100 block truncate">{l.client_company || 'PT Petrokimia'}</strong>
                    <span className="text-[11px] text-slate-400">{l.muatan}</span>
                  </div>

                  <div className="p-2 rounded bg-slate-900 border border-slate-800 text-[10px] space-y-1">
                    <div className="flex justify-between text-slate-300">
                      <span>Rute:</span>
                      <strong className="text-slate-200">{l.asal} &rarr; {l.tujuan}</strong>
                    </div>
                    {l.current_location_note && (
                      <div className="text-cyan-300 truncate">
                        Posisi: {l.current_location_note}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => setSelectedLeadId(l.id)}
                    className="w-full py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold transition-colors"
                  >
                    Buka Detail Tracking &rarr;
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* SECTION 3: FINISHED LEADS AUDIT TRACKING TABLE */}
          <section className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 shadow-md">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-bold text-slate-100">Audit Pelacakan Lead Selesai (Closed)</h3>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={finishedLeadsSearch}
                  onChange={(e) => setFinishedLeadsSearch(e.target.value)}
                  placeholder="Cari SJ / Klien..."
                  className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-100 focus:outline-none w-36"
                />
                <button
                  onClick={exportFinishedLeadsCsv}
                  className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs"
                >
                  Ekspor CSV
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 text-[10px] uppercase border-b border-slate-800">
                  <tr>
                    <th className="p-2">ID Lead</th>
                    <th className="p-2">No Surat Jalan</th>
                    <th className="p-2">Klien Perusahaan</th>
                    <th className="p-2">Muatan & Isotank</th>
                    <th className="p-2">Rute Asal-Tujuan</th>
                    <th className="p-2 text-center">Status SLA</th>
                    <th className="p-2 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 text-slate-300">
                  {filteredFinishedLeads.map((l) => (
                    <tr key={l.id} className="hover:bg-slate-800/30">
                      <td className="p-2 font-mono font-bold text-teal-400">{l.lead_code}</td>
                      <td className="p-2 font-mono text-[11px] text-slate-300">{l.no_surat_jalan}</td>
                      <td className="p-2 font-bold text-slate-100">{l.client_company || '-'}</td>
                      <td className="p-2">{l.muatan} ({l.asset_code})</td>
                      <td className="p-2 text-slate-400">{l.asal} &rarr; {l.tujuan}</td>
                      <td className="p-2 text-center">
                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                          ✓ Selesai BASTP
                        </span>
                      </td>
                      <td className="p-2 text-right">
                        <button
                          onClick={() => setSelectedLeadId(l.id)}
                          className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-bold"
                        >
                          Detail
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

        </div>
      )}

      {/* CUSTOM CALENDAR MODAL */}
      {showCalendarModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5 max-w-sm w-full space-y-4 shadow-2xl animate-fadeIn text-xs">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <h3 className="font-bold text-slate-100 text-sm">Rentang Tanggal Kalender</h3>
              <button onClick={() => setShowCalendarModal(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Tanggal Mulai:</label>
                <input
                  type="date"
                  value={calendarStart}
                  onChange={(e) => setCalendarStart(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono focus:border-teal-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-bold mb-1">Tanggal Akhir:</label>
                <input
                  type="date"
                  value={calendarEnd}
                  onChange={(e) => setCalendarEnd(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono focus:border-teal-500 focus:outline-none"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowCalendarModal(false)}
                className="px-3.5 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-bold"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleApplyCalendar}
                className="px-4 py-2 rounded-xl bg-teal-500 text-slate-950 font-bold hover:bg-teal-400 shadow-md"
              >
                Terapkan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REPORT DOWNLOAD POPUP MODAL */}
      <ReportDownloadModal
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
        initialType={downloadModalInitialType}
      />

    </div>
  );
};
