import React, { useState, useMemo } from 'react';
import {
  TrendingUp, Clock, CheckCircle2, AlertTriangle, Truck, Sparkles,
  RotateCcw, ShieldCheck, HelpCircle, ArrowRight, Activity, FileText,
  Zap, Award, SlidersHorizontal, Layers, Gauge, Compass, Eye, Download,
  RefreshCw, MapPin, Thermometer, Filter, ChevronRight, ShieldAlert,
  BarChart2, PieChart as PieIcon, Calendar, Check, Search, DollarSign,
  Target, CheckCheck, FileCheck, Star, ChevronDown, CalendarRange, Users,
  MoreHorizontal, ArrowUpRight, ArrowDownRight, Package, Droplets, Flame,
  FileSpreadsheet, Shield
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

  // Sub-Menu Navigation: Monitoring (Overview Analytics) vs Tracking (Action Queue & Shipments)
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
  const [selectedMonth, setSelectedMonth] = useState<number>(5);
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [calendarStart, setCalendarStart] = useState<string>(periodFilter.startDate || '2026-01-01');
  const [calendarEnd, setCalendarEnd] = useState<string>(periodFilter.endDate || '2026-05-31');
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

  // Siohioma Paired Revenue Bar Chart Data
  const revenueBarChartData = [
    { month: 'Jan', income: 140, expenses: 90 },
    { month: 'Feb', income: 165, expenses: 110 },
    { month: 'Mar', income: 155, expenses: 105 },
    { month: 'Apr', income: 180, expenses: 120 },
    { month: 'May', income: 193, expenses: 130 },
    { month: 'Jun', income: 210, expenses: 145 },
  ];

  // Siohioma Donut Chart Data (Total View Performance style)
  const donutPerformanceData = [
    { name: 'Aktif On-Track', value: 68, fill: '#bef264' },     // Vibrant Lime
    { name: 'Armada Depo', value: 23, fill: '#0a1c13' },       // Deep Forest Green
    { name: 'Perawatan/SLA', value: 16, fill: '#f59e0b' },     // Warm Orange/Amber
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

  // Recent 6 transactions for the Siohioma "Transaction" card
  const recentTransactions = useMemo(() => {
    return leads.slice(0, 6);
  }, [leads]);

  return (
    <div className="space-y-6 animate-fadeIn">

      {/* ── SubTab Selector (Monitoring vs Tracking) ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center bg-gray-100 dark:bg-slate-800/80 p-1 rounded-full text-xs font-bold">
          <button
            onClick={() => setDashboardSubTab('monitoring')}
            className={`px-4 py-1.5 rounded-full transition-all flex items-center gap-1.5 ${
              dashboardSubTab === 'monitoring'
                ? 'bg-[#0a1c13] text-[#bef264] shadow-sm'
                : 'text-gray-500 hover:text-gray-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>Overview & Analytics</span>
          </button>
          <button
            onClick={() => setDashboardSubTab('tracking')}
            className={`px-4 py-1.5 rounded-full transition-all flex items-center gap-1.5 ${
              dashboardSubTab === 'tracking'
                ? 'bg-[#0a1c13] text-[#bef264] shadow-sm'
                : 'text-gray-500 hover:text-gray-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Tracking & Antrean PIC</span>
            {allActionNeededLeads.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-[#bef264] text-[#0a1c13] text-[10px] font-black">
                {allActionNeededLeads.length}
              </span>
            )}
          </button>
        </div>

        {/* Filter Muatan Pills */}
        <div className="hidden md:flex items-center gap-1.5">
          {['all', 'chemical', 'gas', 'food'].map((type) => (
            <button
              key={type}
              onClick={() => setSelectedMuatanFilter(type)}
              className={`px-3 py-1 rounded-full text-xs font-semibold capitalize transition-all ${
                selectedMuatanFilter === type
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-[#bef264] border border-emerald-300 dark:border-emerald-800'
                  : 'bg-white dark:bg-slate-900 text-gray-500 dark:text-slate-400 border border-gray-200 dark:border-slate-800 hover:border-gray-300'
              }`}
            >
              {type === 'all' ? 'All Types' : type}
            </button>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ── SUBTAB 1: MONITORING (EXACT SIOHIOMA DASHBOARD LAYOUT) ── */}
      {/* ========================================================================= */}
      {dashboardSubTab === 'monitoring' && (
        <div className="space-y-6">

          {/* ── ROW 1: Update Card + Net Income + Total Return ── */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">

            {/* 1. Siohioma Dark Forest Green Update Banner (Span 4 cols) */}
            <div className="md:col-span-4 bg-[#0a1c13] text-white p-6 rounded-[24px] shadow-sm relative overflow-hidden flex flex-col justify-between group hover:shadow-md transition-all">
              {/* Decorative Subtle Starburst in Background */}
              <div className="absolute -right-6 -bottom-6 w-32 h-32 text-white/[0.04] pointer-events-none">
                <svg className="w-full h-full fill-current" viewBox="0 0 24 24">
                  <path d="M12 2L13.5 8.5L20 7L15.5 12L20 17L13.5 15.5L12 22L10.5 15.5L4 17L8.5 12L4 7L10.5 8.5L12 2Z" />
                </svg>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 text-[11px] font-bold text-[#bef264] tracking-wide">
                    <span className="w-2 h-2 rounded-full bg-[#bef264] animate-pulse" />
                    Update
                  </span>
                  <span className="text-xs text-[#789d87] font-medium">May 12th 2026</span>
                </div>

                <h3 className="text-xl font-bold tracking-tight text-white leading-snug mt-2">
                  Sales revenue & fleet volume increased <span className="text-[#bef264]">40%</span> in 1 week
                </h3>
              </div>

              <div className="pt-6">
                <button
                  onClick={() => setActiveView('reports')}
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#bef264] hover:text-white transition-colors group-hover:translate-x-0.5"
                >
                  <span>See Statistics</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 2. Net Income Stat Card (Span 4 cols) */}
            <div className="md:col-span-4 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-6 rounded-[24px] shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
              <div className="flex items-center justify-between text-gray-500 dark:text-slate-400">
                <span className="text-xs font-bold tracking-wide uppercase">Net Income</span>
                <button className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-200">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>

              <div className="my-3">
                <div className="flex items-baseline gap-1 text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                  <span className="text-lg font-bold text-gray-400 mr-0.5">$</span>
                  <span>193.000</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-xs font-bold text-[#84cc16] dark:text-[#bef264]">
                <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                <span>+35% from last month</span>
              </div>
            </div>

            {/* 3. Total Return Stat Card (Span 4 cols) */}
            <div className="md:col-span-4 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-6 rounded-[24px] shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
              <div className="flex items-center justify-between text-gray-500 dark:text-slate-400">
                <span className="text-xs font-bold tracking-wide uppercase">Total Return</span>
                <button className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-200">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>

              <div className="my-3">
                <div className="flex items-baseline gap-1 text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                  <span className="text-lg font-bold text-gray-400 mr-0.5">$</span>
                  <span>32.000</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-xs font-bold text-rose-500 dark:text-rose-400">
                <ArrowDownRight className="w-4 h-4 stroke-[2.5]" />
                <span>-24% from last month</span>
              </div>
            </div>

          </div>

          {/* ── ROW 2: Main Siohioma Dashboard 3-Column Area ── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

            {/* ── Left Column: Transaction List Card (Span 4 cols) ── */}
            <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-6 rounded-[24px] shadow-sm space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-3">
                  <h3 className="text-sm font-black text-gray-900 dark:text-white">Transaction</h3>
                  <button className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-200">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>

                {/* Siohioma Transaction Items List */}
                <div className="divide-y divide-gray-50 dark:divide-slate-800/60 mt-1">
                  {recentTransactions.map((tx, idx) => {
                    const isCompleted = idx % 2 === 0;
                    const sampleProducts = [
                      { title: 'Premium T-Shirt', code: '0JWEJS7ISNC', date: 'Jul 12th 2026' },
                      { title: 'Playstation 5', code: '0JWEJS7ISNC', date: 'Jul 12th 2026' },
                      { title: 'Hoodie Gombrong', code: '0JWEJS7ISNC', date: 'Jul 12th 2026' },
                      { title: 'iPhone 15 Pro Max', code: '0JWEJS7ISNC', date: 'Jul 12th 2026' },
                      { title: 'Lotse', code: '0JWEJS7ISNC', date: 'Jul 12th 2026' },
                      { title: 'Starbucks', code: '0JWEJS7ISNC', date: 'Jul 12th 2026' },
                    ];
                    const itemData = sampleProducts[idx] || {
                      title: tx.muatan,
                      code: tx.lead_code,
                      date: 'Jul 12th 2026',
                    };

                    return (
                      <div
                        key={tx.id}
                        onClick={() => setSelectedLeadId(tx.id)}
                        className="py-3 flex items-center justify-between gap-3 hover:bg-gray-50/80 dark:hover:bg-slate-800/50 rounded-xl px-2 transition-colors cursor-pointer group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Siohioma Round Dark Icon Box */}
                          <div className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 flex items-center justify-center shrink-0 group-hover:bg-[#0a1c13] group-hover:text-[#bef264] transition-colors">
                            {idx === 0 ? <Package className="w-4 h-4" /> :
                             idx === 1 ? <Zap className="w-4 h-4" /> :
                             idx === 2 ? <Droplets className="w-4 h-4" /> :
                             idx === 3 ? <Flame className="w-4 h-4" /> :
                             <Truck className="w-4 h-4" />}
                          </div>

                          <div className="min-w-0">
                            <div className="text-xs font-bold text-gray-900 dark:text-white truncate">
                              {itemData.title}
                            </div>
                            <div className="text-[10px] text-gray-400 dark:text-slate-500 font-medium">
                              {itemData.date}
                            </div>
                          </div>
                        </div>

                        {/* Status & Code */}
                        <div className="text-right shrink-0">
                          <span className={`text-[10px] font-bold block ${
                            isCompleted ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
                          }`}>
                            {isCompleted ? 'Completed' : 'Pending'}
                          </span>
                          <span className="text-[9px] text-gray-400 font-mono">
                            {itemData.code}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <button
                onClick={() => setActiveView('leads')}
                className="w-full py-2.5 rounded-full bg-gray-50 hover:bg-gray-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold text-gray-700 dark:text-slate-300 transition-colors text-center"
              >
                View all transactions &rarr;
              </button>
            </div>

            {/* ── Middle Column: Revenue Chart + Sales Report (Span 4 cols) ── */}
            <div className="lg:col-span-4 space-y-5">

              {/* 1. Siohioma Paired Bar Chart: Revenue */}
              <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-6 rounded-[24px] shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-gray-900 dark:text-white">Revenue</h3>
                  {/* Legend */}
                  <div className="flex items-center gap-3 text-[10px] font-bold">
                    <span className="flex items-center gap-1.5 text-gray-700 dark:text-slate-300">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#0a1c13] dark:bg-white inline-block" />
                      Income
                    </span>
                    <span className="flex items-center gap-1.5 text-gray-700 dark:text-slate-300">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#bef264] inline-block" />
                      Expenses
                    </span>
                  </div>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                    $193.000
                  </span>
                  <span className="text-xs font-bold text-[#84cc16] dark:text-[#bef264] flex items-center gap-0.5">
                    <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
                    +35% from last month
                  </span>
                </div>

                {/* Paired Bar Chart */}
                <div className="h-44 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={revenueBarChartData} barGap={4} margin={{ top: 5, right: 0, left: -25, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f2f0" />
                      <XAxis dataKey="month" stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0a1c13',
                          border: 'none',
                          borderRadius: '12px',
                          color: '#fff',
                          fontSize: '11px'
                        }}
                      />
                      <Bar dataKey="income" fill="#0a1c13" radius={[4, 4, 0, 0]} barSize={9} />
                      <Bar dataKey="expenses" fill="#bef264" radius={[4, 4, 0, 0]} barSize={9} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* 2. Siohioma Horizontal Bars: Sales Report */}
              <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-6 rounded-[24px] shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-2">
                  <h3 className="text-sm font-black text-gray-900 dark:text-white">Sales Report</h3>
                  <button className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-200">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-4 pt-1">
                  {/* Bar 1 */}
                  <div>
                    <div className="flex justify-between text-[11px] font-bold text-gray-700 dark:text-slate-300 mb-1">
                      <span>Product Launched (233)</span>
                      <span className="font-mono text-gray-400">233</span>
                    </div>
                    <div className="h-2.5 w-full bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-[#bef264] rounded-full" style={{ width: '58%' }} />
                    </div>
                  </div>

                  {/* Bar 2 */}
                  <div>
                    <div className="flex justify-between text-[11px] font-bold text-gray-700 dark:text-slate-300 mb-1">
                      <span>Ongoing Product (23)</span>
                      <span className="font-mono text-gray-400">23</span>
                    </div>
                    <div className="h-2.5 w-full bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-[#bef264] rounded-full" style={{ width: '22%' }} />
                    </div>
                  </div>

                  {/* Bar 3 */}
                  <div>
                    <div className="flex justify-between text-[11px] font-bold text-gray-700 dark:text-slate-300 mb-1">
                      <span>Product Sold (482)</span>
                      <span className="font-mono text-gray-400">482</span>
                    </div>
                    <div className="h-2.5 w-full bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-[#bef264] rounded-full" style={{ width: '85%' }} />
                    </div>
                  </div>

                  {/* Axis line 0, 100, 200, 300, 400 */}
                  <div className="flex justify-between text-[9px] font-mono text-gray-400 pt-2 border-t border-gray-100 dark:border-slate-800">
                    <span>0</span>
                    <span>100</span>
                    <span>200</span>
                    <span>300</span>
                    <span>400</span>
                  </div>
                </div>
              </div>

            </div>

            {/* ── Right Column: Total View Performance + Level Up Card (Span 4 cols) ── */}
            <div className="lg:col-span-4 space-y-5">

              {/* 1. Siohioma Donut Chart Card: Total View Performance */}
              <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-6 rounded-[24px] shadow-sm space-y-4">
                <div className="text-center">
                  <h3 className="text-sm font-black text-gray-900 dark:text-white">Total View Performance</h3>
                </div>

                {/* Donut Chart with Center Number */}
                <div className="h-48 w-full relative flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={donutPerformanceData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={78}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {donutPerformanceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0a1c13',
                          border: 'none',
                          borderRadius: '12px',
                          color: '#fff',
                          fontSize: '11px'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>

                  {/* Center Text 565K */}
                  <div className="absolute text-center">
                    <span className="text-[10px] text-gray-400 font-bold block">Total Count</span>
                    <span className="text-2xl font-black text-gray-900 dark:text-white font-mono">565K</span>
                  </div>
                </div>

                {/* Percentage Labels */}
                <div className="flex items-center justify-around text-xs font-bold text-gray-600 dark:text-slate-300">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#f59e0b]" /> 16%
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#0a1c13] dark:bg-white" /> 23%
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#bef264]" /> 68%
                  </span>
                </div>

                {/* Tips & Guide Button */}
                <p className="text-[11px] text-gray-400 text-center">
                  Here are some tips on how to improve your score.
                </p>

                <button
                  onClick={() => openDownloadReportPopup('finished')}
                  className="w-full py-2.5 rounded-full border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 text-xs font-bold text-gray-800 dark:text-slate-200 transition-colors"
                >
                  Guide Views
                </button>

                {/* Pill Filter Badges */}
                <div className="flex justify-center gap-2 pt-1">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-[#bef264]">
                    View Count
                  </span>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-slate-400">
                    Percentage
                  </span>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-slate-400">
                    Sales
                  </span>
                </div>
              </div>

              {/* 2. Siohioma Bottom Right Level-Up Promotional Card */}
              <div className="bg-[#ecf8d9] dark:bg-[#132617] border border-[#d2edaa] dark:border-[#1d3d24] p-6 rounded-[24px] shadow-sm relative overflow-hidden space-y-4">
                {/* Decorative Starburst Graphic */}
                <div className="absolute -right-10 -bottom-10 w-36 h-36 text-[#84cc16]/15 dark:text-[#bef264]/10 pointer-events-none">
                  <svg className="w-full h-full fill-current" viewBox="0 0 24 24">
                    <path d="M12 2L13.5 8.5L20 7L15.5 12L20 17L13.5 15.5L12 22L10.5 15.5L4 17L8.5 12L4 7L10.5 8.5L12 2Z" />
                  </svg>
                </div>

                <div className="w-8 h-8 rounded-xl bg-[#84cc16]/20 dark:bg-[#bef264]/20 flex items-center justify-center text-[#0a1c13] dark:text-[#bef264]">
                  <Sparkles className="w-4 h-4" />
                </div>

                <div>
                  <h4 className="text-base font-black text-gray-900 dark:text-white leading-tight">
                    Level up your sales managing to the next level.
                  </h4>
                  <p className="text-[11px] text-gray-600 dark:text-slate-300 mt-1 leading-relaxed">
                    An airy way to manage sales with care and precision.
                  </p>
                </div>

                <button
                  onClick={onOpenNewLead}
                  className="w-full py-2.5 px-4 rounded-full bg-[#0a1c13] hover:bg-[#142c1f] dark:bg-[#bef264] dark:hover:bg-[#a3e635] text-white dark:text-[#0a1c13] text-xs font-black transition-all shadow-md active:scale-95 text-center"
                >
                  Update to IsoTrack+
                </button>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* ── SUBTAB 2: TRACKING (ACTION QUEUE & SHIPMENT STATUS) ── */}
      {/* ========================================================================= */}
      {dashboardSubTab === 'tracking' && (
        <div className="space-y-6">

          {/* Action Queue: PERLU TINDAKAN SAYA */}
          <section className="p-6 rounded-[24px] bg-white dark:bg-slate-900 border-2 border-[#bef264] shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 dark:border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-[#0a1c13] text-[#bef264] font-black text-xs uppercase flex items-center gap-1.5 shadow-sm">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>PERLU TINDAKAN SAYA</span>
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 text-xs font-mono font-bold">
                    {allActionNeededLeads.length} Antrean
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-1.5">
                  Transaksi aktif yang membutuhkan persetujuan atau verifikasi untuk peran <strong className="text-emerald-700 dark:text-[#bef264] capitalize">{currentUser.name} ({currentUser.role})</strong>.
                </p>
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-1 bg-gray-100 dark:bg-slate-800 p-1 rounded-full text-xs">
                <button
                  onClick={() => setActionCategory('all')}
                  className={`px-3 py-1 rounded-full font-bold transition-all ${
                    actionCategory === 'all' ? 'bg-[#0a1c13] text-[#bef264]' : 'text-gray-500 hover:text-gray-900 dark:text-slate-400 dark:hover:text-white'
                  }`}
                >
                  Semua ({allActionNeededLeads.length})
                </button>
                <button
                  onClick={() => setActionCategory('approval')}
                  className={`px-3 py-1 rounded-full font-bold transition-all ${
                    actionCategory === 'approval' ? 'bg-amber-500 text-white' : 'text-gray-500 hover:text-gray-900 dark:text-slate-400 dark:hover:text-white'
                  }`}
                >
                  Approval ({approvalCategoryCount})
                </button>
                <button
                  onClick={() => setActionCategory('followup')}
                  className={`px-3 py-1 rounded-full font-bold transition-all ${
                    actionCategory === 'followup' ? 'bg-orange-500 text-white' : 'text-gray-500 hover:text-gray-900 dark:text-slate-400 dark:hover:text-white'
                  }`}
                >
                  Revisi ({followupCategoryCount})
                </button>
                <button
                  onClick={() => setActionCategory('overdue')}
                  className={`px-3 py-1 rounded-full font-bold transition-all ${
                    actionCategory === 'overdue' ? 'bg-rose-500 text-white' : 'text-gray-500 hover:text-gray-900 dark:text-slate-400 dark:hover:text-white'
                  }`}
                >
                  Kritis ({overdueCategoryCount})
                </button>
              </div>
            </div>

            {/* Task Action Queue Cards */}
            {displayedActionNeededLeads.length === 0 ? (
              <div className="p-8 rounded-2xl bg-gray-50 dark:bg-slate-800/40 text-center space-y-2">
                <CheckCheck className="w-8 h-8 text-emerald-500 mx-auto" />
                <h4 className="text-xs font-bold text-gray-800 dark:text-slate-200">Tidak Ada Antrean Tertunda</h4>
                <p className="text-[11px] text-gray-400">Seluruh tugas peran Anda telah diselesaikan.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {displayedActionNeededLeads.map((leadItem) => {
                  const isLate = Boolean(leadItem.sla_hours_actual && leadItem.sla_hours_target && leadItem.sla_hours_actual > leadItem.sla_hours_target);
                  const diffHours = (leadItem.sla_hours_target || 48) - (leadItem.sla_hours_actual || 0);
                  const isUrgent = diffHours <= 12 && !isLate;
                  const currentStage = STAGE_LIST.find(s => s.step === leadItem.current_step);

                  return (
                    <div
                      key={leadItem.id}
                      className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 hover:border-emerald-500 shadow-sm transition-all flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-[#bef264] font-mono font-bold text-xs">
                            {leadItem.lead_code}
                          </span>
                          {isLate ? (
                            <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-600 text-[10px] font-bold">
                              Terlambat SLA
                            </span>
                          ) : isUrgent ? (
                            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold">
                              Sisa {diffHours}j
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-gray-200 dark:bg-slate-700 text-gray-600 dark:text-slate-300 text-[10px] font-bold">
                              Tahap {leadItem.current_step}
                            </span>
                          )}
                        </div>

                        <div>
                          <strong className="text-gray-900 dark:text-white font-bold block truncate">
                            {leadItem.client_company || 'Perusahaan Klien'}
                          </strong>
                          <span className="text-xs text-gray-500 dark:text-slate-400 block truncate">
                            {leadItem.no_surat_jalan} &middot; {leadItem.muatan}
                          </span>
                        </div>

                        <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 text-xs flex justify-between border border-gray-100 dark:border-slate-700">
                          <span className="text-emerald-700 dark:text-[#bef264] font-bold">{currentStage?.name}</span>
                          <span className="text-gray-500">{leadItem.asal} &rarr; {leadItem.tujuan}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => setSelectedLeadId(leadItem.id)}
                        className="mt-3 w-full py-2 rounded-xl bg-[#0a1c13] hover:bg-[#142c1f] dark:bg-[#bef264] dark:hover:bg-[#a3e635] text-white dark:text-[#0a1c13] font-bold text-xs transition-all flex items-center justify-center gap-1.5"
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

          {/* Active Shipments */}
          <section className="p-6 rounded-[24px] bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-black text-gray-900 dark:text-white">Pelacakan Kontainer Aktif</h3>
              </div>
              <span className="text-xs font-mono text-emerald-700 dark:text-[#bef264] font-bold">
                {activeLeads.length} Kontainer
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeLeads.map((l) => (
                <div key={l.id} className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/40 border border-gray-100 dark:border-slate-800 space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-mono font-bold text-emerald-700 dark:text-[#bef264]">{l.lead_code}</span>
                    <span className="px-2 py-0.5 rounded-full bg-white dark:bg-slate-700 text-gray-600 dark:text-slate-300 font-mono text-[10px]">
                      {l.asset_code}
                    </span>
                  </div>

                  <div>
                    <strong className="text-gray-900 dark:text-white block truncate">{l.client_company || 'PT Niaga Segara'}</strong>
                    <span className="text-gray-500 dark:text-slate-400">{l.muatan}</span>
                  </div>

                  <div className="p-2 rounded-xl bg-white dark:bg-slate-800 text-[11px] space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Rute:</span>
                      <strong className="text-gray-800 dark:text-slate-200">{l.asal} &rarr; {l.tujuan}</strong>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedLeadId(l.id)}
                    className="w-full py-1.5 rounded-xl bg-white hover:bg-gray-100 dark:bg-slate-700 dark:hover:bg-slate-600 text-gray-800 dark:text-slate-200 text-xs font-bold border border-gray-200 dark:border-slate-600 transition-colors"
                  >
                    Buka Detail Tracking &rarr;
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Finished Leads Audit Table */}
          <section className="p-6 rounded-[24px] bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-black text-gray-900 dark:text-white">Audit Transaksi Selesai (Closed)</h3>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={finishedLeadsSearch}
                  onChange={(e) => setFinishedLeadsSearch(e.target.value)}
                  placeholder="Cari SJ / Klien..."
                  className="bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-full px-4 py-1.5 text-xs text-gray-800 dark:text-white focus:outline-none w-44"
                />
                <button
                  onClick={exportFinishedLeadsCsv}
                  className="px-4 py-1.5 rounded-full bg-[#0a1c13] dark:bg-[#bef264] text-white dark:text-[#0a1c13] font-bold text-xs"
                >
                  Ekspor CSV
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 dark:bg-slate-800 text-gray-500 dark:text-slate-400 text-[10px] uppercase">
                  <tr>
                    <th className="p-3">ID Lead</th>
                    <th className="p-3">No Surat Jalan</th>
                    <th className="p-3">Klien</th>
                    <th className="p-3">Muatan & Unit</th>
                    <th className="p-3">Rute</th>
                    <th className="p-3 text-center">Status</th>
                    <th className="p-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-800 text-gray-700 dark:text-slate-300">
                  {filteredFinishedLeads.map((l) => (
                    <tr key={l.id} className="hover:bg-gray-50/60 dark:hover:bg-slate-800/40">
                      <td className="p-3 font-mono font-bold text-emerald-700 dark:text-[#bef264]">{l.lead_code}</td>
                      <td className="p-3 font-mono text-gray-500">{l.no_surat_jalan}</td>
                      <td className="p-3 font-bold text-gray-900 dark:text-white">{l.client_company || '-'}</td>
                      <td className="p-3">{l.muatan} ({l.asset_code})</td>
                      <td className="p-3 text-gray-500">{l.asal} &rarr; {l.tujuan}</td>
                      <td className="p-3 text-center">
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-[#bef264] text-[10px] font-bold">
                          ✓ Selesai BASTP
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => setSelectedLeadId(l.id)}
                          className="px-3 py-1 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300 text-xs font-bold"
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

      {/* REPORT DOWNLOAD POPUP MODAL */}
      <ReportDownloadModal
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
        initialType={downloadModalInitialType}
      />

    </div>
  );
};
