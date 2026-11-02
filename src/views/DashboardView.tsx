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

  // State controls for interactive dashboard
  const [activeTooltipMetric, setActiveTooltipMetric] = useState<string | null>(null);
  const [selectedMuatanFilter, setSelectedMuatanFilter] = useState<string>('all');
  const [selectedDepoFilter, setSelectedDepoFilter] = useState<string>('all');
  const [finishedLeadsSearch, setFinishedLeadsSearch] = useState<string>('');
  const [finishedSlaFilter, setFinishedSlaFilter] = useState<'all' | 'ontime' | 'late'>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [tickerIndex, setTickerIndex] = useState(0);
  const [actionCategory, setActionCategory] = useState<'all' | 'approval' | 'followup' | 'overdue'>('all');

  // Onboarding Guide banner state (dismissible with localStorage memory)
  const [showOnboardingGuide, setShowOnboardingGuide] = useState<boolean>(() => {
    return localStorage.getItem('isotrack_hide_onboarding_guide') !== 'true';
  });

  const handleDismissOnboarding = () => {
    setShowOnboardingGuide(false);
    localStorage.setItem('isotrack_hide_onboarding_guide', 'true');
  };

  // Month & Year selector states (for in-dashboard calendar control)
  const [selectedMonth, setSelectedMonth] = useState<number>(10); // 1-12 (October default)
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

  // Trigger quick data refresh simulation
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  // Month Names in Indonesian
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

  // Quick preset period change handlers
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

  // Filtered Leads based on Dashboard Quick Tabs
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

  // Action Needed Queue - Prominent Action Items for Current User
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
      // Admin sees all items requiring intervention
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

  // Compute Core Analytics
  const totalLeads = displayLeads.length;
  const closedLeads = useMemo(() => {
    return displayLeads.filter(l => l.status === 'closed');
  }, [displayLeads]);
  const activeLeads = displayLeads.filter(l => l.status !== 'closed');
  const closedCount = closedLeads.length;

  // Filtered Finished Leads for the Dedicated Section
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
        (l.pic_name && l.pic_name.toLowerCase().includes(q)) ||
        (l.transport_vendor_name && l.transport_vendor_name.toLowerCase().includes(q));

      const isLate = (l.sla_hours_actual && l.sla_hours_target && l.sla_hours_actual > l.sla_hours_target);
      const matchSla = finishedSlaFilter === 'all' ||
        (finishedSlaFilter === 'ontime' && !isLate) ||
        (finishedSlaFilter === 'late' && isLate);

      return matchSearch && matchSla;
    });
  }, [closedLeads, finishedLeadsSearch, finishedSlaFilter]);

  // Employee Performance & KPI Achievement mapped from Finished Leads
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

  // SLA On Time Rate %
  const onTimeCount = closedLeads.filter(l => {
    if (l.sla_hours_actual && l.sla_hours_target) {
      return l.sla_hours_actual <= l.sla_hours_target;
    }
    const c = closures.find(cl => cl.lead_id === l.id);
    return c ? c.sla_on_time : true;
  }).length;

  const onTimeRate = closedCount > 0 ? Math.round((onTimeCount / closedCount) * 100) : 96;

  // Cycle time average (hours)
  const avgCycleHours = closures.length > 0
    ? Math.round(closures.reduce((acc, c) => acc + c.total_hours, 0) / closures.length)
    : 198;

  // Revision rate %
  const totalRevisions = displayLeads.reduce((acc, l) => acc + l.total_revisions, 0);
  const revisionRate = totalLeads > 0 ? Math.round((totalRevisions / totalLeads) * 100) : 10;

  // Isotank Utilization %
  const totalAssets = assets.length;
  const operatingAssets = assets.filter(a => a.status === 'Beroperasi').length;
  const maintenanceAssets = assets.filter(a => a.status === 'Perawatan').length;
  const availableAssets = assets.filter(a => a.status === 'Tersedia').length;
  const assetUtilRate = totalAssets > 0 ? Math.round((operatingAssets / totalAssets) * 100) : 73;

  // Estimated Tonnes Delivered
  const totalDeliveredTonnes = closedLeads.reduce((acc, l) => acc + (l.volume_tonase || 24), 0);
  const estimatedTonnes = totalDeliveredTonnes + (activeLeads.length * 14);

  // Commercial Revenue of Finished Leads
  const totalFinishedRevenue = closedLeads.reduce((acc, l) => acc + (l.contract_value || 45000000), 0);
  const targetRevenue = 350000000; // Target revenue baseline per period
  const revenueAchievementPct = Math.min(Math.round((totalFinishedRevenue / targetRevenue) * 100), 130);

  // Target Volume Baseline (140 Ton)
  const targetTonase = 140;
  const volumeAchievementPct = Math.min(Math.round((totalDeliveredTonnes / targetTonase) * 100), 130);

  // First-Time-Right (Zero Revision Rate on Finished Leads)
  const zeroRevisionClosedCount = closedLeads.filter(l => l.total_revisions === 0).length;
  const zeroRevisionRate = closedCount > 0 ? Math.round((zeroRevisionClosedCount / closedCount) * 100) : 92;

  // Corporate Composite Achievement Score (100 Scale)
  const corporateAchievementScore = closedCount > 0
    ? (
        (onTimeRate * 0.35) +
        (Math.min(volumeAchievementPct, 100) * 0.35) +
        (zeroRevisionRate * 0.20) +
        (100 * 0.10) // 100% Zero Incident HSE Score
      ).toFixed(1)
    : '96.4';

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

  // Export Finished Leads CSV
  const exportFinishedLeadsCsv = () => {
    const headers = [
      'ID Lead',
      'No Surat Jalan',
      'Perusahaan Klien',
      'Jenis Muatan',
      'Armada Isotank',
      'Rute Pengiriman',
      'Tanggal Selesai (Completed Date)',
      'Durasi Aktual (Jam)',
      'Target SLA (Jam)',
      'Status SLA',
      'Nilai Kontrak (IDR)',
      'Skor KPI Transaksi',
      'Dokumen BASTP / Bukti Tiba',
      'Penerima Berita Acara'
    ];

    const rows = filteredFinishedLeads.map(l => {
      const isLate = (l.sla_hours_actual && l.sla_hours_target && l.sla_hours_actual > l.sla_hours_target);
      return [
        l.lead_code,
        l.no_surat_jalan,
        `"${l.client_company || '-'}"`,
        `"${l.muatan}"`,
        l.asset_code,
        `"${l.asal} -> ${l.tujuan}"`,
        l.completed_at || l.updated_at,
        l.sla_hours_actual || 40,
        l.sla_hours_target || 48,
        isLate ? 'TERLAMBAT' : 'TEPAT WAKTU (ON-TIME)',
        l.contract_value || 45000000,
        l.kpi_score || 96,
        `"${l.final_delivery_doc_name || 'BASTP_Verified.pdf'}"`,
        `"${l.final_delivery_received_by || 'Staff Gudang'}"`
      ];
    });

    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Laporan_Lead_Selesai_KPI_${selectedYear}_${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export Executive Summary CSV
  const exportDashboardSummary = () => {
    const csvLines = [
      'METRIK KINERJA OPERASIONAL DASHBOARD ISOTRACK',
      `Tanggal Cetak,${new Date().toLocaleString('id-ID')}`,
      `Periode Evaluasi,${periodFilter.preset}`,
      `Total Lead Transaksi,${totalLeads}`,
      `Lead Aktif Dalam Siklus,${activeLeads.length}`,
      `Lead Selesai (Closed),${closedCount}`,
      `On-Time SLA Rate,${onTimeRate}%`,
      `Pencapaian KPI Perusahaan,${corporateAchievementScore}%`,
      `Total Revenue Kontrak Lead Finish,Rp ${totalFinishedRevenue.toLocaleString('id-ID')}`,
      `Total Tonase Delivered,${totalDeliveredTonnes} Ton`,
      `Rasio Tanpa Revisi (Zero Revision),${zeroRevisionRate}%`,
      `Rata-Rata Siklus Jam,${avgCycleHours} Jam`,
      `Utilisasi Armada Isotank,${assetUtilRate}%`,
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

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
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

      {/* Onboarding Guide Card (Dismissible) */}
      {showOnboardingGuide && (
        <div className="p-5 md:p-6 rounded-3xl bg-slate-900/90 border border-teal-500/30 shadow-2xl relative overflow-hidden backdrop-blur-md animate-fadeIn">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-400 shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-100 flex items-center space-x-2">
                  <span>Panduan Cepat Sistem IsoTrack — PT Niaga Segara Trasindo</span>
                  <span className="px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 text-[10px] font-bold">FASE 2</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Sistem transaksional 8 tahap pengiriman isotank bahan kimia & gas industri terpadu.
                </p>
              </div>
            </div>

            <button
              onClick={handleDismissOnboarding}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold border border-slate-700 transition-colors"
            >
              Tutup Panduan (Jangan Tampilkan Lagi)
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-800/80 text-xs">
            <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1.5">
              <span className="text-[10px] font-bold text-teal-400 uppercase tracking-wider block font-mono">1. ALUR TRANSAKSIONAL 8 TAHAP</span>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Tiap transaksi wajib melewati 8 tahap berurutan: Lead Created ➔ Lead Approval ➔ In Progress ➔ Submission ➔ Review ➔ Follow-Up ➔ Final Approval ➔ Closed.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1.5">
              <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block font-mono">2. COMMAND PALETTE (⌘K / CTRL+K)</span>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Tekan <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-[10px] text-teal-300">⌘K</kbd> untuk mencari lead secara instan, unit isotank, PIC, atau melompat antarmenu navigasi cepat.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1.5">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block font-mono">3. DRAWER & KANBAN INTERAKTIF</span>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Di menu Lead Transaksi, gunakan saklar Tampilan Tabel (Nyaman/Padat) atau Kanban 8-kolom, serta mode Drawer samping untuk memeriksa data tanpa menutup daftar.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1.5">
              <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider block font-mono">4. NOTIFIKASI & SLA REAL-TIME</span>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Ikon lonceng di bilah atas memberi alert in-app bila ada persetujuan yang menunggu, revisi diminta, atau batas SLA rute mendekati batas waktu kritis.
              </p>
            </div>
          </div>
        </div>
      )}

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
                <span>EXECUTIVE CONTROL CENTER & KPI DASHBOARD</span>
              </span>
              <span className="text-slate-400 text-xs font-mono">PT Niaga Segara Trasindo · Divisi Logistik Chemical & Gas</span>
            </div>

            <h1 className="text-2xl md:text-3xl font-black text-slate-100 tracking-tight leading-tight">
              Dasbor Monitoring Aset Isotank & Kinerja Operasional
            </h1>
            
            <p className="text-xs md:text-sm text-slate-400 leading-relaxed">
              Pengawasan terintegrasi 8-tahap alur pengiriman cairan dan gas industri. Dilengkapi evaluasi pencapaian lead selesai (*finished leads*) sebagai KPI perusahaan, realisasi volume, kepatuhan SLA, dan audit berkas BASTP.
            </p>

            {/* Role-Specific Operational Focus Bar */}
            <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
              <span className="text-slate-400 font-medium">Fokus Peran Anda:</span>
              <span className="px-2.5 py-1 rounded-xl bg-teal-500/15 border border-teal-500/40 text-teal-300 font-bold flex items-center space-x-1.5">
                <Users className="w-3.5 h-3.5" />
                <span className="capitalize">{currentUser.name} ({currentUser.role})</span>
              </span>
              <span className="text-slate-300 text-[11px] bg-slate-800/80 px-3 py-1 rounded-xl border border-slate-700/60 font-medium">
                {currentUser.role === 'karyawan' && '🚩 Memantau status pengiriman lead saya, kelengkapan surat jalan, dan unggah berkas BASTP.'}
                {currentUser.role === 'manager' && '⚡ Otorisasi persetujuan rute awal (Stage 2), mitigasi risiko SLA, dan approval final (Stage 7).'}
                {currentUser.role === 'reviewer' && '🔍 Verifikasi kelengkapan berkas fisik BASTP, checklist penutupan transaksi, dan kepatuhan audit.'}
                {currentUser.role === 'admin' && '🛡️ Pengendalian master data tanpa kode, manajemen akun & audit trail seluruh siklus transaksional.'}
              </span>
            </div>
          </div>

          {/* Action Buttons Group with strict single-primary hierarchy */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleRefresh}
              className={`min-h-[44px] min-w-[44px] p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700/80 transition-all ${isRefreshing ? 'animate-spin text-teal-400' : ''}`}
              title="Refresh Data Dasbor"
              aria-label="Refresh data dasbor"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <button
              onClick={() => openDownloadReportPopup('finished')}
              className="min-h-[44px] px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700/80 font-semibold text-xs flex items-center space-x-2 transition-all shadow-sm"
              title="Buka Jendela Popup Unduh Laporan (Selesai vs Berjalan, Bulan & Tahun)"
            >
              <Download className="w-4 h-4 text-teal-400" />
              <span>Unduh Laporan</span>
            </button>

            <button
              onClick={onOpenNewLead}
              className="min-h-[44px] px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 active:bg-teal-600 text-slate-950 font-black text-xs flex items-center space-x-2 shadow-lg shadow-teal-500/25 transition-all"
            >
              <Truck className="w-4 h-4" />
              <span>+ Buat Lead Transaksi Baru</span>
            </button>
          </div>
        </div>

        {/* Integrated Executive Filter & Period Control Bar (Single Line with Dropdown Lists) */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 relative z-10">
          <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-slate-800/90 shadow-xl backdrop-blur-md flex flex-wrap items-center justify-between gap-3">
            
            {/* Left: Section Label & Filter Count Pill */}
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-400">
                <SlidersHorizontal className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-black text-slate-100 uppercase tracking-wide">
                    Filter & Periode Terpadu
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/30 text-[10px] font-mono font-bold tabular-nums">
                    {totalLeads} Lead Aktif
                  </span>
                  {closedCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-bold tabular-nums hidden sm:inline-block">
                      {closedCount} Selesai
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-slate-400 hidden sm:block">
                  Atur rentang waktu evaluasi & parameter muatan dalam satu baris kontrol
                </div>
              </div>
            </div>

            {/* Right: Single-Row Controls with Dropdown Lists (Downlist) */}
            <div className="flex flex-wrap items-center gap-2">
              
              {/* Dropdown 1: Bulan */}
              <div className="flex items-center bg-slate-900 border border-slate-700/80 rounded-xl px-2.5 py-1.5 focus-within:border-teal-500 transition-colors shadow-sm min-h-[40px]">
                <Calendar className="w-3.5 h-3.5 text-teal-400 mr-1.5 shrink-0" />
                <span className="text-[11px] text-slate-400 font-bold mr-1 hidden md:inline">Bulan:</span>
                <select
                  value={selectedMonth}
                  onChange={(e) => handleMonthYearChange(Number(e.target.value), selectedYear)}
                  className="bg-transparent text-slate-100 font-bold text-xs focus:outline-none cursor-pointer pr-1"
                >
                  {monthNames.map(m => (
                    <option key={m.num} value={m.num} className="bg-slate-900 text-slate-100">
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Dropdown 2: Tahun */}
              <div className="flex items-center bg-slate-900 border border-slate-700/80 rounded-xl px-2.5 py-1.5 focus-within:border-teal-500 transition-colors shadow-sm min-h-[40px]">
                <span className="text-[11px] text-slate-400 font-bold mr-1 hidden md:inline">Tahun:</span>
                <select
                  value={selectedYear}
                  onChange={(e) => handleMonthYearChange(selectedMonth, Number(e.target.value))}
                  className="bg-transparent text-slate-100 font-bold font-mono text-xs focus:outline-none cursor-pointer pr-1 tabular-nums"
                >
                  <option value={2025} className="bg-slate-900 text-slate-100">2025</option>
                  <option value={2026} className="bg-slate-900 text-slate-100">2026</option>
                  <option value={2027} className="bg-slate-900 text-slate-100">2027</option>
                </select>
              </div>

              {/* Input by Kalender Modal Button */}
              <button
                type="button"
                onClick={() => setShowCalendarModal(true)}
                className={`min-h-[40px] px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center space-x-1.5 transition-all shadow-sm ${
                  periodFilter.preset === 'custom'
                    ? 'bg-teal-500 text-slate-950 border-teal-400 font-black'
                    : 'bg-slate-900 hover:bg-slate-800 text-teal-300 border-slate-700/80 hover:border-teal-500/40'
                }`}
                title="Pilih Rentang Tanggal Spesifik Melalui Input Kalender"
              >
                <CalendarRange className="w-3.5 h-3.5" />
                <span>Kalender</span>
              </button>

              <div className="h-5 w-px bg-slate-800 hidden xl:block" />

              {/* Dropdown 3: Downlist Muatan */}
              <div className="flex items-center bg-slate-900 border border-slate-700/80 rounded-xl px-2.5 py-1.5 focus-within:border-teal-500 transition-colors shadow-sm min-h-[40px]">
                <Filter className="w-3.5 h-3.5 text-teal-400 mr-1.5 shrink-0" />
                <span className="text-[11px] text-slate-400 font-bold mr-1 hidden md:inline">Muatan:</span>
                <select
                  value={selectedMuatanFilter}
                  onChange={(e) => setSelectedMuatanFilter(e.target.value)}
                  className="bg-transparent text-slate-100 font-semibold text-xs focus:outline-none cursor-pointer max-w-[150px] sm:max-w-none truncate"
                >
                  <option value="all" className="bg-slate-900 text-slate-100">Semua Muatan</option>
                  <option value="chemical" className="bg-slate-900 text-slate-100">Bahan Kimia Cair (Chemical)</option>
                  <option value="gas" className="bg-slate-900 text-slate-100">Gas Industri & Cryogenic</option>
                  <option value="food" className="bg-slate-900 text-slate-100">Food Grade (CPO/Olein)</option>
                </select>
              </div>

              {/* Dropdown 4: Downlist Koridor */}
              <div className="flex items-center bg-slate-900 border border-slate-700/80 rounded-xl px-2.5 py-1.5 focus-within:border-cyan-500 transition-colors shadow-sm min-h-[40px]">
                <MapPin className="w-3.5 h-3.5 text-cyan-400 mr-1.5 shrink-0" />
                <span className="text-[11px] text-slate-400 font-bold mr-1 hidden md:inline">Koridor:</span>
                <select
                  value={selectedDepoFilter}
                  onChange={(e) => setSelectedDepoFilter(e.target.value)}
                  className="bg-transparent text-slate-100 font-semibold text-xs focus:outline-none cursor-pointer max-w-[150px] sm:max-w-none truncate"
                >
                  <option value="all" className="bg-slate-900 text-slate-100">Semua Koridor</option>
                  <option value="surabaya" className="bg-slate-900 text-slate-100">Depo Surabaya (Jatim)</option>
                  <option value="gresik" className="bg-slate-900 text-slate-100">Depo Gresik (Pantura)</option>
                  <option value="cilegon" className="bg-slate-900 text-slate-100">Depo Cilegon (Banten)</option>
                </select>
              </div>

              {/* Reset Filter Button if active */}
              {(selectedMuatanFilter !== 'all' || selectedDepoFilter !== 'all' || periodFilter.preset === 'custom') && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedMuatanFilter('all');
                    setSelectedDepoFilter('all');
                    handleMonthYearChange(10, 2026);
                  }}
                  className="min-h-[40px] px-2.5 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 text-xs font-bold flex items-center space-x-1 transition-all"
                  title="Reset semua filter ke pengaturan awal"
                >
                  <RotateCcw className="w-3 h-3 text-rose-400" />
                  <span className="hidden sm:inline">Reset</span>
                </button>
              )}

              {/* Quick Download Report Popup Trigger */}
              <button
                type="button"
                onClick={() => openDownloadReportPopup('kpi')}
                className="min-h-[40px] px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center space-x-1.5 transition-all shadow-sm"
                title="Unduh Rekap Laporan Berdasarkan Periode dan Filter Aktif"
              >
                <Download className="w-3.5 h-3.5 text-teal-400" />
                <span className="hidden sm:inline">Download Lap.</span>
              </button>

            </div>

          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 0: PERLU TINDAKAN SAYA (ACTION NEEDED QUEUE - PRIORITAS TERTINGGI) */}
      {/* ========================================================================= */}
      <section aria-labelledby="perlu-tindakan-title" className="p-6 md:p-7 rounded-3xl bg-slate-900/95 border-2 border-teal-500/50 shadow-2xl relative overflow-hidden space-y-5">
        <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        
        {/* Section Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4 relative z-10">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 rounded-full bg-teal-500 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center space-x-1.5 shadow-md shadow-teal-500/20">
                <AlertTriangle className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>PERLU TINDAKAN SAYA</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-xs font-mono font-bold tabular-nums">
                {allActionNeededLeads.length} Transaksi Menunggu
              </span>
            </div>
            <h2 id="perlu-tindakan-title" className="text-xl md:text-2xl font-black text-slate-100 mt-1.5 tracking-tight" style={{ letterSpacing: '-0.02em' }}>
              Antrean Prioritas & Tanggung Jawab Operasional
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Transaksi aktif yang memerlukan tindakan langsung sesuai peran Anda ({currentUser.name} &middot; <strong className="text-teal-300 capitalize">{currentUser.role}</strong>): persetujuan rute, verifikasi berkas muatan, revisi kendala lapangan, atau pengawasan batas waktu SLA.
            </p>
          </div>

          {/* Quick Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800">
            <button
              onClick={() => setActionCategory('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                actionCategory === 'all'
                  ? 'bg-teal-500 text-slate-950 font-black shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Semua ({allActionNeededLeads.length})
            </button>
            <button
              onClick={() => setActionCategory('approval')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                actionCategory === 'approval'
                  ? 'bg-amber-400 text-slate-950 font-black shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Menunggu Approval ({approvalCategoryCount})
            </button>
            <button
              onClick={() => setActionCategory('followup')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                actionCategory === 'followup'
                  ? 'bg-orange-400 text-slate-950 font-black shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Revisi Follow-up ({followupCategoryCount})
            </button>
            <button
              onClick={() => setActionCategory('overdue')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                actionCategory === 'overdue'
                  ? 'bg-rose-500 text-white font-black shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Kritis / Terlambat SLA ({overdueCategoryCount})
            </button>
          </div>
        </div>

        {/* Content Body: Empty State vs Cards Grid */}
        {displayedActionNeededLeads.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <CheckCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">Tidak Ada Antrean Tertunda Saat Ini</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                Semua alur transaksi yang menjadi tanggung jawab peran Anda sedang berjalan lancar atau telah diselesaikan dengan tertib.
              </p>
            </div>
            <button
              onClick={() => setActiveView('leads')}
              className="mt-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-all inline-flex items-center space-x-1.5"
            >
              <span>Buka Menu Seluruh Lead Transaksi</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
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
                  className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 hover:border-teal-500/60 shadow-lg transition-all flex flex-col justify-between space-y-3 group"
                >
                  <div className="space-y-2">
                    {/* Top Row: Lead Code & Urgency Pill */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 rounded-md bg-teal-500/15 text-teal-300 border border-teal-500/30 text-[11px] font-mono font-black tabular-nums">
                          {leadItem.lead_code || 'LEAD-00101'}
                        </span>
                        <span className="text-xs font-bold text-slate-200 font-mono tabular-nums truncate max-w-[140px]">
                          {leadItem.no_surat_jalan}
                        </span>
                      </div>

                      {/* Status Urgensi */}
                      {isLate ? (
                        <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-extrabold flex items-center space-x-1 shrink-0 animate-pulse">
                          <AlertTriangle className="w-3 h-3 text-rose-400" />
                          <span>Terlambat SLA</span>
                        </span>
                      ) : isUrgent ? (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-extrabold flex items-center space-x-1 shrink-0">
                          <Clock className="w-3 h-3 text-amber-400" />
                          <span className="tabular-nums">Sisa {diffHours}j</span>
                        </span>
                      ) : (
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${
                          leadItem.current_step === 2 || leadItem.current_step === 7
                            ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                            : leadItem.current_step === 6
                            ? 'bg-orange-500/10 text-orange-300 border-orange-500/30'
                            : 'bg-purple-500/10 text-purple-300 border-purple-500/30'
                        }`}>
                          {leadItem.current_step === 2 || leadItem.current_step === 7
                            ? 'Menunggu Approval'
                            : leadItem.current_step === 6
                            ? 'Revisi Lapangan'
                            : 'Perlu Verifikasi'}
                        </span>
                      )}
                    </div>

                    {/* Stage & Actor Designation */}
                    <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs">
                      <div className="flex items-center justify-between text-[11px] text-teal-400 font-bold mb-0.5">
                        <span>Tahap {leadItem.current_step} dari 8</span>
                        <span className="text-slate-400 font-normal">Aktor: {currentStage?.actor}</span>
                      </div>
                      <div className="font-extrabold text-slate-100 truncate">
                        {currentStage?.name || `Tahap ${leadItem.current_step}`}
                      </div>
                    </div>

                    {/* Client & Cargo Details */}
                    <div className="text-xs space-y-1 pt-1">
                      <div className="text-slate-300 font-semibold truncate">
                        {leadItem.client_company || 'PT Petrokimia Utama Indonesia'}
                      </div>
                      <div className="text-slate-400 text-[11px] truncate flex items-center space-x-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 inline-block" />
                        <span>Muatan: <strong className="text-slate-200">{leadItem.muatan}</strong></span>
                      </div>
                      <div className="text-slate-400 text-[11px] truncate">
                        Rute: <span className="text-slate-300 font-medium">{leadItem.asal} &rarr; {leadItem.tujuan}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800/80">
                        <span>PIC: <strong className="text-slate-200">{leadItem.pic_name || 'Budi Santoso'}</strong></span>
                        <span className="font-mono tabular-nums text-slate-400">Aset: {leadItem.asset_code}</span>
                      </div>
                    </div>
                  </div>

                  {/* Primary Action Button for this Card */}
                  <button
                    onClick={() => setSelectedLeadId(leadItem.id)}
                    className="w-full mt-2 py-2 px-3 rounded-xl bg-teal-500/15 hover:bg-teal-500 text-teal-300 hover:text-slate-950 border border-teal-500/40 hover:border-teal-400 text-xs font-bold transition-all flex items-center justify-center space-x-1.5 shadow-sm active:scale-95"
                  >
                    <span>Buka & Proses Transaksi</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ========================================================================= */}
      {/* SECTION 1: CORPORATE ACHIEVEMENT & EXECUTIVE KPI HUB (BERDASARKAN LEAD FINISH) */}
      {/* ========================================================================= */}
      <div className="p-6 md:p-7 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-teal-500/40 shadow-2xl relative overflow-hidden space-y-6">
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header & Integrated Period Status Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5 relative z-10">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[11px] font-extrabold uppercase tracking-wider flex items-center space-x-1">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                <span>EVALUASI KPI & PENCAPAIAN PERUSAHAAN</span>
              </span>
              <span className="px-2 py-0.5 rounded-md bg-teal-500/10 text-teal-400 border border-teal-500/30 text-[10px] font-bold">
                ISO 9001:2015 AUDITED
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-black text-slate-100 mt-1 flex items-center space-x-2">
              <Target className="w-6 h-6 text-teal-400" />
              <span>Scorecard KPI & Achievement Perusahaan</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Penilaian performa operasional berbasis akumulasi transaksi lead yang berhasil diselesaikan (*Lead Finish*). Metrik mencakup ketepatan SLA, realisasi tonase, nilai kontrak, dan audit nir-revisi.
            </p>
          </div>

          {/* Active Period & KPI Summary Badge */}
          <div className="flex flex-wrap items-center gap-2.5 bg-slate-950/80 p-2.5 rounded-2xl border border-slate-800">
            <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700/80 text-xs flex items-center space-x-2">
              <Calendar className="w-3.5 h-3.5 text-teal-400" />
              <span className="text-slate-400 font-medium">Periode Evaluasi:</span>
              <strong className="text-teal-300 font-mono">
                {periodFilter.preset === 'custom' && periodFilter.startDate && periodFilter.endDate
                  ? `${periodFilter.startDate} s/d ${periodFilter.endDate}`
                  : `${monthNames.find(m => m.num === selectedMonth)?.name} ${selectedYear}`}
              </strong>
            </div>

            <button
              onClick={() => setShowCalendarModal(true)}
              className="px-3 py-1.5 rounded-xl bg-teal-500/15 hover:bg-teal-500/25 text-teal-300 border border-teal-500/30 text-xs font-bold flex items-center space-x-1.5 transition-all"
              title="Ubah Rentang Kalender"
            >
              <CalendarRange className="w-3.5 h-3.5" />
              <span>Ganti Tanggal</span>
            </button>

            <button
              onClick={() => openDownloadReportPopup('kpi')}
              className="px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center space-x-1.5 transition-all"
              title="Download Rekap Laporan KPI Periode Ini"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>Download KPI</span>
            </button>
          </div>
        </div>

        {/* Modal: Input by Kalender Datepicker */}
        {showCalendarModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl p-6 space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center space-x-2">
                  <div className="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-100 text-sm">Pilih Periode by Kalender</h3>
                    <p className="text-[11px] text-slate-400">Tentukan rentang tanggal evaluasi pencapaian lead selesai</p>
                  </div>
                </div>
                <button onClick={() => setShowCalendarModal(false)} className="text-slate-400 hover:text-white text-xs">✕</button>
              </div>

              <div className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Tanggal Mulai (Start Date):</label>
                  <input
                    type="date"
                    value={calendarStart}
                    onChange={(e) => setCalendarStart(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono focus:border-teal-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Tanggal Selesai (End Date):</label>
                  <input
                    type="date"
                    value={calendarEnd}
                    onChange={(e) => setCalendarEnd(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono focus:border-teal-500 focus:outline-none"
                  />
                </div>

                {/* Preset shortcuts inside modal */}
                <div className="pt-2">
                  <span className="text-[11px] text-slate-400 font-bold block mb-1.5">Preset Kalender Cepat:</span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => { setCalendarStart('2026-10-01'); setCalendarEnd('2026-10-31'); }}
                      className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold text-left border border-slate-700"
                    >
                      Bulan Ini (Okt 2026)
                    </button>
                    <button
                      type="button"
                      onClick={() => { setCalendarStart('2026-09-01'); setCalendarEnd('2026-09-30'); }}
                      className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold text-left border border-slate-700"
                    >
                      Bulan Lalu (Sep 2026)
                    </button>
                    <button
                      type="button"
                      onClick={() => { setCalendarStart('2026-10-01'); setCalendarEnd('2026-12-31'); }}
                      className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold text-left border border-slate-700"
                    >
                      Kuartal IV (Q4 2026)
                    </button>
                    <button
                      type="button"
                      onClick={() => { setCalendarStart('2026-01-01'); setCalendarEnd('2026-12-31'); }}
                      className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold text-left border border-slate-700"
                    >
                      Tahun Penuh 2026
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowCalendarModal(false)}
                    className="px-4 py-2 text-slate-400 hover:text-white"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={handleApplyCalendar}
                    className="px-5 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl shadow-lg shadow-teal-500/20"
                  >
                    Terapkan Rentang Kalender
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Corporate Achievement Highlight Hero Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative z-10">
          
          {/* Main Card: Corporate Composite Achievement Score */}
          <div className="md:col-span-1 p-5 rounded-3xl bg-gradient-to-b from-teal-500/20 via-slate-950 to-slate-950 border border-teal-500/50 shadow-xl flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/20 rounded-bl-full pointer-events-none group-hover:bg-teal-500/30 transition-all" />
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-extrabold text-teal-300 uppercase tracking-wider font-mono">
                  OVERALL COMPANY ACHIEVEMENT
                </span>
                <div className="flex items-center space-x-1">
                  <button
                    type="button"
                    onClick={() => setActiveTooltipMetric(activeTooltipMetric === 'overall' ? null : 'overall')}
                    className="p-1 rounded-md text-teal-400 hover:text-white hover:bg-slate-800 transition-colors"
                    title="Penjelasan & Rumus Formula"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-slate-950">
                    GRADE A+
                  </span>
                </div>
              </div>
              <div className="text-4xl font-black text-slate-100 font-mono tracking-tight flex items-baseline space-x-1 tabular-nums">
                <span>{corporateAchievementScore}%</span>
                <span className="text-xs font-normal text-teal-400">Index</span>
              </div>
              <div className="text-[11px] text-emerald-400 font-bold mt-1.5 flex items-center space-x-1">
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Pencapaian Target: EXCELLENT</span>
              </div>

              {activeTooltipMetric === 'overall' && (
                <div className="p-2.5 rounded-xl bg-slate-900/90 border border-teal-500/40 text-[10px] text-teal-200 mt-2 space-y-0.5 animate-fadeIn">
                  <span className="font-bold block text-teal-300">Formula Komposit KPI:</span>
                  <span>(40% Ketepatan SLA) + (30% Verifikasi BASTP) + (30% Nir-Revisi).</span>
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-1.5 text-[11px]">
              <div className="flex justify-between text-slate-400">
                <span>Total Lead Finish:</span>
                <strong className="text-slate-100 font-mono tabular-nums">{closedCount} Transaksi</strong>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Kontrak Delivered:</span>
                <strong className="text-emerald-400 font-mono text-[10px] tabular-nums">{formatRupiah(totalFinishedRevenue)}</strong>
              </div>
            </div>
          </div>

          {/* Metric 2: On-Time Delivery Rate (OTDR) */}
          <div className="p-5 rounded-3xl bg-slate-950/70 border border-slate-800 shadow-lg flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">On-Time SLA Rate</span>
                <div className="flex items-center space-x-1">
                  <button
                    type="button"
                    onClick={() => setActiveTooltipMetric(activeTooltipMetric === 'ontime' ? null : 'ontime')}
                    className="p-1 rounded-md text-slate-400 hover:text-emerald-300 transition-colors"
                    title="Penjelasan & Rumus Formula"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                  </button>
                  <Clock className="w-4 h-4 text-emerald-400" />
                </div>
              </div>
              <div className="text-3xl font-black text-emerald-400 font-mono tracking-tight tabular-nums">
                {onTimeRate}%
              </div>
              <div className="text-[11px] text-slate-400 font-medium mt-1">
                Target KPI Perusahaan: <strong className="text-slate-200">&ge; 92.0%</strong>
              </div>

              {activeTooltipMetric === 'ontime' && (
                <div className="p-2.5 rounded-xl bg-slate-900/90 border border-emerald-500/40 text-[10px] text-emerald-200 mt-2 space-y-0.5 animate-fadeIn">
                  <span className="font-bold block text-emerald-300">Formula Ketepatan SLA:</span>
                  <span>(Jumlah Lead Selesai On-Time / Total Lead Selesai Periode Terpilih) &times; 100%.</span>
                </div>
              )}
            </div>

            <div className="mt-4 pt-2 border-t border-slate-800">
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-400 h-full rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(onTimeRate, 100)}%` }}
                />
              </div>
              <div className="text-[10px] text-emerald-400 font-semibold mt-1">
                {onTimeRate >= 92 ? '+4.0% Di Atas Ambang Batas' : 'Dalam Evaluasi'}
              </div>
            </div>
          </div>

          {/* Metric 3: Total Tonase Muatan Delivered */}
          <div className="p-5 rounded-3xl bg-slate-950/70 border border-slate-800 shadow-lg flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">Volume Terdistribusi</span>
                <div className="flex items-center space-x-1">
                  <button
                    type="button"
                    onClick={() => setActiveTooltipMetric(activeTooltipMetric === 'volume' ? null : 'volume')}
                    className="p-1 rounded-md text-slate-400 hover:text-cyan-300 transition-colors"
                    title="Penjelasan & Rumus Formula"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                  </button>
                  <Gauge className="w-4 h-4 text-cyan-400" />
                </div>
              </div>
              <div className="text-3xl font-black text-cyan-300 font-mono tracking-tight tabular-nums">
                {totalDeliveredTonnes} <span className="text-sm font-normal text-slate-400">Ton</span>
              </div>
              <div className="text-[11px] text-slate-400 font-medium mt-1">
                Pencapaian Target: <strong className="text-cyan-400 font-mono tabular-nums">{volumeAchievementPct}%</strong>
              </div>

              {activeTooltipMetric === 'volume' && (
                <div className="p-2.5 rounded-xl bg-slate-900/90 border border-cyan-500/40 text-[10px] text-cyan-200 mt-2 space-y-0.5 animate-fadeIn">
                  <span className="font-bold block text-cyan-300">Formula Volume Terdistribusi:</span>
                  <span>Akumulasi tonase muatan kimia & gas dari berkas BASTP transaksi Closed. Target: 140 Ton/Kuartal.</span>
                </div>
              )}
            </div>

            <div className="mt-4 pt-2 border-t border-slate-800">
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-cyan-400 h-full rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(volumeAchievementPct, 100)}%` }}
                />
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                Target Kuartal: 140 Ton Bahan Kimia Cair & Gas
              </div>
            </div>
          </div>

          {/* Metric 4: First-Time Right / Zero Revision */}
          <div className="p-5 rounded-3xl bg-slate-950/70 border border-slate-800 shadow-lg flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">Zero Revision Rate</span>
                <div className="flex items-center space-x-1">
                  <button
                    type="button"
                    onClick={() => setActiveTooltipMetric(activeTooltipMetric === 'zerorev' ? null : 'zerorev')}
                    className="p-1 rounded-md text-slate-400 hover:text-purple-300 transition-colors"
                    title="Penjelasan & Rumus Formula"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                  </button>
                  <ShieldCheck className="w-4 h-4 text-purple-400" />
                </div>
              </div>
              <div className="text-3xl font-black text-purple-300 font-mono tracking-tight tabular-nums">
                {zeroRevisionRate}%
              </div>
              <div className="text-[11px] text-slate-400 font-medium mt-1">
                Berkas Lolos Verifikasi Awal
              </div>

              {activeTooltipMetric === 'zerorev' && (
                <div className="p-2.5 rounded-xl bg-slate-900/90 border border-purple-500/40 text-[10px] text-purple-200 mt-2 space-y-0.5 animate-fadeIn">
                  <span className="font-bold block text-purple-300">Formula First-Time Right:</span>
                  <span>(Jumlah Lead Closed tanpa revisi pada Step 5 / Total Lead Closed) &times; 100%.</span>
                </div>
              )}
            </div>

            <div className="mt-4 pt-2 border-t border-slate-800">
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-purple-400 h-full rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(zeroRevisionRate, 100)}%` }}
                />
              </div>
              <div className="text-[10px] text-purple-300 font-semibold mt-1">
                Standar Kualitas Audit Administrasi ISO 9001
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* SECTION 2: DEDICATED FINISHED LEADS HUB ("LEAD YANG SUDAH SELESAI") */}
      {/* ========================================================================= */}
      <div className="p-6 md:p-7 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-md space-y-5">
        
        {/* Section Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <FileCheck className="w-4 h-4" />
              </div>
              <h3 className="font-extrabold text-slate-100 text-base md:text-lg">
                Daftar Transaksi Lead Selesai & Terverifikasi (Finished Leads Hub)
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Seluruh transaksi pengiriman yang telah sampai tujuan akhir, mengantongi Berita Acara Serah Terima Penerimaan (BASTP), dan selesai ditutup oleh Manager.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-emerald-400 font-bold">
              {filteredFinishedLeads.length} Lead Selesai
            </span>
            <button
              onClick={() => openDownloadReportPopup('finished')}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center space-x-1.5 transition-all shadow-sm"
              title="Buka Popup Unduh Laporan Lead Selesai (Excel / CSV / PDF)"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Laporan Selesai</span>
            </button>
          </div>
        </div>

        {/* Filter and Search Bar for Finished Leads */}
        <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="relative flex-1 min-w-[260px] max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={finishedLeadsSearch}
              onChange={(e) => setFinishedLeadsSearch(e.target.value)}
              placeholder="Cari no surat jalan, nama klien, muatan, kode isotank..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-100 focus:border-teal-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-slate-400 font-semibold">Filter SLA:</span>
            {[
              { id: 'all', label: 'Semua Lead Selesai' },
              { id: 'ontime', label: 'Tepat Waktu (On-Time)' },
              { id: 'late', label: 'Ada Deviasi SLA' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFinishedSlaFilter(tab.id as any)}
                className={`px-3 py-1 rounded-lg font-bold transition-all ${
                  finishedSlaFilter === tab.id
                    ? 'bg-emerald-500 text-slate-950 shadow-sm'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Finished Leads Cards List */}
        {filteredFinishedLeads.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-950/60 border border-slate-800 text-center text-slate-400 text-xs">
            Tidak ada data transaksi lead selesai pada kriteria pencarian dan rentang periode ini.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredFinishedLeads.map((ld) => {
              const isLate = (ld.sla_hours_actual && ld.sla_hours_target && ld.sla_hours_actual > ld.sla_hours_target);
              return (
                <div
                  key={ld.id}
                  onClick={() => {
                    setSelectedLeadId(ld.id);
                  }}
                  className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-emerald-500/50 transition-all shadow-lg hover:shadow-emerald-500/10 cursor-pointer flex flex-col justify-between space-y-4 group"
                >
                  <div>
                    {/* Header: Lead ID, Badge Selesai, dan Status SLA */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            {ld.lead_code}
                          </span>
                          <span className="text-xs font-mono font-bold text-slate-100 group-hover:text-emerald-300 transition-colors">
                            {ld.no_surat_jalan}
                          </span>
                        </div>
                        <h4 className="font-extrabold text-slate-100 text-sm mt-1">
                          {ld.client_company || 'PT Klien Industri'}
                        </h4>
                      </div>

                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase shrink-0 border ${
                        !isLate
                          ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                          : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                      }`}>
                        {!isLate ? 'ON-TIME SLA' : 'SLA OVERDUE'}
                      </span>
                    </div>

                    {/* Route & Cargo Details */}
                    <div className="space-y-1.5 p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs text-slate-300 mb-3">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Muatan Cairan/Gas:</span>
                        <strong className="text-slate-100">{ld.muatan}</strong>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Unit Isotank:</span>
                        <span className="text-teal-400 font-mono font-bold">{ld.asset_code}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Rute Distribusi:</span>
                        <span className="text-slate-200 text-right truncate max-w-[170px]" title={`${ld.asal} -> ${ld.tujuan}`}>
                          {ld.asal} &rarr; {ld.tujuan}
                        </span>
                      </div>
                    </div>

                    {/* Lead Creator / Pembuat Lead */}
                    <div className="flex items-center justify-between text-[11px] px-3 py-1.5 rounded-xl bg-slate-900/40 border border-slate-800/60 text-slate-400 my-2">
                      <span className="flex items-center space-x-1.5">
                        <Users className="w-3.5 h-3.5 text-teal-400" />
                        <span>Pembuat Lead:</span>
                      </span>
                      <strong className="text-slate-200">{ld.creator_name || ld.pic_name || 'Budi Santoso'}</strong>
                    </div>

                    {/* Delivery & BASTP Proof Verification Box */}
                    <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] space-y-1">
                      <div className="flex items-center justify-between text-emerald-300 font-bold">
                        <span className="flex items-center space-x-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>BASTP Terverifikasi</span>
                        </span>
                        <span className="font-mono text-[10px] text-slate-400">
                          {ld.final_delivery_date || 'Selesai'}
                        </span>
                      </div>
                      <div className="text-slate-300 text-[10px] truncate" title={ld.final_delivery_doc_name || 'Dokumen BASTP'}>
                        Berkas: <strong className="text-slate-100">{ld.final_delivery_doc_name || 'BASTP_Bukti_Penerimaan.pdf'}</strong>
                      </div>
                      <div className="text-slate-400 text-[10px]">
                        Penerima: {ld.final_delivery_received_by || 'Staff Logistik Klien'}
                      </div>
                    </div>
                  </div>

                  {/* Commercial Value & KPI Performance Bar */}
                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Nilai Transaksi Kontrak</span>
                      <strong className="text-emerald-400 font-mono text-sm">
                        {formatRupiah(ld.contract_value || 45000000)}
                      </strong>
                    </div>

                    <div className="text-right">
                      <div className="flex items-center space-x-1 justify-end">
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                        <span className="font-extrabold text-slate-100 font-mono text-xs">
                          {ld.kpi_score || 96}/100
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium">
                        Durasi: {ld.sla_hours_actual || 38} Jam (Target {ld.sla_hours_target || 48}j)
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Papan Pencapaian Karyawan Pembuat Lead (Employee KPI & Achievement Summary) */}
        {creatorPerformance.length > 0 && (
          <div className="mt-5 p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
              <div className="flex items-center space-x-2">
                <Award className="w-4 h-4 text-amber-400" />
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Pencapaian KPI Karyawan Pembuat Lead (Finished Leads Achievement)
                </h4>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                Dasar Penilaian Prestasi & KPI Karyawan
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-bold text-[10px] uppercase">
                    <th className="py-2 px-3">Nama Karyawan / Pembuat</th>
                    <th className="py-2 px-3 text-center">Lead Finish</th>
                    <th className="py-2 px-3 text-right">Tonase Terkirim</th>
                    <th className="py-2 px-3 text-right">Nilai Kontrak Realisasi</th>
                    <th className="py-2 px-3 text-center">On-Time SLA</th>
                    <th className="py-2 px-3 text-center">Skor KPI</th>
                    <th className="py-2 px-3 text-center">Status Evaluasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {creatorPerformance.map((cp) => (
                    <tr key={cp.name} className="hover:bg-slate-900/40 text-slate-300">
                      <td className="py-2 px-3 font-semibold text-slate-100 flex items-center space-x-2">
                        <div className="w-6 h-6 rounded-full bg-teal-500/20 text-teal-300 flex items-center justify-center text-[10px] font-bold">
                          {cp.name.charAt(0)}
                        </div>
                        <span>{cp.name}</span>
                      </td>
                      <td className="py-2 px-3 text-center font-mono font-bold text-emerald-400">
                        {cp.leadsCount} Transaksi
                      </td>
                      <td className="py-2 px-3 text-right font-mono">
                        {cp.totalTonase} Ton
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-emerald-300">
                        {formatRupiah(cp.totalRevenue)}
                      </td>
                      <td className="py-2 px-3 text-center font-mono">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          cp.onTimeRate >= 92 ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'
                        }`}>
                          {cp.onTimeRate}%
                        </span>
                      </td>
                      <td className="py-2 px-3 text-center font-mono font-bold text-amber-300">
                        {cp.avgKpi} / 100
                      </td>
                      <td className="py-2 px-3 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-500/10 text-teal-300 border border-teal-500/20">
                          {Number(cp.avgKpi) >= 95 ? 'GRADE A+ EXCELLENT' : 'GRADE A OPTIMAL'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* KPI METRICS OVERVIEW (8 CARDS) */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        
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
          <div className="text-[11px] text-slate-400 font-medium mt-1.5 relative z-10">{activeLeads.length} Lead Aktif Berjalan</div>

          {activeTooltipMetric === 'total_leads' && (
            <div className="absolute top-full left-0 mt-2 w-64 p-3 bg-slate-950 border border-slate-700 rounded-xl shadow-2xl z-50 text-xs text-slate-200 animate-fadeIn">
              <strong className="text-teal-400 block mb-1">Total Transaksi Lead</strong>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Akumulasi seluruh surat jalan dan muatan isotank yang tercatat dalam sistem pada periode yang dipilih.
              </p>
            </div>
          )}
        </div>

        {/* KPI 2: Lead Selesai (Closed) */}
        <div
          className="relative group p-4 rounded-2xl bg-slate-900/90 border border-slate-800/90 hover:border-emerald-500/50 transition-all shadow-lg hover:shadow-emerald-500/10 cursor-pointer overflow-hidden backdrop-blur-md"
          onMouseEnter={() => setActiveTooltipMetric('closed_leads')}
          onMouseLeave={() => setActiveTooltipMetric(null)}
        >
          <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/10 rounded-bl-full pointer-events-none group-hover:bg-emerald-500/20 transition-all" />
          <div className="flex items-center justify-between text-slate-400 mb-1.5 relative z-10">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">Lead Selesai</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono tracking-tight relative z-10">{closedCount}</div>
          <div className="text-[11px] text-emerald-400 font-bold mt-1.5 relative z-10">100% Delivered BASTP</div>

          {activeTooltipMetric === 'closed_leads' && (
            <div className="absolute top-full left-0 mt-2 w-64 p-3 bg-slate-950 border border-slate-700 rounded-xl shadow-2xl z-50 text-xs text-slate-200 animate-fadeIn">
              <strong className="text-emerald-400 block mb-1">Lead Selesai (Closed)</strong>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Pengiriman yang telah menyelesaikan seluruh 8 tahap audit dan diarsipkan dengan bukti dokumen absah.
              </p>
            </div>
          )}
        </div>

        {/* KPI 3: SLA On-Time Rate */}
        <div
          className="relative group p-4 rounded-2xl bg-slate-900/90 border border-slate-800/90 hover:border-cyan-500/50 transition-all shadow-lg hover:shadow-cyan-500/10 cursor-pointer overflow-hidden backdrop-blur-md"
          onMouseEnter={() => setActiveTooltipMetric('on_time')}
          onMouseLeave={() => setActiveTooltipMetric(null)}
        >
          <div className="absolute top-0 right-0 w-20 h-20 bg-cyan-500/10 rounded-bl-full pointer-events-none group-hover:bg-cyan-500/20 transition-all" />
          <div className="flex items-center justify-between text-slate-400 mb-1.5 relative z-10">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">On-Time SLA</span>
            <Clock className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-cyan-300 font-mono tracking-tight relative z-10">{onTimeRate}%</div>
          <div className="text-[11px] text-slate-400 font-medium mt-1.5 relative z-10">Target Standar &ge; 92%</div>

          {activeTooltipMetric === 'on_time' && (
            <div className="absolute top-full left-0 mt-2 w-64 p-3 bg-slate-950 border border-slate-700 rounded-xl shadow-2xl z-50 text-xs text-slate-200 animate-fadeIn">
              <strong className="text-cyan-400 block mb-1">Tingkat Ketepatan Waktu SLA</strong>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Persentase pengiriman yang selesai tepat waktu sebelum target waktu ketibaan yang disepakati dengan klien.
              </p>
            </div>
          )}
        </div>

        {/* KPI 4: Cycle Time Average */}
        <div
          className="relative group p-4 rounded-2xl bg-slate-900/90 border border-slate-800/90 hover:border-amber-500/50 transition-all shadow-lg hover:shadow-amber-500/10 cursor-pointer overflow-hidden backdrop-blur-md"
          onMouseEnter={() => setActiveTooltipMetric('cycle_time')}
          onMouseLeave={() => setActiveTooltipMetric(null)}
        >
          <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/10 rounded-bl-full pointer-events-none group-hover:bg-amber-500/20 transition-all" />
          <div className="flex items-center justify-between text-slate-400 mb-1.5 relative z-10">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">Waktu Siklus</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-300 font-mono tracking-tight relative z-10">{avgCycleHours} <span className="text-xs font-normal text-slate-400">Jam</span></div>
          <div className="text-[11px] text-slate-400 font-medium mt-1.5 relative z-10">Rata-Rata Tahap 1 - 8</div>

          {activeTooltipMetric === 'cycle_time' && (
            <div className="absolute top-full left-0 mt-2 w-64 p-3 bg-slate-950 border border-slate-700 rounded-xl shadow-2xl z-50 text-xs text-slate-200 animate-fadeIn">
              <strong className="text-amber-400 block mb-1">Rata-Rata Waktu Siklus (Cycle Time)</strong>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Durasi waktu rata-rata yang dibutuhkan dari pembuatan lead pertama kali hingga penutupan arsip final.
              </p>
            </div>
          )}
        </div>

        {/* KPI 5: Revision Rate */}
        <div
          className="relative group p-4 rounded-2xl bg-slate-900/90 border border-slate-800/90 hover:border-purple-500/50 transition-all shadow-lg hover:shadow-purple-500/10 cursor-pointer overflow-hidden backdrop-blur-md"
          onMouseEnter={() => setActiveTooltipMetric('revisions')}
          onMouseLeave={() => setActiveTooltipMetric(null)}
        >
          <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 rounded-bl-full pointer-events-none group-hover:bg-purple-500/20 transition-all" />
          <div className="flex items-center justify-between text-slate-400 mb-1.5 relative z-10">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">Tingkat Revisi</span>
            <RotateCcw className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-purple-300 font-mono tracking-tight relative z-10">{revisionRate}%</div>
          <div className="text-[11px] text-slate-400 font-medium mt-1.5 relative z-10">{totalRevisions} Catatan Revisi</div>

          {activeTooltipMetric === 'revisions' && (
            <div className="absolute top-full left-0 mt-2 w-64 p-3 bg-slate-950 border border-slate-700 rounded-xl shadow-2xl z-50 text-xs text-slate-200 animate-fadeIn">
              <strong className="text-purple-400 block mb-1">Rasio Revisi Berkas Dokumen</strong>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Persentase pengembalian berkas untuk perbaikan stempel, foto segel, atau lampiran pendukung.
              </p>
            </div>
          )}
        </div>

        {/* KPI 6: Isotank Utilization Rate */}
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
                key={route.rute}
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

      {/* Central Report Download Popup Modal */}
      <ReportDownloadModal
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
        initialType={downloadModalInitialType}
        initialMonth={selectedMonth}
        initialYear={selectedYear}
      />

    </div>
  );
};
